/* nombres-compteur.js — French numbers for the star counter's world:
   the number → words converter, the star-counter widget, the opening's live count,
   and the number questions used by the quiz. */
(function () {
  const FL = window.FL;
  const B = FL.bi;
  const esc = FL.esc;

  /* ---------- numbers in words (standard spelling, spaces around cent / mille) ---------- */
  const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  const TENS = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };
  const below20 = n => (n < 17 ? U[n] : `dix-${U[n - 10]}`);
  // finalS: quatre-vingts / deux cents keep their s only at the very end (not before mille)
  function below100(n, finalS = true) {
    if (n < 20) return below20(n);
    const t = Math.floor(n / 10), u = n % 10;
    if (t < 7) return TENS[t] + (u === 0 ? '' : u === 1 ? ' et un' : `-${U[u]}`);
    if (t < 8) return n === 71 ? 'soixante et onze' : `soixante-${below20(n - 60)}`;   // 70 = 60 + 10
    return n === 80 ? `quatre-vingt${finalS ? 's' : ''}` : `quatre-vingt-${below20(n - 80)}`; // 80 = 4 × 20, no "et"
  }
  function below1000(n, finalS = true) {
    if (n < 100) return below100(n, finalS);
    const c = Math.floor(n / 100), r = n % 100;
    const head = c === 1 ? 'cent' : `${U[c]} cent`;
    return r ? `${head} ${below100(r, finalS)}` : head + (c > 1 && finalS ? 's' : '');
  }
  function cardinal(n, { fem = false } = {}) {
    if (n === 0) return 'zéro';
    const g = Math.floor(n / 1e9), m = Math.floor((n % 1e9) / 1e6), k = Math.floor((n % 1e6) / 1000), r = n % 1000;
    const parts = [];
    if (g) parts.push(`${below1000(g)} milliard${g > 1 ? 's' : ''}`);   // milliard / million are nouns: they take s
    if (m) parts.push(`${below1000(m)} million${m > 1 ? 's' : ''}`);
    if (k) parts.push(k === 1 ? 'mille' : `${below1000(k, false)} mille`); // never "un mille", mille never takes s
    if (r) parts.push(below1000(r));
    let w = parts.join(' ');
    if (fem) w = w.replace(/(^|[\s-])un$/, '$1une'); // vingt et une étoiles
    return w;
  }
  function ordinal(n, { fem = false } = {}) {
    if (n === 1) return fem ? 'première' : 'premier';
    let w = cardinal(n)
      .replace(/cinq$/, 'cinqu').replace(/neuf$/, 'neuv')
      .replace(/quatre-vingts$/, 'quatre-vingt').replace(/cents$/, 'cent').replace(/(milliard|million)s$/, '$1');
    if (/e$/.test(w)) w = w.slice(0, -1);
    return `${w}ième`;
  }
  const abbr = n => (n === 1 ? '1er' : `${n}e`);
  const digits = n => n.toLocaleString('fr-FR');
  // how the hard ones are built
  function build(n) {
    if (n >= 70 && n < 80) return `${n} = 60 + ${n - 60}`;
    if (n === 80) return '80 = 4 × 20';
    if (n > 80 && n < 100) return `${n} = 4 × 20 + ${n - 80}`;
    if (n >= 17 && n < 20) return `${n} = 10 + ${n - 10}`;
    return '';
  }
  FL.numFr = { cardinal, ordinal, digits, abbr };

  const RANGES = [
    { id: 'r10', label: '0 – 20', min: 0, max: 20 },
    { id: 'r100', label: '0 – 100', min: 0, max: 100 },
    { id: 'r70', label: '70 – 99', min: 70, max: 99 },
    { id: 'r1000', label: '100 – 999', min: 100, max: 999 },
    { id: 'rk', label: '1 000 – 99 999', min: 1000, max: 99999 },
    { id: 'rbig', label: 'Grands', min: 100000, max: 999999999 },
  ];
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pickIn = r => rand(r.min, r.max);
  const onlyDigits = s => String(s).replace(/[^\d]/g, '');

  /* ---------- how the topic page presents the widget ---------- */
  FL.WIDGET_META = FL.WIDGET_META || {};
  FL.WIDGET_META.stars = {
    chapter: { id: 'compteur', fr: 'Compteur', zh: '数星星', en: 'Counter', color: '#2e3b5a' },
    h2: 'Le compteur d’étoiles',
    sub: { zh: '输入任何数字，看它怎么写、怎么读', en: 'Type any number to see and hear it in French' },
    cls: 'counter-page',
  };

  /* ---------- the opening's live block: the stars counted so far ---------- */
  FL.openingLive = FL.openingLive || {};
  FL.openingLive.stars = box => {
    let n = 501622731;
    box.innerHTML = `<div class="labels sub-labels"><span>${B('已经数了的星星', 'Stars counted so far')}</span></div>
      <div class="live-count digital"></div>
      <div class="live-time fr live-words"></div>
      <button type="button" class="btn primary live-say">${FL.ICON_SPEAKER} ${B('听这个数字', 'Hear the number')}</button>`;
    const d = box.querySelector('.live-count'), w = box.querySelector('.live-words');
    const text = () => `${cardinal(n, { fem: true })} étoiles`;
    const show = () => { d.textContent = digits(n); w.textContent = text(); w.dataset.say = text(); };
    show();
    setInterval(() => { n++; show(); }, 4000); // she never stops counting
    box.querySelector('.live-say').addEventListener('click', () => FL.speak(text()));
    return { text };
  };

  /* ---------- quiz questions about numbers ---------- */
  function near(n, max) {
    const cands = [n + 1, n - 1, n + 10, n - 10, n + 20, n - 20, n + 100, n - 100, n + 11, n - 9]
      .concat(n >= 70 && n < 100 ? [n - 10, n + 10, n - 20] : []);
    const out = new Set();
    for (const c of FL.shuffle(cands)) { if (c >= 0 && c <= max && c !== n) out.add(c); if (out.size === 3) break; }
    while (out.size < 3) { const c = rand(0, max); if (c !== n) out.add(c); }
    return [...out];
  }
  FL.quizGenerators.nombres = () => {
    const kind = FL.pick(['d2w', 'w2d', 'listen', 'calc']);
    if (kind === 'calc') {
      const q = calcQuestion();
      const opts = FL.shuffle([q.ans, ...near(q.ans, Math.max(20, q.ans + 20))]);
      return {
        prompt: `<div class="q-label">${B('算一算', 'Work it out')}</div><div class="q-big fr">${esc(q.say)}</div>${FL.sayBtn(q.say)}`,
        options: opts.map(o => `<span class="digital">${digits(o)}</span>`), answer: opts.indexOf(q.ans), say: q.full,
      };
    }
    const r = FL.pick([RANGES[0], RANGES[1], RANGES[1], RANGES[2], RANGES[3]]);
    const n = pickIn(r);
    const opts = FL.shuffle([n, ...near(n, r.max + 20)]);
    const answer = opts.indexOf(n), say = cardinal(n);
    if (kind === 'd2w') return {
      prompt: `<div class="q-label">${B('这个数字用法语怎么写？', 'How is this number written in French?')}</div><div class="q-big digital">${digits(n)}</div>`,
      options: opts.map(o => `<span lang="fr">${esc(cardinal(o))}</span>`), answer, say,
    };
    if (kind === 'w2d') return {
      prompt: `<div class="q-label">${B('选出这个数字', 'Pick the number')}</div><div class="q-big fr">${esc(say)}</div>${FL.sayBtn(say)}`,
      options: opts.map(o => `<span class="digital">${digits(o)}</span>`), answer, say,
    };
    return {
      prompt: `<div class="q-label">${B('听一听，选出这个数字', 'Listen and pick the number')}</div><button type="button" class="play-big" data-say="${esc(say)}" aria-label="Écouter">${FL.ICON_SPEAKER}</button>`,
      options: opts.map(o => `<span class="digital">${digits(o)}</span>`), answer, say, autoSay: true,
    };
  };

  /* ---------- arithmetic, said the French way ---------- */
  const OPS = [
    { id: 'plus', sym: '+', w: 'plus' },
    { id: 'moins', sym: '−', w: 'moins' },
    { id: 'fois', sym: '×', w: 'fois' },
    { id: 'div', sym: '÷', w: 'divisé par' },
  ];
  function calcQuestion(level = 1) {
    const op = FL.pick(OPS);
    let a, b, ans;
    const big = level > 1 ? 100 : 50;
    if (op.id === 'plus') { a = rand(1, big); b = rand(1, big); ans = a + b; }
    if (op.id === 'moins') { a = rand(5, big); b = rand(1, a); ans = a - b; }
    if (op.id === 'fois') { a = rand(2, 12); b = rand(2, 12); ans = a * b; }
    if (op.id === 'div') { b = rand(2, 10); ans = rand(2, 12); a = b * ans; }
    const say = `Combien font ${cardinal(a)} ${op.w} ${cardinal(b)} ?`;
    const full = `${cap(cardinal(a))} ${op.w} ${cardinal(b)} ${op.id === 'plus' || op.id === 'div' ? 'égale' : 'font'} ${cardinal(ans)}.`;
    return { a, b, op, ans, say, full, sym: `${digits(a)} ${op.sym} ${digits(b)}` };
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- the widget: the star counter ---------- */
  FL.widgets.stars = el => {
    let n = 77, tab = 'explore', rangeId = FL.store.get('nombres:range', 'r100');
    let target = null, stats = { ok: 0, miss: 0 };
    const range = () => RANGES.find(r => r.id === rangeId) || RANGES[1];

    el.innerHTML = `
      <div class="sc-left">
        <div class="sc-sky" aria-hidden="true"></div>
        <output class="sc-digits digital"></output>
        <div class="sc-controls">
          <button type="button" class="btn ghost" data-n="-10">−10</button>
          <button type="button" class="btn ghost" data-n="-1">−1</button>
          <input class="sc-input" type="text" inputmode="numeric" aria-label="Un nombre" maxlength="13">
          <button type="button" class="btn ghost" data-n="1">+1</button>
          <button type="button" class="btn ghost" data-n="10">+10</button>
        </div>
        <div class="sc-range">
          <label>${B('范围', 'Range')}
            <select class="sc-range-pick">${RANGES.map(r => `<option value="${r.id}" ${r.id === rangeId ? 'selected' : ''}>${r.label}</option>`).join('')}</select>
          </label>
          <button type="button" class="btn ghost" data-n="rand">${B('随机', 'Random')}</button>
        </div>
      </div>
      <div class="sc-right">
        <div class="seg" role="tablist">
          <button type="button" data-ctab="explore" class="on">${B('看说法', 'Explore')}</button>
          <button type="button" data-ctab="dictee">${B('听写数字', 'Dictation')}</button>
          <button type="button" data-ctab="ecrire">${B('写法语', 'Spell it')}</button>
          <button type="button" data-ctab="calcul">${B('计算', 'Arithmetic')}</button>
        </div>
        <div class="sc-panel"></div>
        <p class="ty-stats sc-stats"></p>
      </div>`;
    const left = el.querySelector('.sc-left'), right = el.querySelector('.sc-right');
    const panel = right.querySelector('.sc-panel');
    const input = left.querySelector('.sc-input');

    // up to 100 stars, one row per ten, so the tens can be seen; beyond that, a ledger by group
    function sky() {
      const box = left.querySelector('.sc-sky');
      if (n <= 100) {
        let s = '';
        for (let i = 0; i < n; i++) {
          const row = Math.floor(i / 10), col = i % 10;
          s += `<use href="#sc-star" x="${10 + col * 22}" y="${10 + row * 18}" class="${row % 2 ? 'odd' : ''}"/>`;
        }
        box.innerHTML = `<svg viewBox="0 0 230 190"><defs><path id="sc-star" d="M0 -7 L2 -2 L7 -2 L3 1.5 L4.5 7 L0 3.8 L-4.5 7 L-3 1.5 L-7 -2 L-2 -2 Z"/></defs>${s}</svg>
          <p class="sc-caption">${n ? B(`${Math.floor(n / 10)} 排十颗 + ${n % 10} 颗`, `${Math.floor(n / 10)} rows of ten + ${n % 10}`) : B('还没有星星', 'No stars yet')}</p>`;
      } else {
        const groups = [['milliards', 1e9], ['millions', 1e6], ['mille', 1e3], ['unités', 1]]
          .map(([name, size]) => ({ name, v: Math.floor((n % (size * 1000)) / size) }))
          .filter((g, i, a) => g.v || a.slice(0, i).some(x => x.v));
        box.innerHTML = `<table class="sc-ledger"><tr>${groups.map(g => `<th lang="fr">${g.name}</th>`).join('')}</tr>
          <tr>${groups.map(g => `<td class="digital">${String(g.v).padStart(groups[0] === g ? 1 : 3, '0')}</td>`).join('')}</tr>
          <tr>${groups.map(g => `<td lang="fr" class="sc-ledger-w">${g.v ? esc(below1000(g.v, g.name !== 'mille')) : '—'}</td>`).join('')}</tr></table>
          <p class="sc-caption">${B('法语按三位一组来读：百万 · 千 · 个', 'French reads in groups of three: millions · thousands · units')}</p>`;
      }
    }
    function setN(v, fromInput) {
      n = Math.max(0, Math.min(999999999999, Math.round(v) || 0));
      left.querySelector('.sc-digits').textContent = digits(n);
      if (!fromInput) input.value = String(n);
      sky();
      if (tab === 'explore') explore();
    }

    function explore() {
      const w = cardinal(n), o = ordinal(n), how = build(n);
      panel.innerHTML = `
        <div class="saying" data-say="${esc(w)}" tabindex="0" role="button">
          <small>${B('基数词', 'Cardinal')}</small>
          <div class="fr big-line">${esc(w)}</div>${FL.sayBtn(w)}
        </div>
        ${how ? `<p class="sc-how">${esc(how)}</p>` : ''}
        ${n > 0 && n < 1e6 ? `<div class="saying" data-say="${esc(`le ${o}`)}" tabindex="0" role="button">
          <small>${B('序数词', 'Ordinal')} · ${abbr(n)}</small>
          <div class="fr big-line">${esc(o)}</div>${FL.sayBtn(`le ${o}`)}
        </div>` : ''}
        ${/(^|\s)un$/.test(w) ? `<p class="tip">${B(`阴性名词前用 une：${cardinal(n, { fem: true })} étoiles`, `Before a feminine noun: ${cardinal(n, { fem: true })} étoiles`)}</p>` : ''}`;
    }
    const statsLine = () => { right.querySelector('.sc-stats').textContent = tab === 'explore' ? '' : `✓ ${stats.ok} · ✗ ${stats.miss}`; };

    // dictation: hear a number, write the digits
    function dictee() {
      target = pickIn(range());
      panel.innerHTML = `
        <p class="q-label">${B('听数字，用阿拉伯数字写下来', 'Listen, then write the number in digits')}</p>
        <button type="button" class="play-big" data-r="say" aria-label="Écouter">${FL.ICON_SPEAKER}</button>
        <input class="ty-input sc-answer" inputmode="numeric" autocomplete="off" placeholder="123" aria-label="Le nombre">
        <div class="ty-actions">
          <button type="button" class="btn primary" data-r="check">${B('检查', 'Check')} ⏎</button>
          <button type="button" class="btn ghost" data-r="slow">${B('慢一点', 'Slower')}</button>
          <button type="button" class="btn ghost" data-r="next">${B('下一个', 'Next')} →</button>
        </div>
        <div class="ty-feedback" aria-live="polite"></div>`;
      setTimeout(() => FL.speak(cardinal(target)), 200);
    }
    // spelling: see the digits, write the French
    function ecrire() {
      target = pickIn(range());
      panel.innerHTML = `
        <p class="q-label">${B('用法语写出这个数字', 'Write this number in French')}</p>
        <div class="q-big digital">${digits(target)}</div>
        <input class="ty-input sc-answer" lang="fr" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="quatre-vingt-…" aria-label="En lettres">
        <div class="ty-actions">
          <button type="button" class="btn primary" data-r="check">${B('检查', 'Check')} ⏎</button>
          <button type="button" class="btn ghost" data-r="show">${B('答案', 'Answer')}</button>
          <button type="button" class="btn ghost" data-r="next">${B('下一个', 'Next')} →</button>
        </div>
        <div class="ty-feedback" aria-live="polite"></div>`;
    }
    // arithmetic: the question is spoken and written in French, the answer in digits
    let cq = null;
    function calcul() {
      cq = calcQuestion(rangeId === 'r10' ? 1 : 2);
      target = cq.ans;
      panel.innerHTML = `
        <p class="q-label">${B('听题，算出答案', 'Listen and work it out')}</p>
        <div class="q-big fr sc-calc" data-say="${esc(cq.say)}" tabindex="0" role="button">${esc(cq.say)}</div>
        <p class="sc-sym digital">${esc(cq.sym)} = ?</p>
        <input class="ty-input sc-answer" inputmode="numeric" autocomplete="off" placeholder="?" aria-label="Le résultat">
        <div class="ty-actions">
          <button type="button" class="btn primary" data-r="check">${B('检查', 'Check')} ⏎</button>
          <button type="button" class="btn ghost" data-r="say">${FL.ICON_SPEAKER} ${B('再听', 'Again')}</button>
          <button type="button" class="btn ghost" data-r="next">${B('下一题', 'Next')} →</button>
        </div>
        <div class="ty-feedback" aria-live="polite"></div>`;
      setTimeout(() => FL.speak(cq.say), 200);
    }
    function check() {
      const fb = panel.querySelector('.ty-feedback'), v = panel.querySelector('.sc-answer').value;
      let ok;
      if (tab === 'ecrire') ok = FL.norm(v, true) === FL.norm(cardinal(target), true);
      else ok = onlyDigits(v) !== '' && +onlyDigits(v) === target;
      ok ? stats.ok++ : stats.miss++;
      statsLine();
      const answer = tab === 'calcul' ? cq.full : `${digits(target)} · ${cardinal(target)}`;
      const said = tab === 'calcul' ? cq.full : cardinal(target);
      fb.innerHTML = `<span class="${ok ? 'ok' : 'no'}">${ok ? B('✓ 正确', '✓ Correct') : B('✗ 正确答案', '✗ The answer')}</span>
        <div class="answers"><div><span class="fr">${esc(answer)}</span> ${FL.sayBtn(said, 'tiny')}</div></div>`;
      if (ok) FL.speak(said);
    }
    function openTab(t) {
      tab = t;
      right.querySelectorAll('[data-ctab]').forEach(b => b.classList.toggle('on', b.dataset.ctab === t));
      ({ explore, dictee, ecrire, calcul })[t]();
      statsLine();
      const a = panel.querySelector('.sc-answer');
      if (a) {
        a.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
        a.focus({ preventScroll: true });
      }
    }

    const onClick = e => {
      const b = e.target.closest('[data-n], [data-ctab], [data-r]');
      if (!b) return;
      if (b.dataset.n === 'rand') setN(pickIn(range()));
      else if (b.dataset.n) setN(n + +b.dataset.n);
      if (b.dataset.ctab) openTab(b.dataset.ctab);
      const r = b.dataset.r;
      if (r === 'say') FL.speak(tab === 'calcul' ? cq.say : cardinal(target));
      if (r === 'slow') FL.speak(cardinal(target), { rate: 0.7 });
      if (r === 'check') check();
      if (r === 'next') openTab(tab);
      if (r === 'show') panel.querySelector('.ty-feedback').innerHTML = `<div class="answers"><div><span class="fr">${esc(cardinal(target))}</span> ${FL.sayBtn(cardinal(target), 'tiny')}</div></div>`;
    };
    left.addEventListener('click', onClick);
    right.addEventListener('click', onClick);
    input.addEventListener('input', () => setN(+onlyDigits(input.value), true));
    left.querySelector('.sc-range-pick').addEventListener('change', e => {
      rangeId = e.target.value; FL.store.set('nombres:range', rangeId);
      if (tab !== 'explore') openTab(tab);
    });
    setN(n);
    openTab('explore');
    return { left, right };
  };
})();
