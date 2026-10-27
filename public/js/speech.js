/* 새싹영어 — 음성 합성(TTS), 음성 인식(STT), 발음 점수, 효과음 */
const Speech = (() => {
  const synth = window.speechSynthesis;
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let voice = null;
  let rate = 0.85;
  // 목소리/효과음 볼륨을 따로 저장 (0~1)
  const vol = { voice: 1, sfx: 0.6 };
  try { Object.assign(vol, JSON.parse(localStorage.getItem('sprout-volume')) || {}); } catch (e) { /* ignore */ }

  function pickVoice() {
    if (!synth) return;
    const vs = synth.getVoices().filter(v => /^en(-|_)/i.test(v.lang));
    const pref = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Karen', 'Daniel'];
    voice = pref.map(n => vs.find(v => v.name.includes(n))).find(Boolean) || vs.find(v => /en-US/i.test(v.lang)) || vs[0] || null;
  }
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }

  function speak(text, { onBoundary, onEnd, slow } = {}) {
    if (!synth) { onEnd && onEnd(); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : 'en-US';
    u.rate = slow ? 0.6 : rate;
    u.pitch = 1.05;
    u.volume = vol.voice;
    if (onBoundary) u.onboundary = e => { if (e.name === 'word' || e.name === undefined) onBoundary(e.charIndex); };
    u.onend = () => onEnd && onEnd();
    u.onerror = () => onEnd && onEnd();
    synth.speak(u);
  }
  const stop = () => synth && synth.cancel();

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
      r.start();
    });
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
    speak, stop, listen, score, sfx,
    get canSpeak() { return !!synth; }, get canListen() { return !!Rec; },
    setRate(r) { rate = r; },
    get volume() { return { ...vol }; },
    setVolume(k, v) { vol[k] = v; try { localStorage.setItem('sprout-volume', JSON.stringify(vol)); } catch (e) { /* ignore */ } },
  };
})();
