// AI 음성 (신경망 TTS): 문장마다 한 번만 만들어 data/tts/ 에 저장하고, 다음부터는 저장된 파일을 보낸다.
// 공급자: OpenAI (OPENAI_API_KEY) 또는 Google Cloud TTS (GOOGLE_TTS_API_KEY). 개발용 test 공급자는 삐 소리 WAV를 만든다.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './env.js';

const e = process.env;
const DIR = path.join(config.dataDir, 'tts');
fs.mkdirSync(DIR, { recursive: true });

export const ttsProvider = () => {
  const p = (e.TTS_PROVIDER || '').toLowerCase();
  if (p === 'test') return 'test';
  if ((p === 'openai' || !p) && e.OPENAI_API_KEY) return 'openai';
  if ((p === 'google' || !p) && e.GOOGLE_TTS_API_KEY) return 'google';
  return null;
};
// Google 기본 목소리는 Studio-O: Neural2-F는 Z를 'C', V를 'P'처럼 읽어서 알파벳 학습에 맞지 않았다 (2026-10 26글자 비교)
export const voiceId = () => ({ openai: e.OPENAI_TTS_VOICE || 'nova', google: e.GOOGLE_TTS_VOICE || 'en-US-Studio-O', test: 'beep' }[ttsProvider()]);
const ext = () => (ttsProvider() === 'test' ? 'wav' : 'mp3');

