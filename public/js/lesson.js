/* 새싹영어 — 문항 생성기 + 레슨 진행 엔진 */
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickOthers = (pool, n, not) => shuffle([...new Set(pool)].filter(x => x !== not)).slice(0, n);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const words = s => s.replace(/[.?!,]/g, '').split(/\s+/);

const Gen = (() => {
  // 스테이지 은행을 레벨 수만큼 나눠 각 레벨 몫을 돌려줌
  // 3단계부터는 손으로 쓴 문장 뒤에 자동 생성 문장(generator.js)을 더해 열흘 동안 겹치지 않게 한다
  const GEN_PER_LEVEL = 36;
  const itemCache = {};
  function levelItems(level) {
    if (itemCache[level]) return itemCache[level];
    const st = stageOf(level), k = st.levels.indexOf(level), n = st.levels.length;
    let bank;
    if (st.id === 1) bank = LETTERS;
    else if (st.id === 2) return (itemCache[level] = PHONICS[level].map(([en, emoji, ko]) => ({ en, emoji, ko })));
    else if (QA[st.id]) bank = QA[st.id].map(([q, a, ko]) => ({ q, a, ko }));
    else bank = SENTENCES[st.id].map(([en, ko, emoji]) => ({ en, ko, emoji }));
    const size = Math.ceil(bank.length / n);
    const own = bank.slice(k * size, k * size + size);
    if (st.id === 1) return (itemCache[level] = own);
    // 같은 단계의 다른 레벨에 이미 있는 문장은 빼고 만든다
    const gen = GEN.forLevel(level, GEN_PER_LEVEL, bank).map(x => ({ ...x, gen: true }));
    return (itemCache[level] = own.concat(gen));
  }
  // 단계 전체 문장 (오답 보기용)
  const stageCache = {};
  const stageItems = st => stageCache[st] || (stageCache[st] = STAGES.find(s => s.id === st).levels.flatMap(levelItems));
  // 질문 종류 (첫 두 단어) — 같은 종류 질문의 대답은 오답 보기로 쓰지 않는다 (둘 다 맞는 답이 될 수 있어서)
  const qKind = q => { const w = q.toLowerCase().split(' '); return ['where', 'when', 'who', 'how'].includes(w[0]) ? w[0] : w.slice(0, 2).join(' '); };
  const wrongAnswers = (Q, pool) => pool.filter(x => qKind(x.q) !== qKind(Q.q) && x.a !== Q.a).map(x => x.a);
  const wrongQuestions = (Q, pool) => pool.filter(x => qKind(x.q) !== qKind(Q.q)).map(x => x.q);
  // 레벨마다 1~9일째: 새 항목 + 앞에서 배운 항목 복습, 10일째: 레벨 전체 복습
  const isReviewDay = idx => idx >= LESSONS_PER_LEVEL - 1;
  // weak: 자주 틀린 항목 id — 복습 몫에서 먼저 고른다
  const weakFirst = (list, weak) => { const s = shuffle(list); return s.filter(x => weak.has(itemId(x))).concat(s.filter(x => !weak.has(itemId(x)))); };
  function lessonItems(level, idx, weak = new Set()) {
    const items = levelItems(level), newDays = LESSONS_PER_LEVEL - 1;
    if (isReviewDay(idx)) return weakFirst(items, weak).slice(0, 6);
    const per = Math.ceil(items.length / newDays);
    const fresh = items.slice(idx * per, idx * per + per);
    const review = weakFirst(items.slice(0, idx * per), weak).slice(0, Math.max(2, 5 - fresh.length));
    let chunk = fresh.concat(review);
    if (chunk.length < 4) chunk = chunk.concat(shuffle(items.filter(x => !chunk.includes(x))).slice(0, 4 - chunk.length));
    return chunk;
  }

  const choice = (key, title, answer, others, extra = {}) => ({ type: 'choice', key, title, answer, options: shuffle([answer, ...others]), ...extra });

  // 빠진 모음 고르기: c_t
  function vowelQ(W) {
    const i = W.en.search(/[aeiou]/); if (i <= 0) return [];
    const v = W.en[i];
    return [() => choice(`ph-vowel-${W.en}`, '빠진 모음을 골라요', v, pickOthers('aeiou'.split(''), 2, v), { show: `${W.emoji} ${W.en.slice(0, i)}_${W.en.slice(i + 1)}`, say: W.en })];
  }
  // 모음 짝 고르기: tr__ (ee · ea · ai · oa)
  const TEAMS = ['ee', 'ea', 'ai', 'oa'];
  const teamOf = w => TEAMS.find(t => w.includes(t));
  function teamQ(W) {
    const t = teamOf(W.en); if (!t) return [];
    const i = W.en.indexOf(t);
    // ee와 ea는 소리가 같아서 서로 오답 보기로 쓰지 않는다
    const others = TEAMS.filter(x => x !== t && !(/^e[ea]$/.test(x) && /^e[ea]$/.test(t)));
    return [() => choice(`ph-team-${W.en}`, '빠진 모음 짝을 골라요', t, pickOthers(others, 2), { show: `${W.emoji} ${W.en.slice(0, i)}__${W.en.slice(i + 2)}`, say: W.en })];
  }
  // 끝소리가 같은 단어 (cat — hat)
  function rhymeQ(W, all) {
    const end = W.en.slice(-2), same = all.filter(x => x[0] !== W.en && x[0].slice(-2) === end);
    if (!same.length) return [];
    const [r, re] = same[Math.floor(Math.random() * same.length)];
    const cands = all.filter(x => x[0].slice(-2) !== end && x[0].slice(-1) !== W.en.slice(-1)).map(([en, emoji]) => ({ en, emoji }));
    const others = pictureOthers(cands, 2, { en: r, emoji: re }).map(x => `${x.emoji} ${x.en}`);
    return [() => choice(`ph-rhyme-${W.en}`, '끝소리가 같은 단어를 골라요', `${re} ${r}`, others, { show: `${W.emoji} ${W.en}`, say: W.en })];
  }

  const B = {
    1: (L, t) => {
      const pool = LETTERS.map(x => x.letter);
      const [word, emoji] = L.words[t % L.words.length]; // 날마다 다른 그림 단어
      // X는 x로 시작하는 쉬운 단어가 없어서 끝소리로 배운다 (box, fox, six)
      const sound = L.ending ? `${word} ends with ${L.letter}` : `${L.letter} is for ${word}`;
      return [
        () => choice(`ltr-listen-${L.letter}`, '소리를 듣고 알파벳을 골라요', L.letter, pickOthers(pool, 2, L.letter), { say: L.letter, big: '🔊' }),
        () => choice(`ltr-case-${L.letter}`, '대문자와 짝인 소문자를 골라요', L.letter.toLowerCase(), pickOthers(pool, 2, L.letter).map(x => x.toLowerCase()), { show: L.letter, say: L.letter }),
        () => choice(`ltr-start-${L.letter}-${word}`, L.ending ? '어떤 글자로 끝날까요?' : '어떤 글자로 시작할까요?', L.letter, pickOthers(pool, 2, L.letter), { show: emoji, sub: word, say: word }),
        () => ({ type: 'trace', key: `ltr-trace-${L.letter}-${t % 2}`, title: '글자를 따라 써요', letter: t % 2 ? L.letter.toLowerCase() : L.letter, say: L.letter }),
        () => ({ type: 'speak', key: `ltr-speak-${L.letter}-${word}`, title: '따라 말해요', target: sound, show: emoji }),
        // 이 글자로 시작하는(끝나는) 그림 고르기
        () => {
          const cands = LETTERS.filter(x => x.letter !== L.letter && !x.ending).map(x => { const [en, e] = x.words[t % x.words.length]; return { en, emoji: e }; });
          const others = pictureOthers(cands, 2, { en: word, emoji }).map(x => `${x.emoji} ${x.en}`);
          return choice(`ltr-pic-${L.letter}-${word}`, L.ending ? `${L.letter}로 끝나는 그림을 골라요` : `${L.letter}로 시작하는 그림을 골라요`, `${emoji} ${word}`, others, { show: `${L.letter} ${L.letter.toLowerCase()}`, say: L.letter, sayAfter: word });
        },
        // 빈칸 글자: _pple
        () => {
          const lo = L.letter.toLowerCase(), at = L.ending ? word.length - 1 : 0;
          return choice(`ltr-miss-${L.letter}-${word}`, '빈칸에 들어갈 글자를 골라요', lo, pickOthers(pool, 2, L.letter).map(x => x.toLowerCase()), { show: `${emoji} ${word.slice(0, at)}_${word.slice(at + 1)}`, sayAfter: word });
        },
        // 알파벳 순서
        () => {
          const i = pool.indexOf(L.letter);
          const show = i >= 2 ? `${pool[i - 2]}  ${pool[i - 1]}  ?` : `?  ${pool[i + 1]}  ${pool[i + 2]}`;
          return choice(`ltr-order-${L.letter}`, i >= 2 ? '다음에 올 알파벳을 골라요' : '앞에 올 알파벳을 골라요', L.letter, pickOthers(pool.filter(x => Math.abs(pool.indexOf(x) - i) > 1), 2), { show, sayAfter: L.letter });
        },
      ];
    },
    2: (W, level) => {
      const all = Object.values(PHONICS).flat();
      const pics = all.map(([en, e]) => ({ en, emoji: e }));
      return [
        () => choice(`ph-listen-${W.en}`, '소리를 듣고 단어를 골라요', `${W.emoji} ${W.en}`, pictureOthers(pics, 2, W).map(x => `${x.emoji} ${x.en}`), { say: W.en, big: '🔊' }),
        () => ({ type: 'tiles', key: `ph-spell-${W.en}`, title: '글자를 순서대로 눌러 단어를 만들어요', show: W.emoji, say: W.en, answer: W.en.split(''), tiles: shuffle(W.en.split('').concat(pickOthers('abcdefghijklmnopqrstuvwxyz'.split(''), 2, W.en[0]))), joiner: '' }),
        () => choice(`ph-first-${W.en}`, '첫소리는 무엇일까요?', W.en[0], pickOthers('bcdfghjklmnprstvwz'.split(''), 2, W.en[0]), { show: W.emoji, say: W.en }),
        () => choice(`ph-mean-${W.en}`, '뜻을 골라요', W.ko, pickOthers(all.map(x => x[2]), 2, W.ko), { show: W.en, say: W.en }),
        () => ({ type: 'speak', key: `ph-speak-${W.en}`, title: '따라 말해요', target: W.en, show: W.emoji }),
        // Level E부터 듣고 철자를 직접 쳐 보는 타자 연습
        ...(level === 'E' ? [() => ({ type: 'type', key: `ph-type-${W.en}`, title: '듣고 단어를 써 봐요 ⌨️', show: W.emoji, say: W.en, answer: W.en })] : []),
        // 소리 없이 읽고 그림 고르기
        () => choice(`ph-read-${W.en}`, '단어를 읽고 알맞은 그림을 골라요', W.emoji, pictureOthers(pics, 2, W).map(x => x.emoji), { show: W.en, sayAfter: W.en }),
        // 끝소리 (cake처럼 끝 글자 e가 소리 나지 않는 단어는 빼요)
        ...(/[bcdfghjklmnpqrstvxz]$/.test(W.en) ? [() => choice(`ph-last-${W.en}`, '끝소리는 무엇일까요?', W.en.slice(-1), pickOthers('bdgklmnprstx'.split(''), 2, W.en.slice(-1)), { show: `${W.emoji} ${W.en.slice(0, -1)}_`, say: W.en })] : []),
        ...(teamOf(W.en) ? teamQ(W) : vowelQ(W)), ...rhymeQ(W, all),
      ];
    },
    sentence: (S, t, st) => {
      const pool = stageItems(st), bank = pool.map(x => x.en);
      const ws = words(S.en), blankable = ws.map((w, i) => [w, i]).filter(([w]) => w.length > 2);
      const [bw, bi] = blankable[t % blankable.length] || [ws[0], 0];
      const distract = pickOthers(bank.flatMap(words).filter(w => w.length > 2 && w.toLowerCase() !== bw.toLowerCase()), 2);
      const list = [
        () => ({ type: 'tiles', key: `s-order-${S.en}`, title: '단어를 순서대로 놓아 문장을 만들어요', sub: S.ko, say: S.en, show: S.emoji, answer: ws, tiles: shuffle(ws), joiner: ' ' }),
        () => choice(`s-fill-${S.en}-${bi}`, '빈칸에 알맞은 단어를 골라요', bw, distract, { show: ws.map((w, i) => i === bi ? '____' : w).join(' '), sub: S.ko, sayAfter: S.en }),
        () => choice(`s-mean-${S.en}`, '문장의 뜻을 골라요', S.ko, pickOthers(pool.map(x => x.ko), 2, S.ko), { show: S.en, say: S.en }),
        () => choice(`s-hear-${S.en}`, '듣고 뜻을 골라요', S.ko, pickOthers(pool.map(x => x.ko), 2, S.ko), { say: S.en, big: '🔊', show: S.emoji }),
        () => choice(`s-listen-${S.en}`, '듣고 알맞은 문장을 골라요', S.en, pickOthers(bank, 2, S.en), { say: S.en, big: '🔊' }),
        () => ({ type: 'speak', key: `s-speak-${S.en}`, title: '문장을 따라 말해요', target: S.en, show: S.emoji, sub: S.ko }),
      ];
      // 5단계부터는 빈칸 단어를 직접 쳐서 쓰기
      if (st >= 5) list.push(() => ({ type: 'type', key: `s-type-${S.en}-${bi}`, title: '빈칸에 들어갈 단어를 써 봐요 ⌨️', answer: bw, show: ws.map((w, i) => i === bi ? '____' : w).join(' '), sub: S.ko, sayAfter: S.en }));
      if (st === 7) {
        const v = VERBS.find(([b, p]) => ws.includes(p)) || VERBS[t % VERBS.length];
        const wrong = WRONG_PAST[v[0]] || v[0] + 'ed';
        list.push(() => choice(`past-${v[0]}`, `"${v[0]}"의 과거형을 골라요`, v[1], [...new Set([v[0], wrong])].filter(x => x !== v[1]).slice(0, 2), { show: `${v[0]} → ?`, sayAfter: `${v[0]}, ${v[1]}` }));
      }
      return list;
    },
    qa: (Q, t, st) => {
      const pool = stageItems(st), k = `${Q.q}|${Q.a}`;
      const ws = words(Q.a), qws = words(Q.q);
      return [
        () => choice(`qa-pick-${k}`, '질문에 알맞은 대답을 골라요', Q.a, pickOthers(wrongAnswers(Q, pool), 2, Q.a), { show: Q.q, say: Q.q, sayAfter: Q.a }),
        () => ({ type: 'tiles', key: `qa-order-${k}`, title: '대답을 순서대로 만들어요', show: Q.q, say: Q.q, answer: ws, tiles: shuffle(ws), joiner: ' ' }),
        () => choice(`qa-mean-${k}`, '대화의 뜻을 골라요', Q.ko, pickOthers(pool.map(x => x.ko), 2, Q.ko), { show: `${Q.q}\n${Q.a}`, say: `${Q.q} ${Q.a}` }),
        () => ({ type: 'speak', key: `qa-speak-${k}`, title: '질문을 듣고 대답해요', target: Q.a, prompt: Q.q, sub: Q.ko.split(' — ')[1] }),
        // 대답을 보고 알맞은 질문 고르기
        () => choice(`qa-ask-${k}`, '이 대답에 어울리는 질문을 골라요', Q.q, pickOthers(wrongQuestions(Q, pool), 2, Q.q), { show: Q.a, sub: Q.ko.split(' — ')[1], sayAfter: `${Q.q} ${Q.a}` }),
        // 질문 단어 순서 맞추기
        ...(qws.length >= 4 ? [() => ({ type: 'tiles', key: `qa-qorder-${k}`, title: '질문을 순서대로 만들어요', sub: Q.ko.split(' — ')[0], say: Q.q, answer: qws, tiles: shuffle(qws), joiner: ' ' })] : []),
      ];
    },
  };

  // 항목을 돌아가며 문항을 고른다. 최근에 푼 문항(avoid)과 바로 앞과 같은 종류(ltr-listen, s-fill…)는 피하고,
  // 말하기·따라 쓰기는 한 레슨에 두 번까지만.
  function lesson(level, idx, n = 8, avoid = new Set(), weak = new Set()) {
    const st = stageOf(level).id;
    const items = shuffle(lessonItems(level, idx, weak));
    const cands = items.map((it, t) => shuffle(tag(it, level, buildersFor(it, t + idx, st, level)).map(b => b())));
    const out = [], seen = new Set(), count = {};
    const kind = q => q.key.split('-').slice(0, 2).join('-');
    const cost = (q, last) => (avoid.has(q.key) ? 4 : 0) + (kind(q) === last ? 1 : 0) + ((q.type === 'speak' || q.type === 'trace') && count[q.type] >= 2 ? 8 : 0);
    for (let round = 0; out.length < n && round < 12; round++) {
      for (const qs of cands) {
        if (out.length >= n) break;
        const last = out.length ? kind(out[out.length - 1]) : null;
        const best = qs.filter(q => !seen.has(q.key)).sort((a, b) => cost(a, last) - cost(b, last))[0];
        if (!best) continue;
        seen.add(best.key); out.push(best); count[best.type] = (count[best.type] || 0) + 1;
      }
    }
    return out;
  }
  // 항목(단어·문장)마다의 문항 만들기 — 레슨과 복습이 같이 쓴다
  const buildersFor = (it, t, st, level) => st === 1 ? B[1](it, t) : st === 2 ? B[2](it, level) : QA[st] ? B.qa(it, t, st) : B.sentence(it, t, st);
  // 문항마다 어떤 항목인지 붙인다 (복습·리포트용)
  const itemId = it => it.letter ? 'L:' + it.letter : it.q ? 'Q:' + it.q + (it.gen ? '|' + it.a : '') : 'E:' + it.en;
  const tag = (it, level, bs) => bs.map(b => () => ({ ...b(), item: itemId(it), level }));
  // 항목 id → { level, it } (처음 쓸 때 만든다)
  let index = null;
  const itemIndex = () => index || (index = Object.fromEntries(ALL_LEVELS.flatMap(lv => levelItems(lv).map(it => [itemId(it), { level: lv, it }]))));
  // 🔁 복습 문항: 복습할 항목마다 빠르게 풀 문항 하나씩 (따라 쓰기·말하기는 빼고)
  function reviewQuestions(ids, n = 8) {
    const out = [];
    for (const id of ids) {
      const hit = itemIndex()[id]; if (!hit) continue;
      const st = stageOf(hit.level).id;
      const bs = tag(hit.it, hit.level, buildersFor(hit.it, Math.floor(Math.random() * 3), st, hit.level));
      const qs = bs.map(b => b()).filter(q => q.type !== 'trace' && q.type !== 'speak');
      if (qs.length) out.push(qs[Math.floor(Math.random() * qs.length)]);
      if (out.length >= n) break;
    }
    return out;
  }
  // 🌱 보충 연습 문항: 틀린 항목마다 방금과 다른 종류로 하나씩. 소리·그림이 있는 고르기 문제를 먼저 쓴다
  // misses: [{ item, kinds: Set('ltr-listen', …) }]
  const kindOf = key => key.split('-').slice(0, 2).join('-');
  function boosterQuestions(misses) {
    const out = [];
    for (const { item, kinds } of misses) {
      const hit = itemIndex()[item]; if (!hit) continue;
      const st = stageOf(hit.level).id;
      const all = tag(hit.it, hit.level, buildersFor(hit.it, Math.floor(Math.random() * 3), st, hit.level)).map(b => b()).filter(q => !['trace', 'speak', 'type'].includes(q.type));
      const fresh = all.filter(q => !kinds.has(kindOf(q.key)));
      const pool = fresh.length ? fresh : all;
      const helpful = pool.filter(q => q.type === 'choice' && (q.say || q.sayAfter) && (q.big || /\p{Extended_Pictographic}/u.test(q.show || '')));
      const choices = pool.filter(q => q.type === 'choice');
      const from = helpful.length ? helpful : choices.length ? choices : pool;
      if (from.length) out.push({ ...from[Math.floor(Math.random() * from.length)], boost: true });
    }
    return out;
  }
  const itemLabel = id => { const h = itemIndex()[id]; if (!h) return id.slice(2); const it = h.it; return it.letter ? `${it.letter} (${it.word})` : it.q ? it.a : it.en; };

  // 레슨 중간 ⚡챌린지: 1단계 알파벳 풍선, 2단계 단어 두더지, 3단계부터 문장 O/X
  function challenge(level) {
    const st = stageOf(level).id, upto = ALL_LEVELS.slice(0, ALL_LEVELS.indexOf(level) + 1);
    const same = upto.filter(lv => stageOf(lv).id === st);
    const pool = same.flatMap(levelItems);
    if (st === 1) return { kind: 'balloon', title: '알파벳 풍선 팡팡', how: '소리를 듣고 맞는 글자 풍선을 터뜨려요!', pool: pool.map(L => L.letter) };
    if (st === 2) return { kind: 'mole', title: '단어 두더지 잡기', how: '소리를 듣고 맞는 그림 두더지를 잡아요!', pool };
    // 3단계부터: 큰 버튼 두 개 중 하나를 빠르게 고르는 게임 (그림 없이 문장으로)
    if (QA[st]) return { kind: 'pick2', title: '알맞은 대답 스피드', how: '질문을 듣고, 알맞은 대답을 빨리 골라요!',
      pool: pool.map(x => ({ say: x.q, prompt: x.q, answer: x.a, wrong: wrongAnswers(x, stageItems(st)) })) };
    const allWords = pool.flatMap(x => words(x.en)).filter(w => w.length > 2);
    return { kind: 'pick2', title: '빈칸 단어 스피드', how: '문장을 듣고, 빈칸에 들어갈 단어를 빨리 골라요!',
      pool: pool.map(x => {
        const ws = words(x.en), cand = ws.map((w, i) => [w, i]).filter(([w]) => w.length > 2);
        const [w, i] = cand[Math.floor(Math.random() * cand.length)] || [ws[0], 0];
        return { say: x.en, prompt: ws.map((v, k) => k === i ? '____' : v).join(' '), answer: w, wrong: allWords.filter(v => v.toLowerCase() !== w.toLowerCase() && !(GEN.classOf(v) && GEN.classOf(v) === GEN.classOf(w))) };
      }) };
  }
  const itemInfo = id => itemIndex()[id] || null;
  return { lesson, levelItems, isReviewDay, challenge, reviewQuestions, boosterQuestions, kindOf, itemLabel, itemId, itemInfo };
})();

