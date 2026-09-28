/* book.js — the site is a book: a closed cover on a desk that opens into
   two-page spreads you turn (buttons, ← →, or drag the page corner).
   On narrow screens it shows one page at a time.

   FL.Book.mount(el, {
     cover: { html },                      // closed-book cover (front)
     pages: [{ el, chapter, wide?, left? }]  // wide = spans both pages; left = must start on a left page
     chapters: [{ id, fr, zh, en, color }],
     filler: () => HTMLElement,              // page used to pad a spread
     startOpen: false,
   }) */
(function () {
  const FL = window.FL;
  const B = FL.bi;
  const DUR = 750;

  /* ---------- the room behind the book (line drawing) ---------- */
  FL.renderRoom = () => {
    if (document.querySelector('.room')) return;
    const room = document.createElement('div');
    room.className = 'room';
    room.setAttribute('aria-hidden', 'true');
    room.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <filter id="paint" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="3" seed="7" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="d"/>
          <feGaussianBlur in="d" stdDeviation="1.4"/>
        </filter>
        <filter id="haze"><feGaussianBlur stdDeviation="40"/></filter>
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b1d13"/><stop offset=".55" stop-color="#1c130c"/><stop offset="1" stop-color="#0c0805"/></linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16202f"/><stop offset=".7" stop-color="#3a4758"/><stop offset="1" stop-color="#55606a"/></linearGradient>
        <linearGradient id="curtain" x1="0" x2="1">
          <stop offset="0" stop-color="#2a0906"/><stop offset=".14" stop-color="#6e2019"/><stop offset=".26" stop-color="#3a0f0b"/><stop offset=".42" stop-color="#7e2a22"/>
          <stop offset=".58" stop-color="#420f0b"/><stop offset=".74" stop-color="#6a1f18"/><stop offset=".9" stop-color="#2e0a07"/><stop offset="1" stop-color="#1a0604"/>
        </linearGradient>
        <linearGradient id="table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2e18"/><stop offset=".08" stop-color="#2c1a0d"/><stop offset="1" stop-color="#0d0804"/></linearGradient>
        <linearGradient id="cloth" x1="0" x2="1"><stop offset="0" stop-color="#3b3322"/><stop offset=".4" stop-color="#8a7648"/><stop offset=".7" stop-color="#5a4c2e"/><stop offset="1" stop-color="#2a2416"/></linearGradient>
        <linearGradient id="brass" x1="0" x2="1"><stop offset="0" stop-color="#5a3f14"/><stop offset=".4" stop-color="#d8b766"/><stop offset="1" stop-color="#6b4a16"/></linearGradient>
        <linearGradient id="wax" x1="0" x2="1"><stop offset="0" stop-color="#b8a582"/><stop offset=".4" stop-color="#f1e6cc"/><stop offset="1" stop-color="#9d8a68"/></linearGradient>
        <radialGradient id="candle"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset=".35" stop-color="#d9822b" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
        <radialGradient id="moonglow"><stop offset="0" stop-color="#dfe6e8" stop-opacity=".45"/><stop offset="1" stop-color="#dfe6e8" stop-opacity="0"/></radialGradient>
        <radialGradient id="vig" cx=".5" cy=".55" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#wall)"/>
      <g filter="url(#paint)">
        <!-- window with moonlight -->
        <path d="M1150 580 L1150 250 Q1150 140 1270 105 Q1390 140 1390 250 L1390 580 Z" fill="url(#sky)"/>
        <circle cx="1305" cy="245" r="130" fill="url(#moonglow)"/>
        <circle cx="1305" cy="245" r="34" fill="#e6dfc8"/>
        <path d="M1150 580 L1150 250 Q1150 140 1270 105 Q1390 140 1390 250 L1390 580 M1270 105 L1270 580 M1150 390 L1390 390" fill="none" stroke="#1d130b" stroke-width="16"/>
        <path d="M1130 588 L1410 588" stroke="#3a2616" stroke-width="18"/>
        <!-- velvet curtain -->
        <path d="M0 0 L380 0 Q330 260 400 470 Q430 540 360 600 Q320 760 360 900 L0 900 Z" fill="url(#curtain)"/>
        <path d="M330 520 Q390 500 420 540 Q400 580 350 575 Z" fill="#9a7431"/>
        <!-- table and cloth -->
        <rect x="0" y="640" width="1600" height="260" fill="url(#table)"/>
        <path d="M0 640 L1600 640" stroke="#6b4526" stroke-width="3"/>
        <path d="M1060 636 Q1180 626 1330 644 Q1350 760 1420 900 L1000 900 Q1040 770 1060 636 Z" fill="url(#cloth)"/>
        <!-- books -->
        <rect x="150" y="598" width="260" height="42" rx="4" fill="#4a2a16"/><rect x="170" y="560" width="220" height="38" rx="4" fill="#2e3b3a"/><rect x="190" y="528" width="190" height="32" rx="4" fill="#5b2a1f"/>
        <path d="M150 606 L410 606 M170 570 L390 570 M190 538 L380 538" stroke="#b08a4a" stroke-width="2" opacity=".6"/>
        <!-- hourglass -->
        <rect x="1128" y="494" width="116" height="14" rx="3" fill="url(#brass)"/><rect x="1128" y="624" width="116" height="14" rx="3" fill="url(#brass)"/>
        <path d="M1140 508 Q1140 560 1186 566 Q1232 560 1232 508 Z M1140 624 Q1140 572 1186 566 Q1232 572 1232 624 Z" fill="rgba(220,215,200,.14)" stroke="rgba(240,232,210,.35)" stroke-width="2"/>
        <path d="M1160 530 Q1186 552 1212 530 Z" fill="#b9914c"/><path d="M1150 624 Q1186 584 1222 624 Z" fill="#c9a15a"/>
        <line x1="1186" y1="560" x2="1186" y2="610" stroke="#c9a15a" stroke-width="2"/>
        <rect x="1132" y="508" width="6" height="116" fill="url(#brass)"/><rect x="1234" y="508" width="6" height="116" fill="url(#brass)"/>
        <!-- candle in a brass stick -->
        <ellipse cx="560" cy="636" rx="54" ry="9" fill="url(#brass)"/><rect x="552" y="560" width="16" height="76" fill="url(#brass)"/><ellipse cx="560" cy="560" rx="26" ry="6" fill="url(#brass)"/>
        <rect x="548" y="470" width="24" height="90" rx="3" fill="url(#wax)"/>
        <!-- a fallen rose -->
        <path d="M1380 650 q18 -16 36 0 q-4 18 -18 20 q-16 -2 -18 -20 z" fill="#6e1c18"/><path d="M1340 668 L1392 660" stroke="#3b4a2a" stroke-width="3"/>
      </g>
      <path class="flame-c" d="M560 468 Q549 448 560 424 Q571 448 560 468 Z" fill="#ffe1a0"/>
      <circle class="candle-glow" cx="560" cy="450" r="360" fill="url(#candle)"/>
      <rect width="1600" height="900" fill="url(#vig)"/>
    </svg>`;
    document.body.prepend(room);
  };

  /* ---------- the book ---------- */
  FL.Book = {
    mount(root, cfg) {
      let pages = cfg.pages;
      let mode = 0, spreads = [], si = 0, busy = false, open = !!cfg.startOpen;

      root.innerHTML = `
        <div class="book-wrap ${open ? 'is-open' : 'is-closed'}">
          <nav class="tabs" aria-label="Chapitres">${cfg.chapters.map(c =>
            `<button type="button" data-chap="${c.id}" style="--tab:${c.color}"><span lang="fr">${FL.esc(c.fr)}</span><small>${B(c.zh, c.en)}</small></button>`).join('')}</nav>
          <div class="book">
            <div class="book-body">
              <div class="slot left"></div><div class="slot right"></div><div class="slot single"></div><div class="slot wide"></div>
              <div class="gutter"></div>
              <button type="button" class="corner next" aria-label="Page suivante"><span></span></button>
              <button type="button" class="corner prev" aria-label="Page précédente"><span></span></button>
            </div>
            <div class="cover" role="button" tabindex="0" aria-label="Ouvrir le livre">
              <div class="cover-front">${cfg.cover.html}</div>
              <div class="cover-back"><div class="endpaper"></div></div>
            </div>
          </div>
          <div class="book-nav">
            <button type="button" class="round-btn" data-turn="-1" aria-label="Page précédente">‹</button>
            <span class="folio-count"></span>
            <button type="button" class="round-btn" data-turn="1" aria-label="Page suivante">›</button>
          </div>
          <p class="drag-hint">${B('拖动页角翻页 · 也可以用 ← →', 'Drag the corner to turn · or use ← →')}</p>
        </div>`;
      const wrap = root.querySelector('.book-wrap');
      const body = root.querySelector('.book-body');
      const S = {
        left: body.querySelector('.slot.left'), right: body.querySelector('.slot.right'),
        single: body.querySelector('.slot.single'), wide: body.querySelector('.slot.wide'),
      };
      const blank = () => { const d = document.createElement('div'); d.className = 'page blank-page'; return d; };

      /* spreads depend on screen width: 2 pages side by side, or 1 */
      function build() {
        const two = window.matchMedia('(min-width: 900px)').matches;
        const m = two ? 2 : 1;
        if (m === mode && spreads.length) return false;
        const curPage = spreads.length ? firstPage(spreads[si]) : null;
        mode = m;
        wrap.classList.toggle('two', two);
        spreads = [];
        if (!two) pages.filter(p => !p.filler).forEach(p => spreads.push({ single: p }));
        else {
          let pend = null;
          const flush = () => { if (pend) { spreads.push({ left: pend, right: { el: cfg.filler(), filler: true, chapter: pend.chapter } }); pend = null; } };
          pages.forEach(p => {
            if (p.wide) { flush(); spreads.push({ wide: p }); return; }
            if (p.left && pend) flush();
            if (pend) { spreads.push({ left: pend, right: p }); pend = null; } else pend = p;
          });
          flush();
        }
        si = curPage ? Math.max(0, spreads.findIndex(s => [s.left, s.right, s.single, s.wide].includes(curPage))) : 0;
        return true;
      }
      const firstPage = s => s.single || s.wide || s.left;

      function place(slot, p) {
        slot.replaceChildren(p ? p.el : blank());
      }
      function render() {
        const s = spreads[si];
        Object.values(S).forEach(x => x.replaceChildren());
        body.dataset.kind = s.wide ? 'wide' : s.single ? 'single' : 'pair';
        if (s.wide) place(S.wide, s.wide);
        else if (s.single) place(S.single, s.single);
        else { place(S.left, s.left); place(S.right, s.right); }
        const ps = s.single ? [s.single] : s.wide ? [s.wide] : [s.left, s.right];
        const nums = ps.map(p => pages.indexOf(p) + 1).filter(n => n > 0);
        root.querySelector('.folio-count').textContent = `${nums.join('–')} / ${pages.filter(p => !p.filler).length}`;
        const chap = (s.single || s.wide || s.right || s.left).chapter;
        root.querySelectorAll('[data-chap]').forEach(b => b.classList.toggle('on', b.dataset.chap === chap));
        root.querySelector('[data-turn="-1"]').disabled = si === 0;
        root.querySelector('[data-turn="1"]').disabled = si === spreads.length - 1;
        body.classList.toggle('at-start', si === 0);
        body.classList.toggle('at-end', si === spreads.length - 1);
        if (!open) return;
        // let the new page's contents settle in, one line after another
        ps.forEach(p => {
          if (!p || p.el.classList.contains('opening')) return;
          p.el.classList.remove('landing');
          void p.el.offsetWidth;
          p.el.classList.add('landing');
        });
        ps.forEach(p => p && p.onShow && p.onShow());
        if (history.replaceState && chap) history.replaceState(null, '', '#' + chap);
        document.dispatchEvent(new CustomEvent('fl:pageturn'));
      }

      /* the visual side of a spread, as a static copy for the turning leaf */
      function sideCopy(s, side) {
        if (s.wide && mode === 2) {
          // show the matching half of a two-page-wide spread
          const half = document.createElement('div');
          half.className = `page-half ${side}`;
          const c = s.wide.el.cloneNode(true);
          c.classList.remove('landing');
          c.querySelectorAll('[id]:not(clipPath)').forEach(n => n.removeAttribute('id'));
          half.append(c);
          return half;
        }
        let p = null;
        if (s.single) p = s.single;
        else if (!s.wide) p = side === 'left' ? s.left : s.right;
        const c = p ? p.el.cloneNode(true) : blank();
        c.classList.remove('landing');
        c.querySelectorAll('[id]:not(clipPath)').forEach(n => n.removeAttribute('id'));
        c.setAttribute('aria-hidden', 'true');
        return c;
      }

      /* begin a turn to spread `to`; returns a controller driven by progress 0..1 */
      function beginTurn(to) {
        const from = spreads[si], dest = spreads[to];
        const fwd = to > si;
        FL.stopSpeech();
        const leaf = document.createElement('div');
        leaf.className = `leaf ${mode === 1 ? 'leaf-single' : fwd ? 'leaf-next' : 'leaf-prev'}`;
        const front = document.createElement('div'), back = document.createElement('div');
        front.className = 'leaf-face front'; back.className = 'leaf-face back';
        const shade = document.createElement('div'); shade.className = 'leaf-shade';
        leaf.append(front, back, shade);

        if (mode === 1) {
          // single page: the old page lifts away (next) or the new one lands (prev)
          if (fwd) { front.append(sideCopy(from)); place(S.single, dest.single); }
          else { front.append(sideCopy(dest)); }
        } else {
          Object.values(S).forEach(x => x.replaceChildren());
          body.dataset.kind = 'pair';
          if (fwd) {
            front.append(sideCopy(from, 'right')); back.append(sideCopy(dest, 'left'));
            S.left.append(sideCopy(from, 'left')); S.right.append(sideCopy(dest, 'right'));
          } else {
            front.append(sideCopy(from, 'left')); back.append(sideCopy(dest, 'right'));
            S.left.append(sideCopy(dest, 'left')); S.right.append(sideCopy(from, 'right'));
          }
        }
        body.append(leaf);
        const set = p => {
          let deg;
          if (mode === 1) {
            const q = fwd ? p : 1 - p;
            leaf.style.transform = `rotateY(${-100 * q}deg)`;
            leaf.style.opacity = String(1 - q * 0.9);
          } else {
            deg = fwd ? -180 * p : 180 * p;
            leaf.style.transform = `rotateY(${deg}deg)`;
            shade.style.opacity = String(Math.sin(p * Math.PI) * 0.35);
          }
        };
        set(0);
        return {
          set,
          done(commit) {
            leaf.remove();
            if (commit) si = to;
            render();
          },
        };
      }
      const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      function animate(ctrl, from, to, cb) {
        const t0 = performance.now(), dur = DUR * Math.abs(to - from);
        const step = now => {
          const t = Math.min(1, (now - t0) / Math.max(1, dur));
          ctrl.set(from + (to - from) * ease(t));
          if (t < 1) requestAnimationFrame(step); else cb();
        };
        requestAnimationFrame(step);
      }
      function turnTo(to) {
        if (busy || !open || to === si || to < 0 || to >= spreads.length) return;
        busy = true;
        const ctrl = beginTurn(to);
        animate(ctrl, 0, 1, () => { ctrl.done(true); busy = false; });
      }
      const turn = d => turnTo(si + d);
      FL.Book.turn = turn;

      /* drag a corner */
      function dragFrom(e, dir) {
        if (busy || !open) return;
        const to = si + dir;
        if (to < 0 || to >= spreads.length) return;
        e.preventDefault();
        busy = true;
        const ctrl = beginTurn(to);
        const rect = body.getBoundingClientRect();
        const span = mode === 1 ? rect.width : rect.width * 0.9;
        const x0 = e.clientX;
        let p = 0;
        const move = ev => {
          p = Math.max(0, Math.min(1, ((x0 - ev.clientX) * dir) / span));
          ctrl.set(p);
        };
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          const commit = p > 0.25;
          animate(ctrl, p, commit ? 1 : 0, () => { ctrl.done(commit); busy = false; });
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        wrap.classList.add('dragged');
      }
      body.querySelector('.corner.next').addEventListener('pointerdown', e => dragFrom(e, 1));
      body.querySelector('.corner.prev').addEventListener('pointerdown', e => dragFrom(e, -1));
      // a plain click on a corner also turns
      body.querySelector('.corner.next').addEventListener('click', () => { if (!busy) turn(1); });
      body.querySelector('.corner.prev').addEventListener('click', () => { if (!busy) turn(-1); });
      // swipe on phones
      let sx = null, sy = null;
      body.addEventListener('touchstart', e => { if (mode === 1 && !e.target.closest('input, textarea, svg, .card3d, button')) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
      body.addEventListener('touchend', e => {
        if (sx == null) return;
        const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
        sx = null;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) turn(dx < 0 ? 1 : -1);
      });

      root.querySelector('.book-nav').addEventListener('click', e => {
        const b = e.target.closest('[data-turn]');
        if (b) turn(+b.dataset.turn);
      });
      root.querySelector('.tabs').addEventListener('click', e => {
        const b = e.target.closest('[data-chap]');
        if (!b) return;
        const go = () => turnTo(spreads.findIndex(s => (s.single || s.wide || s.left).chapter === b.dataset.chap));
        if (!open) openBook(go); else go();
      });
      document.addEventListener('keydown', e => {
        if (!open || e.target.closest('input, textarea, select, [contenteditable]')) return;
        const s = spreads[si];
        const own = [s.left, s.right, s.single, s.wide].some(p => p && p.ownKeys);
        if (own && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown') turn(1);
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') turn(-1);
      });

      /* opening the cover */
      function openBook(after) {
        if (open) return after && after();
        open = true;
        wrap.classList.remove('is-closed');
        wrap.classList.add('is-opening');
        setTimeout(() => {
          wrap.classList.remove('is-opening');
          wrap.classList.add('is-open');
          render();
          if (after) after();
        }, 1100);
      }
      FL.Book.open = openBook;
      const cover = root.querySelector('.cover');
      cover.addEventListener('click', e => { if (!e.target.closest('a')) openBook(); });
      cover.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBook(); } });

      build();
      const hash = decodeURIComponent(location.hash.slice(1));
      if (hash) {
        const k = spreads.findIndex(s => (s.single || s.wide || s.left).chapter === hash);
        if (k >= 0) { si = k; open = true; wrap.classList.remove('is-closed'); wrap.classList.add('is-open'); }
      }
      render();
      window.addEventListener('resize', () => { if (!busy && build()) render(); });
    },
  };
})();
