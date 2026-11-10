// Render each <section class="slide"> of slides.html to a 1080x1350 PNG with headless Chrome (CDP).
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
const [HTML, OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const PORT = 9334;
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${OUT}/../.render-profile`,
  '--allow-file-access-from-files', '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let seq = 0; const waiting = new Map();
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const id = ++seq; waiting.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const evalJs = async e => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result?.result?.value;
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 1400, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'file://' + HTML });
await sleep(1500);
await evalJs('document.fonts.ready.then(() => [...document.fonts].filter(f => f.status === "loaded").map(f => f.family).join(","))').then(f => console.log('fonts:', f));
await evalJs('Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; })))');
const rects = await evalJs('[...document.querySelectorAll(".slide")].map(s => { const b = s.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height }; })');
for (const [i, r] of rects.entries()) {
  const res = await send('Page.captureScreenshot', { format: 'png', clip: { ...r, scale: 1 }, captureBeyondViewport: true });
  writeFileSync(`${OUT}/carousel-${i + 1}.png`, Buffer.from(res.result.data, 'base64'));
  console.log('saved carousel-' + (i + 1));
}
ws.close(); chrome.kill();
