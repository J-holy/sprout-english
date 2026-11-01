// 음성 인식 설정 시험: 1초짜리 무음을 보내 Google이 받아 주는지 본다 (요금은 거의 들지 않는다)
// 사용법: node scripts/test-stt.js
import { recognize, sttProvider } from '../lib/stt.js';

const provider = sttProvider();
if (!provider) { console.error('.env에 음성 인식 키가 없어요.'); process.exit(1); }
const n = 16000, wav = Buffer.alloc(44 + n * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + n * 2, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(16000, 24); wav.writeUInt32LE(32000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(n * 2, 40);
try {
  await recognize(wav, '');
  console.log(`음성 인식 연결 정상 (${provider})`);
} catch (err) {
  console.error('음성 인식에 연결하지 못했어요:', err.message);
  process.exit(1);
}
