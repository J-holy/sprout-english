/* 새싹스쿨 서비스 워커 — 파일을 저장해 두지 않는다(늘 서버의 최신 파일).
 * 인터넷이 끊겼을 때 화면 이동만 받아서 흰 화면 대신 안내를 보여준다. /api 는 건드리지 않는다.
 * 서버가 보낸 학습 시간 알림(웹 푸시)을 휴대폰 알림으로 띄운다. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
const OFFLINE = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>새싹스쿨</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fff4e2;font-family:system-ui,sans-serif;color:#2b2f4a;text-align:center;padding:24px}button{font:inherit;padding:12px 22px;border-radius:999px;border:3px solid #2b2f4a;background:#ffd23f;font-weight:700}</style></head>
<body><div><div style="font-size:64px">🌱</div><h1>인터넷에 연결되어 있지 않아요</h1><p>와이파이나 데이터를 켠 뒤 다시 열어 주세요.</p><button onclick="location.reload()">다시 열기</button></div></body></html>`;
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.mode !== 'navigate' || new URL(req.url).pathname.startsWith('/api/')) return;
  e.respondWith(fetch(req).catch(() => new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});

// 매일 학습 시간 알림 (서버가 보낸 웹 푸시)
self.addEventListener('push', e => {
  let m = {};
  try { m = e.data ? e.data.json() : {}; } catch (x) { m = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(m.title || '새싹스쿨', {
    body: m.body || '오늘의 영어 시간이에요.', icon: '/img/icon-192.png', badge: '/img/icon-192.png',
    tag: m.tag || 'sprout', renotify: true, data: { url: m.url || '/' },
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || '/', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const w = list.find(c => new URL(c.url).origin === self.location.origin);
    if (w) return w.focus().then(c => (c && 'navigate' in c ? c.navigate(url) : c)).catch(() => self.clients.openWindow(url));
    return self.clients.openWindow(url);
  }));
});
