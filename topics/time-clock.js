/* time-clock.js — French clock-time helpers, the interactive clock widget,
   and the "clock" question type used by the quiz. */
(function () {
  const FL = window.FL;
  const B = FL.bi;

  /* ---------- time -> French words ---------- */
  const U = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze',
    'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const TENS = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante' };
  // feminine because heure and minute are feminine: une heure, vingt et une minutes
  function num(n) {
    let w;
    if (n < 20) w = U[n];
    else {
      const t = Math.floor(n / 10), u = n % 10;
      w = u === 0 ? TENS[t] : u === 1 ? `${TENS[t]} et un` : `${TENS[t]}-${U[u]}`;
    }
    return w.replace(/(^|\s)un$/, '$1une');
  }
  const heures = h => `${num(h)} ${h <= 1 ? 'heure' : 'heures'}`;

  function official(h, m) {
    return `Il est ${heures(h)}${m ? ' ' + num(m) : ''}.`;
  }
  function colloquialParts(h, m) {
    let H = h;
    if (m > 30) H = (h + 1) % 24;
    const special = H === 0 ? 'minuit' : H === 12 ? 'midi' : null;
    const base = special || heures(H % 12);
    let mins = '';
    if (m === 15) mins = ' et quart';
    else if (m === 30) mins = special ? ' et demi' : ' et demie';
    else if (m === 45) mins = ' moins le quart';
    else if (m > 30) mins = ` moins ${num(60 - m)}`;
    else if (m > 0) mins = ` ${num(m)}`;
    const period = special ? '' : H < 12 ? ' du matin' : H < 18 ? " de l'après-midi" : ' du soir';
    return { base, mins, period };
  }
  function colloquial(h, m, withPeriod = true) {
    const p = colloquialParts(h, m);
    return `Il est ${p.base}${p.mins}${withPeriod ? p.period : ''}.`;
  }
  // everything a learner might reasonably type for this time
  function variants(h, m) {
    const out = new Set([official(h, m), colloquial(h, m, true), colloquial(h, m, false)]);
    const p = colloquialParts(h, m);
    if (m === 45) ['', p.period].forEach(per => out.add(`Il est ${p.base} moins quart${per}.`));
    if (m === 30 && (p.base === 'midi' || p.base === 'minuit')) out.add(`Il est ${p.base} et demie.`);
    if (m === 15 || m === 30) out.add(`Il est ${heures(h)} ${m === 15 ? 'et quart' : 'et demie'}.`);
    if (h === 12 && m === 0) out.add('Il est midi.');
    if (h === 0 && m === 0) out.add('Il est minuit.');
    const list = [...out];
    list.forEach(v => out.add(v.replace(/^Il est /, '')));
    return [...out];
  }
  function moment(h) {
    if (h >= 5 && h < 12) return { emoji: '🌅', fr: 'le matin', zh: '早上 / 上午', en: 'morning' };
    if (h >= 12 && h < 14) return { emoji: '☀️', fr: 'le midi', zh: '中午', en: 'noon' };
    if (h >= 14 && h < 18) return { emoji: '🌤️', fr: "l'après-midi", zh: '下午', en: 'afternoon' };
    if (h >= 18 && h < 23) return { emoji: '🌆', fr: 'le soir', zh: '晚上', en: 'evening' };
    return { emoji: '🌙', fr: 'la nuit', zh: '夜里', en: 'night' };
  }
  const randTime = () => ({ h: Math.floor(Math.random() * 24), m: FL.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]) });
  const digital = (h, m) => `${FL.pad(h)}:${FL.pad(m)}`;
  FL.timeFr = { num, official, colloquial, variants, moment, digital };

  /* ---------- quiz question type ---------- */
  FL.quizGenerators.clock = () => {
    const t = randTime();
    const others = [];
    while (others.length < 3) {
      const o = Math.random() < 0.5 ? { h: t.h, m: FL.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]) } : randTime();
      if (!(o.h === t.h && o.m === t.m) && !others.some(x => x.h === o.h && x.m === o.m)) others.push(o);
    }
    const opts = FL.shuffle([t, ...others]);
    const say = colloquial(t.h, t.m);
    if (Math.random() < 0.5) {
      const mo = moment(t.h);
      return {
        prompt: `<div class="q-label">${B('钟上是几点？', 'What time does the clock show?')}</div>
          <div class="q-clock">${FL.clockSVG(t.h, t.m)}<span class="badge">${mo.fr}</span></div>`,
        options: opts.map(o => `<span lang="fr">${FL.esc(colloquial(o.h, o.m))}</span>`),
        answer: opts.indexOf(t), say,
      };
    }
    return {
      prompt: `<div class="q-label">${B('选出对应的时间', 'Pick the matching time')}</div><div class="q-big fr">${FL.esc(say)}</div>${FL.sayBtn(say)}`,
      options: opts.map(o => `<span class="digital">${digital(o.h, o.m)}</span>`),
      answer: opts.indexOf(t), say, autoSay: true,
    };
  };

  /* ---------- the antique French mantel clock (pendule de cheminée) ----------
     Dial uses the same 0–200 local coordinates as FL.clockSVG, so FL.setHands works on it. */
  const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  let clipN = 0;
  FL.antiqueClockSVG = (h, m, { seconds = false, cls = '' } = {}) => {
    const cid = `pwin${++clipN}`;
    const rad = d => (d * Math.PI) / 180;
    let ticks = '', nums = '';
    for (let i = 0; i < 60; i++) {
      const a = rad(i * 6), r1 = i % 5 ? 64 : 60;
      ticks += `<line x1="${(100 + r1 * Math.sin(a)).toFixed(1)}" y1="${(100 - r1 * Math.cos(a)).toFixed(1)}" x2="${(100 + 68 * Math.sin(a)).toFixed(1)}" y2="${(100 - 68 * Math.cos(a)).toFixed(1)}" class="${i % 5 ? 'atk' : 'atk5'}"/>`;
    }
    ROMAN.forEach((n, i) => {
      const a = rad(i * 30);
      nums += `<text x="${(100 + 50 * Math.sin(a)).toFixed(1)}" y="${(100 - 50 * Math.cos(a) + 4.5).toFixed(1)}">${n}</text>`;
    });
    const ha = (h % 12) * 30 + m * 0.5, ma = m * 6;
    const leaf = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.6" transform="rotate(${r} ${x} ${y})" class="leafy"/>`;
    return `<svg class="antique ${cls}" viewBox="0 0 300 440" role="img" aria-label="Pendule ${FL.pad(h)}:${FL.pad(m)}">
      <defs><clipPath id="${cid}"><path d="M120 350 L120 302 Q120 284 150 284 Q180 284 180 302 L180 350 Z"/></clipPath>
        <linearGradient id="${cid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4e2a6"/><stop offset=".35" stop-color="#c9a24a"/><stop offset=".6" stop-color="#7d5a1c"/><stop offset=".85" stop-color="#d8b766"/><stop offset="1" stop-color="#8a6420"/></linearGradient>
        <linearGradient id="${cid}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0f1220"/><stop offset=".45" stop-color="#2c3150"/><stop offset=".55" stop-color="#262a45"/><stop offset="1" stop-color="#0b0d17"/></linearGradient>
        <radialGradient id="${cid}e" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fbf5e6"/><stop offset=".8" stop-color="#eadcbc"/><stop offset="1" stop-color="#cdb98f"/></radialGradient>
      </defs>
      <ellipse cx="150" cy="424" rx="128" ry="9" class="ac-shadow"/>
      <ellipse cx="62" cy="410" rx="15" ry="9" class="g-dk ol"/><ellipse cx="238" cy="410" rx="15" ry="9" class="g-dk ol"/>
      <rect x="38" y="372" width="224" height="38" rx="4" class="g ol"/>
      <path d="M70 384 Q110 402 150 384 Q190 402 230 384" class="swag"/>
      <circle cx="70" cy="384" r="5" class="g-hi ol-thin"/><circle cx="150" cy="384" r="6" class="g-hi ol-thin"/><circle cx="230" cy="384" r="5" class="g-hi ol-thin"/>
      <rect x="28" y="362" width="244" height="12" rx="3" class="g-hi ol"/>
      <path d="M62 364 L62 150 Q62 96 150 92 Q238 96 238 150 L238 364 Z" class="case ol"/>
      <path d="M58 154 Q58 88 150 84 Q242 88 242 154" class="arch-ol"/><path d="M58 154 Q58 88 150 84 Q242 88 242 154" class="arch-g"/>
      ${[52, 228].map(x => `
        <rect x="${x}" y="150" width="20" height="208" class="g ol"/>
        <line x1="${x + 6}" y1="156" x2="${x + 6}" y2="352" class="flute"/><line x1="${x + 10}" y1="156" x2="${x + 10}" y2="352" class="flute"/><line x1="${x + 14}" y1="156" x2="${x + 14}" y2="352" class="flute"/>
        <rect x="${x - 4}" y="140" width="28" height="12" rx="2" class="g-hi ol"/>
        <rect x="${x - 4}" y="352" width="28" height="10" rx="2" class="g-hi ol"/>`).join('')}
      <path d="M140 80 Q110 104 80 106" class="garland"/><path d="M160 80 Q190 104 220 106" class="garland"/>
      ${leaf(124, 92, 30)}${leaf(108, 100, 20)}${leaf(93, 104, 10)}${leaf(176, 92, -30)}${leaf(192, 100, -20)}${leaf(207, 104, -10)}
      <rect x="134" y="76" width="32" height="9" rx="2" class="g-dk ol"/>
      <path d="M132 77 Q126 58 140 50 L160 50 Q174 58 168 77 Z" class="g ol"/>
      <rect x="142" y="42" width="16" height="9" rx="2" class="g-hi ol"/>
      <path d="M150 12 Q164 28 157 42 L143 42 Q136 28 150 12 Z" class="flame ol"/>
      <path d="M120 350 L120 302 Q120 284 150 284 Q180 284 180 302 L180 350 Z" class="window"/>
      <g clip-path="url(#${cid})"><g class="pendulum">
        <line x1="150" y1="266" x2="150" y2="330" class="rod"/>
        <circle cx="150" cy="333" r="13" class="g ol"/><circle cx="156" cy="330" r="10.5" class="bob-cut"/>
      </g></g>
      <path d="M120 350 L120 302 Q120 284 150 284 Q180 284 180 302 L180 350 Z" class="window-frame"/>
      <circle cx="94" cy="340" r="5" class="g-hi ol-thin"/><circle cx="206" cy="340" r="5" class="g-hi ol-thin"/>
      <path class="case-star" d="M92 293 L94.1 297.9 L99 300 L94.1 302.1 L92 307 L89.9 302.1 L85 300 L89.9 297.9 Z"/><path class="case-star" d="M208 293 L210.1 297.9 L215 300 L210.1 302.1 L208 307 L205.9 302.1 L201 300 L205.9 297.9 Z"/><path class="case-star" d="M100 318 L101.2 320.8 L104 322 L101.2 323.2 L100 326 L98.8 323.2 L96 322 L98.8 320.8 Z"/><path class="case-star" d="M200 318 L201.2 320.8 L204 322 L201.2 323.2 L200 326 L198.8 323.2 L196 322 L198.8 320.8 Z"/><path class="case-star" d="M86 115 L87.5 118.5 L91 120 L87.5 121.5 L86 125 L84.5 121.5 L81 120 L84.5 118.5 Z"/><path class="case-star" d="M214 115 L215.5 118.5 L219 120 L215.5 121.5 L214 125 L212.5 121.5 L209 120 L212.5 118.5 Z"/>
      <circle cx="150" cy="190" r="88" class="g ol"/>
      <circle cx="150" cy="190" r="80" class="g-hi ol-thin"/>
      <g transform="translate(50 90)">
        <circle cx="100" cy="100" r="74" class="face enamel ol-thin"/>
        <circle cx="100" cy="100" r="68" class="track"/><circle cx="100" cy="100" r="60" class="track"/>
        ${ticks}
        <g class="roman">${nums}</g>
        <text x="100" y="134" class="signed">À Paris</text>
        <circle cx="80" cy="116" r="3.5" class="hole"/><circle cx="120" cy="116" r="3.5" class="hole"/>
        <g class="hand hand-h" transform="rotate(${ha} 100 100)">
          <line class="hit" x1="100" y1="100" x2="100" y2="48"/>
          <line x1="100" y1="112" x2="100" y2="69" class="blued" stroke-width="4"/>
          <circle cx="100" cy="62" r="7" class="blued-ring" stroke-width="3"/>
          <line x1="100" y1="55" x2="100" y2="46" class="blued" stroke-width="3"/>
        </g>
        <g class="hand hand-m" transform="rotate(${ma} 100 100)">
          <line class="hit" x1="100" y1="100" x2="100" y2="30"/>
          <line x1="100" y1="118" x2="100" y2="46" class="blued" stroke-width="2.6"/>
          <circle cx="100" cy="41" r="4.5" class="blued-ring" stroke-width="2.2"/>
          <line x1="100" y1="36" x2="100" y2="28" class="blued" stroke-width="2"/>
        </g>
        ${seconds ? `<g class="hand-s" transform="rotate(0 100 100)"><line x1="100" y1="120" x2="100" y2="34"/></g>` : ''}
        <circle cx="100" cy="100" r="5" class="g ol-thin"/>
        <path d="M52 70 A58 58 0 0 1 96 38" class="glint"/>
      </g>
    </svg>`
      // gilt bronze, lacquered case and enamel get real shading
      .replace(/class="g( |")/g, `style="fill:url(#${cid}g)" class="g$1`)
      .replace(/class="case /, `style="fill:url(#${cid}c)" class="case `)
      .replace(/class="face enamel/, `style="fill:url(#${cid}e)" class="face enamel`)
      .replace(/class="arch-g"/, `style="stroke:url(#${cid}g)" class="arch-g"`);
  };
  FL.setSeconds = (svg, s) => {
    const g = svg.querySelector('.hand-s');
    if (g) g.setAttribute('transform', `rotate(${s * 6} 100 100)`);
  };

  /* ---------- the interactive clock ----------
     Renders .clock-left (the clock) and .clock-right (the practice panel);
     the book puts them on facing pages, so listeners are bound to each half. */
  FL.widgets.clock = el => {
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes();
    let tab = 'explore', target = null, locked = false;

    el.innerHTML = `
      <div class="clock-wrap">
        <div class="clock-left">
          <div class="clock-holder">${FL.antiqueClockSVG(h, m, { cls: 'big' })}</div>
          <div class="clock-digital">
            <button type="button" class="btn ghost" data-t="-60" aria-label="minus 1 hour">−1h</button>
            <button type="button" class="btn ghost" data-t="-5" aria-label="minus 5 minutes">−5</button>
            <output class="digital"></output>
            <button type="button" class="btn ghost" data-t="5" aria-label="plus 5 minutes">+5</button>
            <button type="button" class="btn ghost" data-t="60" aria-label="plus 1 hour">+1h</button>
          </div>
          <div class="clock-digital">
            <button type="button" class="btn ghost" data-t="720">${B('上午 ⇄ 下午', 'AM ⇄ PM')}</button>
            <button type="button" class="btn ghost" data-c="now">${B('现在', 'Now')}</button>
            <button type="button" class="btn ghost" data-c="rand">${B('随机', 'Random')}</button>
          </div>
          <p class="hint">${B('拖动指针来拨钟', 'Drag the hands to set the time')}</p>
        </div>
        <div class="clock-right">
          <div class="seg" role="tablist">
            <button type="button" data-ctab="explore" class="on">${B('看说法', 'Explore')}</button>
            <button type="button" data-ctab="read">${B('读钟', 'Read it')}</button>
            <button type="button" data-ctab="set">${B('拨钟', 'Set it')}</button>
          </div>
          <div class="clock-panel"></div>
        </div>
      </div>`;
    const left = el.querySelector('.clock-left'), right = el.querySelector('.clock-right');
    const svg = el.querySelector('.clock-holder svg');
    const out = el.querySelector('output.digital');
    const panel = el.querySelector('.clock-panel');

    function update(fromUser) {
      FL.setHands(svg, h, m);
      out.textContent = digital(h, m);
      if (tab === 'explore') explore();
      if (fromUser && tab === 'set') panel.querySelector('.ty-feedback').innerHTML = '';
    }
    function setTime(nh, nm, fromUser = true) {
      if (locked) return;
      const total = (((nh * 60 + nm) % 1440) + 1440) % 1440;
      h = Math.floor(total / 60); m = total % 60;
      update(fromUser);
    }

    function explore() {
      const mo = moment(h);
      const off = official(h, m), col = colloquial(h, m);
      panel.innerHTML = `
        <div class="moment"><div><b lang="fr">${mo.fr}</b><div>${B(mo.zh, mo.en)}</div></div></div>
        <div class="saying" data-say="${FL.esc(col)}" tabindex="0" role="button">
          <small>${B('口语（12小时制）', 'Everyday (12h)')}</small>
          <div class="fr big-line">${FL.esc(col)}</div>${FL.sayBtn(col)}
        </div>
        <div class="saying" data-say="${FL.esc(off)}" tabindex="0" role="button">
          <small>${B('官方（24小时制）· 车站、电视', 'Official (24h) · stations, TV')}</small>
          <div class="fr big-line">${FL.esc(off)}</div>${FL.sayBtn(off)}
        </div>`;
      FL.markVerbs(panel);
    }
    function newTarget() { target = randTime(); }
    function read() {
      newTarget();
      locked = false; setTime(target.h, target.m, false); locked = true;
      const mo = moment(h);
      panel.innerHTML = `
        <div class="q-label">${B('钟上是几点？用法语打出来', 'What time is it? Type it in French')} <span class="badge">${mo.fr}</span></div>
        <input class="ty-input" lang="fr" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Il est …">
        <div class="ty-actions">
          <button type="button" class="btn primary" data-r="check">${B('检查', 'Check')} ⏎</button>
          <button type="button" class="btn ghost" data-r="show">${B('答案', 'Answer')}</button>
          <button type="button" class="btn ghost" data-r="next">${B('下一个', 'Next')} →</button>
        </div>
        <div class="ty-feedback" aria-live="polite"></div>`;
      const input = panel.querySelector('input');
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); readAct('check'); } });
      input.focus({ preventScroll: true });
    }
    function answersHTML() {
      const col = colloquial(target.h, target.m), off = official(target.h, target.m);
      return `<div class="answers"><div><span class="fr">${FL.esc(col)}</span> ${FL.sayBtn(col, 'tiny')}</div><div><span class="fr">${FL.esc(off)}</span> ${FL.sayBtn(off, 'tiny')}</div></div>`;
    }
    function readAct(a) {
      const fb = panel.querySelector('.ty-feedback');
      if (a === 'next') return read();
      if (a === 'show') { fb.innerHTML = answersHTML(); FL.markVerbs(fb); return; }
      const v = panel.querySelector('input').value;
      const ok = variants(target.h, target.m).some(x => FL.norm(x, true) === FL.norm(v, true));
      fb.innerHTML = (ok ? `<span class="ok">✓ ${B('正确', 'Correct')}</span>` : `<span class="no">✗ ${B('再试试，或看答案', 'Try again or see the answer')}</span>`) + (ok ? answersHTML() : '');
      FL.markVerbs(fb);
      if (ok) FL.speak(colloquial(target.h, target.m));
    }
    function setMode() {
      newTarget();
      locked = false;
      const phrase = Math.random() < 0.6 ? colloquial(target.h, target.m) : official(target.h, target.m);
      panel.innerHTML = `
        <div class="q-label">${B('把钟拨到这个时间', 'Set the clock to this time')}</div>
        <div class="saying" data-say="${FL.esc(phrase)}" tabindex="0" role="button"><div class="fr big-line">${FL.esc(phrase)}</div>${FL.sayBtn(phrase)}</div>
        <div class="ty-actions">
          <button type="button" class="btn primary" data-s="check">${B('检查', 'Check')}</button>
          <button type="button" class="btn ghost" data-s="next">${B('下一个', 'Next')} →</button>
        </div>
        <div class="ty-feedback" aria-live="polite"></div>`;
      FL.markVerbs(panel);
      FL.speak(phrase);
    }
    function setAct(a) {
      if (a === 'next') return setMode();
      const ok = h % 12 === target.h % 12 && m === target.m;
      panel.querySelector('.ty-feedback').innerHTML = ok
        ? `<span class="ok">✓ ${B('拨对了', 'Exactly right')}</span> <span class="digital">${digital(target.h, target.m)}</span>`
        : `<span class="no">✗ ${B('还不对，现在是', 'Not yet — you set')} ${digital(h, m)}</span>`;
    }
    function openTab(t) {
      tab = t;
      right.querySelectorAll('[data-ctab]').forEach(b => b.classList.toggle('on', b.dataset.ctab === t));
      left.classList.toggle('locked', t === 'read');
      locked = false;
      if (t === 'explore') explore();
      if (t === 'read') read();
      if (t === 'set') setMode();
    }

    const onClick = e => {
      const b = e.target.closest('[data-t], [data-c], [data-ctab], [data-r], [data-s]');
      if (!b) return;
      if (b.dataset.t) setTime(h, m + +b.dataset.t);
      if (b.dataset.c === 'now') { const d = new Date(); setTime(d.getHours(), d.getMinutes()); }
      if (b.dataset.c === 'rand') { const r = randTime(); setTime(r.h, r.m); }
      if (b.dataset.ctab) openTab(b.dataset.ctab);
      if (b.dataset.r) readAct(b.dataset.r);
      if (b.dataset.s) setAct(b.dataset.s);
    };
    left.addEventListener('click', onClick);
    right.addEventListener('click', onClick);

    // dragging the hands
    let drag = null;
    const angleAt = e => {
      const r = svg.querySelector('.face').getBoundingClientRect();
      const a = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
      return (a + 360) % 360;
    };
    svg.addEventListener('pointerdown', e => {
      if (locked) return;
      // only the dial is draggable, not the whole case
      const r = svg.querySelector('.face').getBoundingClientRect();
      if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) > r.width * 0.6) return;
      e.preventDefault();
      drag = e.target.closest('.hand-h') ? 'h' : 'm';
      svg.setPointerCapture(e.pointerId);
      svg.classList.add('dragging');
      move(e);
    });
    function move(e) {
      if (!drag) return;
      const a = angleAt(e);
      if (drag === 'm') {
        const nm = Math.round(a / 6) % 60;
        let nh = h;
        if (m >= 45 && nm < 15) nh++;         // swept forward past 12
        else if (m < 15 && nm >= 45) nh--;    // swept back past 12
        setTime(nh, nm);
      } else {
        const h12 = Math.round(((a - m * 0.5 + 360) % 360) / 30) % 12;
        setTime(h12 + (h >= 12 ? 12 : 0), m);
      }
    }
    svg.addEventListener('pointermove', move);
    const end = () => { drag = null; svg.classList.remove('dragging'); };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);

    // tap the pendule itself to hear the time
    svg.addEventListener('dblclick', () => FL.speak(colloquial(h, m)));
    update(false);
    return { left, right };
  };
})();
