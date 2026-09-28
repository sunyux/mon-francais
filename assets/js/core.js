/* core.js — shared by every page: language mode, pronunciation, storage, header, clock face */
(function () {
  const FL = (window.FL = window.FL || {});
  FL.topicData = FL.topicData || {};
  FL.widgets = FL.widgets || {};
  FL.quizGenerators = FL.quizGenerators || {};

  /* ---------- small utils ---------- */
  FL.esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  FL.shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  FL.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  FL.pad = n => String(n).padStart(2, '0');

  FL.store = {
    get(k, d) {
      try { const v = localStorage.getItem('fl:' + k); return v == null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem('fl:' + k, JSON.stringify(v)); } catch (e) { /* private mode */ }
    },
  };

  /* ---------- language mode ----------
     Every meaning is rendered as <span class="zh">…</span><span class="en">…</span>;
     CSS hides one of them depending on html[data-mode]. No re-render needed. */
  FL.MODES = [
    { id: 'zh-en-fr', label: '中 · EN · FR' },
    { id: 'zh-fr', label: '中 · FR' },
    { id: 'en-fr', label: 'EN · FR' },
  ];
  FL.getMode = () => FL.store.get('mode', 'zh-en-fr');
  FL.setMode = m => {
    FL.store.set('mode', m);
    document.documentElement.dataset.mode = m;
    document.querySelectorAll('[data-setmode]').forEach(b =>
      b.classList.toggle('on', b.dataset.setmode === m));
    document.dispatchEvent(new CustomEvent('fl:mode', { detail: m }));
  };
  document.documentElement.dataset.mode = FL.getMode();

  FL.bi = (zh, en) =>
    `<span class="zh">${FL.esc(zh)}</span><span class="en">${FL.esc(en)}</span>`;
  FL.m = o => (o ? FL.bi(o.zh, o.en) : '');
  // plain-text meaning for places that can't hold HTML (select options, aria)
  FL.plain = o => {
    const m = FL.getMode();
    return m === 'zh-fr' ? o.zh : m === 'en-fr' ? o.en : `${o.zh} / ${o.en}`;
  };
  // French text as the learner should type/hear it: drop "(m.)", "(f.)" markers
  FL.cleanFr = s => String(s).replace(/\s*\([^)]*\)/g, '').trim();

  // answer comparison: case, punctuation, hyphens and (optionally) accents ignored
  FL.norm = (s, lenient) => {
    let t = String(s).toLowerCase()
      .replace(/[’`´]/g, "'")
      .replace(/[?!.,;:«»"“”…]/g, ' ')
      .replace(/-/g, ' ')
      .replace(/'\s+/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    if (lenient) t = t.replace(/œ/g, 'oe').normalize('NFD').replace(/[̀-ͯ]/g, '');
    return t;
  };

  /* ---------- pronunciation (Web Speech API) ---------- */
  const synth = window.speechSynthesis;
  let voice = null;
  FL.voices = () => (synth ? synth.getVoices().filter(v => /^fr/i.test(v.lang)) : []);
  function pickVoice() {
    const vs = FL.voices();
    const saved = FL.store.get('voice', null);
    voice =
      vs.find(v => v.name === saved) ||
      vs.find(v => /fr[-_]FR/i.test(v.lang) && /google|amélie|amelie|thomas|audrey|marie|denise|premium|enhanced/i.test(v.name)) ||
      vs.find(v => /fr[-_]FR/i.test(v.lang)) ||
      vs[0] || null;
    document.dispatchEvent(new CustomEvent('fl:voices'));
  }
  if (synth) {
    pickVoice();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice);
    else synth.onvoiceschanged = pickVoice;
  }
  FL.hasSpeech = !!synth;
  FL.currentVoice = () => voice;
  FL.setVoice = name => { FL.store.set('voice', name); pickVoice(); };
  FL.rate = () => FL.store.get('rate', 0.9);

  const speakText = t => FL.cleanFr(t).replace(/\s\/\s/g, ', ').replace(/…/g, ', ');
  FL.speak = (text, opts = {}) => {
    if (!synth) { if (opts.onend) setTimeout(opts.onend, 1800); return null; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(speakText(text));
    u.lang = 'fr-FR';
    if (voice) u.voice = voice;
    u.rate = (opts.rate || 1) * FL.rate();
    if (opts.onboundary) u.onboundary = opts.onboundary;
    if (opts.onstart) u.onstart = opts.onstart;
    u.onend = () => opts.onend && opts.onend();
    u.onerror = () => opts.onend && opts.onend();
    synth.speak(u);
    return u;
  };
  FL.stopSpeech = () => synth && synth.cancel();
  FL.speakList = (texts, gap = 350) => {
    let i = 0, alive = true;
    const next = () => {
      if (!alive || i >= texts.length) return;
      FL.speak(texts[i++], { onend: () => setTimeout(next, gap) });
    };
    next();
    return () => { alive = false; FL.stopSpeech(); };
  };

  const SPEAKER = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  FL.ICON_SPEAKER = SPEAKER;
  FL.sayBtn = (text, cls = '') =>
    `<button type="button" class="say ${cls}" data-say="${FL.esc(text)}" aria-label="Écouter" title="🔊 Écouter">${SPEAKER}</button>`;

  // any element with data-say speaks on click
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-say]');
    if (!el) return;
    FL.speak(el.dataset.say, {
      onstart: () => el.classList.add('speaking'),
      onend: () => el.classList.remove('speaking'),
    });
  });
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-say]:not(button)')) {
      e.preventDefault();
      e.target.click();
    }
  });

  /* ---------- clock face (used by story, quiz and the clock widget) ---------- */
  const handAngles = (h, m) => [((h % 12) * 30 + m * 0.5), m * 6];
  FL.clockSVG = (h, m, { cls = '' } = {}) => {
    const rad = d => (d * Math.PI) / 180;
    let ticks = '', nums = '';
    for (let i = 0; i < 60; i++) {
      const a = rad(i * 6), r1 = i % 5 ? 88 : 83;
      ticks += `<line class="${i % 5 ? 'tk' : 'tk5'}" x1="${(100 + r1 * Math.sin(a)).toFixed(1)}" y1="${(100 - r1 * Math.cos(a)).toFixed(1)}" x2="${(100 + 92 * Math.sin(a)).toFixed(1)}" y2="${(100 - 92 * Math.cos(a)).toFixed(1)}"/>`;
    }
    for (let n = 1; n <= 12; n++) {
      const a = rad(n * 30);
      nums += `<text x="${(100 + 71 * Math.sin(a)).toFixed(1)}" y="${(100 - 71 * Math.cos(a) + 6).toFixed(1)}">${n}</text>`;
    }
    const [ha, ma] = handAngles(h, m);
    return `<svg class="clock ${cls}" viewBox="0 0 200 200" role="img" aria-label="${FL.pad(h)}:${FL.pad(m)}">
      <circle class="face" cx="100" cy="100" r="96"/>${ticks}${nums}
      <g class="hand hand-h" transform="rotate(${ha} 100 100)"><line class="hit" x1="100" y1="100" x2="100" y2="50"/><line x1="100" y1="112" x2="100" y2="52"/></g>
      <g class="hand hand-m" transform="rotate(${ma} 100 100)"><line class="hit" x1="100" y1="100" x2="100" y2="24"/><line x1="100" y1="116" x2="100" y2="24"/></g>
      <circle class="pin" cx="100" cy="100" r="5"/></svg>`;
  };
  FL.setHands = (svg, h, m) => {
    const [ha, ma] = handAngles(h, m);
    svg.querySelector('.hand-h').setAttribute('transform', `rotate(${ha} 100 100)`);
    svg.querySelector('.hand-m').setAttribute('transform', `rotate(${ma} 100 100)`);
    svg.setAttribute('aria-label', `${FL.pad(h)}:${FL.pad(m)}`);
  };

  /* ---------- header / settings ---------- */
  FL.renderHeader = (active, root = '') => {
    const el = document.getElementById('site-header');
    if (!el) return;
    const mode = FL.getMode();
    const rate = FL.rate();
    el.innerHTML = `
      <div class="hdr">
        <a class="brand" href="${root}index.html"><span class="brand-mark">F</span><span>Mon Français<small>${FL.bi('我的法语', 'My French')}</small></span></a>
        <nav class="hdr-nav">
          <a href="${root}index.html" class="${active === 'home' ? 'on' : ''}">${FL.bi('主题', 'Topics')}</a>
          <a href="${root}verbs.html" class="${active === 'verbs' ? 'on' : ''}">${FL.bi('动词变位', 'Verbs')}</a>
        </nav>
        <div class="hdr-tools">
          <div class="seg" role="group" aria-label="Language mode">
            ${FL.MODES.map(x => `<button type="button" data-setmode="${x.id}" class="${x.id === mode ? 'on' : ''}">${x.label}</button>`).join('')}
          </div>
          <details class="settings">
            <summary aria-label="Settings" title="发音设置 Voice settings">${SPEAKER}<span class="caret">▾</span></summary>
            <div class="settings-pop">
              <label>${FL.bi('语速', 'Speed')}
                <select data-rate>
                  ${[[0.6, '0.6 · lent'], [0.75, '0.75'], [0.9, '0.9'], [1, '1.0'], [1.15, '1.15 · vif']].map(([v, l]) => `<option value="${v}" ${v === rate ? 'selected' : ''}>${l}</option>`).join('')}
                </select>
              </label>
              <label>${FL.bi('声音', 'Voice')}<select data-voice></select></label>
              <button type="button" class="btn small" data-say="Bonjour ! Il est huit heures et demie.">${SPEAKER} Test</button>
              ${FL.hasSpeech ? '' : `<p class="warn">${FL.bi('此浏览器不支持发音，请用 Chrome / Safari / Edge', 'This browser has no speech — try Chrome, Safari or Edge')}</p>`}
            </div>
          </details>
        </div>
      </div>`;
    el.querySelectorAll('[data-setmode]').forEach(b => b.addEventListener('click', () => FL.setMode(b.dataset.setmode)));
    el.querySelector('[data-rate]').addEventListener('change', e => FL.store.set('rate', +e.target.value));
    const vSel = el.querySelector('[data-voice]');
    const fillVoices = () => {
      const vs = FL.voices(), cur = FL.currentVoice();
      vSel.innerHTML = vs.length
        ? vs.map(v => `<option ${cur && cur.name === v.name ? 'selected' : ''}>${FL.esc(v.name)}</option>`).join('')
        : '<option>—</option>';
    };
    fillVoices();
    document.addEventListener('fl:voices', fillVoices);
    vSel.addEventListener('change', e => FL.setVoice(e.target.value));
    // sticky elements below the header need its real height (it wraps on phones)
    const setH = () => document.documentElement.style.setProperty('--hdr-h', el.offsetHeight + 'px');
    setH();
    if (window.ResizeObserver) new ResizeObserver(setH).observe(el);
  };

  FL.registerTopic = data => { FL.topicData[data.id] = data; };
})();
