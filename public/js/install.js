/* 새싹스쿨 — 홈 화면에 앱처럼 설치하기 안내
 * 휴대폰·태블릿으로 처음 들어오면 기기에 맞는 설치 방법을 팝업으로 보여준다.
 * - 안드로이드 Chrome·삼성 인터넷: 설치 버튼 한 번 (브라우저가 허락할 때), 아니면 메뉴 안내
 * - 아이폰·아이패드: 브라우저가 대신 설치해 줄 수 없어서 공유 › "홈 화면에 추가" 순서를 그림으로 안내
 * - 카카오톡 등 앱 안의 브라우저: 설치가 안 되니 Safari·Chrome으로 먼저 열게 안내
 * 이미 설치한 앱으로 열었으면 보여주지 않는다. 사이트 아래쪽 "앱으로 설치하기"로 언제든 다시 볼 수 있다.
 */
const Install = (() => {
  const KEY = 'sprout-install';
  const env = Speech.env;
  const ua = navigator.userAgent || '';
  const samsung = /SamsungBrowser/i.test(ua) && !env.inApp;
  const ipad = env.ios && (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const standalone = () => navigator.standalone === true || !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  let deferred = null; // 안드로이드 Chrome이 주는 설치 기회 (beforeinstallprompt)

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', () => { deferred = null; save({ never: true }); });

  // 오프라인일 때 흰 화면 대신 안내 (안드로이드 설치 조건도 채운다)
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* 없어도 동작 */ }));
  }

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* ignore */ } }

  const shareIco = '<svg class="ins-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 11H6.5A1.5 1.5 0 0 0 5 12.5v7A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const addIco = '<span class="ins-key">＋</span>';
  const steps = list => `<ol class="ins-steps">${list.map(s => `<li>${s}</li>`).join('')}</ol>`;

  // 기기에 맞는 안내 화면
  function body() {
    if (env.inApp) {
      const ext = Speech.externalUrl(), app = env.kakao ? '카카오톡' : '앱';
      const where = env.ios ? 'Safari' : 'Chrome';
      return {
        title: `${app} 안에서 열렸어요`,
        html: `<p>여기서는 앱으로 설치할 수 없어요. <b>${where}</b>에서 열면 홈 화면에 새싹스쿨을 놓을 수 있어요.</p>
          ${ext ? `<a class="btn btn-primary block" href="${ext}">${where}로 열기</a>` : ''}
          <p class="fine">버튼이 안 되면 ${env.ios ? '오른쪽 아래 공유(⋯) 버튼 › <b>Safari로 열기</b>' : '오른쪽 위 ⋮ 메뉴 › <b>다른 브라우저로 열기</b>'}를 눌러 주세요.</p>`,
      };
    }
    if (env.ios) {
      const chrome = env.iosNotSafari;
      return {
        title: `${ipad ? '아이패드' : '아이폰'} 홈 화면에 새싹스쿨 놓기`,
        html: steps([
          chrome
            ? `주소창 오른쪽의 <b>공유</b> 버튼 ${shareIco}을 눌러요.`
            : `Safari ${ipad ? '위쪽 주소창 오른쪽' : '아래쪽'}의 <b>공유</b> 버튼 ${shareIco}을 눌러요. <span class="fine">안 보이면 <b>⋯</b> 버튼을 먼저 눌러요.</span>`,
          `목록을 위로 올려 <b>홈 화면에 추가</b> ${addIco}를 눌러요.`,
          '오른쪽 위 <b>추가</b>를 누르면 끝! 홈 화면의 새싹 아이콘으로 바로 들어와요.',
        ]) + `<p class="fine">📌 설치한 앱에서 처음 한 번 <b>로그인</b>하면 공부 기록이 그대로 이어져요.${chrome ? ' 말하기(마이크)는 Safari에서 설치하면 가장 잘 돼요.' : ''}</p>`,
      };
    }
    if (env.android || deferred) {
      if (deferred) {
        return {
          title: '새싹스쿨을 앱으로 설치해요',
          html: `<p>버튼 한 번이면 홈 화면에 새싹 아이콘이 생겨요. 주소를 칠 필요 없이 앱처럼 바로 열려요.</p>
            <button class="btn btn-primary block" data-install>📲 홈 화면에 설치하기</button>`,
        };
      }
      return {
        title: '홈 화면에 새싹스쿨 놓기',
        html: samsung
          ? steps(['아래쪽 <b>≡</b> 메뉴를 눌러요.', '<b>현재 페이지 추가</b> › <b>홈 화면</b>을 눌러요.', '<b>추가</b>를 누르면 끝! 홈 화면의 새싹 아이콘으로 바로 들어와요.'])
          : steps(['Chrome 오른쪽 위 <b>⋮</b> 메뉴를 눌러요.', '<b>홈 화면에 추가</b> 또는 <b>앱 설치</b>를 눌러요.', '<b>설치</b>(추가)를 누르면 끝! 홈 화면의 새싹 아이콘으로 바로 들어와요.']),
      };
    }
    return {
      title: '휴대폰·태블릿에 앱처럼 놓기',
      html: '<p>아이폰·아이패드·안드로이드에서 <b>saessakschool.co.kr</b>에 들어오면 홈 화면에 새싹스쿨을 앱처럼 놓을 수 있어요. 들어오면 방법을 바로 알려 드려요.</p>',
    };
  }

  function open(auto = false) {
    const b = body();
    const m = App.modal(`<div class="ins">
      <img class="ins-app" src="img/icon-192.png" alt="" width="72" height="72">
      <h2>${b.title}</h2>${b.html}
      <div class="ins-foot">${auto ? '<button class="link-btn" data-later>나중에 할게요</button><button class="link-btn" data-never>다시 보지 않기</button>' : '<button class="btn btn-ghost sm" data-close>닫기</button>'}</div></div>`);
    const el = m.el;
    el.querySelector('[data-install]')?.addEventListener('click', async () => {
      const ev = deferred; deferred = null; if (!ev) return;
      ev.prompt();
      try { const r = await ev.userChoice; if (r.outcome === 'accepted') { save({ never: true }); App.toast('📲 홈 화면에 새싹스쿨이 생겼어요!'); } } catch (e) { /* ignore */ }
      m.close();
    });
    el.querySelector('[data-later]')?.addEventListener('click', () => { save({ until: Date.now() + 3 * 864e5 }); m.close(); });
    el.querySelector('[data-never]')?.addEventListener('click', () => { save({ never: true }); m.close(); });
    // 바깥을 눌러 닫으면 하루 뒤에 다시
    if (auto) save({ until: Date.now() + 864e5 });
  }

  const can = () => !standalone() && (env.ios || env.android);
  function due() {
    const s = load();
    return can() && !s.never && !(s.until > Date.now());
  }

  // 첫 화면이 뜨고 조금 뒤에 한 번. 레슨 중이거나 다른 창이 열려 있으면 다음 화면 이동 때 다시 본다
  function auto() {
    if (!due()) return;
    const tryShow = () => {
      if (!due()) return true;
      if (document.body.classList.contains('in-lesson') || !document.getElementById('modal').hidden) return false;
      open(true); return true;
    };
    setTimeout(() => {
      if (tryShow()) return;
      const again = () => setTimeout(() => { if (tryShow()) window.removeEventListener('hashchange', again); }, 1500);
      window.addEventListener('hashchange', again);
    }, 3000);
  }

  // 사이트 아래쪽 버튼: 이미 앱으로 열었으면 숨긴다
  function footer() {
    const btn = document.querySelector('[data-install-help]');
    if (!btn) return;
    btn.hidden = standalone();
    btn.onclick = () => open(false);
  }

  return { auto, open, footer, get available() { return !!deferred; } };
})();

