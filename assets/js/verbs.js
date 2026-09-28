/* verbs.js — site-wide verb dictionary, conjugator, and hover popup.
   Any French text inside an element with class "fr" gets its verbs underlined
   automatically (FL.markVerbs). Hover (or tap) a verb to see its conjugation.

   To add a verb: add one line to VERBS. Regular -er / -ir / -re verbs only need
   zh + en (+ aux:'être' if it uses être). Irregular verbs also give pres/pp/fut. */
(function () {
  const FL = window.FL;

  const VERBS = {
    // irregular
    'être':      { zh: '是；在', en: 'to be', pres: 'suis es est sommes êtes sont', pp: 'été', fut: 'ser', imp: 'ét' },
    'avoir':     { zh: '有', en: 'to have', pres: 'ai as a avons avez ont', pp: 'eu', fut: 'aur' },
    'aller':     { zh: '去', en: 'to go', pres: 'vais vas va allons allez vont', pp: 'allé', fut: 'ir', aux: 'être' },
    'venir':     { zh: '来', en: 'to come', pres: 'viens viens vient venons venez viennent', pp: 'venu', fut: 'viendr', aux: 'être' },
    'partir':    { zh: '出发；离开', en: 'to leave', pres: 'pars pars part partons partez partent', pp: 'parti', aux: 'être' },
    'sortir':    { zh: '出去', en: 'to go out', pres: 'sors sors sort sortons sortez sortent', pp: 'sorti', aux: 'être' },
    'dormir':    { zh: '睡觉', en: 'to sleep', pres: 'dors dors dort dormons dormez dorment', pp: 'dormi' },
    'faire':     { zh: '做', en: 'to do / make', pres: 'fais fais fait faisons faites font', pp: 'fait', fut: 'fer' },
    'prendre':   { zh: '拿；乘坐', en: 'to take', pres: 'prends prends prend prenons prenez prennent', pp: 'pris' },
    'mettre':    { zh: '放；花（时间）', en: 'to put', pres: 'mets mets met mettons mettez mettent', pp: 'mis' },
    'pouvoir':   { zh: '能够', en: 'can', pres: 'peux peux peut pouvons pouvez peuvent', pp: 'pu', fut: 'pourr' },
    'vouloir':   { zh: '想要', en: 'to want', pres: 'veux veux veut voulons voulez veulent', pp: 'voulu', fut: 'voudr' },
    'devoir':    { zh: '必须', en: 'must', pres: 'dois dois doit devons devez doivent', pp: 'dû', fut: 'devr' },
    'voir':      { zh: '看见', en: 'to see', pres: 'vois vois voit voyons voyez voient', pp: 'vu', fut: 'verr' },
    'savoir':    { zh: '知道', en: 'to know', pres: 'sais sais sait savons savez savent', pp: 'su', fut: 'saur' },
    'se lever':  { zh: '起床', en: 'to get up', pres: 'lève lèves lève levons levez lèvent', pp: 'levé', fut: 'lèver' },
    // regular -er
    'arriver':   { zh: '到达', en: 'to arrive', aux: 'être' },
    'rentrer':   { zh: '回家；返回', en: 'to go back home', aux: 'être' },
    'rester':    { zh: '待；留下', en: 'to stay', aux: 'être' },
    'commencer': { zh: '开始', en: 'to begin' },
    'manger':    { zh: '吃', en: 'to eat' },
    'travailler':{ zh: '工作', en: 'to work' },
    'parler':    { zh: '说', en: 'to speak' },
    'aimer':     { zh: '喜欢；爱', en: 'to like / love' },
    'déjeuner':  { zh: '吃午饭', en: 'to have lunch' },
    'dîner':     { zh: '吃晚饭', en: 'to have dinner' },
    'regarder':  { zh: '看', en: 'to watch' },
    'habiter':   { zh: '居住', en: 'to live (somewhere)' },
    'se coucher':{ zh: '睡觉；躺下', en: 'to go to bed' },
    'se réveiller': { zh: '醒来', en: 'to wake up' },
    // regular -ir / -re
    'finir':     { zh: '结束；完成', en: 'to finish' },
    'attendre':  { zh: '等待', en: 'to wait' },
  };

  const P = ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'];
  const REFL = ['me', 'te', 'se', 'nous', 'vous', 'se'];
  const AGREE = ['(e)', '(e)', '(e)', '(e)s', '(e)(s)', '(e)s'];
  const AUX = { avoir: 'ai as a avons avez ont'.split(' '), 'être': 'suis es est sommes êtes sont'.split(' ') };
  const END_IMP = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
  const END_FUT = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
  const TENSES = [
    { id: 'present', fr: 'Présent', zh: '现在时', en: 'Present' },
    { id: 'pc', fr: 'Passé composé', zh: '复合过去时', en: 'Past' },
    { id: 'imparfait', fr: 'Imparfait', zh: '未完成过去时', en: 'Imperfect' },
    { id: 'futur', fr: 'Futur simple', zh: '简单将来时', en: 'Future' },
  ];
  const startsVowel = w => /^[aeiouyâàéèêëîïôûùœh]/i.test(w);

  function regularPres(base) {
    const s = base.slice(0, -2);
    if (base.endsWith('er')) {
      const n = s.endsWith('c') ? s.slice(0, -1) + 'ç' : s.endsWith('g') ? s + 'e' : s;
      return [s + 'e', s + 'es', s + 'e', n + 'ons', s + 'ez', s + 'ent'];
    }
    if (base.endsWith('ir')) return [s + 'is', s + 'is', s + 'it', s + 'issons', s + 'issez', s + 'issent'];
    return [s + 's', s + 's', s, s + 'ons', s + 'ez', s + 'ent'];
  }
  const regularPP = b => b.slice(0, -2) + (b.endsWith('er') ? 'é' : b.endsWith('ir') ? 'i' : 'u');

  function line(pi, form, refl) {
    let v = form;
    if (refl) v = (pi !== 3 && pi !== 4 && startsVowel(v) ? REFL[pi][0] + "'" : REFL[pi] + ' ') + v;
    return (pi === 0 && startsVowel(v) ? "j'" : P[pi] + ' ') + v;
  }

  const cache = {};
  function conj(key) {
    if (cache[key]) return cache[key];
    const d = VERBS[key];
    if (!d) return null;
    const refl = /^se |^s'/.test(key);
    const base = key.replace(/^se |^s'/, '');
    const aux = refl ? 'être' : d.aux || 'avoir';
    const pres = d.pres ? d.pres.split(' ') : regularPres(base);
    const pp = d.pp || regularPP(base);
    const impStem = d.imp || pres[3].slice(0, -3);
    const imp = END_IMP.map((e, i) =>
      (i === 3 || i === 4 ? impStem.replace(/ç$/, 'c').replace(/(g)e$/, '$1') : impStem) + e);
    const futStem = d.fut || (base.endsWith('re') ? base.slice(0, -1) : base);
    const fut = END_FUT.map(e => futStem + e);
    const pc = AUX[aux].map((a, i) => `${a} ${pp}${aux === 'être' ? AGREE[i] : ''}`);
    const forms = { present: pres, pc, imparfait: imp, futur: fut };
    const lines = {};
    for (const t in forms) lines[t] = forms[t].map((f, i) => line(i, f, refl));
    return (cache[key] = { key, base, refl, aux, pp, zh: d.zh, en: d.en, forms, lines });
  }

  // reverse index: conjugated word -> infinitive. Past participles are left out on purpose
  // ("été" is also "summer", "fait" is covered by the present tense anyway).
  const INDEX = {};
  for (const key in VERBS) {
    const c = conj(key);
    INDEX[c.base] = key;
    ['present', 'imparfait', 'futur'].forEach(t => c.forms[t].forEach(f => { INDEX[f.toLowerCase()] = INDEX[f.toLowerCase()] || key; }));
  }

  /* ---------- auto-mark verbs inside .fr elements ---------- */
  const SKIP = 'button, input, textarea, select, .verb, .no-verb, script, style';
  const WORD = /([A-Za-zÀ-ÖØ-öø-ÿœŒ]+)/;
  FL.markVerbs = (root = document.body) => {
    const scopes = root.matches && root.matches('.fr') ? [root] : [...root.querySelectorAll('.fr')];
    scopes.forEach(scope => {
      if (scope.closest(SKIP)) return;
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
        acceptNode: n => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const parts = node.nodeValue.split(WORD);
        if (!parts.some((p, i) => i % 2 && INDEX[p.toLowerCase()])) return;
        const frag = document.createDocumentFragment();
        parts.forEach((p, i) => {
          const inf = i % 2 ? INDEX[p.toLowerCase()] : null;
          if (inf) {
            const s = document.createElement('span');
            s.className = 'verb';
            s.dataset.inf = inf;
            s.tabIndex = 0;
            s.textContent = p;
            frag.appendChild(s);
          } else if (p) frag.appendChild(document.createTextNode(p));
        });
        node.parentNode.replaceChild(frag, node);
      });
    });
  };

  /* ---------- tables ---------- */
  function tenseTable(c, t, hi) {
    return `<table class="conj">${c.lines[t].map((l, i) => {
      const on = hi && c.forms[t][i].toLowerCase() === hi ? ' class="hi"' : '';
      return `<tr${on}><td lang="fr">${FL.esc(l)}</td><td>${FL.sayBtn(l, 'tiny')}</td></tr>`;
    }).join('')}</table>`;
  }
  const auxNote = c => `<span class="aux-note">${FL.bi('复合过去时助动词', 'Past-tense helper')}: <b lang="fr">${c.aux}</b></span>`;

  FL.verbs = {
    list: () => Object.keys(VERBS),
    get: conj,
    TENSES,
    // full 4-tense grid, used on the verbs page and topic pages
    tableHTML(key) {
      const c = conj(key);
      if (!c) return '';
      return `<div class="conj-full">
        <div class="conj-head"><h3 lang="fr">${FL.esc(key)}</h3>${FL.sayBtn(key)}<span class="conj-mean">${FL.bi(c.zh, c.en)}</span>${auxNote(c)}</div>
        <div class="conj-grid">${TENSES.map(t => `
          <div class="conj-block">
            <div class="conj-tense"><span lang="fr">${t.fr}</span> <small>${FL.bi(t.zh, t.en)}</small>
              <button type="button" class="say tiny" data-say="${FL.esc(c.lines[t.id].join(', '))}" aria-label="Écouter">${FL.ICON_SPEAKER}</button></div>
            ${tenseTable(c, t.id)}
          </div>`).join('')}</div></div>`;
    },
  };

  /* ---------- hover popup ---------- */
  let pop, showT, hideT, pinned = false, cur = null;
  function ensurePop() {
    if (pop) return pop;
    pop = document.createElement('div');
    pop.id = 'verb-pop';
    pop.setAttribute('role', 'dialog');
    document.body.appendChild(pop);
    pop.addEventListener('click', e => {
      const tab = e.target.closest('[data-vtab]');
      if (tab) { FL.store.set('vtab', tab.dataset.vtab); fill(); }
    });
    return pop;
  }
  function fill() {
    const c = conj(cur.dataset.inf);
    const t = FL.store.get('vtab', 'present');
    const hi = cur.textContent.toLowerCase();
    pop.innerHTML = `
      <div class="vp-head"><b lang="fr">${FL.esc(c.key)}</b>${FL.sayBtn(c.key, 'tiny')}<span class="vp-mean">${FL.bi(c.zh, c.en)}</span></div>
      <div class="vp-tabs">${TENSES.map(x => `<button type="button" data-vtab="${x.id}" class="${x.id === t ? 'on' : ''}" title="${x.zh} · ${x.en}">${x.fr}</button>`).join('')}</div>
      ${tenseTable(c, t, hi)}
      <div class="vp-foot">${auxNote(c)}<a href="${FL.root || ''}verbs.html#${encodeURIComponent(c.key)}">${FL.bi('全部 →', 'All →')}</a></div>`;
  }
  function place() {
    const r = cur.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let left = Math.min(Math.max(8, r.left + r.width / 2 - pw / 2), window.innerWidth - pw - 8);
    let top = r.bottom + 8;
    if (top + ph > window.innerHeight - 8 && r.top - ph - 8 > 0) top = r.top - ph - 8;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  }
  function show(el, pin) {
    ensurePop();
    cur = el;
    pinned = !!pin;
    fill();
    pop.classList.add('open');
    place();
  }
  function hide() { if (pop) pop.classList.remove('open'); pinned = false; cur = null; }

  document.addEventListener('mouseover', e => {
    const v = e.target.closest('.verb');
    if (v) { clearTimeout(hideT); if (v !== cur && !pinned) showT = setTimeout(() => show(v), 120); }
    else if (e.target.closest('#verb-pop')) clearTimeout(hideT);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('.verb') || e.target.closest('#verb-pop')) {
      clearTimeout(showT);
      if (!pinned) hideT = setTimeout(hide, 280);
    }
  });
  document.addEventListener('click', e => {
    const v = e.target.closest('.verb');
    if (v) { show(v, true); return; }
    if (!e.target.closest('#verb-pop')) hide();
  });
  document.addEventListener('focusin', e => { if (e.target.matches('.verb')) show(e.target); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', () => { if (cur && pop.classList.contains('open')) place(); }, { passive: true });
})();
