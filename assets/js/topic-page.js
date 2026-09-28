/* topic-page.js — turns a topic data file into a book.
   topic.html?t=time  ->  loads topics/time.js (+ extras), builds the pages, mounts FL.Book. */
(function () {
  const FL = window.FL;
  const B = FL.bi;
  const esc = FL.esc;

  const params = new URLSearchParams(location.search);
  const id = params.get('t') || 'time';
  const meta = (FL.TOPICS || []).find(t => t.id === id);
  const main = document.getElementById('main');
  FL.renderHeader('topic');
  FL.renderRoom();

  if (!meta || !meta.ready) {
    main.innerHTML = `<div class="empty"><div class="big-emoji">${meta ? meta.emoji : '🤔'}</div>
      <h1>${meta ? esc(meta.fr) : 'Introuvable'}</h1>
      <p>${B('这个主题还在准备中。', 'This topic is coming soon.')}</p>
      <a class="btn primary" href="index.html">← ${B('返回主页', 'Back home')}</a></div>`;
    return;
  }

  const load = src => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src + '?v=6'; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
  meta.scripts.reduce((p, s) => p.then(() => load(s)), Promise.resolve())
    .then(() => render(FL.topicData[id]))
    .catch(err => { main.innerHTML = `<div class="empty"><p>${esc(err.message)}</p></div>`; });

  const CHAPTERS = [
    { id: 'ouverture', fr: 'Ouverture', zh: '开篇', en: 'Opening', color: '#7e2a22' },
    { id: 'vocabulaire', fr: 'Vocabulaire', zh: '词汇', en: 'Words', color: '#9a7431' },
    { id: 'regles', fr: 'Règles', zh: '规则', en: 'Rules', color: '#4f6f5f' },
    { id: 'questions', fr: 'Questions', zh: '问句', en: 'Questions', color: '#5b4a6e' },
    { id: 'verbes', fr: 'Verbes', zh: '动词', en: 'Verbs', color: '#8a4b26' },
    { id: 'horloge', fr: 'Horloge', zh: '时钟', en: 'Clock', color: '#2e3b5a' },
    { id: 'histoire', fr: 'Histoire', zh: '故事', en: 'Story', color: '#9c5a5e' },
    { id: 'pratique', fr: 'Pratique', zh: '练习', en: 'Practice', color: '#56603a' },
  ];
  const chap = cid => CHAPTERS.find(c => c.id === cid);

  const PROVERBS = [
    { fr: 'Chaque chose en son temps.', zh: '凡事各有其时。', en: 'Everything in its own time.' },
    { fr: 'Mieux vaut tard que jamais.', zh: '迟做总比不做好。', en: 'Better late than never.' },
    { fr: 'Le temps, c’est de l’argent.', zh: '时间就是金钱。', en: 'Time is money.' },
    { fr: 'Petit à petit, l’oiseau fait son nid.', zh: '积少成多。', en: 'Little by little, the bird builds its nest.' },
    { fr: 'Paris ne s’est pas fait en un jour.', zh: '巴黎不是一天建成的。', en: "Paris wasn't built in a day." },
  ];
  let proverbI = 0;
  const WATCH = `<svg viewBox="0 0 200 60" class="sketch" aria-hidden="true"><circle cx="20" cy="30" r="14"/><path d="M60 16 A14 14 0 0 1 60 44 A8 14 0 0 0 60 16"/><circle cx="100" cy="30" r="14" class="full"/><path d="M140 16 A14 14 0 0 0 140 44 A8 14 0 0 1 140 16"/><circle cx="180" cy="30" r="14"/></svg>`;

  /* ---------- page helpers ---------- */
  function mkPage(cid, inner, { cls = '', title = '' } = {}) {
    const c = chap(cid);
    const el = document.createElement('div');
    el.className = `page ${cls}`;
    el.style.setProperty('--chap', c.color);
    el.innerHTML = `
      <div class="pg-head"><span class="pg-chap" lang="fr">${c.fr}</span><span class="pg-book" lang="fr">${esc(title)}</span></div>
      <div class="pg-inner">${inner}</div>
      <div class="pg-foot"></div>`;
    return el;
  }
  const labels = (lines, cls = '') => `<div class="labels ${cls}">${lines.map(l => `<span>${l}</span>`).join('')}</div>`;
  const wordRow = w => `
    <li class="word" data-say="${esc(w.fr)}" tabindex="0" role="button">
      <span class="fr">${esc(w.fr)}</span>
      <span class="mean">${FL.m(w)}</span>
      ${w.note ? `<span class="wnote">${FL.m(w.note)}</span>` : ''}
    </li>`;

  function render(d) {
    document.title = `${d.title.fr} · Mon Français`;
    const T = d.title.fr;
    const pages = [];
    const add = (cid, el, opts = {}) => { pages.push({ el, chapter: cid, ...opts }); return el; };

    /* 1. opening: the antique clock pops up out of the book */
    const now = new Date();
    const floaters = ['janvier', 'lundi', "l'été", 'midi', 'demain', 'minuit', 'le soir', 'mai'];
    const opening = document.createElement('div');
    opening.className = 'page wide-page opening';
    opening.style.setProperty('--chap', chap('ouverture').color);
    opening.innerHTML = `
      <div class="op-left">
        ${labels([esc('Le temps'), 'et', esc("l'heure")], 'title-labels')}
        ${labels([B(d.title.zh, d.title.en)], 'sub-labels')}
        <p class="op-motto fr" data-say="Le temps nous appartient." tabindex="0" role="button">« Le temps nous appartient. » <span class="mean">${B('时间属于我们。', 'Time belongs to us.')}</span></p>
        <p class="op-intro">${FL.m(d.intro)}</p>
      </div>
      <div class="op-stage">
        <div class="pop-base"></div>
        ${floaters.map((f, i) => `<button type="button" class="floater" data-say="${esc(f)}" style="--i:${i}">${esc(f)}</button>`).join('')}
        <div class="pop-clock" title="Cliquez pour entendre l'heure">${FL.antiqueClockSVG(now.getHours(), now.getMinutes(), { seconds: true })}</div>
      </div>
      <div class="op-right">
        ${labels([B('现在是', 'Right now it is')], 'sub-labels')}
        <div class="live-time fr"></div>
        <button type="button" class="btn primary live-say">${FL.ICON_SPEAKER} ${B('听现在几点', 'Hear the time')}</button>
        <div class="op-toc">
          <p class="toc-title" lang="fr">Sommaire</p>
          ${CHAPTERS.slice(1).map((c, i) => `<button type="button" data-goto="${c.id}" style="--tab:${c.color}"><b>${i + 1}</b><span lang="fr">${c.fr}</span><small>${B(c.zh, c.en)}</small></button>`).join('')}
        </div>
      </div>`;
    const svg = opening.querySelector('.pop-clock svg');
    const liveEl = opening.querySelector('.live-time');
    let lastMin = -1;
    const tick = () => {
      const t = new Date();
      FL.setHands(svg, t.getHours(), t.getMinutes());
      FL.setSeconds(svg, t.getSeconds());
      if (t.getMinutes() !== lastMin) {
        lastMin = t.getMinutes();
        liveEl.textContent = FL.timeFr.colloquial(t.getHours(), t.getMinutes());
        liveEl.dataset.say = liveEl.textContent;
      }
    };
    tick();
    setInterval(tick, 1000);
    const sayNow = () => FL.speak(liveEl.textContent);
    opening.querySelector('.pop-clock').addEventListener('click', sayNow);
    opening.querySelector('.live-say').addEventListener('click', sayNow);
    opening.querySelector('.op-toc').addEventListener('click', e => {
      const b = e.target.closest('[data-goto]');
      if (b) document.querySelector(`.tabs [data-chap="${b.dataset.goto}"]`).click();
    });
    add('ouverture', opening, {
      wide: true,
      onShow: () => { opening.classList.remove('pop'); void opening.offsetWidth; opening.classList.add('pop'); },
    });

    /* 2. vocabulary: one page per group */
    d.groups.forEach(g => add('vocabulaire', mkPage('vocabulaire', `
      <div class="pg-title-row">
        <h2><span class="pg-emoji">${g.emoji}</span> <span lang="fr">${esc(g.title.fr)}</span></h2>
        <button type="button" class="btn small" data-playall="${g.id}">▶ ${B('全部朗读', 'Play all')}</button>
      </div>
      <p class="pg-sub">${FL.m(g.title)}</p>
      <ul class="words">${g.words.map(wordRow).join('')}</ul>
      ${g.tip ? `<p class="tip">${FL.m(g.tip)}</p>` : ''}`, { title: T }), { left: g === d.groups[0] }));

    /* 3. rules */
    (d.rules || []).forEach((r, i) => add('regles', mkPage('regles', `
      <h2><span class="pg-emoji">${r.emoji}</span> <span lang="fr">${esc(r.title.fr)}</span></h2>
      <p class="pg-sub">${FL.m(r.title)}</p>
      ${r.tip ? `<p class="tip">${FL.m(r.tip)}</p>` : ''}
      <ul class="rows">${r.rows.map(x => `
        <li data-say="${esc(x.fr)}" tabindex="0" role="button"><span class="fr">${esc(x.fr)}</span><span class="mean">${FL.m(x)}</span></li>`).join('')}
      </ul>`, { title: T }), { left: i === 0 }));

    /* 4. questions, three per page */
    const qs = d.questions || [];
    for (let i = 0; i < qs.length; i += 3) {
      add('questions', mkPage('questions', `
        ${i === 0 ? `<h2><span class="pg-emoji">❓</span> <span lang="fr">Questions clés</span></h2><p class="pg-sub">${B('核心疑问词', 'Key question words')}</p>` : ''}
        <div class="qa-list">${qs.slice(i, i + 3).map(q => `
          <article class="qa">
            <div class="qa-word"><b lang="fr">${esc(q.word)}</b> ${FL.m(q)}</div>
            <div class="qa-q" data-say="${esc(q.q.fr)}" tabindex="0" role="button">
              <span class="fr">${esc(q.q.fr)}</span>
              <div class="mean">${FL.m(q.q)}</div>
            </div>
            ${q.a.map(a => `<div class="qa-a" data-say="${esc(a.fr)}" tabindex="0" role="button">
              <span class="arrow">↳</span><span class="fr">${esc(a.fr)}</span>
              <div class="mean">${FL.m(a)}</div></div>`).join('')}
          </article>`).join('')}
        </div>`, { title: T }), { left: i === 0 });
    }

    /* 5. verbs: list on the left, conjugation on the right */
    if (d.verbs && d.verbs.length) {
      const vl = add('verbes', mkPage('verbes', `
        <h2><span class="pg-emoji">🔁</span> <span lang="fr">Les verbes</span></h2>
        <p class="pg-sub">${B('相关动词 · 鼠标放在任何动词上都能看变位', 'Related verbs · hover any verb anywhere to see it conjugated')}</p>
        <div class="verb-chips">${d.verbs.map((v, i) => `<button type="button" class="chip ${i === 0 ? 'on' : ''}" data-verb="${esc(v.inf)}"><span lang="fr">${esc(v.inf)}</span> <small>${FL.m(FL.verbs.get(v.inf))}</small></button>`).join('')}</div>
        <div class="verb-ex-slot"></div>`, { title: T }), { left: true });
      const vr = add('verbes', mkPage('verbes', '<div class="verb-detail"></div>', { title: T }));
      const showVerb = inf => {
        const v = d.verbs.find(x => x.inf === inf);
        vr.querySelector('.verb-detail').innerHTML = FL.verbs.tableHTML(inf);
        vl.querySelector('.verb-ex-slot').innerHTML = v && v.ex
          ? `<p class="verb-ex" data-say="${esc(v.ex.fr)}" tabindex="0" role="button"><span class="fr">${esc(v.ex.fr)}</span><br><span class="mean">${FL.m(v.ex)}</span></p>` : '';
        FL.markVerbs(vl);
      };
      showVerb(d.verbs[0].inf);
      vl.querySelector('.verb-chips').addEventListener('click', e => {
        const c = e.target.closest('[data-verb]');
        if (!c) return;
        vl.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === c));
        showVerb(c.dataset.verb);
      });
    }

    /* 6. clock: the pendule on the left, its exercises on the right */
    if ((d.widgets || []).includes('clock') && FL.widgets.clock) {
      const tmp = document.createElement('div');
      const parts = FL.widgets.clock(tmp);
      const cl = add('horloge', mkPage('horloge', `
        <h2><span class="pg-emoji">🕰️</span> <span lang="fr">L'horloge</span></h2>
        <p class="pg-sub">${B('拖动指针拨钟 · 双击钟听时间', 'Drag the hands · double-click to hear it')}</p>`, { title: T, cls: 'clock-page' }), { left: true });
      cl.querySelector('.pg-inner').append(parts.left);
      const cr = add('horloge', mkPage('horloge', '', { title: T }));
      cr.querySelector('.pg-inner').append(parts.right);
    }

    /* 7. story (both pages) */
    if (d.story) {
      const st = document.createElement('div');
      st.className = 'page wide-page';
      st.style.setProperty('--chap', chap('histoire').color);
      st.innerHTML = `<div class="pg-head"><span class="pg-chap" lang="fr">Histoire</span><span class="pg-book" lang="fr">${esc(d.story.title.fr)}</span></div>
        <div class="pg-inner"><div data-story></div></div><div class="pg-foot"></div>`;
      FL.Story.mount(st.querySelector('[data-story]'), d.story);
      add('histoire', st, { wide: true });
    }

    /* 8. practice (both pages) */
    const pr = document.createElement('div');
    pr.className = 'page wide-page';
    pr.style.setProperty('--chap', chap('pratique').color);
    pr.innerHTML = `<div class="pg-head"><span class="pg-chap" lang="fr">Pratique</span><span class="pg-book">${B('闪卡 · 选择题 · 跟我打字', 'Flashcards · Quiz · Type with me')}</span></div>
      <div class="pg-inner"><div class="practice" data-practice></div></div><div class="pg-foot"></div>`;
    const sentences = [
      ...(d.questions || []).flatMap(q => [q.q, ...q.a]),
      ...(d.rules || []).flatMap(r => r.rows.filter(x => !x.fr.includes(' / '))),
    ];
    FL.Practice.mount(pr.querySelector('[data-practice]'), { id: d.id, groups: d.groups, sentences, quizExtras: d.quizExtras });
    add('pratique', pr, { wide: true, ownKeys: true });

    // page numbers + verb marking
    pages.forEach((p, i) => {
      const f = p.el.querySelector('.pg-foot');
      if (f) f.textContent = i + 1;
      FL.markVerbs(p.el);
    });

    // "play all" inside vocabulary pages
    let stopAll = null;
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-playall]');
      if (!b) return;
      if (stopAll) stopAll();
      const g = d.groups.find(x => x.id === b.dataset.playall);
      stopAll = FL.speakList(g.words.map(w => w.fr));
    });

    const coverClock = FL.antiqueClockSVG(10, 10, { cls: 'cover-clock' });
    main.innerHTML = '<div class="book-mount"></div>';
    FL.Book.mount(main.querySelector('.book-mount'), {
      chapters: CHAPTERS.filter(c => pages.some(p => p.chapter === c.id)),
      pages,
      filler: () => {
        const p = PROVERBS[proverbI++ % PROVERBS.length];
        const el = document.createElement('div');
        el.className = 'page filler';
        el.innerHTML = `<div class="pg-inner filler-inner">${WATCH}
          <blockquote class="fr" data-say="${esc(p.fr)}" tabindex="0" role="button">« ${esc(p.fr)} »</blockquote>
          <p class="mean">${FL.m(p)}</p><p class="filler-note" lang="fr">Proverbe</p></div>`;
        return el;
      },
      cover: {
        html: `<div class="cover-art" style="--cover:#2a1a12">
          <div class="cover-top"><span class="cover-kicker" lang="fr">Mon Français</span><span class="cover-no">I</span></div>
          ${labels([esc('Le temps'), esc("et l'heure")], 'title-labels')}
          ${labels([B(d.title.zh, d.title.en)], 'sub-labels')}
          <div class="cover-illus">${coverClock}</div>
          <span class="open-btn" aria-hidden="true">▶</span>
          <p class="cover-hint">${B('点击打开', 'Click to open')}</p>
        </div>`,
      },
    });
  }
})();
