/* dictee.js — La dictée du livre: the last journey, open once every world is painted.
   Every word of every book (each spelling once), heard and written, twenty to a page.
   A word you miss comes back at the end of its page; progress is kept between visits.
   Write the whole book and it is yours. */
(function () {
  const FL = window.FL, B = FL.bi, esc = FL.esc;
  const PAGE = 20, KEY = 'dictee:book';
  FL.renderHeader('home');
  FL.renderRoom();
  const main = document.getElementById('main');
  const ready = FL.TOPICS.filter(t => t.ready);
  const painted = t => !!FL.Levels.load(t.id).passed.final;
  const poster = t => `<span class="dt-world">${FL.planetPoster({ ...t.world, paint: FL.Levels.paint(t.id) }, { stars: false })}<small lang="fr">${esc(t.world.fr)}</small></span>`;

  /* locked: show what is left to paint */
  if (!ready.every(painted) && !/[?&]preview\b/.test(location.search)) {
    main.innerHTML = `
      <section class="dt-locked">
        <p class="lv-kicker" lang="fr">La dernière épreuve</p>
        <h1 lang="fr">La dictée du livre</h1>
        <p>${B('等所有星球都上完颜色（每颗星球的最终关都通过），这一关才会打开：把整本书听写出来，书就是你的了。', 'This opens once every world is painted (each world’s final level passed): write the whole book from dictation, and the book is yours.')}</p>
        <div class="dt-worlds">${ready.map(t => `<a href="topic.html?t=${t.id}#voyage" class="${painted(t) ? 'is-done' : ''}">${poster(t)}<b>${painted(t) ? '✓' : B('未完成', 'not yet')}</b></a>`).join('')}</div>
        <a class="btn ghost" href="index.html">← ${B('回到星空', 'Back to the sky')}</a>
      </section>`;
    return;
  }

  const load = src => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src + '?v=28'; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
  ready.flatMap(t => t.scripts).reduce((p, s) => p.then(() => load(s)), Promise.resolve())
    .then(start)
    .catch(err => { main.innerHTML = `<div class="empty"><p>${esc(err.message)}</p></div>`; });

  function start() {
    // the whole book in reading order; each spelling once (nous the subject and nous the object are one word to write)
    const seen = new Set(), words = [];
    ready.forEach(t => (FL.topicData[t.id].groups || []).forEach(g => g.words.forEach(w => {
      const k = FL.norm(FL.cleanFr(w.fr));
      if (seen.has(k)) return;
      seen.add(k);
      words.push({ ...w, group: g.id, topic: t.id, key: k });
    })));
    let st = FL.store.get(KEY, null) || { done: [], miss: {} };
    const save = () => FL.store.set(KEY, st);
    let page = null;

    const left = () => words.filter(w => !st.done.includes(w.key));
    function overview() {
      const n = st.done.length, total = words.length;
      if (n >= total) return finished();
      main.innerHTML = `
        <section class="dt">
          <p class="lv-kicker" lang="fr">La dernière épreuve</p>
          <h1 lang="fr">La dictée du livre</h1>
          <p class="dt-lead">${B(`整本书一共 ${total} 个词，每页 ${PAGE} 个。听，写下来。写错的词会在这一页最后再出现一次。可以分很多次完成，进度会保存。`, `The whole book has ${total} words, ${PAGE} to a page. Listen and write. A missed word comes back at the end of its page. Take as many visits as you like; your progress is kept.`)}</p>
          <div class="progress"><div class="bar"><i style="width:${(n / total) * 100}%"></i></div><span>${n} / ${total}</span></div>
          <div class="dt-worlds">${ready.map(t => {
            const tw = words.filter(w => w.topic === t.id), td = tw.filter(w => st.done.includes(w.key)).length;
            return `<span>${poster(t)}<b>${td} / ${tw.length}</b></span>`;
          }).join('')}</div>
          <button type="button" class="btn primary lv-go" data-dt="page">${n ? B('继续下一页', 'Next page') : B('开始第一页', 'Begin the first page')} →</button>
        </section>`;
    }
    function newPage() {
      const ws = left().slice(0, PAGE);
      page = { queue: ws.slice(), first: ws.length, ok: 0, missed: [] };
      ask();
    }
    function ask() {
      const w = page.queue[0];
      const t = FL.TOPICS.find(x => x.id === w.topic);
      main.innerHTML = `
        <section class="dt dt-run">
          <div class="lv-top"><span lang="fr">${esc(t.world.fr)}</span><span class="q-count">${B(`本页还剩 ${page.queue.length}`, `${page.queue.length} left on this page`)}</span>
            <button type="button" class="ex-stop" data-dt="leave">${B('先到这里', 'Stop here')}</button></div>
          <div class="progress thin"><div class="bar"><i style="width:${((st.done.length) / words.length) * 100}%"></i></div></div>
          <div class="dt-ear-row">
            <button type="button" class="lv-ear" data-dt="hear" aria-label="Écouter">${FL.ICON_SPEAKER}</button>
            <button type="button" class="btn ghost small" data-dt="slow">${B('慢一点', 'Slower')}</button>
          </div>
          <input class="ty-input lv-input dt-input" lang="fr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Écrivez ce que vous entendez…" aria-label="Votre réponse">
          <div class="accent-bar">${'àâçéèêëîïôûùœ'.split('').map(c => `<button type="button" data-ch="${c}" tabindex="-1">${c}</button>`).join('')}</div>
          <div class="lv-actions"><button type="button" class="btn ghost" data-dt="skip">${B('不会', "Don't know")}</button><button type="button" class="btn primary" data-dt="check">${B('检查', 'Check')}</button></div>
          <div class="lv-after" aria-live="polite"></div>
        </section>`;
      setTimeout(() => FL.speak(w.fr), 250);
      main.querySelector('.dt-input').focus({ preventScroll: true });
    }
    function check(given) {
      const w = page.queue[0];
      if (page.answered) return;
      page.answered = true;
      const answers = [w.fr, ...(w.alt || [])].map(FL.cleanFr);
      const exact = answers.some(a => FL.norm(a) === FL.norm(given));
      const loose = !exact && given.trim() && answers.some(a => FL.norm(a, true) === FL.norm(given, true));
      const ok = exact || loose;
      const inp = main.querySelector('.dt-input');
      inp.disabled = true; inp.classList.add(ok ? 'is-ok' : 'is-no');
      page.queue.shift();
      if (ok) { if (!st.done.includes(w.key)) st.done.push(w.key); page.ok++; }
      else { st.miss[w.key] = (st.miss[w.key] || 0) + 1; page.queue.push(w); if (!page.missed.includes(w)) page.missed.push(w); }
      save();
      main.querySelector('.lv-after').innerHTML = `
        <p class="lv-fb ${ok ? 'is-ok' : 'is-no'}">${ok ? (loose ? B('对了，但注意重音：', 'Right, but mind the accents:') : B('对了！', 'Right!')) : B('应该是：', 'It was:')}
          ${!exact ? `<b lang="fr">${esc(FL.cleanFr(w.fr))}</b>` : ''} <span class="mean">${FL.m(w)}</span></p>
        ${!ok ? `<p class="dt-again">${B('这个词会在本页最后再考一次。', 'This word comes back at the end of the page.')}</p>` : ''}
        <button type="button" class="btn primary" data-dt="next">${B('下一个', 'Next')} →</button>`;
      main.querySelector('[data-dt="next"]').focus({ preventScroll: true });
    }
    function next() {
      page.answered = false;
      if (page.queue.length) return ask();
      // the page is turned
      const n = st.done.length;
      if (n >= words.length) return finished();
      main.innerHTML = `
        <section class="dt">
          <p class="lv-kicker" lang="fr">Page tournée</p>
          <h1 lang="fr">${B(`这一页写完了`, 'Page written')}</h1>
          <p class="dt-lead">${B(`第一次就写对 ${page.first - page.missed.length} / ${page.first}。全书进度 ${n} / ${words.length}。`, `Right the first time: ${page.first - page.missed.length} of ${page.first}. The book: ${n} of ${words.length}.`)}</p>
          ${page.missed.length ? `<p>${B('这一页难写的词：', 'The hard ones on this page:')} ${page.missed.map(w => `<b lang="fr">${esc(FL.cleanFr(w.fr))}</b> ${FL.sayBtn(w.fr, 'tiny')}`).join(' · ')}</p>` : ''}
          <div class="lv-actions"><button type="button" class="btn primary" data-dt="page">${B('下一页', 'Next page')} →</button><button type="button" class="btn ghost" data-dt="home">${B('休息一下', 'Take a break')}</button></div>
        </section>`;
    }
    function finished() {
      const hardest = Object.entries(st.miss).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => words.find(w => w.key === k)).filter(Boolean);
      main.innerHTML = `
        <section class="dt dt-done">
          <p class="lv-kicker" lang="fr">Fin du voyage</p>
          <h1 lang="fr">Le livre est à toi.</h1>
          <p class="dt-lead">${B(`你把整本书的 ${words.length} 个词都听写出来了。每一颗小星球都亮着。`, `You have written all ${words.length} words of the book. Every little world is shining.`)}</p>
          <div class="dt-worlds">${ready.map(t => `<span>${poster(t)}</span>`).join('')}</div>
          ${hardest.length ? `<p>${B('一路上最难的词，偶尔回来看看：', 'The hardest words on the way; come back to them now and then:')}<br>${hardest.map(w => `<b lang="fr">${esc(FL.cleanFr(w.fr))}</b> ${FL.sayBtn(w.fr, 'tiny')}`).join(' · ')}</p>` : ''}
          <p class="dt-date" lang="fr">${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <div class="lv-actions"><button type="button" class="btn ghost" data-dt="restart">${B('从头再写一遍', 'Write the book again')}</button><a class="btn primary" href="index.html">${B('回到星空', 'Back to the sky')}</a></div>
        </section>`;
      FL.store.set('dictee:finished', true);
    }

    main.addEventListener('click', e => {
      const ch = e.target.closest('[data-ch]');
      if (ch) { const i = main.querySelector('.dt-input'); if (i && !i.disabled) { i.setRangeText(ch.dataset.ch, i.selectionStart, i.selectionEnd, 'end'); i.focus(); } return; }
      const b = e.target.closest('[data-dt]');
      if (!b) return;
      const a = b.dataset.dt;
      if (a === 'page') newPage();
      if (a === 'hear') FL.speak(page.queue[0].fr);
      if (a === 'slow') FL.speak(page.queue[0].fr, { rate: 0.6 });
      if (a === 'check') check(main.querySelector('.dt-input').value);
      if (a === 'skip') check('');
      if (a === 'next') next();
      if (a === 'leave' || a === 'home') overview();
      if (a === 'restart') { st = { done: [], miss: {} }; save(); overview(); }
    });
    main.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || !page) return;
      e.preventDefault();
      if (page.answered) next();
      else if (e.target.matches('.dt-input')) check(e.target.value);
    });
    overview();
  }
})();
