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
    const mic = body.querySelector('[data-ot="listen"]');
    mic.onclick = () => {
      mic.classList.add('is-listening');
      body.querySelector('.ot-verdict').innerHTML = `<p class="mi-verdict">${B('请说…', 'Speak now…')}</p>`;
      FL.mirror.listen(target, res => {
        mic.classList.remove('is-listening');
        body.querySelector('.ot-verdict').innerHTML = FL.mirror.verdict(res, target);
        if (res.heard) body.querySelector('.ot-history').insertAdjacentHTML('afterbegin', `<li class="is-${res.level}"><span lang="fr">${esc(res.heard)}</span></li>`);
      });
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
