/* tools.js — the toolbox, on every page.
   · Select any French word → a small "Chercher" button → a card: the book's own meaning,
     the verb it belongs to, a dictionary definition (Wiktionary), a machine translation,
     links to WordReference / Larousse / DeepL, sound, the pronunciation mirror, and ★ Mon carnet.
   · FL.carnet: my own word list (FL.store), practised on the Outils page.
   · FL.translate(text, from, to): Google Translate's free web endpoint, MyMemory as fallback; no key.
   · FL.mirror.listen(target, done): the browser's speech recognition, in French.
   Lookups and translations send only the selected text to those services. */
(function () {
  const FL = window.FL, B = FL.bi, esc = FL.esc;

  /* ---------- Mon carnet ---------- */
  const CKEY = 'carnet:words';
  const norm = s => FL.norm(FL.cleanFr(s));
  FL.carnet = {
    all: () => FL.store.get(CKEY, []) || [],
    has: fr => FL.carnet.all().some(w => norm(w.fr) === norm(fr)),
    add(w) {
      const list = FL.carnet.all().filter(x => norm(x.fr) !== norm(w.fr));
      list.unshift({ fr: w.fr.trim(), zh: (w.zh || '').trim(), en: (w.en || '').trim(), from: w.from || '', added: Date.now() });
      FL.store.set(CKEY, list);
      document.dispatchEvent(new CustomEvent('carnet:change'));
    },
    remove(fr) {
      FL.store.set(CKEY, FL.carnet.all().filter(x => norm(x.fr) !== norm(fr)));
      document.dispatchEvent(new CustomEvent('carnet:change'));
    },
  };

  /* ---------- services ---------- */
  const LANG = { fr: 'fr', zh: 'zh-CN', en: 'en' };
  const cache = new Map();
  // Google Translate's free web endpoint first (much better on single words and Chinese);
  // MyMemory as the fallback if it ever refuses
  async function google(text, from, to) {
    const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${LANG[from]}&tl=${LANG[to]}&dt=t&q=${encodeURIComponent(text)}`);
    if (!r.ok) throw new Error('google');
    const j = await r.json();
    return (j[0] || []).map(x => x[0]).join('').trim();
  }
  async function mymemory(text, from, to) {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${LANG[from]}|${LANG[to]}`);
    if (!r.ok) throw new Error('translate');
    const j = await r.json();
    if (j.responseStatus && j.responseStatus !== 200) throw new Error(j.responseDetails || 'translate');
    // its top answer can be a loose match from someone else's sentence ("un café" → "a lawyer");
    // trust an exact human match with good quality, then its own machine translation
    const ms = j.matches || [];
    const human = ms.filter(m => m['created-by'] !== 'MT!' && m.match >= 0.99);
    const good = human.find(m => +m.quality >= 70);
    const mt = ms.find(m => m['created-by'] === 'MT!');
    return ((good || mt || human[0] || {}).translation || (j.responseData && j.responseData.translatedText) || '').trim();
  }
  FL.translate = async (text, from, to) => {
    const k = `${from}|${to}|${text}`;
    if (cache.has(k)) return cache.get(k);
    const out = await google(text, from, to).catch(() => mymemory(text, from, to));
    if (!out) throw new Error('translate');
    cache.set(k, out);
    return out;
  };
  const strip = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.trim(); };
  FL.define = async word => {
    const r = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`);
    if (!r.ok) return [];
    const j = await r.json();
    return (j.fr || []).slice(0, 3).map(p => ({ pos: p.partOfSpeech, defs: (p.definitions || []).map(d => strip(d.definition)).filter(Boolean).slice(0, 2) })).filter(p => p.defs.length);
  };
  FL.dictLinks = w => {
    const q = encodeURIComponent(w);
    return `<span class="tl-links">
      <a href="https://www.wordreference.com/fren/${q}" target="_blank" rel="noopener">WordReference</a>
      <a href="https://www.larousse.fr/dictionnaires/francais/${q}" target="_blank" rel="noopener">Larousse</a>
      <a href="https://www.deepl.com/translator#fr/zh/${q}" target="_blank" rel="noopener">DeepL</a></span>`;
  };

  /* ---------- the book's own words, from every world ---------- */
  let bookWords = null;
  function bookIndex() {
    if (bookWords) return bookWords;
    const load = src => new Promise(res => {
      const s = document.createElement('script');
      s.src = src + '?v=31'; s.onload = res; s.onerror = res;
      document.head.appendChild(s);
    });
    const ready = (FL.TOPICS || []).filter(t => t.ready);
    const missing = ready.filter(t => !FL.topicData[t.id]);
    bookWords = Promise.all(missing.map(t => load(t.scripts[0]))).then(() => ready.flatMap(t => {
      const d = FL.topicData[t.id];
      return d ? d.groups.flatMap(g => g.words.map(w => ({ ...w, topic: t, group: g }))) : [];
    }));
    return bookWords;
  }
  FL.bookLookupAll = () => bookIndex();
  FL.bookLookup = async text => {
    const k = FL.norm(text, true);
    const all = await bookIndex();
    return all.filter(w => [w.fr, ...(w.alt || [])].some(f => FL.norm(FL.cleanFr(f), true) === k));
  };

  /* ---------- the pronunciation mirror ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const lev = (a, b) => {
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  };
  FL.mirror = {
    supported: !!SR,
    // done({ heard, level: 'perfect' | 'close' | 'miss' | 'error', message })
    listen(target, done) {
      if (!SR) return done({ level: 'error', message: B('这个浏览器不支持语音识别，请用 Chrome 或 Safari。', 'This browser has no speech recognition; try Chrome or Safari.') });
      const r = new SR();
      r.lang = 'fr-FR'; r.interimResults = false; r.maxAlternatives = 5;
      let got = false;
      r.onresult = e => {
        got = true;
        const alts = [...e.results[0]].map(a => a.transcript.trim());
        const t = FL.norm(FL.cleanFr(target), true);
        const scored = alts.map(h => {
          const n = FL.norm(h, true);
          const exact = n === t || n.split(' ').includes(t) || n.includes(t);
          return { h, exact, sim: 1 - lev(n, t) / Math.max(n.length, t.length, 1) };
        }).sort((a, b) => b.exact - a.exact || b.sim - a.sim);
        const best = scored[0];
        done({ heard: best.h, level: best.exact ? 'perfect' : best.sim >= 0.7 ? 'close' : 'miss' });
      };
      r.onerror = e => { got = true; done({ level: 'error', message: e.error === 'not-allowed' ? B('需要允许使用麦克风。', 'Please allow the microphone.') : e.error === 'no-speech' ? B('没听到声音，再说一次？', 'I heard nothing; once more?') : B('出了点问题，再试一次。', 'Something went wrong; try again.') }); };
      r.onend = () => { if (!got) done({ level: 'error', message: B('没听到声音，再说一次？', 'I heard nothing; once more?') }); };
      r.start();
      return r;
    },
    verdict(res, target) {
      if (res.level === 'error') return `<p class="mi-verdict is-error">${res.message}</p>`;
      const heard = `<span lang="fr">« ${esc(res.heard)} »</span>`;
      if (res.level === 'perfect') return `<p class="mi-verdict is-perfect">${B('镜子听到了', 'The mirror heard')} ${heard}. <b lang="fr">Parfait !</b></p>`;
      if (res.level === 'close') return `<p class="mi-verdict is-close">${B('很接近了。镜子听到', 'Close. The mirror heard')} ${heard}${B('，再听一遍原声，跟着读？', '; hear the model again and repeat?')}</p>`;
      return `<p class="mi-verdict is-miss">${B('镜子听到的是', 'The mirror heard')} ${heard}${B(`，不是 «${esc(FL.cleanFr(target))}»。慢一点，再试一次。`, `, not « ${esc(FL.cleanFr(target))} ». Slower, once more.`)}</p>`;
    },
  };

  /* ---------- select a word, anywhere → Chercher ---------- */
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'tl-pill';
  pill.innerHTML = `<span lang="fr">Chercher</span> <small>${B('查', 'look up')}</small>`;
  pill.hidden = true;
  const card = document.createElement('div');
  card.className = 'tl-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Dictionnaire');
  card.hidden = true;
  document.addEventListener('DOMContentLoaded', () => document.body.append(pill, card));
  if (document.body) document.body.append(pill, card);

  let picked = '';
  const LETTERS = /[A-Za-zÀ-ÖØ-öø-ÿœŒ]/;
  function selectionWord() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return null;
    const node = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
    if (!node || node.closest('input, textarea, .tl-card, .tl-pill, [contenteditable]')) return null;
    const t = sel.toString().replace(/\s+/g, ' ').trim().replace(/^[«"“(]+|[»"”).,;:!?]+$/g, '');
    if (!t || t.length > 60 || !LETTERS.test(t) || t.split(' ').length > 6) return null;
    return { text: t, rect: sel.getRangeAt(0).getBoundingClientRect() };
  }
  function place(el, rect, below = 8) {
    const x = Math.min(window.innerWidth - el.offsetWidth - 8, Math.max(8, rect.left + rect.width / 2 - el.offsetWidth / 2));
    let y = rect.bottom + below;
    if (y + el.offsetHeight > window.innerHeight - 8) y = Math.max(8, rect.top - el.offsetHeight - below);
    el.style.left = `${x + window.scrollX}px`;
    el.style.top = `${y + window.scrollY}px`;
  }
  const onSelect = () => setTimeout(() => {
    const s = selectionWord();
    if (!s) { pill.hidden = true; return; }
    picked = s.text;
    pill.hidden = false;
    place(pill, s.rect, 6);
  }, 10);
  const inTool = e => e.target.closest && e.target.closest('.tl-card, .tl-pill');
  document.addEventListener('mouseup', e => { if (!inTool(e)) onSelect(); });
  document.addEventListener('touchend', e => { if (!inTool(e)) setTimeout(onSelect, 250); });
  document.addEventListener('keyup', e => { if (e.shiftKey) onSelect(); });
  pill.addEventListener('mousedown', e => e.preventDefault());
  pill.addEventListener('click', () => {
    const rect = pill.getBoundingClientRect();
    pill.hidden = true;
    if (picked) FL.lookup(picked, rect);
  });
  document.addEventListener('mousedown', e => {
    const t = e.target.closest ? e.target : document.body;
    if (!card.hidden && !t.closest('.tl-card')) card.hidden = true;
    if (!t.closest('.tl-pill')) setTimeout(() => { if (!window.getSelection().toString()) pill.hidden = true; }, 0);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { card.hidden = true; pill.hidden = true; } });

  // the card itself, also opened from the Outils page
  FL.lookup = async (text, rect) => {
    const word = FL.cleanFr(text);
    const lower = word.toLowerCase();
    const inf = FL.verbs && FL.verbs.find && (FL.verbs.find(lower) || (FL.verbs.get(lower) ? lower : null));
    card.innerHTML = `
      <div class="tl-head">
        <b lang="fr">${esc(word)}</b> ${FL.sayBtn(word, 'tiny')}
        ${FL.mirror.supported ? `<button type="button" class="tl-mic" data-tl="mic" aria-label="Prononcer" title="${esc('发音镜子 Pronunciation mirror')}">${MIC}</button>` : ''}
        <button type="button" class="tl-star ${FL.carnet.has(word) ? 'on' : ''}" data-tl="star" aria-label="Mon carnet" title="${esc('加入我的词本 Add to Mon carnet')}">★</button>
        <button type="button" class="tl-x" data-tl="close" aria-label="Fermer">×</button>
      </div>
      <div class="tl-mirror"></div>
      <div class="tl-book"><p class="tl-wait">${B('在书里找…', 'Looking in the book…')}</p></div>
      ${inf ? `<div class="tl-verb"><p class="tl-h">${B('动词', 'Verb')} <b lang="fr">${esc(inf)}</b> · ${B(FL.verbs.get(inf).zh, FL.verbs.get(inf).en)}</p>
        <p class="tl-conj" lang="fr">${FL.verbs.get(inf).lines.present.map(esc).join(' · ')}</p>
        <a href="verbs.html#${encodeURIComponent(inf)}">${B('全部变位', 'All tenses')} →</a></div>` : ''}
      <div class="tl-mt"><p class="tl-h">${B('机器翻译', 'Machine translation')}</p><p class="tl-wait">…</p></div>
      <div class="tl-def"><p class="tl-h">${B('词典', 'Dictionary')} <small>Wiktionary</small></p><p class="tl-wait">…</p></div>
      <p class="tl-foot">${FL.dictLinks(word)}</p>`;
    card.hidden = false;
    card.dataset.word = word;
    place(card, rect || { left: window.innerWidth / 2, width: 0, top: 80, bottom: 80 });
    const vb = inf && FL.verbs.get(inf);
    const found = vb ? { zh: inf === lower ? vb.zh : `${vb.zh}（${inf}）`, en: inf === lower ? vb.en : `${vb.en} (${inf})` } : { zh: '', en: '' };
    // 1. the book
    FL.bookLookup(word).then(ws => {
      const box = card.querySelector('.tl-book');
      if (!box || card.dataset.word !== word) return;
      box.innerHTML = ws.length ? `<p class="tl-h">${B('书里', 'In the book')}</p>${ws.slice(0, 4).map(w => `
        <p class="tl-hit"><span class="mean">${FL.m(w)}</span>
        <a href="topic.html?t=${w.topic.id}#vocabulaire" lang="fr">${esc(w.topic.world.fr)} · ${esc(w.group.title.fr)}</a></p>`).join('')}` : '';
      if (ws[0]) { found.zh = found.zh || ws[0].zh; found.en = found.en || ws[0].en; }
    });
    // 2. machine translation, to Chinese and English. It is poor on lone words (vais → "will he…"),
    //    so a single word the book or the verb list already knows does not show it
    const phrase = /\s/.test(word);
    Promise.all([FL.bookLookup(word), FL.translate(word, 'fr', 'zh').catch(() => ''), FL.translate(word, 'fr', 'en').catch(() => '')]).then(([hits, zh, en]) => {
      const box = card.querySelector('.tl-mt');
      if (!box || card.dataset.word !== word) return;
      if ((!zh && !en) || (!phrase && (inf || hits.length))) { box.innerHTML = ''; return; }
      box.querySelector('.tl-wait').outerHTML = `<p class="tl-tr">${B(esc(zh), esc(en))}</p>`;
      found.zh = found.zh || zh; found.en = found.en || en;
    });
    // 3. a real dictionary definition
    FL.define(word).catch(() => []).then(ps => {
      const box = card.querySelector('.tl-def');
      if (!box || card.dataset.word !== word) return;
      if (!ps.length) { box.innerHTML = ''; return; }
      box.querySelector('.tl-wait').outerHTML = ps.map(p => `<p class="tl-pos"><i>${esc(p.pos)}</i> ${p.defs.map(esc).join(' · ')}</p>`).join('');
    });
    card.onclick = e => {
      const b = e.target.closest('[data-tl]');
      if (!b) return;
      if (b.dataset.tl === 'close') card.hidden = true;
      if (b.dataset.tl === 'star') {
        if (FL.carnet.has(word)) FL.carnet.remove(word);
        else FL.carnet.add({ fr: word, zh: found.zh, en: found.en, from: document.title.split(' · ')[0] });
        b.classList.toggle('on', FL.carnet.has(word));
      }
      if (b.dataset.tl === 'mic') {
        const box = card.querySelector('.tl-mirror');
        b.classList.add('is-listening');
        box.innerHTML = `<p class="mi-verdict">${B('请说…', 'Speak now…')}</p>`;
        FL.mirror.listen(word, res => { b.classList.remove('is-listening'); box.innerHTML = FL.mirror.verdict(res, word); });
      }
    };
  };

  const MIC = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  FL.ICON_MIC = MIC;
})();