/* ---------------- ⚡ 미니 챌린지 (20초 게임) ---------------- */
const Challenge = (() => {
  const SECONDS = 20;
  // spec: Gen.challenge() 결과. onEnd(score)
  function run(el, spec, onEnd) {
    el.className = 'lesson-body anim-in';
    el.innerHTML = `<div class="ch-intro"><div class="ch-badge">⚡ 챌린지!</div><h2>${esc(spec.title)}</h2><p>${esc(spec.how)}</p>
      <p class="fine">${SECONDS}초 동안 몇 개나 맞힐 수 있을까요? 연속으로 맞히면 🔥콤보!</p>
      <button class="btn btn-primary lg" data-go>▶ 시작!</button></div>`;
    el.querySelector('[data-go]').onclick = () => play(el, spec, onEnd);
  }
  function play(el, spec, onEnd) {
    let score = 0, combo = 0, best = 0, over = false, round = null;
    const end = Date.now() + SECONDS * 1000;
    el.innerHTML = `<div class="ch-head"><span>⚡ ${esc(spec.title)}</span><span class="ch-score">⭐ 0</span><span class="ch-combo"></span></div>
      <div class="ch-time"><i></i></div><div class="ch-stage"></div>`;
    const stage = el.querySelector('.ch-stage'), bar = el.querySelector('.ch-time i');
    const tick = setInterval(() => {
      if (!document.body.contains(el)) return clearInterval(tick);
      const left = Math.max(0, end - Date.now()); bar.style.width = left / (SECONDS * 10) + '%';
      if (!left) finish();
    }, 100);
    const finish = () => {
      if (over) return; over = true; clearInterval(tick); Speech.stop();
      onEnd({ score, best });
    };
    const hit = ok => {
      if (over) return;
      if (ok) { score++; combo++; best = Math.max(best, combo); Speech.sfx.correct(); } else { combo = 0; Speech.sfx.wrong(); }
      el.querySelector('.ch-score').textContent = `⭐ ${score}`;
      el.querySelector('.ch-combo').textContent = combo >= 2 ? `🔥 ${combo}콤보` : '';
      setTimeout(() => { if (!over && document.body.contains(el)) next(); }, ok ? 350 : 700);
    };
    const pickOne = a => a[Math.floor(Math.random() * a.length)];
    const next = () => {
      if (spec.kind === 'balloon') {
        const ans = pickOne(spec.pool);
        const opts = shuffle([ans, ...pickOthers(LETTERS.map(l => l.letter), 3, ans)]);
        const colors = ['#ff7aa8', '#ffd23f', '#5cc8ff', '#7ed957'];
        stage.innerHTML = `<div class="sky ch-sky">${opts.map((o, k) => `<button class="balloon" style="--c:${colors[k]};--d:${k * 0.2}s;--x:${k * 25 + 2}%" data-v="${o}"><span class="ch-letter">${k % 2 ? o.toLowerCase() : o}</span></button>`).join('')}</div>`;
        Speech.speak(ans);
        stage.querySelectorAll('.balloon').forEach(b => b.onclick = () => {
          const ok = b.dataset.v === ans; b.classList.add(ok ? 'pop' : 'nope');
          stage.querySelectorAll('.balloon').forEach(x => x.disabled = true); hit(ok);
        });
      } else if (spec.kind === 'mole') {
        const ans = pickOne(spec.pool);
        const opts = shuffle([ans, ...pictureOthers(spec.pool, 3, ans)]);
        stage.innerHTML = `<div class="moles">${opts.map((o, k) => `<button class="mole" style="--d:${k * 0.08}s" data-v="${esc(o.en)}"><span class="mole-pic">${pic(o.emoji)}</span><small>${esc(o.en)}</small></button>`).join('')}</div>
          <button class="btn btn-ghost sm ch-again" data-again>🔊 다시</button>`;
        Speech.speak(ans.en);
        stage.querySelector('[data-again]').onclick = () => Speech.speak(ans.en);
        stage.querySelectorAll('.mole').forEach(b => b.onclick = () => {
          const ok = b.dataset.v === ans.en; b.classList.add(ok ? 'whack' : 'nope');
          stage.querySelectorAll('.mole').forEach(x => x.disabled = true); hit(ok);
        });
      } else {
        // 두 개 중 고르기: 질문(또는 빈칸 문장)을 보여주고 읽어준다
        const item = pickOne(spec.pool);
        const opts = shuffle([item.answer, pickOne(item.wrong)]);
        stage.innerHTML = `<div class="pick2-card"><p class="pick2-prompt">${esc(item.prompt)}</p><button class="btn btn-ghost sm" data-again>🔊 다시 듣기</button></div>
          <div class="pick2-btns">${opts.map(o => `<button class="pick2" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
        Speech.speak(item.say);
        stage.querySelector('[data-again]').onclick = () => Speech.speak(item.say);
        stage.querySelectorAll('.pick2').forEach(b => b.onclick = () => {
          const ok = b.dataset.v === item.answer;
          b.classList.add(ok ? 'right' : 'wrong');
          if (!ok) stage.querySelectorAll('.pick2').forEach(x => { if (x.dataset.v === item.answer) x.classList.add('right'); });
          stage.querySelectorAll('.pick2').forEach(x => x.disabled = true); hit(ok);
        });
      }
    };
    next();
  }
  return { run, SECONDS };
})();

