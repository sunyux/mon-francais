/* Les pronoms — the mirror (every form for one person, flipped I ↔ you)
   and the workbook: the seven exercises from the user's sheet, checked as you type. */
(function () {
  const FL = window.FL, B = FL.bi, esc = FL.esc;

  /* ---------- one row per person ---------- */
  const PERSONS = [
    { id: 'je', label: 'je', sujet: 'je', tonique: 'moi', cod: 'me', coi: 'me', adj: 'mon · ma · mes', pro: 'le mien · la mienne · les miens · les miennes', zh: '我', en: 'I' },
    { id: 'tu', label: 'tu', sujet: 'tu', tonique: 'toi', cod: 'te', coi: 'te', adj: 'ton · ta · tes', pro: 'le tien · la tienne · les tiens · les tiennes', zh: '你', en: 'you' },
    { id: 'il', label: 'il', sujet: 'il', tonique: 'lui', cod: 'le', coi: 'lui', adj: 'son · sa · ses', pro: 'le sien · la sienne · les siens · les siennes', zh: '他', en: 'he' },
    { id: 'elle', label: 'elle', sujet: 'elle', tonique: 'elle', cod: 'la', coi: 'lui', adj: 'son · sa · ses', pro: 'le sien · la sienne · les siens · les siennes', zh: '她', en: 'she' },
    { id: 'nous', label: 'nous', sujet: 'nous', tonique: 'nous', cod: 'nous', coi: 'nous', adj: 'notre · notre · nos', pro: 'le nôtre · la nôtre · les nôtres', zh: '我们', en: 'we' },
    { id: 'vous', label: 'vous', sujet: 'vous', tonique: 'vous', cod: 'vous', coi: 'vous', adj: 'votre · votre · vos', pro: 'le vôtre · la vôtre · les vôtres', zh: '你们／您', en: 'you (pl.)' },
    { id: 'ils', label: 'ils', sujet: 'ils', tonique: 'eux', cod: 'les', coi: 'leur', adj: 'leur · leur · leurs', pro: 'le leur · la leur · les leurs', zh: '他们', en: 'they (m.)' },
    { id: 'elles', label: 'elles', sujet: 'elles', tonique: 'elles', cod: 'les', coi: 'leur', adj: 'leur · leur · leurs', pro: 'le leur · la leur · les leurs', zh: '她们', en: 'they (f.)' },
  ];
  const ROWS = [
    ['sujet', '主语', 'subject', p => `${p.sujet}…`],
    ['tonique', '重读', 'stressed', p => `C'est ${p.tonique}.`],
    ['cod', '直接宾语', 'direct object', p => `Il ${p.cod} voit.`],
    ['coi', '间接宾语', 'indirect object', p => `Il ${p.coi} parle.`],
    ['adj', '主有形容词', 'possessive adj.', null],
    ['pro', '主有代词', 'possessive pron.', null],
  ];
  // what the mirror does: I ↔ you, we ↔ you all; the others look the same
  const MIRROR = { je: 'tu', tu: 'je', nous: 'vous', vous: 'nous' };

  /* ---------- the workbook: exercises 1–7 of the sheet ---------- */
  const EX = [
    { id: 'e1', n: 1, title: { zh: '重读人称代词（填空）', en: 'Stressed pronouns (fill in)' }, items: [
      { q: 'Qui est là ? — C’est ___. (je)', a: ['moi'], full: "Qui est là ? C'est moi." },
      { q: 'Je dîne chez ___ ce soir. (tu)', a: ['toi'], full: 'Je dîne chez toi ce soir.' },
      { q: 'Tu pars avec ___ ? (ils)', a: ['eux'], full: 'Tu pars avec eux ?' },
      { q: 'Ce livre est à ___. (elle)', a: ['elle'], full: 'Ce livre est à elle.' },
      { q: 'Vous venez sans ___ ? (nous)', a: ['nous'], full: 'Vous venez sans nous ?' },
    ] },
    { id: 'e2', n: 2, title: { zh: '直接／间接宾语代词（改写或填空）', en: 'Direct / indirect object pronouns' }, long: true, items: [
      { q: 'Je vois Marie. →', a: ['Je la vois.'], full: 'Je la vois.' },
      { q: 'Tu aimes le café ? →', a: ["Tu l'aimes ?"], full: "Tu l'aimes ?" },
      { q: 'Il connaît ses parents. →', a: ['Il les connaît.'], full: 'Il les connaît.' },
      { q: 'Elle téléphone à son père. →', a: ['Elle lui téléphone.'], full: 'Elle lui téléphone.' },
      { q: 'Nous parlons à nos amis. →', a: ['Nous leur parlons.'], full: 'Nous leur parlons.' },
      { q: 'Elle ___ explique la leçon. (à nous)', a: ['nous'], full: 'Elle nous explique la leçon.', short: true },
      { q: 'Je ___ donne un cadeau. (à toi)', a: ['te'], full: 'Je te donne un cadeau.', short: true },
    ] },
    { id: 'e3', n: 3, title: { zh: 'y 或 en（填空）', en: 'Y or en (fill in)' }, items: [
      { q: 'Tu vas à Paris ? — Oui, j’___ vais.', a: ['y'], full: "Oui, j'y vais." },
      { q: 'Il a des frères ? — Oui, il ___ a deux.', a: ['en'], full: 'Oui, il en a deux.' },
      { q: 'Vous pensez à votre voyage ? — Oui, nous ___ pensons.', a: ['y'], full: 'Oui, nous y pensons.' },
      { q: 'Elle parle de son travail ? — Oui, elle ___ parle.', a: ['en'], full: 'Oui, elle en parle.' },
      { q: 'Tu veux du café ? — Non, merci, je n’___ veux pas.', a: ['en'], full: "Non, merci, je n'en veux pas." },
      { q: 'Ils sont dans la classe ? — Oui, ils ___ sont.', a: ['y'], full: 'Oui, ils y sont.' },
    ] },
    { id: 'e4', n: 4, title: { zh: '泛指代词（on / quelqu’un / quelque chose / chacun）', en: 'Indefinites (on / quelqu’un / quelque chose / chacun)' }, items: [
      { q: 'En France, ___ mange du pain.', a: ['on'], full: 'En France, on mange du pain.' },
      { q: '___ frappe à la porte.', a: ["quelqu'un"], full: "Quelqu'un frappe à la porte." },
      { q: 'Il y a ___ sur la table.', a: ['quelque chose'], full: 'Il y a quelque chose sur la table.' },
      { q: '___ doit faire son travail.', a: ['chacun'], full: 'Chacun doit faire son travail.' },
    ] },
    { id: 'e5', n: 5, title: { zh: '指示形容词与指示代词', en: 'Demonstratives' }, items: [
      { q: '___ livre', a: ['ce'], full: 'ce livre' },
      { q: '___ hôtel', a: ['cet'], full: 'cet hôtel' },
      { q: '___ école', a: ['cette'], full: 'cette école' },
      { q: '___ amis', a: ['ces'], full: 'ces amis' },
      { q: '___ homme', a: ['cet'], full: 'cet homme' },
      { q: '___ histoire', a: ['cette'], full: 'cette histoire' },
      { q: 'Ma voiture et ___ de mon père.', a: ['celle'], full: 'Ma voiture et celle de mon père.' },
      { q: 'Ces livres sont ___ de Paul.', a: ['ceux'], full: 'Ces livres sont ceux de Paul.' },
      { q: 'Mon sac et ___ de Marie.', a: ['celui'], full: 'Mon sac et celui de Marie.' },
      { q: 'Tes chaussures et ___ de ta sœur.', a: ['celles'], full: 'Tes chaussures et celles de ta sœur.' },
    ] },
    { id: 'e6', n: 6, title: { zh: '主有形容词与主有代词', en: 'Possessive adjectives and pronouns' }, items: [
      { q: '(je) ___ amie', a: ['mon'], full: 'mon amie', why: { zh: 'amie 以元音开头，用 mon', en: 'amie starts with a vowel, so mon' } },
      { q: '(tu) ___ sœur', a: ['ta'], full: 'ta sœur' },
      { q: '(il) ___ parents', a: ['ses'], full: 'ses parents' },
      { q: '(nous) ___ maison', a: ['notre'], full: 'notre maison' },
      { q: '(vous) ___ enfants', a: ['vos'], full: 'vos enfants' },
      { q: '(ils) ___ voiture', a: ['leur'], full: 'leur voiture' },
      { q: 'Ce livre est à moi. →', a: ["C'est le mien."], full: "C'est le mien.", long: true },
      { q: 'Cette maison est à nous. →', a: ["C'est la nôtre."], full: "C'est la nôtre.", long: true },
      { q: 'Ces clés sont à toi. →', a: ['Ce sont les tiennes.'], full: 'Ce sont les tiennes.', long: true },
      { q: 'Ces enfants sont à eux. →', a: ['Ce sont les leurs.'], full: 'Ce sont les leurs.', long: true },
      { q: 'Ce sac est à elle. →', a: ["C'est le sien."], full: "C'est le sien.", long: true },
    ] },
    { id: 'e7', n: 7, title: { zh: '翻译（中 → 法）', en: 'Translate (Chinese → French)' }, long: true, items: [
      { q: '我看见他们了。', a: ['Je les vois.', 'Je les ai vus.', 'Je les ai vues.'], full: 'Je les vois.' },
      { q: '你去那里吗？', a: ['Tu y vas ?', 'Est-ce que tu y vas ?', 'Y vas-tu ?'], full: 'Tu y vas ?' },
      { q: '我有两个姐妹。', a: ["J'en ai deux.", "J'ai deux sœurs."], full: "J'en ai deux." },
      { q: '我的车是红色的，他们的是蓝色的。', a: ['Ma voiture est rouge, la leur est bleue.'], full: 'Ma voiture est rouge, la leur est bleue.' },
      { q: '每个人都有自己的房间。', a: ['Chacun a sa chambre.', 'Chacun a sa propre chambre.'], full: 'Chacun a sa chambre.' },
    ] },
  ];
  // exact = same letters; accents = right apart from accents (accepted, but flagged)
  const grade = (typed, item) => {
    if (!typed.trim()) return null;
    if (item.a.some(a => FL.norm(a) === FL.norm(typed))) return 'ok';
    if (item.a.some(a => FL.norm(a, true) === FL.norm(typed, true))) return 'accent';
    return 'no';
  };

  /* ---------- how the topic page presents the widget ---------- */
  FL.WIDGET_META = FL.WIDGET_META || {};
  FL.WIDGET_META.miroir = {
    chapter: { id: 'cahier', fr: 'Cahier', zh: '练习本', en: 'Workbook', color: '#6a4560' },
    h2: 'Le miroir',
    sub: { zh: '选一个人称，看它的所有形式；照镜子，“我”就变成“你”', en: 'Pick a person to see every form; look in the mirror and “I” becomes “you”' },
    cls: 'mirror-page',
  };

  /* ---------- the opening's live block: what the mirror answers ---------- */
  const PAIRS = [
    ['Je me vois.', 'Tu te vois.'],
    ["C'est moi.", "C'est toi."],
    ["C'est mon miroir.", "C'est ton miroir."],
    ["C'est le mien.", "C'est le tien."],
    ["Je t'écoute.", "Tu m'écoutes."],
    ['Nous parlons de nous.', 'Vous parlez de vous.'],
  ];
  FL.openingLive = FL.openingLive || {};
  FL.openingLive.miroir = box => {
    let i = 0;
    box.innerHTML = `<div class="labels sub-labels"><span>${B('镜子回答', 'The mirror answers')}</span></div>
      <div class="mirror-pair"><span class="fr mp-a"></span><span class="mp-bar" aria-hidden="true"></span><span class="fr mp-b"></span></div>
      <button type="button" class="btn primary live-say">${FL.ICON_SPEAKER} ${B('听镜子说话', 'Hear the mirror')}</button>`;
    const a = box.querySelector('.mp-a'), b = box.querySelector('.mp-b');
    const text = () => `${PAIRS[i][0]} ${PAIRS[i][1]}`;
    const show = () => { [a.textContent, b.textContent] = PAIRS[i]; a.dataset.say = PAIRS[i][0]; b.dataset.say = PAIRS[i][1]; };
    show();
    setInterval(() => { i = (i + 1) % PAIRS.length; show(); }, 5000);
    box.querySelector('.live-say').addEventListener('click', () => FL.speak(text()));
    return { text };
  };

  /* ---------- quiz questions from the workbook ---------- */
  FL.quizGenerators = FL.quizGenerators || {};
  FL.quizGenerators.pronoms = () => {
    const ex = FL.pick(EX.filter(e => !e.long));
    const item = FL.pick(ex.items.filter(it => !it.long));
    const pool = [...new Set(ex.items.filter(it => !it.long).map(it => it.a[0]))].filter(x => x !== item.a[0]);
    const opts = FL.shuffle([item.a[0], ...FL.shuffle(pool).slice(0, 3)]);
    return {
      prompt: `<div class="q-label">${B('填空', 'Fill in the blank')}</div><div class="q-big fr">${esc(item.q)}</div>`,
      options: opts.map(o => `<span class="fr">${esc(o)}</span>`), answer: opts.indexOf(item.a[0]), say: item.full,
    };
  };

  /* ---------- the widget ---------- */
  FL.widgets = FL.widgets || {};
  FL.widgets.miroir = el => {
    let who = 'je', exId = FL.store.get('pronoms:ex', 'e1');

    el.innerHTML = `
      <div class="mi-left">
        <div class="seg mi-persons" role="group" aria-label="Personne">
          ${PERSONS.map(p => `<button type="button" data-who="${p.id}" lang="fr">${p.label}</button>`).join('')}
        </div>
        <div class="mi-glass">
          <table class="mi-table"><tbody></tbody></table>
        </div>
        <button type="button" class="btn ghost mi-flip">${B('照镜子：我 ↔ 你', 'Look in the mirror: I ↔ you')}</button>
        <p class="mi-note"></p>
      </div>
      <div class="mi-right">
        <div class="seg mi-tabs" role="tablist">${EX.map(e => `<button type="button" data-ex="${e.id}" title="${esc(e.title.en)}">${e.n}</button>`).join('')}</div>
        <div class="mi-ex"></div>
        <div class="mi-actions">
          <button type="button" class="btn primary" data-r="check">${B('检查', 'Check')}</button>
          <button type="button" class="btn ghost" data-r="show">${B('看答案', 'Answers')}</button>
          <button type="button" class="btn ghost" data-r="clear">${B('重做', 'Clear')}</button>
        </div>
        <p class="ty-stats mi-score"></p>
      </div>`;
    const left = el.querySelector('.mi-left'), right = el.querySelector('.mi-right');
    const glass = left.querySelector('.mi-glass');

    function drawPerson() {
      const p = PERSONS.find(x => x.id === who);
      left.querySelectorAll('[data-who]').forEach(b => b.classList.toggle('on', b.dataset.who === who));
      left.querySelector('tbody').innerHTML = ROWS.map(([k, zh, en, ex]) => {
        const say = ex ? ex(p) : p[k].replace(/ · /g, ', ');
        return `<tr><th>${B(zh, en)}</th><td><span class="fr" data-say="${esc(say)}" tabindex="0">${esc(p[k])}</span>${ex ? `<small class="fr mi-ex-line">${esc(ex(p))}</small>` : ''}</td></tr>`;
      }).join('');
      left.querySelector('.mi-note').innerHTML = MIRROR[who]
        ? B(`镜子里，${p.zh} 会变成 ${PERSONS.find(x => x.id === MIRROR[who]).zh}`, `In the mirror, ${p.label} becomes ${MIRROR[who]}`)
        : B(`${p.label} 在镜子里不变：第三人称谁也不是“我”或“你”`, `${p.label} stays the same in the mirror: the third person is neither “I” nor “you”`);
    }
    function flip() {
      if (!MIRROR[who]) { glass.classList.remove('shake'); void glass.offsetWidth; glass.classList.add('shake'); return; }
      glass.classList.add('turning');
      setTimeout(() => { who = MIRROR[who]; drawPerson(); glass.classList.remove('turning'); FL.speak(`C'est ${PERSONS.find(x => x.id === who).tonique}.`); }, 260);
    }

    const ex = () => EX.find(e => e.id === exId) || EX[0];
    function drawEx() {
      const e = ex();
      right.querySelectorAll('[data-ex]').forEach(b => b.classList.toggle('on', b.dataset.ex === exId));
      right.querySelector('.mi-ex').innerHTML = `
        <h3 class="mi-ex-title">${B(`练习 ${e.n}　${e.title.zh}`, `Exercise ${e.n} · ${e.title.en}`)}</h3>
        <ol class="mi-items">${e.items.map((it, i) => {
          const long = it.long || (e.long && !it.short);
          return `<li class="${long ? 'long' : ''}">
            <span class="${/[一-鿿]/.test(it.q) ? 'zh-q' : 'fr'} mi-q">${esc(it.q)}</span>
            <input type="text" class="mi-in" data-i="${i}" autocomplete="off" autocapitalize="off" spellcheck="false" lang="fr" aria-label="Réponse ${i + 1}">
            <span class="mi-fb" aria-live="polite"></span>
          </li>`;
        }).join('')}</ol>`;
      right.querySelector('.mi-score').textContent = '';
    }
    function check(reveal) {
      const e = ex();
      let ok = 0, done = 0;
      right.querySelectorAll('.mi-in').forEach(inp => {
        const it = e.items[+inp.dataset.i];
        const fb = inp.nextElementSibling;
        const g = reveal ? null : grade(inp.value, it);
        inp.classList.remove('is-ok', 'is-no');
        if (g) { done++; if (g !== 'no') ok++; inp.classList.add(g === 'no' ? 'is-no' : 'is-ok'); }
        const ans = `<span class="fr">${esc(it.a[0])}</span> ${FL.sayBtn(it.full, 'tiny')}`;
        fb.innerHTML = reveal ? ans
          : g === 'ok' ? `<span class="ok">✓</span> ${FL.sayBtn(it.full, 'tiny')}`
          : g === 'accent' ? `<span class="ok">✓</span> ${B('注意重音：', 'mind the accents:')} ${ans}`
          : g === 'no' ? `<span class="bad">✗</span> ${ans}${it.why ? ` <small>${FL.m(it.why)}</small>` : ''}`
          : '';
      });
      if (!reveal) right.querySelector('.mi-score').innerHTML = done ? B(`${done} 题里对了 ${ok} 题`, `${ok} of ${done} right`) : B('先写答案再检查', 'Write some answers first');
    }

    left.addEventListener('click', e => {
      const b = e.target.closest('[data-who]');
      if (b) { who = b.dataset.who; drawPerson(); }
      if (e.target.closest('.mi-flip')) flip();
    });
    right.addEventListener('click', e => {
      const t = e.target.closest('[data-ex]');
      if (t) { exId = t.dataset.ex; FL.store.set('pronoms:ex', exId); drawEx(); }
      const r = e.target.closest('[data-r]');
      if (!r) return;
      if (r.dataset.r === 'check') check(false);
      if (r.dataset.r === 'show') check(true);
      if (r.dataset.r === 'clear') drawEx();
    });
    // Enter checks the line and moves on
    right.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || !e.target.matches('.mi-in')) return;
      e.preventDefault();
      check(false);
      const ins = [...right.querySelectorAll('.mi-in')];
      const next = ins[ins.indexOf(e.target) + 1];
      if (next) next.focus({ preventScroll: true });
    });
    drawPerson();
    drawEx();
    return { left, right };
  };
})();
