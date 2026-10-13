/* levels.js — Le voyage: each little world is learned in short levels.
   The planet starts as a pencil sketch; every level passed paints more of it.
   A level is 10 mixed questions (pick, listen, meaning, write, plus the topic's own kind);
   80 % passes, a perfect score earns a gold star. The Bilan sorts the mistakes by cause and
   sends you to the page to review. Wrong words grow as baobab sprouts on the planet until
   you answer them right on two different days.

   Topic data: levels: [{ id, title:{fr,zh,en}, groups:[groupId…], extra?:{ gen, label:{zh,en}, chapter } }]
   The final level (all groups) is added automatically and is open from the start.
   State lives in FL.store under levels:<topicId>. */
(function () {
  const FL = window.FL, B = FL.bi, esc = FL.esc;
  const PASS = 0.8, N = 10, N_FINAL = 15, BAOBAB_HITS = 2;

  /* ---------- progress ---------- */
  const day = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const KEY = t => `levels:${t}`;
  function load(t) {
    const s = FL.store.get(KEY(t), null) || {};
    return { total: s.total || 5, passed: s.passed || {}, perfect: s.perfect || {}, best: s.best || {}, baobabs: s.baobabs || {} };
  }
  const save = (t, s) => FL.store.set(KEY(t), s);

  // how much of a world is painted: f from 0 (pencil) to 1 (all colour), plus its sprouts
  function paint(topicId) {
    const s = load(topicId);
    const done = !!s.passed.final;
    const n = Object.keys(s.passed).filter(k => k !== 'final' && s.passed[k]).length;
    return { f: done ? 1 : Math.min(1, n / s.total), alive: done || n >= s.total, sprouts: Object.keys(s.baobabs).length };
  }

  const levelsOf = d => {
    if (!d.levels) return [];
    const extras = d.levels.map(l => l.extra).filter(Boolean);
    return [...d.levels, {
      id: 'final', final: true,
      title: { fr: 'Le grand voyage', zh: '最终关：整颗星球', en: 'Final: the whole world' },
      groups: d.groups.map(g => g.id), extras,
    }];
  };

  /* ---------- questions ---------- */
  const sameMeaning = (a, b) => a.zh === b.zh && a.en === b.en;
  const clean = s => FL.cleanFr(s);
  function distractors(all, w, n, key) {
    const seen = new Set([key(w)]);
    const out = [];
    const ok = x => !sameMeaning(x, w) && clean(x.fr) !== clean(w.fr) && !seen.has(key(x));
    for (const x of [...FL.shuffle(all.filter(x => x.group === w.group)), ...FL.shuffle(all.filter(x => x.group !== w.group))]) {
      if (ok(x)) { seen.add(key(x)); out.push(x); }
      if (out.length === n) break;
    }
    return out;
  }
  function wordQ(kind, w, all, topicId) {
    const pic = FL.pic ? FL.pic(w, w.group, topicId, { cls: 'q-pic' }) : '';
    if (kind === 'write') {
      const answers = all.filter(x => sameMeaning(x, w)).flatMap(x => [x.fr, ...(x.alt || [])]).map(clean);
      return { kind, w, tag: w.group, say: w.fr, answers,
        prompt: `<div class="q-label">${B('写出法语', 'Write it in French')}</div>${pic}<div class="q-big">${FL.m(w)}</div>` };
    }
    const byFr = kind !== 'mean';
    const ds = distractors(all, w, 3, byFr ? x => clean(x.fr) : x => x.zh + x.en);
    const opts = FL.shuffle([w, ...ds]);
    const q = { kind, w, tag: w.group, say: w.fr, answer: opts.indexOf(w) };
    if (kind === 'pick') Object.assign(q, {
      prompt: `<div class="q-label">${B('用法语怎么说？', 'How do you say it in French?')}</div>${pic}<div class="q-big">${FL.m(w)}</div>`,
      options: opts.map(o => `<span lang="fr">${esc(clean(o.fr))}</span>`) });
    if (kind === 'listen') Object.assign(q, { autoSay: true,
      prompt: `<div class="q-label">${B('听一听，选出你听到的', 'Listen and choose what you hear')}</div><button type="button" class="lv-ear" data-lv="hear" aria-label="Écouter">${FL.ICON_SPEAKER}</button>`,
      options: opts.map(o => `<span lang="fr">${esc(clean(o.fr))}</span>`) });
    if (kind === 'mean') Object.assign(q, { autoSay: true,
      prompt: `<div class="q-label">${B('这是什么意思？', 'What does it mean?')}</div><div class="q-big fr">${esc(w.fr)}</div>${FL.sayBtn(w.fr)}`,
      options: opts.map(o => FL.m(o)) });
    return q;
  }
  function buildQuestions(level, d, words, n) {
    const all = d.groups.flatMap(g => g.words.map(w => ({ ...w, group: g.id })));
    const pool = words || all.filter(w => level.groups.includes(w.group));
    const extras = (level.extras || (level.extra ? [level.extra] : [])).filter(x => FL.quizGenerators && FL.quizGenerators[x.gen]);
    const picks = [];
    let bag = [];
    for (let i = 0; i < n; i++) {
      if (!bag.length) bag = FL.shuffle(pool.slice());
      picks.push(bag.pop());
    }
    // a steady mix: about a third written, the rest chosen; the topic's own kind every third question
    const kinds = FL.shuffle(Array.from({ length: n }, (_, i) => ['write', 'pick', 'listen', 'write', 'mean', 'pick', 'write', 'listen', 'mean', 'pick'][i % 10]));
    return picks.map((w, i) => {
      if (!words && extras.length && i % 3 === 2) {
        const x = FL.pick(extras);
        const g = FL.quizGenerators[x.gen]();
        return { ...g, kind: 'extra', tag: `x:${x.gen}`, extra: x };
      }
      return wordQ(words ? FL.pick(['write', 'pick']) : kinds[i], w, all, d.id);
    });
  }

  /* ---------- the chapter: a map on the left, the stage on the right ---------- */
  function mount(left, right, d, { onProgress, review, showStage } = {}) {
    const levels = levelsOf(d);
    const world = (FL.TOPICS.find(t => t.id === d.id) || {}).world || {};
    let st = load(d.id);
    if (st.total !== levels.length - 1) { st.total = levels.length - 1; save(d.id, st); }
    const groupOf = id => d.groups.find(g => g.id === id);
    const open = (l, i) => l.final || i === 0 || st.passed[levels[i - 1].id] || st.passed[l.id];

    /* the map */
    function drawMap() {
      const p = paint(d.id);
      const n = levels.filter(l => !l.final && st.passed[l.id]).length;
      const stars = levels.filter(l => st.perfect[l.id]).length;
      const due = Object.values(st.baobabs).filter(b => b.day !== day()).length;
      const sprouts = Object.keys(st.baobabs).length;
      left.innerHTML = `
        <div class="lv-map">
          <div class="lv-head">
            <div class="lv-poster" style="--paint:${p.f}">${FL.planetPoster({ ...world, paint: p }, { stars: false })}</div>
            <div>
              <p class="lv-count">${B(`${n} / ${levels.length - 1} 关`, `${n} of ${levels.length - 1} levels`)} · <span class="lv-gold">★ ${stars}</span></p>
              <p class="lv-say">${p.f >= 1 ? B('整颗星球都有了颜色！', 'The whole world is in colour!') : n ? B('每过一关，星球就多一份颜色。', 'Each level adds colour to the world.') : B('星球还是铅笔稿。过一关，给它上第一层颜色。', 'The world is still a pencil sketch. Pass a level to paint it.')}</p>
            </div>
          </div>
          <ol class="lv-path">${levels.map((l, i) => {
            const state = st.perfect[l.id] ? 'perfect' : st.passed[l.id] ? 'passed' : open(l, i) ? 'open' : 'locked';
            const best = st.best[l.id];
            return `<li class="lv-stop is-${state}${l.final ? ' is-final' : ''}">
              <button type="button" data-level="${l.id}" ${state === 'locked' ? 'disabled' : ''}>
                <span class="lv-dot">${state === 'perfect' ? '★' : state === 'passed' ? '✓' : l.final ? '✦' : i + 1}</span>
                <span class="lv-name"><span lang="fr">${esc(l.title.fr)}</span><small>${B(l.title.zh, l.title.en)}</small>
                  ${l.final && !st.passed.final ? `<small class="lv-skip">${B('已经会了？直接挑战，过了整颗星球上色', 'Know it already? Pass this to paint the whole world')}</small>` : ''}</span>
                <span class="lv-best">${best != null ? `${best}/${l.final ? N_FINAL : N}` : state === 'locked' ? B('未解锁', 'locked') : ''}</span>
              </button></li>`;
          }).join('')}</ol>
          ${sprouts ? `<div class="lv-baobab">
            ${SPROUT}
            <p>${B(`星球上长了 ${sprouts} 棵猴面包树苗：都是答错过的词。在不同的两天各答对一次，就能拔掉。`, `${sprouts} baobab sprout${sprouts > 1 ? 's' : ''} on the world: words you missed. Answer each right on two different days to pull it out.`)}</p>
            <button type="button" class="btn ${due ? 'primary' : 'ghost'}" data-lv="baobab" ${due ? '' : 'disabled'}>${due ? B(`拔树苗（${Math.min(due, N)}）`, `Pull sprouts (${Math.min(due, N)})`) : B('今天拔过了，明天再来', 'Done for today, come back tomorrow')}</button>
          </div>` : ''}
        </div>`;
    }

    /* the stage */
    let run = null;
    function intro(l) {
      const i = levels.indexOf(l);
      const gs = l.groups.map(groupOf).filter(Boolean);
      right.innerHTML = `
        <div class="lv-intro">
          <p class="lv-kicker" lang="fr">${l.final ? 'Épreuve finale' : `Étape ${i + 1}`}</p>
          <h3 lang="fr">${esc(l.title.fr)}</h3>
          <p class="lv-sub">${B(l.title.zh, l.title.en)}</p>
          ${l.final ? '' : `<ul class="lv-covers">${gs.map(g => `<li><span lang="fr">${esc(g.title.fr)}</span> <small>${B(g.title.zh, g.title.en)}</small></li>`).join('')}${l.extra ? `<li>${FL.m(l.extra.label)}</li>` : ''}</ul>`}
          <p class="lv-rule">${B(`${l.final ? N_FINAL : N} 题 · 答对 80% 过关 · 全对得 ★ · 不计时`, `${l.final ? N_FINAL : N} questions · 80% to pass · all right for a ★ · no timer`)}</p>
          ${st.best[l.id] != null ? `<p class="lv-rule">${B(`最好成绩 ${st.best[l.id]}`, `Best ${st.best[l.id]}`)}</p>` : ''}
          <button type="button" class="btn primary lv-go" data-lv="start" data-id="${l.id}">${B('出发', 'Start')} →</button>
        </div>`;
    }
    function welcome() {
      const next = levels.find((l, i) => !l.final && open(l, i) && !st.passed[l.id]) || levels[levels.length - 1];
      intro(next);
    }

    function start(l, words, mode = 'level') {
      const n = words ? Math.min(N, words.length) : l.final ? N_FINAL : N;
      run = { l, mode, qs: buildQuestions(l, d, words, n), i: 0, res: [] };
      ask();
    }
    function ask() {
      const r = run, q = r.qs[r.i];
      const title = r.mode === 'baobab' ? B('拔树苗', 'Pulling sprouts') : r.mode === 'retry' ? B('错题再练', 'Mistakes again') : `<span lang="fr">${esc(r.l.title.fr)}</span>`;
      right.innerHTML = `
        <div class="lv-run">
          <div class="lv-top"><span>${title}</span><span class="q-count">${r.i + 1} / ${r.qs.length}</span>
            <button type="button" class="ex-stop" data-lv="quit">${B('退出', 'Leave')}</button></div>
          <div class="progress thin"><div class="bar"><i style="width:${(r.i / r.qs.length) * 100}%"></i></div></div>
          <div class="q-prompt">${q.prompt}</div>
          ${q.kind === 'write'
            ? `<input class="ty-input lv-input" lang="fr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Tapez ici…" aria-label="Votre réponse">
               <div class="accent-bar">${'àâçéèêëîïôûùœ'.split('').map(c => `<button type="button" data-ch="${c}" tabindex="-1">${c}</button>`).join('')}</div>
               <div class="lv-actions"><button type="button" class="btn ghost" data-lv="skip">${B('不会', "Don't know")}</button><button type="button" class="btn primary" data-lv="check">${B('检查', 'Check')}</button></div>`
            : `<div class="q-opts">${q.options.map((o, k) => `<button type="button" class="q-opt" data-pick="${k}"><kbd>${k + 1}</kbd>${o}</button>`).join('')}</div>`}
          <div class="lv-after" aria-live="polite"></div>
        </div>`;
      FL.markVerbs && FL.markVerbs(right);
      if (q.autoSay) setTimeout(() => FL.speak(q.say), 250);
      const inp = right.querySelector('.lv-input');
      if (inp) inp.focus({ preventScroll: true });
    }
    function answer(given) {
      const r = run, q = r.qs[r.i];
      if (r.res.length > r.i) return; // already answered
      let ok = false, accent = false, typed = '';
      if (q.kind === 'write') {
        typed = given;
        ok = q.answers.some(a => FL.norm(a) === FL.norm(given));
        accent = !ok && given.trim() && q.answers.some(a => FL.norm(a, true) === FL.norm(given, true));
        ok = ok || accent;
      } else {
        ok = given === q.answer;
        right.querySelectorAll('.q-opt').forEach((b, k) => { b.disabled = true; b.classList.toggle('right', k === q.answer); b.classList.toggle('wrong', k === given && !ok); });
      }
      r.res.push({ q, ok, accent, typed });
      if (ok && FL.correct) FL.correct();
      const fr = q.w ? clean(q.w.fr) : '';
      right.querySelector('.lv-after').innerHTML = `
        <p class="lv-fb ${ok ? 'is-ok' : 'is-no'}">${ok ? (accent ? B('对了，但注意重音：', 'Right, but mind the accents:') : B('对了！', 'Right!')) : B('正确答案：', 'The answer:')}
          ${fr && (!ok || accent) ? `<b lang="fr">${esc(fr)}</b>` : ''} ${q.say ? FL.sayBtn(q.say, 'tiny') : ''}</p>
        <button type="button" class="btn primary" data-lv="next">${r.i + 1 < r.qs.length ? B('下一题', 'Next') : B('看总结', 'See the Bilan')} →</button>`;
      const inp = right.querySelector('.lv-input');
      if (inp) { inp.disabled = true; inp.classList.add(ok ? 'is-ok' : 'is-no'); }
      if (q.say) FL.speak(q.say);
      right.querySelector('[data-lv="next"]').focus({ preventScroll: true });
    }
    function next() {
      run.i++;
      if (run.i < run.qs.length) ask(); else bilan();
    }

    /* the Bilan: what went wrong, why, and where to look */
    function bilan() {
      const r = run, n = r.qs.length;
      const score = r.res.filter(x => x.ok).length;
      const pass = score / n >= PASS, perfect = score === n;
      const beforeP = paint(d.id), before = beforeP.f;
      // baobabs: a miss plants (or replants) one; a right answer on a new day helps pull it out
      r.res.forEach(x => {
        if (!x.q.w) return;
        const k = `${x.q.w.group}|${x.q.w.fr}`;
        const b = st.baobabs[k];
        if (!x.ok) st.baobabs[k] = { day: day(), hits: 0 };
        else if (b && b.day !== day()) { b.hits++; b.day = day(); if (b.hits >= BAOBAB_HITS) delete st.baobabs[k]; }
      });
      if (r.mode === 'level') {
        const id = r.l.id;
        st.best[id] = Math.max(st.best[id] || 0, score);
        if (pass) st.passed[id] = true;
        if (perfect) st.perfect[id] = true;
      }
      save(d.id, st);
      const after = paint(d.id);
      drawMap();
      if (onProgress) onProgress(after);

      const wrong = r.res.filter(x => !x.ok);
      const accents = r.res.filter(x => x.accent);
      // sort the mistakes by cause: one card per vocabulary group (or the topic's own exercise)
      const causes = {};
      wrong.forEach(x => { (causes[x.q.tag] = causes[x.q.tag] || []).push(x); });
      const causeCard = (tag, xs) => {
        if (tag.startsWith('x:')) {
          const ex = xs[0].q.extra;
          return `<li class="lv-cause"><p class="lv-cause-h">${FL.m(ex.label)} <span class="lv-n">× ${xs.length}</span></p>
            ${ex.chapter ? `<button type="button" class="btn small" data-review="chapter" data-id="${ex.chapter}">${B('去练这一部分', 'Practise this part')} →</button>` : ''}</li>`;
        }
        const g = groupOf(tag);
        return `<li class="lv-cause">
          <p class="lv-cause-h"><span lang="fr">${esc(g.title.fr)}</span> <small>${B(g.title.zh, g.title.en)}</small> <span class="lv-n">× ${xs.length}</span></p>
          <ul class="lv-words">${xs.map(x => `<li><span lang="fr">${esc(clean(x.q.w.fr))}</span> <span class="mean">${FL.m(x.q.w)}</span>${x.typed ? ` <s lang="fr">${esc(x.typed)}</s>` : ''} ${FL.sayBtn(x.q.w.fr, 'tiny')}</li>`).join('')}</ul>
          ${g.memo && g.memo[0] ? `<p class="lv-hook"><span lang="fr">Pour retenir :</span> ${FL.m(g.memo[0])}</p>` : g.tip ? `<p class="lv-hook">${FL.m(g.tip)}</p>` : ''}
          <button type="button" class="btn small" data-review="group" data-id="${g.id}">${B('翻到这一页复习', 'Review this page')} →</button>
        </li>`;
      };
      const head = r.mode === 'baobab'
        ? B(`拔掉了 ${r.res.filter(x => x.ok).length} 棵里的进度，还剩 ${Object.keys(st.baobabs).length} 棵`, `Progress on ${score} sprouts; ${Object.keys(st.baobabs).length} left`)
        : r.mode === 'retry' ? B(`错题再练：${score} / ${n}`, `Mistakes again: ${score} / ${n}`)
        : pass ? (perfect ? B('满分！得到一颗金星 ★', 'Perfect! A gold star ★') : B('过关！', 'Level passed!'))
        : B(`还差 ${Math.ceil(n * PASS) - score} 题就过关`, `${Math.ceil(n * PASS) - score} more right to pass`);
      const nextLevel = levels[levels.indexOf(r.l) + 1];
      right.innerHTML = `
        <div class="lv-bilan">
          <p class="lv-kicker" lang="fr">Bilan</p>
          <div class="lv-result ${pass || r.mode !== 'level' ? 'is-pass' : 'is-try'}">
            <p class="lv-score"><b>${score}</b> / ${n}</p>
            <p class="lv-headline">${head}</p>
            ${r.mode === 'level' && after.f > before ? `<div class="lv-painted"><div class="lv-poster" style="--paint:${after.f}">${FL.planetPoster({ ...world, paint: after }, { stars: false })}</div>
              <p>${after.f >= 1 ? B('整颗星球都上了颜色！主页上它的星星亮了。', 'The whole world is painted! Its star now shines on the home sky.') : B('星球又多了一层颜色。', 'The world has a little more colour.')}</p></div>` : ''}
          </div>
          ${wrong.length ? `<h4>${B('错在哪里，去复习什么', 'What went wrong, and what to review')}</h4><ul class="lv-causes">${Object.entries(causes).map(([t, xs]) => causeCard(t, xs)).join('')}</ul>` : `<p class="lv-perfect" lang="fr">Aucune faute.</p>`}
          ${accents.length ? `<p class="lv-accents">${B('重音要注意：', 'Mind the accents:')} ${accents.map(x => `<b lang="fr">${esc(clean(x.q.w.fr))}</b>`).join(' · ')}</p>` : ''}
          <div class="lv-actions">
            ${wrong.filter(x => x.q.w).length ? `<button type="button" class="btn primary" data-lv="retry">${B(`只练错题（${wrong.filter(x => x.q.w).length}）`, `Practise the mistakes (${wrong.filter(x => x.q.w).length})`)}</button>` : ''}
            ${r.mode === 'level' ? `<button type="button" class="btn ${pass ? 'ghost' : 'primary'}" data-lv="again">${B('再挑战一次', 'Try again')}</button>` : `<button type="button" class="btn ghost" data-lv="back">${B('回到这一关', 'Back to the level')}</button>`}
            ${r.mode === 'level' && pass && nextLevel ? `<button type="button" class="btn primary" data-lv="start" data-id="${nextLevel.id}">${B('下一关', 'Next level')} →</button>` : ''}
            ${after.f > before || after.sprouts < beforeP.sprouts ? `<button type="button" class="btn ghost" data-review="chapter" data-id="ouverture">✦ ${after.f > before ? B('去看星球上色', 'Watch the world being painted') : B('去看树苗被拔掉', 'Watch the sprouts go')}</button>` : ''}
          </div>
        </div>`;
      run.done = true;
      if (r.mode === 'level' && pass && !FL.reducedMotion) right.querySelector('.lv-result').classList.add('lv-cheer');
    }

    /* events */
    left.addEventListener('click', e => {
      const b = e.target.closest('[data-level]');
      if (b) { intro(levels.find(l => l.id === b.dataset.level)); if (showStage) showStage(); }
      if (e.target.closest('[data-lv="baobab"]')) {
        const all = d.groups.flatMap(g => g.words.map(w => ({ ...w, group: g.id })));
        const due = Object.entries(st.baobabs).filter(([, v]) => v.day !== day()).map(([k]) => k);
        const words = FL.shuffle(all.filter(w => due.includes(`${w.group}|${w.fr}`))).slice(0, N);
        if (words.length) { start(levels[levels.length - 1], words, 'baobab'); if (showStage) showStage(); }
      }
    });
    right.addEventListener('click', e => {
      const o = e.target.closest('[data-pick]');
      if (o && run && !run.done) return answer(+o.dataset.pick);
      const ch = e.target.closest('[data-ch]');
      if (ch) { const i = right.querySelector('.lv-input'); if (i) { i.setRangeText(ch.dataset.ch, i.selectionStart, i.selectionEnd, 'end'); i.focus(); } return; }
      const rv = e.target.closest('[data-review]');
      if (rv && review) return review(rv.dataset.review, rv.dataset.id);
      const a = e.target.closest('[data-lv]');
      if (!a) return;
      const act = a.dataset.lv;
      if (act === 'start') start(levels.find(l => l.id === a.dataset.id));
      if (act === 'hear' && run) FL.speak(run.qs[run.i].say);
      if (act === 'check') answer(right.querySelector('.lv-input').value);
      if (act === 'skip') answer('');
      if (act === 'next') next();
      if (act === 'quit' || act === 'back') { const l = run.l; run = null; intro(l); }
      if (act === 'again') start(run.l);
      if (act === 'retry') start(run.l, run.res.filter(x => !x.ok && x.q.w).map(x => x.q.w), 'retry');
    });
    right.addEventListener('keydown', e => {
      if (!run || run.done) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (run.res.length > run.i) next();
        else if (e.target.matches('.lv-input')) answer(e.target.value);
      } else if (/^[1-4]$/.test(e.key) && !e.target.matches('input') && run.res.length === run.i && run.qs[run.i].options) answer(+e.key - 1);
    });

    drawMap();
    welcome();
  }

  const SPROUT = `<svg viewBox="0 0 40 40" class="lv-sprout" aria-hidden="true"><g stroke="#2b2436" stroke-width="1.5" stroke-linecap="round" filter="url(#fl-wob)"><path d="M20 36 V18" fill="none"/><path d="M20 22 Q10 20 8 11 Q17 11 20 20 Z" fill="#8fae7a"/><path d="M20 19 Q28 14 33 7 Q24 6 20 17 Z" fill="#a9c48f"/><path d="M8 36 H32" fill="none"/></g></svg>`;

  FL.Levels = { mount, paint, load };
})();
