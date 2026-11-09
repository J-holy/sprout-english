// 말하기 채점용 음성 인식 — 아이패드·아이폰의 Chrome처럼 브라우저에 음성 인식이 없는 곳에서 쓴다.
// 화면이 녹음한 16kHz WAV를 받아 서버 안의 Whisper(whisper.cpp), Google Speech-to-Text 또는 OpenAI로 글자로 바꾼다.
// Whisper는 녹음을 밖으로 보내지 않고, 요금이 없다. 라즈베리파이에서는 deploy/set-whisper.sh로 켠다.
// Google은 AI 음성과 같은 프로젝트에서 "Cloud Speech-to-Text API"만 켜면 같은 키(GOOGLE_TTS_API_KEY)를 쓸 수 있다.
import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './env.js';

const e = process.env;
const googleKey = () => e.GOOGLE_STT_API_KEY || e.GOOGLE_TTS_API_KEY;
export const sttProvider = () => {
  const p = (e.STT_PROVIDER || '').toLowerCase();
  if (p === 'off') return null;
  if (p === 'whisper') return e.WHISPER_BIN && e.WHISPER_MODEL ? 'whisper' : null;
  if (p === 'test' || (!p && !config.production && e.TTS_PROVIDER === 'test')) return 'test';
  if ((p === 'google' || !p) && googleKey()) return 'google';
  if ((p === 'openai' || !p) && e.OPENAI_API_KEY) return 'openai';
  return null;
};

// 16kHz·16비트·모노 WAV만 받는다 (최대 약 15초)
export function checkWav(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 44 || buf.length > 600000) return false;
  return buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WAVE' && buf.readUInt16LE(22) === 1 && buf.readUInt32LE(24) === 16000 && buf.readUInt16LE(34) === 16;
}

