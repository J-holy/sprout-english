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
