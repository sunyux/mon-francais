/* outils.js — the Outils page: Traduire, Mon carnet, Le miroir. */
(function () {
  const FL = window.FL, B = FL.bi, esc = FL.esc;
  FL.renderHeader('outils');
  FL.renderRoom();
  const main = document.getElementById('main');
  const TABS = [
    { id: 'traduire', fr: 'Traduire', zh: '翻译', en: 'Translate' },
    { id: 'carnet', fr: 'Mon carnet', zh: '我的词本', en: 'My word book' },
    { id: 'miroir', fr: 'Le miroir', zh: '发音镜子', en: 'Pronunciation mirror' },
  ];
  let tab = (location.hash.slice(1) && TABS.some(t => t.id === location.hash.slice(1))) ? location.hash.slice(1) : FL.store.get('outils:tab', 'traduire');

  main.innerHTML = `
    <section class="ot">
      <div class="ot-head">
        <p class="lv-kicker" lang="fr">Les outils</p>
        <h1 lang="fr">La boîte à outils</h1>
        <p class="dt-lead">${B('在网站任何地方选中一个法语词，就会出现「Chercher」：查意思、听发音、加进词本。', 'Select a French word anywhere on the site and “Chercher” appears: look it up, hear it, keep it.')}</p>
      </div>
      <nav class="seg ot-tabs" role="tablist">${TABS.map(t => `<button type="button" role="tab" data-tab="${t.id}"><span lang="fr">${t.fr}</span> <small>${B(t.zh, t.en)}</small></button>`).join('')}</nav>
      <div class="ot-body"></div>
    </section>`;
  const body = main.querySelector('.ot-body');

  /* ---------- Traduire ---------- */
  const PAIRS = [['fr', 'zh'], ['fr', 'en'], ['zh', 'fr'], ['en', 'fr']];
  const NAME = { fr: 'Français', zh: '中文', en: 'English' };
  function traduire() {
    const pair = FL.store.get('outils:pair', 'fr|zh');
    body.innerHTML = `
      <div class="ot-tr">
        <div class="ot-row">
          <select class="ot-pair" aria-label="Direction">${PAIRS.map(([a, b]) => `<option value="${a}|${b}" ${pair === `${a}|${b}` ? 'selected' : ''}>${NAME[a]} → ${NAME[b]}</option>`).join('')}</select>
          <button type="button" class="btn primary" data-ot="go">${B('翻译', 'Translate')}</button>
        </div>
        <textarea class="ot-src" rows="4" placeholder="Bonjour ! Comment ça va ?" aria-label="Texte"></textarea>
        <div class="ot-out" aria-live="polite"></div>
        <p class="ot-note">${B('机器翻译用的是 Google 翻译的免费接口（连不上时改用 MyMemory），只会发送你输入的文字。重要的句子可以再用词典确认。⌘/Ctrl + Enter 快速翻译。', 'Machine translation uses Google Translate’s free endpoint (MyMemory if it is unreachable); only your text is sent. Check important sentences in a dictionary. ⌘/Ctrl + Enter to translate.')}</p>
      </div>`;
    const src = body.querySelector('.ot-src');
    src.value = FL.store.get('outils:src', '');
    src.focus();
    src.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) go(); });
    body.querySelector('.ot-pair').addEventListener('change', e => FL.store.set('outils:pair', e.target.value));
    async function go() {
      const text = src.value.trim();
      if (!text) return;
      FL.store.set('outils:src', text);
      const [from, to] = body.querySelector('.ot-pair').value.split('|');
      const out = body.querySelector('.ot-out');
      out.innerHTML = `<p class="tl-wait">${B('翻译中…', 'Translating…')}</p>`;
      try {
        const res = await FL.translate(text, from, to);
        const fr = from === 'fr' ? text : to === 'fr' ? res : '';
        const short = fr && fr.split(/\s+/).length <= 6;
        out.innerHTML = `
          <p class="ot-res" ${to === 'fr' ? 'lang="fr"' : ''}>${esc(res)}</p>
          <p class="ot-acts">
            ${fr ? FL.sayBtn(fr) : ''}
            ${short ? `<button type="button" class="btn small" data-ot="keep">★ ${B('加进词本', 'Keep in Mon carnet')}</button>` : ''}
            ${fr ? FL.dictLinks(fr) : ''}
          </p>`;
        const keep = out.querySelector('[data-ot="keep"]');
        if (keep) keep.onclick = () => {
          const zh = from === 'zh' ? text : to === 'zh' ? res : '';
          const en = from === 'en' ? text : to === 'en' ? res : '';
          FL.carnet.add({ fr, zh, en, from: 'Traduire' });
          keep.disabled = true; keep.innerHTML = `★ ${B('已加进词本', 'In Mon carnet')}`;
        };
      } catch (e) {
        out.innerHTML = `<p class="mi-verdict is-error">${B('翻译服务暂时连不上。可以先用这些词典：', 'The translation service is unreachable. Try these dictionaries:')} ${from === 'fr' ? FL.dictLinks(text) : ''}</p>`;
      }
    }
    body.querySelector('[data-ot="go"]').onclick = go;
  }

  /* ---------- Mon carnet ---------- */
  function carnet() {
    const words = FL.carnet.all();
    body.innerHTML = `
      <div class="ot-carnet">
        <form class="ot-add">
          <input name="fr" lang="fr" placeholder="Le mot (français)" required aria-label="Français" autocomplete="off" autocapitalize="off" spellcheck="false">
          <input name="zh" placeholder="中文意思" aria-label="中文">
          <input name="en" placeholder="English (optional)" aria-label="English">
          <button class="btn primary" type="submit">+ ${B('加入', 'Add')}</button>
        </form>
        <p class="ot-note">${B('只写法语也可以，中文会自动用机器翻译补上。也可以在任何页面选中法语词，按 ★。', 'French alone is fine; the Chinese is filled in by machine translation. Or select a French word on any page and press ★.')}</p>
        ${words.length ? `
          <input type="search" class="ot-search" placeholder="Chercher dans mon carnet… 搜索" aria-label="Search">
          <ul class="ot-list">${words.map(w => `
            <li data-fr="${esc(w.fr)}">
              <span class="fr">${esc(w.fr)}</span>
              <span class="mean">${w.zh || w.en ? FL.m({ zh: w.zh || w.en, en: w.en || w.zh }) : ''}</span>
              <span class="ot-from">${esc(w.from || '')}</span>
              <span class="ot-row-acts">${FL.sayBtn(w.fr, 'tiny')}
                ${FL.mirror.supported ? `<button type="button" class="tl-mic" data-ot="mirror" aria-label="Prononcer">${FL.ICON_MIC}</button>` : ''}
                <button type="button" class="tl-x" data-ot="del" aria-label="Supprimer">×</button></span>
            </li>`).join('')}</ul>
          <h3 class="ot-h">${B(`练习我的词本（${words.length} 个词）`, `Practise Mon carnet (${words.length} words)`)}</h3>
          ${words.length >= 4 ? '<div class="practice" data-practice></div>' : `<p class="ot-note">${B('再加几个词（至少 4 个）就可以开始练习了。', 'Add a few more words (at least 4) to start practising.')}</p>`}`
        : `<div class="ot-empty">${B('词本还是空的。在书里或任何页面选中一个法语词，按 ★ 收进来。', 'Your word book is empty. Select a French word anywhere and press ★ to keep it.')}</div>`}
      </div>`;
    const form = body.querySelector('.ot-add');
    form.onsubmit = async e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      if (!f.fr.trim()) return;
      if (!f.zh.trim()) f.zh = await FL.translate(f.fr.trim(), 'fr', 'zh').catch(() => '');
      if (!f.en.trim()) f.en = await FL.translate(f.fr.trim(), 'fr', 'en').catch(() => '');
      FL.carnet.add({ ...f, from: 'à la main' });
    };
    const search = body.querySelector('.ot-search');
    if (search) search.oninput = () => {
      const q = FL.norm(search.value, true);
      body.querySelectorAll('.ot-list li').forEach(li => { li.hidden = q && !FL.norm(li.textContent, true).includes(q); });
    };
    const list = body.querySelector('.ot-list');
    if (list) list.onclick = e => {
      const li = e.target.closest('li');
      const b = e.target.closest('[data-ot]');
      if (!li || !b) return;
      if (b.dataset.ot === 'del') FL.carnet.remove(li.dataset.fr);
      if (b.dataset.ot === 'mirror') { FL.store.set('outils:mirror', li.dataset.fr); open('miroir'); }
    };
    const pr = body.querySelector('[data-practice]');
    if (pr && FL.Practice) FL.Practice.mount(pr, {
      id: 'carnet', labelAll: 'Mon carnet',
      groups: [{ id: 'carnet', emoji: '★', title: { fr: 'Mon carnet', zh: '我的词本', en: 'My word book' },
        words: words.map(w => ({ fr: w.fr, zh: w.zh || w.en || '—', en: w.en || w.zh || '—' })) }],
    });
  }
  document.addEventListener('carnet:change', () => { if (tab === 'carnet') carnet(); });

  /* ---------- Le miroir ---------- */
  async function miroir() {
    const target = FL.store.get('outils:mirror', '') || 'Bonjour';
    body.innerHTML = `
      <div class="ot-mirror">
        <p class="ot-note">${B('先听原声，再按麦克风说一遍。镜子会告诉你它听到了什么。（语音识别由浏览器完成：Chrome 会把录音发给 Google 识别。）', 'Hear the model, then press the microphone and say it. The mirror tells you what it heard. (Recognition is done by your browser; Chrome sends the audio to Google.)')}</p>
        <div class="ot-row">
          <input class="ot-target" lang="fr" value="${esc(target)}" aria-label="Le mot à dire" autocomplete="off" autocapitalize="off" spellcheck="false">
          <button type="button" class="btn ghost" data-ot="random">${B('换一个', 'Another')}</button>
        </div>
        <div class="ot-glass">
          <p class="ot-word" lang="fr">${esc(target)}</p>
          <div class="ot-mirror-acts">
            ${FL.sayBtn(target, 'lg')}
            <button type="button" class="ot-mic" data-ot="listen" ${FL.mirror.supported ? '' : 'disabled'} aria-label="Parler">${FL.ICON_MIC}</button>
          </div>
          <div class="ot-verdict" aria-live="polite">${FL.mirror.supported ? '' : FL.mirror.verdict({ level: 'error', message: B('这个浏览器不支持语音识别，请用 Chrome 或 Safari。', 'This browser has no speech recognition; try Chrome or Safari.') })}</div>
        </div>
        <ul class="ot-history"></ul>
      </div>`;
    const inp = body.querySelector('.ot-target');
    const setTarget = t => { FL.store.set('outils:mirror', t); miroir(); };
    inp.onchange = () => setTarget(inp.value.trim() || 'Bonjour');
    body.querySelector('[data-ot="random"]').onclick = async () => {
      const own = FL.carnet.all().map(w => w.fr);
      const pool = own.length >= 3 ? own : (await FL.bookLookupAll()).map(w => w.fr);
      setTarget(FL.cleanFr(FL.pick(pool)));
    };
    const glass = ripples(body.querySelector('.ot-glass'));
    const mic = body.querySelector('[data-ot="listen"]');
    mic.onclick = () => {
      mic.classList.add('is-listening');
      body.querySelector('.ot-verdict').innerHTML = `<p class="mi-verdict">${B('请说…', 'Speak now…')}</p>`;
      if (glass) glass.listen();
      FL.mirror.listen(target, res => {
        mic.classList.remove('is-listening');
        if (glass) glass.stop(res.level === 'perfect');
        body.querySelector('.ot-verdict').innerHTML = FL.mirror.verdict(res, target);
        if (res.heard) body.querySelector('.ot-history').insertAdjacentHTML('afterbegin', `<li class="is-${res.level}"><span lang="fr">${esc(res.heard)}</span></li>`);
      });
    };
  }

  /* the mirror's surface: hand-drawn rings spread while you speak, louder voice, more rings;
     a right answer washes the glass with gold watercolour. Drawn on twos, in ink, never a glow. */
  function ripples(glass) {
    if (!glass || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    const cv = document.createElement('canvas');
    cv.className = 'ot-ripples';
    cv.setAttribute('aria-hidden', 'true');
    const gl = cv.getContext('webgl', { premultipliedAlpha: false });
    if (!gl) return null;
    glass.prepend(cv);
    const fs = `precision mediump float;
      uniform vec2 uRes; uniform float uFrame; uniform float uAmp; uniform float uGold; uniform float uRings;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
        float d = length(p * vec2(0.85, 1.25));
        float a = atan(p.y, p.x);
        // paper-blue glass, an uneven wash
        vec3 col = mix(vec3(0.93, 0.95, 0.97), vec3(0.79, 0.85, 0.92), noise(p * 4.0) * 0.7 + d * 0.5);
        // a few inked rings; each drawing wobbles a little (line boil)
        float ink = 0.0;
        for (int i = 0; i < 5; i++) {
          float fi = float(i);
          if (fi >= uRings) break;
          float r = fract(uFrame / 36.0 + fi / 5.0) * 0.62;
          float wob = (noise(vec2(a * 3.0 + fi * 5.0, uFrame * 0.5)) - 0.5) * 0.018;
          float line = 1.0 - smoothstep(0.003, 0.009 + uAmp * 0.006, abs(d - r - wob));
          float broken = step(0.25, noise(vec2(a * 9.0 + fi, uFrame * 0.3)));
          ink += line * broken * (1.0 - r / 0.62) * (0.45 + uAmp * 0.55);
        }
        col = mix(col, vec3(0.24, 0.3, 0.42), clamp(ink, 0.0, 1.0) * 0.75);
        // the gold wash for Parfait, blotchy like pigment on wet paper
        float gw = uGold * smoothstep(0.75, 0.2, d + (noise(p * 6.0 + uFrame * 0.05) - 0.5) * 0.3);
        col = mix(col, vec3(0.93, 0.8, 0.45), gw * 0.7);
        gl_FragColor = vec4(col, 1.0);
      }`;
    const sh = (t, src) => { const x = gl.createShader(t); gl.shaderSource(x, src); gl.compileShader(x); return x; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { cv.remove(); return null; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(prog, n);
    let frame = 0, amp = 0, gold = 0, rings = 0, listening = false, timer = null, stream = null, ctx = null, an = null, buf = null;
    function draw() {
      if (!cv.isConnected) return stopMic();
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      if (an) {
        an.getFloatTimeDomainData(buf);
        let sum = 0; for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const lvl = Math.min(1, Math.sqrt(sum / buf.length) * 9);
        amp += (lvl - amp) * 0.5;
        if (amp > 0.12) rings = Math.min(5, rings + amp * 0.6);
      } else if (listening) { rings = Math.max(rings, 2); } // no volume available: a calm two-ring pulse
      else { amp *= 0.8; rings = Math.max(0, rings - 0.25); }
      gold *= 0.965; // the gold soaks in slowly, then dries
      gl.uniform2f(U('uRes'), w, h);
      gl.uniform1f(U('uFrame'), frame++);
      gl.uniform1f(U('uAmp'), Math.max(amp, rings > 0 ? 0.35 : 0));
      gl.uniform1f(U('uRings'), Math.ceil(rings));
      gl.uniform1f(U('uGold'), gold);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      const busy = an || listening || rings > 0.05 || gold > 0.02;
      timer = busy ? setTimeout(draw, 1000 / 12) : null; // on twos
    }
    const kick = () => { if (!timer) draw(); };
    function stopMic() {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (ctx) ctx.close();
      stream = ctx = an = null;
    }
    draw();
    return {
      async listen() {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          an = ctx.createAnalyser(); an.fftSize = 1024;
          buf = new Float32Array(an.fftSize);
          ctx.createMediaStreamSource(stream).connect(an);
        } catch (e) { stopMic(); }
        listening = true;
        rings = Math.max(rings, 2);
        kick();
      },
      stop(perfect) { listening = false; stopMic(); if (perfect) gold = 1; kick(); },
    };
  }

  function open(t) {
    tab = t;
    FL.store.set('outils:tab', t);
    history.replaceState(null, '', `#${t}`);
    main.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
    ({ traduire, carnet, miroir })[t]();
  }
  main.querySelector('.ot-tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) open(b.dataset.tab); });
  open(tab);
})();