/* 문항이 키우는 영역: 듣기 · 읽기 · 말하기 · 쓰기 */
const SKILLS = { listen: '👂 듣기', read: '📖 읽기', speak: '🗣️ 말하기', write: '✏️ 쓰기' };
function skillOf(q) {
  if (q.type === 'speak') return 'speak';
  if (['tiles', 'type', 'trace'].includes(q.type)) return 'write';
  if (q.big || /^(ltr-listen|ph-listen|s-listen|qa-pick)/.test(q.key || '')) return 'listen';
  return 'read';
}

/* ---------------- 레슨 진행 엔진 ---------------- */
const Lesson = (() => {
  // 난이도: 쉬움=보기 2개+힌트, 어려움=보기 4개
  function adjust(questions, diff) {
    if (diff === 'normal') return questions;
    return questions.map(q => {
      if (q.type !== 'choice') return { ...q, hint: diff === 'easy' };
      if (diff === 'easy') return { ...q, options: shuffle([q.answer, q.options.find(o => o !== q.answer)]) };
      const kind = q.key.split('-').slice(0, 2).join('-');
      const pool = questions.filter(x => x.type === 'choice' && x.key.startsWith(kind)).flatMap(x => x.options).filter(o => !q.options.includes(o));
      return pool.length ? { ...q, options: shuffle([...q.options, pool[0]]) } : q;
    });
  }
  function volumeButton() {
    const v = Speech.volume;
    return `<div class="vol-wrap"><button class="icon-btn" data-vol aria-label="소리 크기">🔊</button>
      <div class="vol-pop" hidden><label>🗣️ 목소리<input type="range" min="0" max="1" step="0.1" value="${v.voice}" data-k="voice"></label>
      <label>🎵 효과음<input type="range" min="0" max="1" step="0.1" value="${v.sfx}" data-k="sfx"></label></div></div>`;
  }
  function wireVolume(root) {
    const btn = root.querySelector('[data-vol]'), pop = root.querySelector('.vol-pop');
    btn.onclick = () => { pop.hidden = !pop.hidden; };
    pop.querySelectorAll('input').forEach(r => r.oninput = () => { Speech.setVolume(r.dataset.k, +r.value); if (r.dataset.k === 'sfx') Speech.sfx.tap(); });
    pop.querySelector('[data-k=voice]').onchange = () => Speech.speak('Hello!');
  }

  // test: 레벨 테스트용 — 정답을 알려주지 않고(다음 문제에서 힌트가 되지 않게), 콤보·별 없이 바로 다음 문제로 넘어간다.
  // 문제마다 푸는 데 걸린 시간(ms)을 결과에 담아, 너무 빨리 찍은 정답을 가려낼 수 있게 한다.
  function run(root, questions, { title = '레슨', onDone, onExit, recordSpeech = true, difficulty = 'normal', challenge = null, test = false, exitMsg = '레슨을 그만할까요? 진행 내용은 저장되지 않아요.' } = {}) {
    questions = adjust(questions, difficulty);
    let i = 0, correct = 0, answeredAt = -1, combo = 0, comboStar = false, played = false, bonus = 0, shownAt = 0; const wrong = [], results = []; const t0 = Date.now();
    const challengeAt = Math.min(3, questions.length - 2); // 4번째 문제 다음에 ⚡챌린지
    const diffLabel = { easy: '🐣 쉬움', normal: '🐥 보통', hard: '🦅 도전' }[difficulty];
    root.innerHTML = `
      <div class="lesson">
        <div class="lesson-top">
          <button class="icon-btn" data-exit aria-label="그만하기">✕</button>
          <div class="lesson-progress"><div class="bar"></div></div>
          <span class="lesson-count"></span>
          ${volumeButton()}
        </div>
        <div class="lesson-title">${esc(title)} · <span class="diff">${diffLabel}</span></div>
        <div class="lesson-body"></div>
        <div class="lesson-feedback" hidden></div>
      </div>`;
    const body = root.querySelector('.lesson-body'), fb = root.querySelector('.lesson-feedback');
    wireVolume(root);
    root.querySelector('[data-exit]').onclick = () => { Speech.stop(); if (confirm(exitMsg)) onExit && onExit(); };

    function show() {
      const q = questions[i];
      root.querySelector('.bar').style.width = `${i / questions.length * 100}%`;
      root.querySelector('.lesson-count').textContent = `${i + 1} / ${questions.length}`;
      fb.hidden = true; fb.className = 'lesson-feedback';
      body.innerHTML = ''; body.className = 'lesson-body anim-in';
      shownAt = Date.now();
      (R[q.type] || R.choice)(body, q, answer);
    }
    function answer(ok, q, detail = '') {
      if (answeredAt === i) return; // 한 문제는 한 번만 채점한다
      answeredAt = i;
      results.push({ item: q.item, skill: skillOf(q), ok: !!ok, ms: Date.now() - shownAt, listen: !!q.say });
      if (test) {
        if (ok) correct++;
        Speech.sfx.tap();
        fb.innerHTML = `<div class="fb-msg">${pick(['좋아요! 다음 문제 ▶', '잘하고 있어요! ▶', '다음 문제로 가요 ▶'])}</div>`;
        fb.className = 'lesson-feedback'; fb.hidden = false;
        setTimeout(() => { if (!document.body.contains(body)) return; Speech.stop(); i++; i < questions.length ? show() : finish(); }, 700);
        return;
      }
      if (ok) { correct++; combo++; Speech.sfx.correct(); } else {
        combo = 0;
        Speech.sfx.wrong();
        if (q.type !== 'trace' && q.type !== 'speak') wrong.push({ key: q.key, q });
      }
      if (q.sayAfter) Speech.speakLater(q.sayAfter, 350);
      const correctText = q.type === 'tiles' ? q.answer.join(q.joiner) : q.answer;
      // 🔥 콤보: 3연속부터 표시, 5연속이면 보너스 별 (레슨마다 한 번, 하루 3개까지)
      let comboHtml = combo >= 3 ? `<span class="combo-pill">🔥 ${combo}연속!</span>` : '';
      if (combo === 5 && !comboStar && recordSpeech && Store.profile()) { comboStar = true; if (Store.addStars(1, 'combo', 3)) comboHtml += ' <span class="combo-pill star">⭐ 콤보 보너스!</span>'; }
      fb.innerHTML = `
        <div class="fb-msg">${comboHtml}${ok ? pick(['참 잘했어요! 🎉', '정답이에요! ⭐', '멋져요! 👏', '최고예요! 🌟']) : '아쉬워요! 다시 확인해봐요 💪'}
          ${!ok && correctText ? `<div class="fb-answer">정답: <b>${esc(correctText)}</b></div>` : ''}${detail}</div>
        <button class="btn btn-primary" data-next>${i + 1 < questions.length ? '계속하기' : '결과 보기'}</button>`;
      fb.className = 'lesson-feedback ' + (ok ? 'ok' : 'bad'); fb.hidden = false;
      const next = fb.querySelector('[data-next]'); next.focus();
      next.onclick = () => {
        Speech.stop();
        if (challenge && !played && i === challengeAt) { played = true; return playChallenge(); }
        i++; i < questions.length ? show() : finish();
      };
    }
    function playChallenge() {
      fb.hidden = true;
      root.querySelector('.lesson-count').textContent = '⚡';
      Challenge.run(body, challenge, ({ score, best }) => {
        const got = recordSpeech && Store.profile() ? Store.challengeResult(score) : 0;
        bonus += score;
        body.innerHTML = `<div class="ch-result anim-in"><div class="ch-badge">⚡ 챌린지 끝!</div><div class="ch-big">⭐ ${score}</div>
          <p>${score >= 8 ? '대단해요! 챔피언이에요 🏆' : score >= 4 ? '잘했어요! 👏' : '좋아요, 다음엔 더 많이! 💪'}${best >= 3 ? ` · 최고 🔥${best}콤보` : ''}${got ? ` · 별 ${got}개 획득!` : ''}</p>
          <button class="btn btn-primary lg" data-cont>레슨 계속하기 ▶</button></div>`;
        Speech.sfx.cheer(); if (score >= 6) confetti();
        body.querySelector('[data-cont]').onclick = () => { i++; show(); };
      });
    }
    function finish() {
      root.querySelector('.bar').style.width = '100%';
      onDone && onDone({ correct, total: questions.length, wrong, seconds: (Date.now() - t0) / 1000, bonus, results });
    }
    R.recordSpeech = recordSpeech;
    show();
  }
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function head(q) {
    return `<div class="q-title">${esc(q.title || '')}</div>
      ${q.prompt ? `<div class="q-prompt"><button class="sound-btn" data-say="${esc(q.prompt)}">🔊</button> ${esc(q.prompt)}</div>` : ''}
      ${q.big ? `<button class="q-big sound-btn" data-say="${esc(q.say)}" aria-label="다시 듣기">${q.big}</button>` : ''}
      ${q.show ? `<div class="q-show ${q.show.length <= 3 ? 'huge' : ''}">${pic(esc(q.show)).replace(/\n/g, '<br>')}${q.say && !q.big ? ` <button class="sound-btn small" data-say="${esc(q.say)}" aria-label="듣기">🔊</button>` : ''}</div>` : ''}
      ${q.sub ? `<div class="q-sub">${esc(q.sub)}</div>` : ''}`;
  }
  function wireSay(el, q) {
    el.querySelectorAll('[data-say]').forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
    if (q.say) Speech.speakLater(q.say, 250);
  }

  const R = {
    choice(el, q, done) {
      el.innerHTML = head(q) + `<div class="options ${q.options.some(o => o.length > 18) ? 'stack' : ''}">${q.options.map(o => `<button class="option" data-v="${esc(o)}">${pic(esc(o))}</button>`).join('')}</div>`;
      wireSay(el, q);
      el.querySelectorAll('.option').forEach(b => b.onclick = () => {
        const ok = b.dataset.v === q.answer;
        el.querySelectorAll('.option').forEach(x => { x.disabled = true; if (x.dataset.v === q.answer) x.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        done(ok, q);
      });
    },
    type(el, q, done) {
      el.innerHTML = head(q) + `<div class="type-slots" aria-hidden="true">${[...q.answer].map(c => `<i class="${c === ' ' ? 'sp' : ''}"></i>`).join('')}</div>
        <form class="type-form" autocomplete="off"><input class="type-input" name="t" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="${q.answer.length + 4}" aria-label="정답을 써요">
        <button class="btn btn-primary">확인</button></form>
        ${q.hint ? '<button class="link-btn" data-hint>💡 첫 글자 보기</button>' : ''}`;
      wireSay(el, q);
      const f = el.querySelector('form'), input = f.t, slots = [...el.querySelectorAll('.type-slots i')];
      const fill = () => slots.forEach((s, k) => { s.textContent = input.value[k] || ''; s.classList.toggle('on', !!input.value[k]); });
      input.oninput = fill; setTimeout(() => input.focus(), 50);
      const hint = el.querySelector('[data-hint]');
      if (hint) hint.onclick = () => { input.value = q.answer[0]; fill(); input.focus(); hint.remove(); };
      f.onsubmit = e => {
        e.preventDefault(); if (!input.value.trim()) return input.focus();
        const ok = input.value.trim().toLowerCase() === q.answer.toLowerCase();
        input.disabled = true; el.querySelectorAll('button').forEach(b => b.disabled = true);
        el.querySelector('.type-slots').classList.add(ok ? 'right' : 'wrong');
        if (ok) Speech.speak(q.answer);
        done(ok, q);
      };
    },
    tiles(el, q, done) {
      const placed = [];
      el.innerHTML = head(q) + `<div class="tile-line" aria-label="만든 답"></div><div class="tile-bank"></div>
        <div class="row-center"><button class="btn btn-ghost" data-reset>처음부터</button>${q.hint ? '<button class="btn btn-ghost" data-hint>💡 힌트</button>' : ''}<button class="btn btn-primary" data-check disabled>확인</button></div>`;
      wireSay(el, q);
      const hint = el.querySelector('[data-hint]');
      if (hint) hint.onclick = () => {
        // 다음에 올 카드를 대신 놓아준다
        const want = q.answer[placed.length]; if (want === undefined) return;
        const k = q.tiles.findIndex((t, j) => t === want && !placed.includes(j));
        if (k >= 0 && placed.every((t, j) => q.tiles[t] === q.answer[j])) { placed.push(k); draw(); }
        else { placed.length = 0; draw(); }
      };
      const line = el.querySelector('.tile-line'), bank = el.querySelector('.tile-bank'), check = el.querySelector('[data-check]');
      const draw = () => {
        line.innerHTML = placed.map((t, k) => `<button class="tile placed" data-k="${k}">${esc(q.tiles[t])}</button>`).join('') || '<span class="tile-hint">아래 카드를 눌러요</span>';
        bank.innerHTML = q.tiles.map((t, k) => `<button class="tile" data-k="${k}" ${placed.includes(k) ? 'disabled' : ''}>${esc(t)}</button>`).join('');
        bank.querySelectorAll('.tile').forEach(b => b.onclick = () => { Speech.sfx.tap(); placed.push(+b.dataset.k); draw(); });
        line.querySelectorAll('.tile').forEach(b => b.onclick = () => { placed.splice(placed.indexOf(+b.dataset.k), 1); draw(); });
        check.disabled = placed.length !== q.answer.length;
      };
      el.querySelector('[data-reset]').onclick = () => { placed.length = 0; draw(); };
      check.onclick = () => {
        const got = placed.map(k => q.tiles[k]);
        const ok = got.join('|').toLowerCase() === q.answer.join('|').toLowerCase();
        el.querySelectorAll('button').forEach(b => b.disabled = true);
        line.classList.add(ok ? 'right' : 'wrong');
        if (ok) Speech.speak(q.answer.join(' '));
        done(ok, q);
      };
      draw();
    },
    trace(el, q, done) {
      el.innerHTML = head({ ...q, show: '' }) + `<div class="trace-wrap"><canvas class="trace" width="320" height="320" aria-label="${esc(q.letter)} 따라 쓰기"></canvas></div>
        <div class="row-center"><button class="btn btn-ghost" data-say="${esc(q.say)}">🔊 듣기</button><button class="btn btn-ghost" data-clear>지우기</button><button class="btn btn-primary" data-check disabled>다 썼어요</button></div>`;
      wireSay(el, q);
      const cv = el.querySelector('canvas'), c = cv.getContext('2d');
      const font = `bold 250px "Baloo 2", "Arial Rounded MT Bold", Arial, sans-serif`;
      const guide = () => {
        c.clearRect(0, 0, 320, 320);
        c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--trace-guide') || '#ddd';
        c.fillText(q.letter, 160, 175);
        c.setLineDash([6, 8]); c.strokeStyle = '#bbb'; c.lineWidth = 2; c.strokeText(q.letter, 160, 175); c.setLineDash([]);
      };
      // 글자 모양 마스크 (채점용)
      const mask = document.createElement('canvas'); mask.width = mask.height = 320;
      const mc = mask.getContext('2d'); mc.font = font; mc.textAlign = 'center'; mc.textBaseline = 'middle'; mc.fillText(q.letter, 160, 175);
      const ink = document.createElement('canvas'); ink.width = ink.height = 320; const ic = ink.getContext('2d');
      guide();
      let drawing = false, last = null, length = 0;
      const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * 320 / r.width, (e.clientY - r.top) * 320 / r.height]; };
      const stroke = (ctx2, a, b, color, w) => { ctx2.strokeStyle = color; ctx2.lineWidth = w; ctx2.lineCap = 'round'; ctx2.beginPath(); ctx2.moveTo(...a); ctx2.lineTo(...b); ctx2.stroke(); };
      cv.onpointerdown = e => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); };
      cv.onpointermove = e => {
        if (!drawing) return; const p = pos(e);
        stroke(c, last, p, '#ff7043', 16); stroke(ic, last, p, '#000', 16);
        length += Math.hypot(p[0] - last[0], p[1] - last[1]); last = p;
        el.querySelector('[data-check]').disabled = length < 120;
      };
      cv.onpointerup = cv.onpointercancel = () => { drawing = false; };
      el.querySelector('[data-clear]').onclick = () => { ic.clearRect(0, 0, 320, 320); length = 0; guide(); el.querySelector('[data-check]').disabled = true; };
      el.querySelector('[data-check]').onclick = () => {
        const m = mc.getImageData(0, 0, 320, 320).data, d = ic.getImageData(0, 0, 320, 320).data;
        let maskN = 0, cover = 0, inkN = 0, onMask = 0;
        for (let k = 3; k < m.length; k += 16) {
          const inM = m[k] > 0, inD = d[k] > 0;
          if (inM) { maskN++; if (inD) cover++; }
          if (inD) { inkN++; if (inM) onMask++; }
        }
        const coverage = cover / Math.max(maskN, 1), precision = onMask / Math.max(inkN, 1);
        const ok = coverage > 0.35 && precision > 0.45;
        el.querySelectorAll('button').forEach(b => b.disabled = true);
        done(ok, q, `<div class="fb-answer">글자 덮은 정도 ${Math.round(coverage * 100)}% · 선 안쪽 정확도 ${Math.round(precision * 100)}%</div>`);
      };
    },
    speak(el, q, done) {
      let tries = 0;
      el.innerHTML = head({ ...q, say: null, sub: null }) + `
        <div class="speak-target">${words(q.target).map(w => `<span>${esc(w)}</span>`).join(' ')}</div>
        ${q.sub ? `<div class="q-sub">${esc(q.sub)}</div>` : ''}
        <div class="speak-result" aria-live="polite"></div>
        <div class="row-center">
          <button class="btn btn-ghost" data-listen>🔊 원어민 듣기</button>
          <button class="btn btn-ghost" data-slow>🐢 천천히</button>
          ${Speech.canListen ? '<button class="btn btn-primary mic" data-mic>🎤 말하기</button>' : '<button class="btn btn-primary" data-self>따라 말했어요</button>'}
        </div>
        ${Speech.canListen ? '<button class="link-btn" data-skip>지금은 말하기 어려워요 (건너뛰기)</button>' : `<p class="hint mic-hint">🎤 지금은 "듣고 따라 말하기"로 진행해요. ${esc(Speech.unsupportedReason())}</p>`}`;
      el.querySelectorAll('[data-say]').forEach(b => b.onclick = () => Speech.speak(b.dataset.say));
      const res = el.querySelector('.speak-result');
      el.querySelector('[data-listen]').onclick = () => Speech.speak(q.target);
      el.querySelector('[data-slow]').onclick = () => Speech.speak(q.target, { slow: true });
      Speech.speakLater(q.prompt ? q.prompt : q.target, 250);
      const self = el.querySelector('[data-self]');
      if (self) self.onclick = () => { el.querySelectorAll('button').forEach(b => b.disabled = true); done(true, q); };
      const skip = el.querySelector('[data-skip]');
      if (skip) skip.onclick = () => { el.querySelectorAll('button').forEach(b => b.disabled = true); done(false, q); };
      const mic = el.querySelector('[data-mic]');
      if (mic) mic.onclick = async () => {
        mic.disabled = true; mic.classList.add('rec'); mic.textContent = '🎙️ 듣고 있어요…';
        try {
          const alts = await Speech.listen({ hint: q.target });
          const r = Speech.score(q.target, alts); tries++;
          const pass = passMark();
          if (R.recordSpeech && Store.profile()) Store.recordSpeaking(q.target, r.score);
          const spans = el.querySelectorAll('.speak-target span');
          r.words.forEach((w, k) => { if (spans[k]) spans[k].className = w.ok === 1 ? 'ok' : w.ok ? 'mid' : 'no'; });
          res.innerHTML = `<div class="score-pill ${r.score >= 80 ? 'good' : r.score >= 60 ? 'mid' : 'low'}">${r.score}점</div><div class="heard">들은 말: "${esc(r.heard)}"</div>`;
          if (r.score >= pass || tries >= 3) {
            el.querySelectorAll('button').forEach(b => b.disabled = true);
            mic.classList.remove('rec'); mic.textContent = '✅ 완료';
            return done(r.score >= pass, q, `<div class="fb-answer">${coach(r)}</div>`); // 채점이 끝나면 마이크를 다시 켜지 않는다
          } else {
            res.innerHTML += `<div class="hint">${coach(r)} (${3 - tries}번 더 해볼 수 있어요)</div>`;
          }
        } catch (e) {
          res.innerHTML = `<div class="hint mic-hint">${esc(Speech.micHelp(e.message))}</div>`;
        }
        mic.disabled = false; mic.classList.remove('rec'); mic.textContent = '🎤 다시 말하기';
      };
    },
  };
  // "아이 목소리 너그럽게" 설정이면 통과 점수를 낮춘다
  const passMark = () => { const u = Store.user(); return u && u.settings.gentle === false ? 60 : 45; };
  function coach(r) {
    const miss = r.words.filter(w => w.ok < 1).map(w => w.w);
    if (!miss.length) return '완벽한 발음이에요! 원어민 같아요 🌟';
    return `<b>${miss.slice(0, 3).map(esc).join(', ')}</b> 발음을 한 번 더 들어보고 연습해봐요.`;
  }

  function confetti() {
    const box = document.createElement('div'); box.className = 'confetti';
    const colors = ['#ff7043', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc', '#ec407a'];
    for (let k = 0; k < 70; k++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%'; s.style.background = colors[k % colors.length];
      s.style.animationDelay = Math.random() * 0.6 + 's'; s.style.animationDuration = 1.8 + Math.random() * 1.4 + 's';
      s.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(s);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 3600);
  }
  return { run, confetti, renderers: R, passMark };
})();
