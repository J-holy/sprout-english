// 말하기 채점용 음성 인식 — 아이패드·아이폰의 Chrome처럼 브라우저에 음성 인식이 없는 곳에서 쓴다.
// 화면이 녹음한 16kHz WAV를 받아 Google Speech-to-Text(또는 OpenAI)로 글자로 바꾼다.
// Google은 AI 음성과 같은 프로젝트에서 "Cloud Speech-to-Text API"만 켜면 같은 키(GOOGLE_TTS_API_KEY)를 쓸 수 있다.
import { config } from './env.js';

const e = process.env;
const googleKey = () => e.GOOGLE_STT_API_KEY || e.GOOGLE_TTS_API_KEY;
export const sttProvider = () => {
  const p = (e.STT_PROVIDER || '').toLowerCase();
  if (p === 'off') return null;
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

// 들은 문장 후보들을 돌려준다 (없으면 빈 배열)
export async function recognize(wav, hint) {
  const p = sttProvider();
  if (p === 'google') return googleSTT(wav, hint);
  if (p === 'openai') return openaiSTT(wav, hint);
  if (p === 'test') return hint ? [hint] : ['hello']; // 개발용: 힌트를 그대로 들은 것으로
  throw new Error('no-stt');
}
