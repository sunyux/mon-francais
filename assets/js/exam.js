/* exam.js — site-wide end-of-topic test ("Contrôle").
   Every vocabulary word of the topic is asked exactly once, in random order.
   Sound is optional: a listen button per question, never autoplay.
   No feedback until the end; then a score, a per-group breakdown and the mistakes.

   FL.Exam.mount(el, { id, groups:[{ id, title:{fr,zh,en}, words:[{fr,zh,en,alt?}] }] }) */
(function () {
  const FL = window.FL;
  const B = FL.bi;
  const esc = FL.esc;
  const ACCENTS = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'û', 'ù', 'œ', "'"];
  const FORMATS = [
    { id: 'choose', zh: '选择题', en: 'Multiple choice' },
    { id: 'write', zh: '默写', en: 'Write it' },
    { id: 'mixed', zh: '混合', en: 'Mixed' },
  ];

  // how the grade reads, the way a French teacher would write it on the paper
  function mention(pct) {
    if (pct >= 0.95) return { fr: 'Excellent', zh: '优秀', en: 'Excellent' };
    if (pct >= 0.8) return { fr: 'Très bien', zh: '很好', en: 'Very good' };
    if (pct >= 0.65) return { fr: 'Bien', zh: '良好', en: 'Good' };
    if (pct >= 0.5) return { fr: 'Assez bien', zh: '及格', en: 'Fair' };
    return { fr: 'À revoir', zh: '需要复习', en: 'Needs review' };
  }

  function mount(el, cfg) {
    const all = cfg.groups.flatMap(g => g.words.map(w => ({ ...w, group: g.id })));
    // words that share a meaning (chaque année / tous les ans) are all correct answers
    const sameMeaning = (a, b) => a.zh === b.zh && a.en === b.en;
    const synonyms = w => all.filter(x => sameMeaning(x, w));
    const groupTitle = id => (cfg.groups.find(g => g.id === id) || { title: { fr: '' } }).title;
    const bestKey = `exam:${cfg.id}:best`;
    let format = FL.store.get('exam:format', 'mixed');
    let qs = [], qi = 0;

    /* ---------- start ---------- */
    function start() {
      const best = FL.store.get(bestKey, null);
      el.innerHTML = `
        <div class="ex-start">
          <p class="ex-kicker" lang="fr">Contrôle de vocabulaire</p>
          <p class="ex-count"><b>${all.length}</b> ${B('个词，每个考一次，顺序随机', 'words, each asked once, in random order')}</p>
          <ul class="ex-rules">
            <li>${B('答题时不会显示对错，最后统一出成绩。', 'No right/wrong until the end — then you get the full result.')}</li>
            <li>${B('想听发音就点「听发音」，不会自动播放。', 'Press “Listen” to hear the word — nothing plays on its own.')}</li>
          </ul>
          <div class="ex-format">
            <span class="ex-label">${B('题型', 'Format')}</span>
            <div class="seg" role="group">${FORMATS.map(f => `<button type="button" data-format="${f.id}" class="${f.id === format ? 'on' : ''}">${B(f.zh, f.en)}</button>`).join('')}</div>
          </div>
          ${best ? `<p class="ex-best">${B('最好成绩', 'Best so far')}: <b>${best.score} / ${best.total}</b></p>` : ''}
          <button type="button" class="btn primary ex-go" data-ex="go">${B('开始测试', 'Begin the test')} →</button>
        </div>`;
      el.querySelector('.ex-go').focus({ preventScroll: true });
    }

    function build(words) {
      qs = FL.shuffle(words).map((w, i) => {
        const kind = format === 'mixed' ? (i % 2 ? 'write' : 'choose') : format;
        const q = { w, kind, answer: null, correct: false, accentOnly: false, heard: false };
        if (kind === 'choose') {
          // distractors from the same group first, so the choice is a real one
          const seen = new Set([w.fr]);
          const pool = [...FL.shuffle(all.filter(x => x.group === w.group)), ...FL.shuffle(all.filter(x => x.group !== w.group))];
          const opts = [w];
          for (const x of pool) {
            if (!seen.has(x.fr) && !sameMeaning(x, w)) { seen.add(x.fr); opts.push(x); }
            if (opts.length === 4) break;
          }
          q.options = FL.shuffle(opts);
        }
        return q;
      });
      qi = 0;
      ask();
    }

    /* ---------- one question ---------- */
    function ask() {
      if (qi >= qs.length) return finish();
      const q = qs[qi];
      const pct = (qi / qs.length) * 100;
      el.innerHTML = `
        <div class="ex-q">
          <div class="ex-top">
            <span class="ex-num">${qi + 1} / ${qs.length}</span>
            <span class="ex-group" lang="fr">${esc(groupTitle(q.w.group).fr)}</span>
            <button type="button" class="ex-stop" data-ex="stop">${B('结束测试', 'End test')}</button>
          </div>
          <div class="progress thin"><div class="bar"><i style="width:${pct}%"></i></div></div>
          <p class="q-label">${q.kind === 'choose' ? B('选出对应的法语', 'Choose the French') : B('写出法语', 'Write it in French')}</p>
          ${FL.pic ? FL.pic(q.w, q.w.group, cfg.id, { cls: 'q-pic' }) : ''}
          <div class="ex-prompt">${FL.m(q.w)}</div>
          <button type="button" class="btn ghost ex-listen" data-ex="listen" aria-label="Écouter le mot">${FL.ICON_SPEAKER} ${B('听发音', 'Listen')}</button>
          ${q.kind === 'choose'
            ? `<div class="q-opts">${q.options.map((o, k) => `<button type="button" class="q-opt" data-pick="${k}"><kbd>${k + 1}</kbd><span lang="fr">${esc(FL.cleanFr(o.fr))}</span></button>`).join('')}</div>`
            : `<input class="ty-input ex-input" lang="fr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Tapez ici…" aria-label="Votre réponse">
               <div class="accent-bar">${ACCENTS.map(c => `<button type="button" data-ch="${esc(c)}" tabindex="-1">${esc(c)}</button>`).join('')}</div>
               <div class="ex-actions">
                 <button type="button" class="btn ghost" data-ex="skip">${B('不会，跳过', 'Skip')}</button>
                 <button type="button" class="btn primary" data-ex="submit">${B('下一题', 'Next')} ⏎</button>
               </div>`}
        </div>`;
      const input = el.querySelector('.ex-input');
      if (input) {
        input.focus({ preventScroll: true });
        input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(input.value); } });
      }
    }

    function grade(q, value) {
      q.answer = value;
      const answers = synonyms(q.w).flatMap(x => [x.fr, ...(x.alt || [])]).map(FL.cleanFr);
      q.correct = answers.some(a => FL.norm(a, false) === FL.norm(value, false));
      // right letters, wrong accents: counted, but flagged in the results
      if (!q.correct && value && answers.some(a => FL.norm(a, true) === FL.norm(value, true))) { q.correct = true; q.accentOnly = true; }
    }
    function submit(value) {
      grade(qs[qi], value.trim());
      qi++;
      ask();
    }
    function pick(k) {
      const q = qs[qi];
      const btn = el.querySelector(`[data-pick="${k}"]`);
      el.querySelectorAll('.q-opt').forEach(b => { b.disabled = true; });
      btn.classList.add('chosen');
      grade(q, FL.cleanFr(q.options[k].fr));
      setTimeout(() => { qi++; ask(); }, 280);
    }

    /* ---------- results ---------- */
    function finish() {
      // ended early: grade only what was answered, and say how many were left
      const done = qs.filter(q => q.answer !== null);
      const left = qs.length - done.length;
      const total = done.length;
      const score = done.filter(q => q.correct).length;
      const pct = total ? score / total : 0;
      const m = mention(pct);
      const best = FL.store.get(bestKey, null);
      if (!left && (!best || score > best.score || total > best.total)) FL.store.set(bestKey, { score, total });
      const wrong = done.filter(q => !q.correct);
      const accents = done.filter(q => q.accentOnly);
      const byGroup = cfg.groups.map(g => {
        const gq = done.filter(q => q.w.group === g.id);
        return { g, n: gq.length, ok: gq.filter(q => q.correct).length };
      }).filter(x => x.n);
      const row = q => `
        <li class="ex-miss">
          <span class="mean">${FL.m(q.w)}</span>
          <span class="ex-yours">${q.answer ? `<s lang="fr">${esc(q.answer)}</s>` : `<em>${B('跳过', 'skipped')}</em>`}</span>
          <span class="ex-right" lang="fr">${esc(FL.cleanFr(q.w.fr))}</span>
          ${FL.sayBtn(q.w.fr, 'tiny')}
          ${q.heard ? `<small class="ex-heard">${B('听过', 'heard')}</small>` : ''}
        </li>`;
      el.innerHTML = `
        <div class="ex-result">
          <div class="ex-score">
            <p class="ex-mention" lang="fr">${m.fr}</p>
            <p class="ex-big"><b>${score}</b> / ${total}</p>
            <p class="ex-pct">${Math.round(pct * 100)} % · ${B(m.zh, m.en)}${left ? ` · ${B(`提前结束，${left} 题未作答`, `ended early, ${left} not asked`)}` : ''}</p>
          </div>
          <div class="ex-groups">${byGroup.map(x => `
            <div class="ex-grow"><span lang="fr">${esc(x.g.title.fr)}</span>
              <span class="ex-gbar"><i style="width:${(x.ok / x.n) * 100}%"></i></span><span class="ex-gnum">${x.ok}/${x.n}</span></div>`).join('')}
          </div>
          ${wrong.length ? `<h3 class="ex-h">${B('错题', 'Mistakes')} <small>(${wrong.length})</small></h3><ul class="ex-list">${wrong.map(row).join('')}</ul>` : `<p class="ex-perfect" lang="fr">Aucune faute.</p>`}
          ${accents.length ? `<h3 class="ex-h">${B('注意重音', 'Watch the accents')} <small>(${accents.length})</small></h3><ul class="ex-list">${accents.map(row).join('')}</ul>` : ''}
          <div class="ex-actions">
            ${wrong.length ? `<button type="button" class="btn primary" data-ex="retry">${B('只重考错题', 'Retake mistakes')} (${wrong.length})</button>` : ''}
            <button type="button" class="btn ghost" data-ex="restart">${B('重新开始', 'Start over')}</button>
          </div>
        </div>`;
      FL.markVerbs(el);
    }

    /* ---------- events ---------- */
    el.addEventListener('mousedown', e => { if (e.target.closest('[data-ch]')) e.preventDefault(); });
    el.addEventListener('click', e => {
      const ch = e.target.closest('[data-ch]');
      if (ch) {
        const input = el.querySelector('.ex-input');
        const s = input.selectionStart ?? input.value.length;
        input.setRangeText(ch.dataset.ch, s, input.selectionEnd ?? s, 'end');
        input.focus();
        return;
      }
      const f = e.target.closest('[data-format]');
      if (f) {
        format = f.dataset.format; FL.store.set('exam:format', format);
        el.querySelectorAll('[data-format]').forEach(b => b.classList.toggle('on', b === f));
        return;
      }
      const p = e.target.closest('[data-pick]');
      if (p && !p.disabled) return pick(+p.dataset.pick);
      const a = e.target.closest('[data-ex]');
      if (!a) return;
      const act = a.dataset.ex;
      if (act === 'go') build(all);
      if (act === 'listen') { qs[qi].heard = true; FL.speak(qs[qi].w.fr); }
      if (act === 'submit') submit(el.querySelector('.ex-input').value);
      if (act === 'skip') submit('');
      if (act === 'stop') finish();
      if (act === 'retry') build(qs.filter(q => q.answer !== null && !q.correct).map(q => q.w)); // answered wrong only, not the unasked
      if (act === 'restart') start();
    });
    document.addEventListener('keydown', e => {
      if (!el.isConnected || e.target.closest('input, textarea, select')) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (/^[1-4]$/.test(e.key) && el.querySelector('[data-pick]:not(:disabled)')) pick(+e.key - 1);
    });

    start();
  }

  FL.Exam = { mount };
})();