/* 매일 학습 시간 알림 (웹 푸시, 무료)
 * 이 기기를 서버에 등록해 두면 부모가 정한 시간에 휴대폰 알림이 온다. 아이폰·아이패드는 홈 화면에 설치한 앱에서만 된다. */
const Push = (() => {
  const KEY = 'sprout-push';
  const env = Speech.env;
  const standalone = () => navigator.standalone === true || !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  const can = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && window.isSecureContext;
  const mark = on => { try { on ? localStorage.setItem(KEY, '1') : localStorage.removeItem(KEY); } catch (e) { /* ignore */ } };
  const isOn = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  const reg = () => navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready);
  const toKey = s => { const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)); };

  async function current() { if (!can()) return null; try { return await (await reg()).pushManager.getSubscription(); } catch (e) { return null; } }

  // 'login' | 'install'(아이폰 설치 필요) | 'unsupported' | 'denied' | 'on' | 'off'
  async function state() {
    if (!Store.user() || !API.on) return 'login';
    if (env.ios && !standalone()) return 'install';
    if (!can()) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    return Notification.permission === 'granted' && await current() ? 'on' : 'off';
  }

  async function enable() {
    if (await Notification.requestPermission() !== 'granted') throw new Error('알림을 허용해야 받을 수 있어요.');
    const r = await reg();
    const { key } = await API.req('GET', 'api/push/key');
    const sub = await r.pushManager.getSubscription() || await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(key) });
    await API.req('POST', 'api/push/subscribe', { sub: sub.toJSON() });
    mark(true);
  }
  async function disable() {
    const sub = await current();
    if (sub) { await API.req('POST', 'api/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => {}); await sub.unsubscribe().catch(() => {}); }
    mark(false);
  }
  const test = () => API.req('POST', 'api/push/test', {});

  // 앱을 열 때마다 이 기기 등록을 서버와 맞춘다 (다른 계정으로 로그인했거나 서버 DB가 바뀐 경우)
  async function sync() {
    if (!Store.user() || !API.on || !can() || Notification.permission !== 'granted') return;
    const sub = await current();
    if (sub) API.req('POST', 'api/push/subscribe', { sub: sub.toJSON() }).then(() => mark(true)).catch(() => {});
    else mark(false);
  }

  // 부모페이지 › 설정의 알림 칸
  async function render(box) {
    const s = await state();
    const msg = {
      login: '로그인하면 휴대폰으로 학습 알림을 받을 수 있어요.',
      install: '아이폰·아이패드는 <b>홈 화면에 설치한 새싹스쿨 앱</b>에서만 알림을 받을 수 있어요. 설치한 앱에서 이 화면을 다시 열어 켜 주세요.',
      unsupported: '이 브라우저는 휴대폰 알림을 지원하지 않아요. Chrome·Safari 최신 버전이나 홈 화면에 설치한 앱에서 켤 수 있어요.',
      denied: '알림이 차단되어 있어요. 휴대폰 설정에서 새싹스쿨(또는 이 브라우저)의 알림을 허용한 뒤 다시 열어 주세요.',
      off: '이 기기로 매일 정한 시간에 학습 알림을 받을 수 있어요. 오늘 목표를 다 채웠으면 보내지 않아요.',
      on: '✅ 이 기기로 매일 정한 시간에 학습 알림을 보내요. 오늘 목표를 다 채웠으면 보내지 않아요.',
    }[s];
    const btn = {
      install: '<button type="button" class="btn btn-ghost sm" data-p="install">📲 앱으로 설치하기</button>',
      off: '<button type="button" class="btn btn-primary sm" data-p="on">🔔 이 기기에서 알림 켜기</button>',
      on: '<button type="button" class="btn btn-ghost sm" data-p="test">테스트 알림 보내기</button> <button type="button" class="link-btn" data-p="off">이 기기 알림 끄기</button>',
    }[s] || '';
    box.innerHTML = `<p class="fine">${msg}</p>${btn ? `<div class="row">${btn}</div>` : ''}`;
    box.querySelectorAll('[data-p]').forEach(b => b.onclick = async () => {
      const act = b.dataset.p; b.disabled = true;
      try {
        if (act === 'install') return Install.open(false);
        if (act === 'on') { await enable(); App.toast('알림을 켰어요. 테스트 알림으로 확인해 보세요.'); }
        if (act === 'off') { await disable(); App.toast('이 기기 알림을 껐어요.'); }
        if (act === 'test') { const r = await test(); App.toast(r.sent ? '알림을 보냈어요. 잠시 뒤 휴대폰 알림을 확인해 주세요.' : '등록된 기기가 없어요. 알림을 다시 켜 주세요.'); }
      } catch (e) { App.toast(e.message || '알림을 켜지 못했어요.'); }
      finally { b.disabled = false; render(box); }
    });
  }

  return { state, enable, disable, sync, render, isOn, can };
})();