// 영어 학습 문장만 받는다 (요금 남용 방지)
export const cleanText = t => String(t || '').replace(/\s+/g, ' ').trim();
export const validText = t => t.length > 0 && t.length <= 300 && /^[A-Za-z0-9 .,!?'’\-:;"]+$/.test(t);
// 발음 바로잡기 (Google 음성에 SSML 발음 기호로 보낸다).
// 화면의 speechText()가 먼저 바꿔 보내는 것: 알파벳 → 이름 철자(ay, bee…), 과거형 read → red, 동화 단어 A(관사) → a.
// 여기서는 AI 음성이 문맥만으로는 틀리게 읽는 것을 IPA로 못 박는다.
//  - 관사: 짧은 마디나 단어 하나만 읽으면 a를 '에이', the를 '디'로 강하게 읽는다 → a는 '어', the는 '더'(모음 소리 앞은 '디')
//  - 글자 이름: 'ay'는 '아이'(aye), 'dee'는 IPA로 못 박아도 '티'처럼 들려서, 글자 읽기(say-as characters)로 보낸다
//    (bee·see·eye·oh·you·why는 실제 단어와 소리가 같아서 그대로)
//  - 한 단어만 읽을 때 뜻을 몰라 틀리는 단어: live를 '라이브'로 (동화에서 단어를 눌러 들을 때)
const vowelSound = w => /^(hour|honest)/i.test(w) || (/^[aeiou]/i.test(w) && !/^(one|once|uni|use|usu|eu|u[bcdfgklmnpstvz][aeiou])/i.test(w));
const xml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const LETTER_OF = { ay: 'A', ee: 'E', jee: 'G', aitch: 'H', el: 'L', em: 'M', en: 'N', ess: 'S', eff: 'F', ar: 'R', ex: 'X',
  cue: 'Q', dee: 'D', pee: 'P', tee: 'T', vee: 'V', zee: 'Z', kay: 'K', jay: 'J' };
const SINGLE_IPA = { live: 'lɪv', lives: 'lɪvz', wind: 'wɪnd', minute: 'ˈmɪnɪt', present: 'ˈpɹɛzənt' };
const phoneme = (w, ph) => `<phoneme alphabet="ipa" ph="${ph}">${xml(w)}</phoneme>`;
// 단어 하나를 고쳐 읽을 SSML (고칠 필요가 없으면 null)
function fixWord(ws, i) {
  const [, word, punct] = ws[i].match(/^([A-Za-z]+)([.,!?]*)$/) || [];
  if (!word) return null;
  const low = word.toLowerCase();
  if (LETTER_OF[low]) return `<say-as interpret-as="characters">${LETTER_OF[low]}</say-as>${xml(punct)}`;
  const ph = low === 'a' ? 'ə' : low === 'the' ? (vowelSound(ws[i + 1] || '') ? 'ði' : 'ðə') : ws.length === 1 && SINGLE_IPA[low];
  return ph ? phoneme(word, ph) + xml(punct) : null;
}
const fixed = text => ttsProvider() === 'google' && speechSsml(text) !== `<speak>${xml(text)}</speak>`;
// 철자 줄('bee, ay, en, ay, en, ay. banana')은 글자마다 조금 쉬고, 마지막 글자 뒤에는 더 쉰다.
// 쉬지 않으면 끝 글자 A를 다음 단어의 관사로 읽고('a banana'), 'dee, is for'를 'D's for'로 붙여 읽었다.
// 끝 단어는 마침표로 맺는다 (마침표가 없으면 cake를 'take', worm을 'wern'처럼 읽었다)
const NAME_OF = { ...LETTER_OF, bee: 'B', see: 'C', eye: 'I', oh: 'O', you: 'U', why: 'Y', 'double you': 'W' };
const pause = ms => `<break time="${ms}ms"/>`;
const spelledSsml = names => names.map(n => `<say-as interpret-as="characters">${NAME_OF[n]}</say-as>`).join(',' + pause(150) + ' ') + '.' + pause(500);
export function speechSsml(text) {
  const spell = text.match(/^((?:[a-z ]+, )+[a-z ]+)\. (.+)$/);
  if (spell && spell[1].split(', ').every(n => NAME_OF[n])) return '<speak>' + spelledSsml(spell[1].split(', ')) + ' ' + xml(spell[2].replace(/[.!?]*$/, '.')) + '</speak>';
  const ws = text.split(' ');
  return '<speak>' + ws.map((w, i) => {
    const f = fixWord(ws, i) || xml(w);
    return /^[a-z]+,$/.test(w) && NAME_OF[w.slice(0, -1)] && ws[i + 1] === 'is' ? f + pause(150) : f; // 'dee, is for dog'
  }).join(' ') + '</speak>';
}
// 미리 만든 정적 파일 이름에도 쓴다 (발음을 고친 파일은 이름이 바뀌어 브라우저에 남은 옛 소리를 쓰지 않게).
// 보내는 SSML 자체로 만들어서, 고치는 규칙이 바뀌면 그 규칙에 걸리는 문장만 다시 만든다
export const audioTag = text => (fixed(text) ? '|' + crypto.createHash('sha1').update(speechSsml(text)).digest('hex').slice(0, 8) : '');
export const cacheFile = (text, slow) => {
  const h = crypto.createHash('sha256').update(`${ttsProvider()}|${voiceId()}|${slow ? 'slow' : 'normal'}|${text}${audioTag(text)}`).digest('hex').slice(0, 32);
  return path.join(DIR, `${h}.${ext()}`);
};

async function synthOpenAI(text, slow) {
  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST', signal: AbortSignal.timeout(30000),
    headers: { Authorization: `Bearer ${e.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: e.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts', voice: voiceId(), input: text, response_format: 'mp3',
      instructions: `You are a warm, cheerful English teacher reading to a young child (5-8 years old). Speak clearly with natural American pronunciation${slow ? ', slowly, with a short pause between words' : ' at a gentle, relaxed pace'}.`,
      speed: slow ? 0.75 : 0.95,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI TTS ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return Buffer.from(await r.arrayBuffer());
}
async function synthGoogle(text, slow) {
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(e.GOOGLE_TTS_API_KEY)}`, {
    method: 'POST', signal: AbortSignal.timeout(30000), headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: fixed(text) ? { ssml: speechSsml(text) } : { text }, voice: { languageCode: voiceId().slice(0, 5), name: voiceId() }, audioConfig: { audioEncoding: 'MP3', speakingRate: slow ? 0.7 : 0.92 } }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Google TTS ${r.status}: ${j.error?.message || ''}`.slice(0, 200));
  return Buffer.from(j.audioContent, 'base64');
}
// 개발용: 글자 수에 비례한 길이의 부드러운 삐 소리 WAV
function synthTest(text, slow) {
  const rate = 16000, secs = Math.min(8, 0.3 + text.length * (slow ? 0.09 : 0.06)), n = Math.floor(rate * secs);
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(i / rate * 2 * Math.PI * 440) * 3000 * Math.min(1, i / 800, (n - i) / 800)), 44 + i * 2);
  return b;
}

const inflight = new Map();
// 저장된 파일 경로를 돌려준다 (없으면 만들어서 저장)
export async function getSpeech(text, slow) {
  const file = cacheFile(text, slow);
  if (fs.existsSync(file)) return { file, cached: true };
  if (!inflight.has(file)) {
    inflight.set(file, (async () => {
      const p = ttsProvider();
      const buf = p === 'openai' ? await synthOpenAI(text, slow) : p === 'google' ? await synthGoogle(text, slow) : synthTest(text, slow);
      const tmp = file + '.tmp'; fs.writeFileSync(tmp, buf); fs.renameSync(tmp, file);
    })().finally(() => inflight.delete(file)));
  }
  await inflight.get(file);
  return { file, cached: false };
}
export const ttsStats = () => {
  const files = fs.readdirSync(DIR).filter(f => !f.endsWith('.tmp'));
  return { provider: ttsProvider(), voice: ttsProvider() ? voiceId() : null, files: files.length, sizeKB: Math.round(files.reduce((s, f) => s + fs.statSync(path.join(DIR, f)).size, 0) / 1024) };
};
