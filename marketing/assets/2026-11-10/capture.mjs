// Capture public screens of saessakschool.co.kr through Chrome DevTools Protocol (no login, no account).
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const PORT = 9333;
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${OUT}/../chrome-profile`,
  '--no-first-run', '--hide-scrollbars', '--lang=ko-KR', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let tabs;
for (let i = 0; i < 40; i++) {
  try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); break; } catch { await sleep(250); }
}
const page = tabs.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let seq = 0; const waiting = new Map();
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const id = ++seq; waiting.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evalJs = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });

async function shot(name, clip) {
  const r = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip: { ...clip, scale: 1 }, captureBeyondViewport: true } : {}) });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.result.data, 'base64'));
  console.log('saved', name);
}
async function rectOf(sel) {
  return evalJs(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; e.scrollIntoView({block:'center'}); const b = e.getBoundingClientRect(); return { x: b.left + scrollX - 12, y: b.top + scrollY - 12, width: b.width + 24, height: b.height + 24 }; })()`);
}

await send('Page.navigate', { url: 'https://saessakschool.co.kr/#/' });
await sleep(3500);
await shot('site-hero');
for (const [name, sel] of [['site-coach', '.speak-demo'], ['site-report', '.report-preview']]) {
  const r = await rectOf(sel); await sleep(800);
  if (r) await shot(name, r); else console.log('missing', sel);
}
await send('Page.navigate', { url: 'https://saessakschool.co.kr/#/sample/A' });
await sleep(1000);
await evalJs('location.reload()');
await sleep(4000);
await shot('site-lesson');

ws.close(); chrome.kill();
