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
    // 미리 만들어 검증한 파일을 먼저 쓰고, 없는 문장만 서버에 요청한다
    const f = neural.manifest && neural.manifest[text.trim()];
    if (f) return `audio/${f}`;
    return neural.server ? `api/tts?text=${encodeURIComponent(text)}${slow ? '&slow=1' : ''}` : null;
  }
  // ---------- iPhone·iPad 소리 잠금 풀기 ----------
  // iOS(아이패드 Chrome 포함)는 손가락으로 누른 순간에만 새 소리를 켤 수 있어서, 자동 넘김처럼 시간이 지나 재생하면 막혔다.
  // 플레이어 하나를 계속 쓰고, 첫 터치 때 무음으로 한 번 켜 두면 그 뒤로는 누르지 않아도 재생된다.
  const player = typeof Audio === 'function' ? new Audio() : null;
  let unlocked = false, playId = 0, tickTimer = 0;
  function silentWav() { // 0.05초 무음 WAV
    const n = 400, b = new Uint8Array(44 + n * 2), v = new DataView(b.buffer);
    const put = (o, t) => [...t].forEach((c, i) => { b[o + i] = c.charCodeAt(0); });
    put(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); put(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); put(36, 'data'); v.setUint32(40, n * 2, true);
    return 'data:audio/wav;base64,' + btoa(String.fromCharCode(...b));
  }
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    // 지금 읽고 있지 않을 때만 무음을 켠다 (읽는 중이면 그 소리로 이미 풀렸다)
    if (player && !audio) { player.src = silentWav(); player.play().catch(() => {}); }
    if (synth) { try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); } catch (e) { /* ignore */ } }
  }
  ['touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { capture: true, passive: true }));

  function clearAudio() {
    playId++; timers.forEach(clearTimeout); timers = []; clearTimeout(tickTimer);
    if (audio) { audio.pause(); audio = null; }
  }
  // AI 음성 파일에는 단어 위치 정보가 없어서, 단어 길이와 문장부호 쉼으로 단어마다 시간을 나눈다.
  // 앞뒤의 짧은 무음은 빼고, 실제 재생 위치(currentTime)를 보고 단어를 켜므로 잠깐 끊겨도 어긋나지 않는다.
  function wordTimeline(text, duration) {
    const ws = text.split(' ');
    const weight = ws.map((w, i) => w.replace(/[^A-Za-z0-9]/g, '').length + 2 + (i < ws.length - 1 && /[,.!?]$/.test(w) ? 4 : 0));
    // 실제 AI 음성 파일을 재 보면 앞 무음은 약 0.1초, 끝 무음은 약 0.25초(물음표)~0.45초(마침표)
    const lead = Math.min(0.11, duration * 0.08), tail = Math.min(/\?$/.test(text) ? 0.25 : 0.42, duration * 0.18);
    const span = Math.max(0.1, duration - lead - tail), total = weight.reduce((a, b) => a + b, 0);
    let acc = 0;
    return weight.map(x => { const at = lead + acc / total * span; acc += x; return at; });
  }
  function playNeural(text, { onWord, onEnd, slow, deviceText }) {
    const url = audioUrl(text, slow);
    if (!url) return false;
    const id = ++playId, a = player || new Audio();
    audio = a;
    a.src = url;
    a.volume = vol.voice;
    // 서버는 천천히 버전을 따로 만들고, 미리 만든 파일은 재생 속도로 늦춘다
    a.defaultPlaybackRate = a.playbackRate = slow ? (url.startsWith('api/') ? 1 : 0.75) : rate / 0.85;
    let ended = false, guard = 0;
    const alive = () => id === playId && !ended;
    const stopHere = () => { ended = true; clearTimeout(tickTimer); clearTimeout(guard); if (audio === a) audio = null; };
    const finish = () => { if (!alive()) return; stopHere(); onEnd && onEnd(); };
    const fallback = () => { if (!alive()) return; stopHere(); a.pause(); speakBrowser(deviceText || text, { onWord, onEnd, slow }); };
    // 지킴이: 4초 안에 소리가 시작되지 않으면 기기 목소리로 읽고, 시작했는데 끝 알림이 안 오면 길이만큼 지나서 끝낸다
    // (아이패드에서 소리가 막히거나 알림이 빠지면 자동 넘김이 그 자리에서 멈췄다)
    guard = setTimeout(fallback, 4000);
    a.onended = () => { if (audio === a || alive()) finish(); };
    a.onerror = () => fallback();
    a.onplaying = () => {
      if (!alive()) return;
      clearTimeout(guard);
      const dur = isFinite(a.duration) && a.duration > 0 ? a.duration : text.length * 0.08;
      guard = setTimeout(finish, Math.max(0, dur - a.currentTime) / (a.playbackRate || 1) * 1000 + 2500);
      if (!onWord) return;
      clearTimeout(tickTimer);
      const marks = wordTimeline(text, dur);
      const tick = () => {
        if (!alive()) return;
        let k = 0; while (k + 1 < marks.length && a.currentTime >= marks[k + 1]) k++;
        onWord(k);
        tickTimer = setTimeout(tick, 40);
      };
      tick();
    };
    // 다음 소리로 바꿀 때 나는 AbortError는 정상, 그 밖(재생이 막힘 등)은 기기 목소리로
    a.play().catch(err => { if (err && err.name === 'AbortError') return; fallback(); });
    return true;
  }

  function speakBrowser(text, { onWord, onEnd, slow } = {}) {
    if (!synth) { onEnd && onEnd(); return; }
    const busy = synth.speaking || synth.pending;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : 'en-US';
    u.rate = slow ? 0.5 : rate; // 천천히는 확실히 느리게 (기기마다 속도 반영 정도가 달라서 크게 차이를 둔다)
    u.pitch = 1;
    u.volume = vol.voice;
    if (onWord) {
      let offset = 0; const starts = text.split(' ').map(w => { const o = offset; offset += w.length + 1; return o; });
      u.onboundary = e => { if (e.name === 'word' || e.name === undefined) onWord(Math.max(0, starts.filter(x => x <= e.charIndex).length - 1)); };
    }
    // 일부 기기(특히 iPhone)는 cancel() 바로 뒤에 말하면 소리 없이 '끝남'을 먼저 보낸다 → 시작 전에 온 끝남은 한 번 다시 말한다
    // 지킴이: 끝 알림이 아예 안 오는 기기도 있어서, 넉넉한 시간이 지나면 끝난 것으로 본다 (자동 넘김이 멈추지 않게)
    let started = false, retried = false, done = false;
    const limit = () => 2500 + text.split(' ').length * (slow ? 1000 : 550);
    const end = () => { if (done) return; done = true; clearTimeout(guard); onEnd && onEnd(); };
    let guard = setTimeout(end, limit() + 2000);
    u.onstart = () => { started = true; clearTimeout(guard); guard = setTimeout(end, limit()); if (onWord) onWord(0); };
    u.onend = () => {
      if (!started && !retried) { retried = true; setTimeout(() => synth.speak(u), 120); return; }
      end();
    };
    u.onerror = e => { if (e.error === 'interrupted' || e.error === 'canceled') return; end(); };
    // 말하던 중이었다면 잠깐 쉬었다가 (끊긴 소리와 겹치지 않게)
    if (busy) setTimeout(() => synth.speak(u), 60); else synth.speak(u);
  }
  // 재생 번호: 멈추거나 새로 말하면 번호가 바뀌고, 지난 재생의 끝/단어 알림은 무시한다.
  // (브라우저는 중간에 멈춘 문장에도 '끝남'을 보내서, 스토리북이 페이지를 한 번 더 넘기는 등 소리가 겹쳤다)
  let gen = 0, later = [];
  // 알파벳을 이름으로 읽게 바꾸는 speechText()는 content.js에 있어요 (AI 음성 미리 만들기와 같이 쓰려고)
  function speak(text, opts = {}) {
    // 기기 목소리는 글자 하나('A')를 글자 이름으로 잘 읽지만 'ay' 같은 이름 철자는 '아이'로 읽기도 해서, 그때는 글자를 그대로 준다
    const raw = String(text).trim(), deviceText = /^[A-Z]$/.test(raw) ? raw : null;
    text = speechText(text);
    stop();
    const my = gen;
    const only = fn => fn && ((...a) => { if (my === gen) fn(...a); });
    // 같은 단어로 여러 번 알리지 않는다 (강조가 깜빡이지 않게)
    let lastWord = -1;
    const userWord = opts.onWord;
    const onWord = userWord && only(k => { if (k !== lastWord) { lastWord = k; userWord(k); } });
    opts = { ...opts, onEnd: only(opts.onEnd), onWord };
    if (useNeural() && playNeural(text, { ...opts, deviceText })) return;
    speakBrowser(deviceText || text, opts);
  }
  // 잠시 뒤에 말하기 — 그 사이 멈추거나 다른 소리가 나면 취소된다
  function speakLater(text, ms, opts) { later.push(setTimeout(() => speak(text, opts), ms)); }
  function stop() {
    gen++;
    if (recording) recording.stop();
    later.forEach(clearTimeout); later = [];
    clearAudio();
    if (synth) synth.cancel();
  }

  // ---------- 녹음 (브라우저에 음성 인식이 없는 기기용) ----------
  // 아이패드·아이폰의 Chrome 등은 브라우저 음성 인식이 막혀 있어서, 직접 녹음해 서버(/api/stt)로 채점하거나
  // 서버가 없으면 내 목소리와 원어민 소리를 비교해 듣게 한다. 말이 끝나고 조용해지면 저절로 멈춘다.
  let sttOn = false, recording = null;
  const webSpeechOk = () => !!Rec && env.secure && !env.inApp && !env.iosNotSafari;
  const canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && !!(window.AudioContext || window.webkitAudioContext) && env.secure && !env.inApp;
  function toWav(chunks, inRate) {
    const all = new Float32Array(chunks.reduce((n, c) => n + c.length, 0)); let o = 0;
    chunks.forEach(c => { all.set(c, o); o += c.length; });
    const ratio = inRate / 16000, n = Math.floor(all.length / ratio), b = new DataView(new ArrayBuffer(44 + n * 2));
    const put = (at, t) => [...t].forEach((c, i) => b.setUint8(at + i, c.charCodeAt(0)));
    put(0, 'RIFF'); b.setUint32(4, 36 + n * 2, true); put(8, 'WAVEfmt '); b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true);
    b.setUint32(24, 16000, true); b.setUint32(28, 32000, true); b.setUint16(32, 2, true); b.setUint16(34, 16, true); put(36, 'data'); b.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) {
      // 16kHz로 줄일 때 구간 평균을 내서 거친 소리를 막는다
      const s0 = Math.floor(i * ratio), s1 = Math.max(s0 + 1, Math.floor((i + 1) * ratio)); let v = 0;
      for (let j = s0; j < s1; j++) v += all[j];
      b.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v / (s1 - s0))) * 0x7fff, true);
    }
    return new Blob([b], { type: 'audio/wav' });
  }
  async function record({ maxMs = 8000, silenceMs = 1300 } = {}) {
    stop();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume();
    const src = ctx.createMediaStreamSource(stream), proc = ctx.createScriptProcessor(4096, 1, 1);
    const chunks = [], t0 = Date.now(); let heard = false, quiet = t0;
    return new Promise(resolve => {
      const finish = () => {
        if (!recording) return; recording = null;
        proc.onaudioprocess = null; proc.disconnect(); src.disconnect();
        stream.getTracks().forEach(t => t.stop()); ctx.close().catch(() => {}); // 마이크를 바로 꺼서 소리 크기가 돌아오게
        resolve(heard ? toWav(chunks, ctx.sampleRate) : null);
      };
      recording = { stop: finish };
      proc.onaudioprocess = ev => {
        const d = ev.inputBuffer.getChannelData(0); chunks.push(new Float32Array(d));
        let e = 0; for (let i = 0; i < d.length; i += 4) e += d[i] * d[i];
        const now = Date.now();
        if (Math.sqrt(e / (d.length / 4)) > 0.02) { heard = true; quiet = now; }
        if ((heard && now - quiet > silenceMs) || now - t0 > maxMs) finish();
      };
      src.connect(proc); proc.connect(ctx.destination);
    });
  }
  const stopRecording = () => recording && recording.stop();
  async function listenServer(hint) {
    let wav;
    try { wav = await record(); } catch (e) { throw new Error(e && e.name === 'NotAllowedError' ? 'not-allowed' : 'audio-capture'); }
    if (!wav) throw new Error('no-speech');
    let r;
    try {
      r = await fetch('api/stt' + (hint ? '?text=' + encodeURIComponent(hint.replace(/\s+/g, ' ').trim().slice(0, 200)) : ''), {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'audio/wav', 'X-Sprout': '1' }, body: wav,
      });
    } catch (e) { throw new Error('network'); }
    if (r.status === 401) throw new Error('login');
    if (!r.ok) throw new Error(r.status === 429 ? 'busy' : 'network');
    const { alts } = await r.json();
    if (!alts || !alts.length) throw new Error('no-speech');
    return alts;
  }

  // 한 번 듣고 결과 후보 문장들을 돌려줌 (hint: 아이가 읽으려는 문장 — 서버 인식이 알아듣는 데 쓴다)
  function listen({ timeout = 8000, hint = '' } = {}) {
    if (!webSpeechOk() && sttOn && canRecord()) return listenServer(hint);
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
  // 아이패드 Chrome은 Mac처럼 보이는 주소(UA)를 쓰기도 해서, Chrome이 넣는 __gCrWeb 로도 알아본다
  env.iosNotSafari = env.ios && (/CriOS|FxiOS|EdgiOS|Whale|NAVER|DaumApps|KAKAOTALK/i.test(ua) || typeof window.__gCrWeb !== 'undefined');
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
    if (env.iosNotSafari) return 'iPhone·iPad에서는 Safari에서만 말하기(마이크)가 돼요. 위쪽 "Safari로 열기"를 눌러 주세요. (듣기·따라 읽기는 지금 브라우저에서도 돼요)';
    if (env.ios) return 'iOS 14.5 이상의 Safari에서 말하기를 쓸 수 있어요. iPhone을 업데이트하거나 Safari로 열어 주세요.';
    return '이 브라우저는 음성 인식을 지원하지 않아요. Chrome·Edge·삼성 인터넷 최신 버전으로 열어 주세요.';
  }
  // 음성 인식 오류 코드 → 아이·부모님이 할 일
  function micHelp(code) {
    const permIOS = '설정 › Safari › 마이크를 "허용"으로 바꾸고, 설정 › 일반 › 키보드 › "받아쓰기"를 켜 주세요.';
    const permAndroid = '주소창 왼쪽 자물쇠(ⓘ) › 권한 › 마이크 "허용"으로 바꾸고 새로고침해 주세요.';
    const permPC = '주소창 왼쪽 자물쇠 › 마이크 "허용"으로 바꾸고 새로고침해 주세요.';
    // iPhone의 Chrome·네이버 앱 등은 권한을 줘도 음성 인식이 막혀 있다
    if (code === 'login') return '🎤 말하기 점수는 로그인하면 받을 수 있어요.';
    if (env.iosNotSafari && !sttOn && ['not-allowed', 'service-not-allowed', 'unsupported'].includes(code)) return '🎤 iPhone·iPad에서는 Safari에서만 말하기 점수가 나와요. 공유 버튼 › "Safari로 열기"로 열어 주세요.';
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
    get canSpeak() { return !!synth || !!(neural.server || neural.manifest); }, get canListen() { return webSpeechOk() || (sttOn && canRecord()); },
    env, externalUrl, unsupportedReason, micHelp, micPermission,
    // 서버/정적 AI 음성 연결 (App.init에서 호출)
    configure({ server, manifest, stt }) { neural = { server: !!server, manifest: manifest || null }; sttOn = !!stt; },
    record, stopRecording, get canRecord() { return canRecord(); }, get usesServerStt() { return !webSpeechOk() && sttOn && canRecord(); },
    get neuralAvailable() { return !!(neural.server || neural.manifest); },
    get voiceChoice() { return chosen; },
    get voiceName() { return useNeural() ? '또렷한 학습 목소리' : voice ? voice.name : '기본 목소리'; },
    voices: () => englishVoices().map(v => ({ uri: v.voiceURI, name: v.name, lang: v.lang, natural: NATURAL.test(v.name) })),
    // '' = 자동, 'neural' = AI 음성, 'browser' = 기기 목소리 자동, 그 외 = 특정 기기 목소리
    setVoice(c) { chosen = c; try { localStorage.setItem('sprout-voice', c); } catch (e) { /* ignore */ } pickVoice(); },
    setRate(r) { rate = r; },
    get volume() { return { ...vol }; },
    setVolume(k, v) { vol[k] = v; try { localStorage.setItem('sprout-volume', JSON.stringify(vol)); } catch (e) { /* ignore */ } },
  };
})();
