/* 새싹영어 — 음성 합성(TTS), 음성 인식(STT), 발음 점수, 효과음 */
const Speech = (() => {
  const synth = window.speechSynthesis;
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let voice = null;
  let rate = 0.85;
  // 기본은 '자동': AI 음성이 있으면 AI 음성, 없으면 이 기기에서 가장 자연스러운 목소리
  // 목소리/효과음 볼륨을 따로 저장 (0~1)
  const vol = { voice: 1, sfx: 0.6 };
  try { Object.assign(vol, JSON.parse(localStorage.getItem('sprout-volume')) || {}); } catch (e) { /* ignore */ }

  // ---------- 목소리 고르기 ----------
  // 이름에 이런 말이 있으면 신경망(자연스러운) 목소리예요: Edge의 "Online (Natural)", Apple의 Premium/Enhanced 등
  const NATURAL = /natural|neural|online|premium|enhanced|google/i;
  const NICE = /ava|jenny|aria|emma|michelle|samantha|allison|zoe|evan|nathan|google us/i;
  // macOS의 장난스러운 효과 목소리는 빼요
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph|grandma|grandpa|rocko|shelley|flo|eddy|reed|sandy/i;
  const quality = v => (NATURAL.test(v.name) ? 4 : 0) + (NICE.test(v.name) ? 2 : 0) + (/en[-_]US/i.test(v.lang) ? 1 : 0) + (v.localService ? 0 : 0.5);
  let chosen = '';
  try { chosen = localStorage.getItem('sprout-voice') || ''; } catch (e) { /* ignore */ }
  const englishVoices = () => synth ? synth.getVoices().filter(v => /^en(-|_)/i.test(v.lang) && !NOVELTY.test(v.name)).sort((a, b) => quality(b) - quality(a)) : [];
  function pickVoice() {
    const vs = englishVoices();
    voice = (chosen && chosen !== 'neural' && vs.find(v => v.voiceURI === chosen)) || vs[0] || null;
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }

  // ---------- AI 음성 (서버 /api/tts 또는 미리 만든 audio/ 파일) ----------
  let neural = { server: false, manifest: null };
  let audio = null, timers = [];
  const useNeural = () => (neural.server || neural.manifest) && chosen !== 'browser' && !(chosen && chosen !== 'neural' && voice && voice.voiceURI === chosen);
  function audioUrl(text, slow) {
    if (neural.server) return `api/tts?text=${encodeURIComponent(text)}${slow ? '&slow=1' : ''}`;
    const f = neural.manifest && neural.manifest[text.trim()];
    return f ? `audio/${f}` : null;
  }
  function clearAudio() {
    timers.forEach(clearTimeout); timers = [];
    if (audio) { audio.onended = audio.onerror = null; audio.pause(); audio = null; }
  }
  function playNeural(text, { onBoundary, onEnd, slow }) {
    const url = audioUrl(text, slow);
    if (!url) return false;
    const a = new Audio(url); audio = a;
    a.volume = vol.voice;
    // 서버는 천천히 버전을 따로 만들고, 미리 만든 파일은 재생 속도로 늦춘다
    a.playbackRate = slow ? (neural.server ? 1 : 0.75) : rate / 0.85;
    let ended = false;
    const finish = () => { if (ended) return; ended = true; timers.forEach(clearTimeout); timers = []; onEnd && onEnd(); };
    a.onended = finish;
    a.onerror = () => { if (audio === a) { audio = null; speakBrowser(text, { onBoundary, onEnd, slow }); } };
    if (onBoundary) a.onplaying = () => {
      // 오디오에는 단어 위치 정보가 없어서 글자 수 비율로 단어 강조 시점을 계산한다
      const total = (a.duration || text.length * 0.07) / a.playbackRate * 1000;
      let at = 0;
      text.split(' ').forEach(w => { const t = at / text.length * total; const ci = at; timers.push(setTimeout(() => onBoundary(ci), t)); at += w.length + 1; });
    };
    a.play().catch(() => { if (audio === a) { audio = null; speakBrowser(text, { onBoundary, onEnd, slow }); } });
    return true;
  }

  function speakBrowser(text, { onBoundary, onEnd, slow } = {}) {
    if (!synth) { onEnd && onEnd(); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : 'en-US';
    u.rate = slow ? 0.65 : rate;
    u.pitch = 1;
    u.volume = vol.voice;
    if (onBoundary) u.onboundary = e => { if (e.name === 'word' || e.name === undefined) onBoundary(e.charIndex); };
    u.onend = () => onEnd && onEnd();
    u.onerror = () => onEnd && onEnd();
    synth.speak(u);
  }
  // 재생 번호: 멈추거나 새로 말하면 번호가 바뀌고, 지난 재생의 끝/단어 알림은 무시한다.
  // (브라우저는 중간에 멈춘 문장에도 '끝남'을 보내서, 스토리북이 페이지를 한 번 더 넘기는 등 소리가 겹쳤다)
  let gen = 0, later = [];
  function speak(text, opts = {}) {
    stop();
    const my = gen;
    const only = fn => fn && ((...a) => { if (my === gen) fn(...a); });
    opts = { ...opts, onEnd: only(opts.onEnd), onBoundary: only(opts.onBoundary) };
    if (useNeural() && playNeural(text, opts)) return;
    speakBrowser(text, opts);
  }
  // 잠시 뒤에 말하기 — 그 사이 멈추거나 다른 소리가 나면 취소된다
  function speakLater(text, ms, opts) { later.push(setTimeout(() => speak(text, opts), ms)); }
  function stop() {
    gen++;
    later.forEach(clearTimeout); later = [];
    clearAudio();
    if (synth) synth.cancel();
  }

  // 한 번 듣고 결과 후보 문장들을 돌려줌
  function listen({ timeout = 8000 } = {}) {
    return new Promise((resolve, reject) => {
      if (!Rec) return reject(new Error('unsupported'));
      stop();
      const r = new Rec();
      r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
      let done = false;
      const finish = (fn, v) => { if (!done) { done = true; clearTimeout(t); try { r.stop(); } catch (e) { /* noop */ } fn(v); } };
      const t = setTimeout(() => finish(reject, new Error('timeout')), timeout);
      r.onresult = e => finish(resolve, [...e.results[0]].map(a => a.transcript));
      r.onerror = e => finish(reject, new Error(e.error || 'error'));
      r.onend = () => finish(reject, new Error('no-speech'));
      try { r.start(); } catch (e) { finish(reject, new Error('busy')); }
    });
  }

  // ---------- 기기·브라우저 확인과 마이크 안내 ----------
  const ua = navigator.userAgent || '';
  const env = {
    ios: /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    android: /Android/i.test(ua),
    kakao: /KAKAOTALK/i.test(ua),
    // 앱 안의 브라우저 (카카오톡·인스타그램·페이스북·네이버·라인·밴드 등)는 마이크가 막힌 경우가 많다
    inApp: /KAKAOTALK|Instagram|FBAN|FBAV|NAVER\(inapp|; wv\)|Line\/|BAND\/|DaumApps|everytimeApp|SamsungBrowser\/.*CrossApp/i.test(ua),
  };
  env.iosNotSafari = env.ios && /CriOS|FxiOS|EdgiOS|Whale|NAVER|DaumApps|KAKAOTALK/i.test(ua);
  env.secure = window.isSecureContext !== false;
  // 외부 브라우저로 열기 주소 (카카오톡은 전용 주소, 안드로이드는 Chrome 인텐트)
  function externalUrl(url = location.href) {
    if (env.kakao) return 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url);
    // iOS 17부터 x-safari-https:// 로 Safari에서 바로 열 수 있다 (크롬·인스타그램 등)
    if (env.ios) return 'x-safari-' + url;
    if (env.android) return 'intent://' + url.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end';
    return null; // iPhone은 공유 버튼 › Safari로 열기
  }
  // 음성 인식을 쓸 수 없는 이유 (쓸 수 있으면 '')
  function unsupportedReason() {
    if (Rec && env.secure && !env.inApp && !env.iosNotSafari) return '';
    if (!env.secure) return '보안 연결(https)이 아니라 마이크를 쓸 수 없어요. https:// 주소로 열어 주세요.';
    if (env.inApp) return env.ios ? '앱 안의 브라우저에서는 말하기가 안 돼요. 오른쪽 아래 공유(⋯) 버튼 › "Safari로 열기"로 열어 주세요.' : '앱 안의 브라우저에서는 말하기가 안 돼요. 위쪽 "Chrome으로 열기"를 눌러 주세요.';
    if (env.iosNotSafari) return 'iPhone에서는 Safari에서만 말하기(마이크)가 돼요. 위쪽 "Safari로 열기"를 눌러 주세요.';
    if (env.ios) return 'iOS 14.5 이상의 Safari에서 말하기를 쓸 수 있어요. iPhone을 업데이트하거나 Safari로 열어 주세요.';
    return '이 브라우저는 음성 인식을 지원하지 않아요. Chrome·Edge·삼성 인터넷 최신 버전으로 열어 주세요.';
  }
  // 음성 인식 오류 코드 → 아이·부모님이 할 일
  function micHelp(code) {
    const permIOS = '설정 › Safari › 마이크를 "허용"으로 바꾸고, 설정 › 일반 › 키보드 › "받아쓰기"를 켜 주세요.';
    const permAndroid = '주소창 왼쪽 자물쇠(ⓘ) › 권한 › 마이크 "허용"으로 바꾸고 새로고침해 주세요.';
    const permPC = '주소창 왼쪽 자물쇠 › 마이크 "허용"으로 바꾸고 새로고침해 주세요.';
    // iPhone의 Chrome·네이버 앱 등은 권한을 줘도 음성 인식이 막혀 있다
    if (env.iosNotSafari && ['not-allowed', 'service-not-allowed', 'unsupported'].includes(code)) return '🎤 iPhone에서는 Safari에서만 말하기 점수가 나와요. 공유 버튼 › "Safari로 열기"로 열어 주세요.';
    switch (code) {
      case 'not-allowed': return '🎤 마이크가 꺼져 있어요. ' + (env.ios ? permIOS : env.android ? permAndroid : permPC);
      case 'service-not-allowed': return env.ios ? '🎤 iPhone 받아쓰기가 꺼져 있어요. 설정 › 일반 › 키보드 › "받아쓰기"를 켜고 Safari로 열어 주세요.' : unsupportedReason() || '🎤 이 브라우저에서 음성 인식을 쓸 수 없어요. Chrome으로 열어 주세요.';
      case 'audio-capture': return '🎤 마이크를 찾지 못했어요. 다른 앱(통화·녹음)이 마이크를 쓰고 있는지 확인해 주세요.';
      case 'network': return '📶 음성 인식은 인터넷이 필요해요. 연결을 확인해 주세요.';
      case 'unsupported': return unsupportedReason();
      case 'busy': return '잠깐만요, 다시 한 번 눌러 주세요.';
      case 'timeout': case 'no-speech': case 'aborted': default: return '소리를 듣지 못했어요. 마이크 가까이에서 또박또박 말해 볼까요?';
    }
  }
  // 마이크 권한 상태 ('granted' | 'denied' | 'prompt' | 'unknown')
  async function micPermission() {
    try { return (await navigator.permissions.query({ name: 'microphone' })).state; } catch (e) { return 'unknown'; }
  }

  const norm = s => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s-]/g, ' ').replace(/-/g, ' ').split(/\s+/).filter(Boolean);
  function lev(a, b) {
    const m = a.length, n = b.length; const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  const sim = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length, 1);

  // 목표 문장 대비 단어별 일치도 (순서를 고려한 정렬)
  function scoreOne(target, heard) {
    const T = norm(target), H = norm(heard);
    const words = T.map(w => ({ w, ok: 0 }));
    let hi = 0;
    for (const tw of words) {
      let best = 0, bestJ = -1;
      for (let j = hi; j < Math.min(H.length, hi + 3); j++) {
        const s = sim(tw.w, H[j]); if (s > best) { best = s; bestJ = j; }
      }
      if (best >= 0.99) tw.ok = 1; else if (best >= 0.6) tw.ok = 0.5;
      if (tw.ok) hi = bestJ + 1;
    }
    const score = Math.round(words.reduce((s, w) => s + w.ok, 0) / Math.max(words.length, 1) * 100);
    return { score, words, heard };
  }
  function score(target, alts) {
    return alts.map(h => scoreOne(target, h)).sort((a, b) => b.score - a.score)[0] || { score: 0, words: norm(target).map(w => ({ w, ok: 0 })), heard: '' };
  }

  // ---------- 효과음 (Web Audio) ----------
  let ctx = null;
  function tone(freqs, dur = 0.12, type = 'sine', level = 0.15) {
    const v = level * vol.sfx * 2;
    if (v <= 0) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
        const t0 = ctx.currentTime + i * dur;
        g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 1.6);
        o.start(t0); o.stop(t0 + dur * 1.7);
      });
    } catch (e) { /* audio unavailable */ }
  }
  const sfx = {
    correct: () => tone([660, 880]),
    wrong: () => tone([220, 180], 0.15, 'square', 0.06),
    tap: () => tone([520], 0.05, 'sine', 0.08),
    cheer: () => tone([523, 659, 784, 1047], 0.11, 'triangle', 0.12),
  };

  return {
    speak, speakLater, stop, listen, score, sfx,
    get canSpeak() { return !!synth || !!(neural.server || neural.manifest); }, get canListen() { return !!Rec && env.secure && !env.inApp && !env.iosNotSafari; },
    env, externalUrl, unsupportedReason, micHelp, micPermission,
    // 서버/정적 AI 음성 연결 (App.init에서 호출)
    configure({ server, manifest }) { neural = { server: !!server, manifest: manifest || null }; },
    get neuralAvailable() { return !!(neural.server || neural.manifest); },
    get voiceChoice() { return chosen; },
    get voiceName() { return useNeural() ? 'AI 자연 음성' : voice ? voice.name : '기본 목소리'; },
    voices: () => englishVoices().map(v => ({ uri: v.voiceURI, name: v.name, lang: v.lang, natural: NATURAL.test(v.name) })),
    // '' = 자동, 'neural' = AI 음성, 'browser' = 기기 목소리 자동, 그 외 = 특정 기기 목소리
    setVoice(c) { chosen = c; try { localStorage.setItem('sprout-voice', c); } catch (e) { /* ignore */ } pickVoice(); },
    setRate(r) { rate = r; },
    get volume() { return { ...vol }; },
    setVolume(k, v) { vol[k] = v; try { localStorage.setItem('sprout-volume', JSON.stringify(vol)); } catch (e) { /* ignore */ } },
  };
})();