async function googleSTT(wav, hint) {
  const r = await fetch(`https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${encodeURIComponent(googleKey())}`, {
    method: 'POST', signal: AbortSignal.timeout(20000), headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config: {
        encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: 'en-US', maxAlternatives: 5, profanityFilter: true,
        // 아이가 읽으려던 문장을 힌트로 줘서 서툰 발음도 알아듣게 한다 (채점은 화면에서 단어별로 따로 한다)
        speechContexts: hint ? [{ phrases: [hint], boost: 8 }] : [],
      },
      audio: { content: wav.toString('base64') },
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Google STT ${r.status}: ${j.error?.message || ''}`.slice(0, 200));
  return (j.results || []).flatMap(x => x.alternatives || []).map(a => (a.transcript || '').trim()).filter(Boolean);
}

async function openaiSTT(wav, hint) {
  const fd = new FormData();
  fd.append('file', new Blob([wav], { type: 'audio/wav' }), 'speech.wav');
  fd.append('model', e.OPENAI_STT_MODEL || 'gpt-4o-mini-transcribe');
  fd.append('language', 'en');
  if (hint) fd.append('prompt', `A young child reads aloud: "${hint}"`);
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST', signal: AbortSignal.timeout(30000), headers: { Authorization: `Bearer ${e.OPENAI_API_KEY}` }, body: fd,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`OpenAI STT ${r.status}: ${j.error?.message || ''}`.slice(0, 200));
  return j.text ? [j.text.trim()] : [];
}

// 짧은 음성에서 Whisper가 같은 말을 되풀이해 적을 때가 있어서('I can jump. I can jump. I can', 'Hello! Can you hear me? Hello! Can') 한 번만 남긴다
export function dropRepeats(text) {
  // 처음부터 같은 단어 묶음이 되풀이되면 첫 묶음만 (문장 두 개짜리도). 끝이 잘려 있어서 두 단어 이상 되풀이될 때만 본다
  const words = text.split(' '), w = words.map(x => x.toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (let p = 1; p <= w.length - 2; p++) if (w.slice(p).every((x, i) => x === w[i])) { text = words.slice(0, p).join(' '); break; }
  // 문장 하나가 잇달아 되풀이되면 한 번만
  const key = t => t.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const kept = [];
  for (const part of text.split(/(?<=[.?!])\s+/)) {
    const k = key(part), prev = kept.length ? key(kept[kept.length - 1]) : '';
    if (!k || (prev && prev.startsWith(k))) continue;
    kept.push(part);
  }
  return kept.join(' ');
}

// Whisper는 숫자를 'Day 3'처럼 적어서, 채점이 문장의 'three'와 맞춰 보게 99까지 글자로 바꾼다
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export const numberWords = t => t.replace(/\b\d{1,2}\b/g, d => (d < 20 ? ONES[+d] : TENS[d[0]] + (d[1] !== '0' ? ' ' + ONES[d[1]] : '')));

// Whisper는 CPU를 많이 써서 한 번에 한 문장씩만 돌린다. 줄이 길면 기다리게 하지 않고 다시 눌러 달라고 한다
const MAX_WAITING = 6;
let waiting = 0, last = Promise.resolve();
async function whisperSTT(wav, hint) {
  if (waiting >= MAX_WAITING) throw new Error('busy');
  waiting++;
  const job = last.then(() => runWhisper(wav, hint)).finally(() => { waiting--; });
  last = job.catch(() => {});
  return job;
}
let maxTokens = null;
const hasMaxTokens = () => (maxTokens ??= new Promise(resolve => {
  execFile(e.WHISPER_BIN, ['--help'], { timeout: 10000 }, (err, stdout, stderr) => resolve(/--max-tokens/.test(stdout + stderr)));
}));
// 녹음은 인식하는 동안만 파일로 두고 바로 지운다
async function runWhisper(wav, hint) {
  const dir = path.join(config.dataDir, 'stt-tmp');
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, crypto.randomUUID() + '.wav');
  fs.writeFileSync(file, wav, { mode: 0o600 });
  try {
    // -ac: 짧은 문장을 30초 길이로 처리하지 않게 해서 빨라진다. 50이 1초쯤이라 녹음 길이에 맞춰 정한다 (256은 5초, 512는 10초).
    //   화면이 말소리 앞뒤의 조용한 부분을 잘라서 보내 녹음이 짧다. 라즈베리파이 시험 40문장: 384 고정 1.48초 → 길이에 맞춤 1.10초,
    //   맞힌 단어 비율은 같았다 (93.7% → 93.2%, 2026-11-10). 256보다 줄이면 같은 문장을 되풀이하기 쉬워서 256에서 멈춘다
    // -bs 1 -bo 1 -nf: 후보를 하나만 보고 다시 시도하지 않는다
    // 읽을 문장을 --prompt로 주면 서툰 발음도 알아듣는다 (빼면 'dad is sad'를 'that is said'로 적었다).
    //   대신 그 문장을 끝없이 되풀이해 적어서(30문장 중 9번, 문장당 4초) -mt로 문장 길이만큼만 받아쓰고 끊는다. 되풀이는 dropRepeats가 지운다
    //   -mt는 whisper.cpp에 deploy/whisper-max-tokens.patch를 붙여 빌드해야 있다. 없는 실행 파일이면 문장을 주지 않는다
    //   라즈베리파이 4의 tiny.en-q5_1에서 짧은 문장당 약 1.1초 (2026-11-10 측정)
    const sec = (wav.length - 44) / 32000;
    const ac = Math.min(Number(e.WHISPER_AUDIO_CTX) || 512, Math.max(256, Math.ceil(sec * 50) + 75));
    const args = ['-n', '10', e.WHISPER_BIN, '-m', e.WHISPER_MODEL, '-f', file, '-l', 'en', '-nt', '-t', e.WHISPER_THREADS || '2', '-ac', String(ac), '-bs', '1', '-bo', '1', '-nf'];
    if (hint && await hasMaxTokens()) args.push('--prompt', hint, '-mt', String(Math.ceil(hint.length / 3) + 6));
    const text = await new Promise((resolve, reject) => {
      execFile('nice', args, { timeout: 30000, maxBuffer: 1024 * 1024 }, (err, stdout) => (err ? reject(new Error(`Whisper: ${err.message}`.slice(0, 200))) : resolve(stdout)));
    });
    // [BLANK_AUDIO], (music) 같은 표시는 말한 내용이 아니다
    const heard = numberWords(text.replace(/\[[^\]]*\]|\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim());
    if (!heard) return [];
    return [hint && dropRepeats(hint) !== hint ? heard : dropRepeats(heard)]; // 읽을 문장 자체가 되풀이되면('Run! Run!') 그대로 둔다
  } finally {
    fs.rmSync(file, { force: true });
  }
}

// 들은 문장 후보들을 돌려준다 (없으면 빈 배열)
export async function recognize(wav, hint) {
  const p = sttProvider();
  if (p === 'whisper') return whisperSTT(wav, hint);
  if (p === 'google') return googleSTT(wav, hint);
  if (p === 'openai') return openaiSTT(wav, hint);
  if (p === 'test') return hint ? [hint] : ['hello']; // 개발용: 힌트를 그대로 들은 것으로
  throw new Error('no-stt');
}
