/* practice.js — site-wide practice engine: flashcards, quiz, type-with-me.
   FL.Practice.mount(el, { id, groups:[{id,emoji,title,words}], sentences:[...], quizExtras:['clock'] })
   Items are {fr, zh, en, alt?}. Topics may register extra quiz question makers in FL.quizGenerators. */
(function () {
  const FL = window.FL;
  const B = FL.bi;

  /* ---------- sources (all words / one group / sentences) ---------- */
  function sources(cfg) {
    const all = cfg.groups.flatMap(g => g.words.map(w => ({ ...w, group: g.id })));
    const list = [{ id: 'all', label: `✦ ${cfg.labelAll || 'Tout le vocabulaire'}`, items: all }];
    cfg.groups.forEach(g => list.push({ id: g.id, label: `${g.emoji || '·'} ${g.title.fr}`, items: g.words.map(w => ({ ...w, group: g.id })) }));
    if (cfg.sentences && cfg.sentences.length) list.push({ id: 'sent', label: '— Phrases', items: cfg.sentences.map(s => ({ ...s, group: 'sent' })) });
    return { all, list };
  }
  function pickerHTML(src, sel) {
    return `<select class="src-pick" aria-label="Source">${src.list.map(s =>
      `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${FL.esc(s.label)} (${s.items.length})</option>`).join('')}</select>`;
  }

  /* ---------- flashcards ---------- */
  function Cards(body, cfg) {
    const src = sources(cfg);
    let srcId = FL.store.get(`cards:${cfg.id}:src`, 'all');
    let dir = FL.store.get('cards:dir', 'fr'); // which side faces up first
    let deck, total, i, known;

    body.innerHTML = `
      <div class="pr-toolbar">
        ${pickerHTML(src, srcId)}
        <button type="button" class="btn ghost" data-act="dir">⇄ ${B('正反面', 'Swap sides')}</button>
        <button type="button" class="btn ghost" data-act="shuffle">${B('打乱', 'Shuffle')}</button>
      </div>
      <div class="card3d" tabindex="0" aria-live="polite"><div class="card-inner"><div class="face front"></div><div class="face back"></div></div></div>
      <p class="hint">${B('点击卡片翻面 · 空格翻面 · ← → 切换', 'Click or Space to flip · ← → to move')}</p>
      <div class="card-ctrl">
        <button type="button" class="btn ghost" data-act="prev" aria-label="Previous">←</button>
        <button type="button" class="btn bad" data-act="again">✗ ${B('再来', 'Again')}</button>
        <button type="button" class="btn good" data-act="know">✓ ${B('记住了', 'Got it')}</button>
        <button type="button" class="btn ghost" data-act="next" aria-label="Next">→</button>
      </div>
      <div class="progress"><div class="bar"><i></i></div><span></span></div>`;
    const card = body.querySelector('.card3d');
    const front = body.querySelector('.front'), back = body.querySelector('.back');

    const pic = (w, cls) => (FL.pic ? FL.pic(w, w.group, cfg.id, { cls }) : '');
    const frSide = w => `${pic(w, 'card-pic')}<div class="big fr">${FL.esc(w.fr)}</div>${FL.sayBtn(w.fr, 'lg')}`;
    const mSide = w => `${pic(w, 'card-pic')}<div class="big meaning">${FL.m(w)}</div>${w.note ? `<div class="note">${FL.m(w.note)}</div>` : ''}`;

    function start() {
      const items = (src.list.find(s => s.id === srcId) || src.list[0]).items;
      deck = FL.shuffle(items);
      total = deck.length;
      known = 0;
      i = 0;
      show();
    }
    function show() {
      card.classList.remove('flipped');
      const bar = body.querySelector('.progress i');
      bar.style.width = `${(known / total) * 100}%`;
      body.querySelector('.progress span').innerHTML = `${known} / ${total} ${B('已记住', 'known')}`;
      if (!deck.length) {
        front.innerHTML = `<div class="done"><em lang="fr">Fin.</em><div>${B('这一组都记住了。', 'Every card in this set is learned.')}</div><button type="button" class="btn primary" data-act="restart">${B('再来一轮', 'Again')}</button></div>`;
        back.innerHTML = '';
        return;
      }
      const w = deck[i];
      // wait for the flip-back animation before swapping the hidden side
      front.innerHTML = dir === 'fr' ? frSide(w) : mSide(w);
      setTimeout(() => { back.innerHTML = dir === 'fr' ? mSide(w) : frSide(w); FL.markVerbs(back); }, 250);
      FL.markVerbs(front);
      if (dir === 'fr') FL.speak(w.fr);
    }
    function flip() {
      if (!deck.length) return;
      card.classList.toggle('flipped');
      if (card.classList.contains('flipped') && dir !== 'fr') FL.speak(deck[i].fr);
    }
    function act(a) {
      if (a === 'restart') return start();
      if (a === 'dir') { dir = dir === 'fr' ? 'm' : 'fr'; FL.store.set('cards:dir', dir); return show(); }
      if (a === 'shuffle') return start();
      if (!deck.length) return;
      if (a === 'next') i = (i + 1) % deck.length;
      if (a === 'prev') i = (i - 1 + deck.length) % deck.length;
      if (a === 'know') { deck.splice(i, 1); known++; if (i >= deck.length) i = 0; }
      if (a === 'again') { deck.push(deck.splice(i, 1)[0]); if (i >= deck.length) i = 0; }
      show();
    }
    body.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (b) return act(b.dataset.act);
      if (e.target.closest('.card3d') && !e.target.closest('button, .verb')) flip();
    });
    body.querySelector('.src-pick').addEventListener('change', e => {
      srcId = e.target.value; FL.store.set(`cards:${cfg.id}:src`, srcId); start();
    });
    const onKey = e => {
      if (!body.isConnected || e.target.closest('input, textarea, select')) return;
      if (!isVisible(body)) return;
      if (e.key === ' ') { e.preventDefault(); flip(); }
      else if (e.key === 'ArrowRight') act('next');
      else if (e.key === 'ArrowLeft') act('prev');
    };
    document.addEventListener('keydown', onKey);
    start();
    return () => document.removeEventListener('keydown', onKey);
  }
  function isVisible(el) {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }

  /* ---------- quiz ---------- */
  const N_Q = 10;
  function distractors(pool, item, n, key) {
    const k = key(item);
    const seen = new Set([k]);
    const same = FL.shuffle(pool.filter(x => x.group === item.group));
    const other = FL.shuffle(pool.filter(x => x.group !== item.group));
    const out = [];
    for (const x of [...same, ...other]) {
      const kx = key(x);
      // a word spelled the same (nous the subject, nous the object…) would also be right
      if (!seen.has(kx) && FL.cleanFr(x.fr) !== FL.cleanFr(item.fr)) { seen.add(kx); out.push(x); }
      if (out.length === n) break;
    }
    return out;
  }
  function wordQuestion(items, pool, kind, topicId) {
    const item = FL.pick(items);
    const ds = distractors(pool, item, 3, kind === 'fr2m' ? x => x.zh + x.en : x => x.fr);
    const opts = FL.shuffle([item, ...ds]);
    const answer = opts.indexOf(item);
    if (kind === 'fr2m') return {
      prompt: `<div class="q-label">${B('这是什么意思？', 'What does it mean?')}</div><div class="q-big fr">${FL.esc(item.fr)}</div>${FL.sayBtn(item.fr)}`,
      options: opts.map(o => FL.m(o)), answer, say: item.fr, autoSay: true,
    };
    if (kind === 'm2fr') return {
      prompt: `<div class="q-label">${B('用法语怎么说？', 'How do you say it in French?')}</div>${FL.pic ? FL.pic(item, item.group, topicId, { cls: 'q-pic' }) : ''}<div class="q-big">${FL.m(item)}</div>`,
      options: opts.map(o => `<span lang="fr">${FL.esc(o.fr)}</span>`), answer, say: item.fr,
    };
    return { // listening
      prompt: `<div class="q-label">${B('听一听，选出你听到的', 'Listen and pick what you hear')}</div><button type="button" class="play-big" data-say="${FL.esc(item.fr)}" aria-label="Play">${FL.ICON_SPEAKER}</button>`,
      options: opts.map(o => `<span lang="fr">${FL.esc(o.fr)}</span>`), answer, say: item.fr, autoSay: true,
    };
  }

  function Quiz(body, cfg) {
    const src = sources(cfg);
    let srcId = FL.store.get(`quiz:${cfg.id}:src`, 'all');
    let qs, qi, score, locked;

    function build() {
      const items = (src.list.find(s => s.id === srcId) || src.list[0]).items;
      const pool = srcId === 'sent' ? items : src.all;
      const extras = srcId === 'all' ? (cfg.quizExtras || []).filter(x => FL.quizGenerators[x]) : [];
      qs = [];
      for (let k = 0; k < N_Q; k++) {
        if (extras.length && Math.random() < 0.3) { qs.push(FL.quizGenerators[FL.pick(extras)]()); continue; }
        qs.push(wordQuestion(items, pool, FL.pick(['fr2m', 'm2fr', 'listen']), cfg.id));
      }
      qi = 0; score = 0;
    }
    function render() {
      if (qi >= qs.length) return end();
      const q = qs[qi];
      locked = false;
      body.innerHTML = `
        <div class="pr-toolbar">${pickerHTML(src, srcId)}<span class="q-count">${qi + 1} / ${qs.length} · ✓ ${score}</span></div>
        <div class="progress thin"><div class="bar"><i style="width:${(qi / qs.length) * 100}%"></i></div></div>
        <div class="q-prompt">${q.prompt}</div>
        <div class="q-opts">${q.options.map((o, k) => `<button type="button" class="q-opt" data-i="${k}"><kbd>${k + 1}</kbd>${o}</button>`).join('')}</div>
        <div class="q-after"></div>`;
      FL.markVerbs(body.querySelector('.q-prompt'));
      bindPicker();
      if (q.autoSay) setTimeout(() => FL.speak(q.say), 250);
    }
    function answer(k) {
      if (locked) return;
      locked = true;
      const q = qs[qi];
      const ok = k === q.answer;
      if (ok) score++;
      body.querySelectorAll('.q-opt').forEach((b, j) => {
        b.disabled = true;
        if (j === q.answer) b.classList.add('right');
        else if (j === k) b.classList.add('wrong');
      });
      if (q.say) FL.speak(q.say);
      body.querySelector('.q-after').innerHTML = `
        <span class="${ok ? 'ok' : 'no'}">${ok ? B('✓ 答对了', '✓ Correct') : B('✗ 正确答案已标出', '✗ The right answer is marked')}</span>
        <button type="button" class="btn primary" data-act="next">${B('下一题', 'Next')} →</button>`;
      body.querySelector('[data-act="next"]').focus();
    }
    function end() {
      const key = `quiz:${cfg.id}:best`;
      const best = Math.max(FL.store.get(key, 0), score);
      FL.store.set(key, best);
      const pct = score / qs.length;
      body.innerHTML = `
        <div class="q-end">
          <div class="q-score">${score} / ${qs.length}</div>
          <p>${B('最好成绩', 'Best')}: ${best} / ${qs.length}</p>
          <button type="button" class="btn primary" data-act="again">${B('再来一次', 'Try again')}</button>
        </div>`;
    }
    function bindPicker() {
      body.querySelector('.src-pick').addEventListener('change', e => {
        srcId = e.target.value; FL.store.set(`quiz:${cfg.id}:src`, srcId); build(); render();
      });
    }
    body.addEventListener('click', e => {
      const o = e.target.closest('.q-opt');
      if (o) return answer(+o.dataset.i);
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'next') { qi++; render(); }
      if (a.dataset.act === 'again') { build(); render(); }
    });
    const onKey = e => {
      if (!body.isConnected || e.target.closest('input, textarea, select') || !isVisible(body)) return;
      if (/^[1-4]$/.test(e.key) && !locked) answer(+e.key - 1);
    };
    document.addEventListener('keydown', onKey);
    build(); render();
    return () => document.removeEventListener('keydown', onKey);
  }

  /* ---------- type with me ---------- */
  const ACCENTS = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'û', 'ù', 'œ', "'"];
  const TYPE_MODES = [
    { id: 'copy', emoji: '', zh: '跟打', en: 'Copy' },
    { id: 'recall', emoji: '', zh: '默写', en: 'Recall' },
    { id: 'dictee', emoji: '', zh: '听写', en: 'Dictation' },
  ];
  const baseChar = c => c.toLowerCase().replace(/œ/, 'oe').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/, "'");

  function Typer(body, cfg) {
    const src = sources(cfg);
    let srcId = FL.store.get(`type:${cfg.id}:src`, 'all');
    let mode = FL.store.get('type:mode', 'copy');
    let lenient = FL.store.get('type:lenient', true);
    let order, oi, item, target, hints, stats = { ok: 0, miss: 0 }, done;

    body.innerHTML = `
      <div class="pr-toolbar">
        ${pickerHTML(src, srcId)}
        <div class="seg small" role="group">${TYPE_MODES.map(m => `<button type="button" data-tmode="${m.id}" class="${m.id === mode ? 'on' : ''}">${m.emoji} ${B(m.zh, m.en)}</button>`).join('')}</div>
        <label class="check"><input type="checkbox" data-len ${lenient ? 'checked' : ''}> ${B('忽略重音', 'Ignore accents')}</label>
      </div>
      <div class="ty-card">
        <div class="ty-prompt"></div>
        <div class="ty-target" lang="fr" aria-live="polite"></div>
        <input class="ty-input" lang="fr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Tapez ici…">
        <div class="accent-bar">${ACCENTS.map(c => `<button type="button" data-ch="${FL.esc(c)}" tabindex="-1">${FL.esc(c)}</button>`).join('')}</div>
        <div class="ty-actions">
          <button type="button" class="btn ghost" data-act="say">${FL.ICON_SPEAKER} ${B('听', 'Listen')}</button>
          <button type="button" class="btn ghost" data-act="hint">${B('提示', 'Hint')}</button>
          <button type="button" class="btn primary" data-act="check">${B('检查', 'Check')} ⏎</button>
          <button type="button" class="btn ghost" data-act="skip">${B('跳过', 'Skip')} →</button>
        </div>
        <div class="ty-feedback" aria-live="polite"></div>
      </div>
      <div class="ty-stats"></div>`;
    const input = body.querySelector('.ty-input');
    const tgt = body.querySelector('.ty-target');
    const prompt = body.querySelector('.ty-prompt');
    const fb = body.querySelector('.ty-feedback');

    function start() {
      const items = (src.list.find(s => s.id === srcId) || src.list[0]).items;
      order = FL.shuffle(items);
      oi = -1;
      next();
    }
    function next() {
      oi = (oi + 1) % order.length;
      item = order[oi];
      target = FL.cleanFr(item.fr);
      hints = 0;
      done = false;
      input.value = '';
      fb.innerHTML = '';
      body.querySelector('[data-act="check"]').hidden = mode === 'copy';
      prompt.innerHTML = mode === 'dictee'
        ? `<div class="q-label">${B('听写：听到什么就打什么', 'Type what you hear')}</div>`
        : `<div class="q-label">${mode === 'copy' ? B('照着打出法语', 'Type the French') : B('用法语写出来', 'Write it in French')}</div><div class="ty-meaning">${FL.m(item)}</div>`;
      paint();
      body.querySelector('.ty-stats').innerHTML = `✓ ${stats.ok} · ✗ ${stats.miss} · ${oi + 1}/${order.length}`;
      if (mode !== 'recall') setTimeout(() => FL.speak(target), 200);
      input.focus({ preventScroll: true });
    }
    // copy mode: colour each target letter as you type. recall/dictée: show a mask with hints
    function paint() {
      const typed = input.value;
      if (mode === 'copy') {
        tgt.innerHTML = [...target].map((c, k) => {
          let cls = 'pend';
          if (k < typed.length) {
            const t = typed[k];
            if (t === c || t.toLowerCase() === c.toLowerCase() || (t === "'" && c === '’')) cls = 'ok';
            else if (baseChar(t) === baseChar(c)) cls = lenient ? 'near' : 'bad';
            else cls = 'bad';
          }
          if (k === typed.length) cls += ' cur';
          return `<span class="${cls}">${c === ' ' ? '&nbsp;' : FL.esc(c)}</span>`;
        }).join('');
      } else {
        let letters = 0;
        tgt.innerHTML = [...target].map(c => {
          if (!/[A-Za-zÀ-ÿœŒ]/.test(c)) return `<span class="gap">${c === ' ' ? '&nbsp;&nbsp;' : FL.esc(c)}</span>`;
          return letters++ < hints ? `<span class="ok">${FL.esc(c)}</span>` : '<span class="mask">_</span>';
        }).join('');
      }
    }
    const answers = () => [target, ...(item.alt || []).map(FL.cleanFr)];
    const isRight = v => answers().some(a => FL.norm(a, lenient) === FL.norm(v, lenient));
    function success() {
      done = true;
      stats.ok++;
      fb.innerHTML = `<span class="ok">✓ <span lang="fr">Exact.</span></span> <span lang="fr" class="ans">${FL.esc(target)}</span>`;
      tgt.classList.add('win');
      FL.speak(target, { onend: () => setTimeout(() => { tgt.classList.remove('win'); if (done) next(); }, 350) });
    }
    function check() {
      if (done) return next();
      if (isRight(input.value)) return success();
      stats.miss++;
      // show which letters were wrong
      const v = input.value;
      const diff = [...target].map((c, k) => {
        const t = v[k] || '';
        const good = t && (lenient ? baseChar(t) === baseChar(c) : t.toLowerCase() === c.toLowerCase());
        return `<span class="${good ? 'ok' : 'bad'}">${FL.esc(c)}</span>`;
      }).join('');
      fb.innerHTML = `<span class="no">✗ ${B('正确答案', 'Answer')}:</span> <span class="ans diff">${diff}</span> ${FL.sayBtn(target, 'tiny')}`;
      body.querySelector('.ty-stats').innerHTML = `✓ ${stats.ok} · ✗ ${stats.miss} · ${oi + 1}/${order.length}`;
    }

    input.addEventListener('input', () => {
      if (mode === 'copy') {
        paint();
        if (!done && isRight(input.value)) success();
      }
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); mode === 'copy' ? (done ? next() : null) : check(); }
    });
    body.addEventListener('mousedown', e => { if (e.target.closest('[data-ch]')) e.preventDefault(); });
    body.addEventListener('click', e => {
      const ch = e.target.closest('[data-ch]');
      if (ch) {
        const s = input.selectionStart ?? input.value.length, en = input.selectionEnd ?? s;
        input.setRangeText(ch.dataset.ch, s, en, 'end');
        input.dispatchEvent(new Event('input'));
        input.focus();
        return;
      }
      const tm = e.target.closest('[data-tmode]');
      if (tm) {
        mode = tm.dataset.tmode; FL.store.set('type:mode', mode);
        body.querySelectorAll('[data-tmode]').forEach(b => b.classList.toggle('on', b === tm));
        oi--; next();
        return;
      }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      const act = a.dataset.act;
      if (act === 'say') FL.speak(target);
      if (act === 'skip') next();
      if (act === 'check') check();
      if (act === 'hint') {
        if (mode === 'copy') { input.value = target.slice(0, input.value.length + 1); input.dispatchEvent(new Event('input')); }
        else { hints++; paint(); }
        input.focus();
      }
    });
    body.querySelector('[data-len]').addEventListener('change', e => {
      lenient = e.target.checked; FL.store.set('type:lenient', lenient); paint();
    });
    body.querySelector('.src-pick').addEventListener('change', e => {
      srcId = e.target.value; FL.store.set(`type:${cfg.id}:src`, srcId); start();
    });
    start();
  }

  /* ---------- mount ---------- */
  const TABS = [
    { id: 'cards', emoji: '🃏', zh: '闪卡', en: 'Flashcards', fn: Cards },
    { id: 'quiz', emoji: '✅', zh: '选择题', en: 'Quiz', fn: Quiz },
    { id: 'type', emoji: '⌨️', zh: '跟我打字', en: 'Type with me', fn: Typer },
  ];
  FL.Practice = {
    mount(el, cfg) {
      el.innerHTML = `<div class="pr-tabs" role="tablist">${TABS.map(t =>
        `<button type="button" role="tab" data-ptab="${t.id}"><span class="pt-emoji">${t.emoji}</span>${B(t.zh, t.en)}</button>`).join('')}</div>
        <div class="pr-body"></div>`;
      let cleanup = null;
      const open = id => {
        if (cleanup) cleanup();
        FL.stopSpeech();
        const t = TABS.find(x => x.id === id) || TABS[0];
        el.querySelectorAll('[data-ptab]').forEach(b => {
          b.classList.toggle('on', b.dataset.ptab === t.id);
          b.setAttribute('aria-selected', b.dataset.ptab === t.id);
        });
        // swap in a fresh body so the previous tab's listeners are dropped
        const old = el.querySelector('.pr-body');
        const fresh = old.cloneNode(false);
        old.replaceWith(fresh);
        cleanup = t.fn(fresh, cfg) || null;
        FL.store.set(`ptab:${cfg.id}`, t.id);
      };
      el.querySelector('.pr-tabs').addEventListener('click', e => {
        const b = e.target.closest('[data-ptab]');
        if (b) open(b.dataset.ptab);
      });
      open(FL.store.get(`ptab:${cfg.id}`, 'cards'));
    },
  };
})();
