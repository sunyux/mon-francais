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
  // a star as a watercolor painter would dot it: five soft points
  const star = (x, y, r, d = 0) => `<path class="wc-star" style="--d:${d}s" d="${Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
    return `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ')}Z"/>`;

  /* ---------- the sky behind the book: a desert night in watercolor ---------- */
  FL.renderRoom = () => {
    if (document.querySelector('.room')) return;
    const room = document.createElement('div');
    room.className = 'room';
    room.setAttribute('aria-hidden', 'true');
    const stars = [[120, 90, 9], [300, 60, 6], [520, 140, 8], [760, 70, 5], [980, 120, 9], [1180, 60, 6], [1400, 150, 8], [1520, 80, 5], [220, 260, 5], [660, 250, 6], [1060, 260, 5], [1300, 300, 7], [420, 360, 4], [880, 380, 5], [1460, 420, 4]]
      .map(([x, y, r], i) => star(x, y, r, (i * 0.37) % 3)).join('');
    room.innerHTML = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <filter id="wc-edge" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="3" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" result="d"/>
          <feGaussianBlur in="d" stdDeviation="2"/>
        </filter>
        <filter id="wc-soft"><feGaussianBlur stdDeviation="28"/></filter>
        <linearGradient id="wc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1c2442"/><stop offset=".55" stop-color="#34436b"/><stop offset=".85" stop-color="#6f7394"/><stop offset="1" stop-color="#b09a9a"/>
        </linearGradient>
        <linearGradient id="wc-dune" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9a97c"/><stop offset="1" stop-color="#8d6f55"/></linearGradient>
        <linearGradient id="wc-dune2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a88a6c"/><stop offset="1" stop-color="#6d5646"/></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#wc-sky)"/>
      <g filter="url(#wc-soft)" opacity=".55">
        <ellipse cx="300" cy="220" rx="260" ry="60" fill="#4a5a86"/><ellipse cx="1250" cy="330" rx="300" ry="70" fill="#56648e"/><ellipse cx="820" cy="140" rx="220" ry="50" fill="#3c4a74"/>
      </g>
      <path class="wc-moon" filter="url(#wc-edge)" d="M1330 124 A46 46 0 1 0 1330 216 A36 46 0 1 1 1330 124 Z" fill="#f3e6bf"/>
      <g filter="url(#wc-edge)">${stars}</g>
      <g filter="url(#wc-edge)">
        <path d="M0 700 Q260 610 560 660 T1100 640 T1600 620 L1600 900 L0 900 Z" fill="url(#wc-dune2)" opacity=".9"/>
        <path d="M0 760 Q340 690 720 740 T1600 720 L1600 900 L0 900 Z" fill="url(#wc-dune)"/>
      </g>
    </svg>`;
    document.body.prepend(room);
  };

  /* ---------- a watercolor portrait of a little world (covers, fallback, turning pages) ---------- */
  const PROP_ART = {
    clocktower: `<rect x="-9" y="-58" width="18" height="58" fill="#ecd9b0"/><path d="M-13 -58 L0 -80 L13 -58 Z" fill="#c8594b"/><circle cy="-40" r="7" fill="#f7efdc" stroke="#2b2436" stroke-width="1.6"/><path d="M0 -40 L0 -45 M0 -40 L3 -38" stroke="#2b2436" stroke-width="1.2"/>`,
    keeper: `<path d="M-7 0 L0 -22 L7 0 Z" fill="#5b7fb5"/><circle cy="-26" r="4.5" fill="#f3dcc0"/><rect x="-3.5" y="-37" width="7" height="8" fill="#3a3350"/><rect x="-6" y="-30" width="12" height="1.6" fill="#3a3350"/><circle cx="9" cy="-9" r="2.4" fill="#ffd98a"/>`,
    lamp: `<rect x="-1.2" y="-34" width="2.4" height="34" fill="#4a4058"/><rect x="-3.5" y="-40" width="7" height="6" fill="#4a4058"/><circle cy="-37" r="7" fill="#ffd98a" opacity=".45"/>`,
    house: `<rect x="-10" y="-15" width="20" height="15" fill="#f0e2c4"/><path d="M-13 -15 L0 -27 L13 -15 Z" fill="#c8594b"/><rect x="-2.5" y="-10" width="5" height="5" fill="#ffd98a"/>`,
    tree: `<rect x="-2" y="-16" width="4" height="16" fill="#8a6a4a"/><circle cy="-24" r="11" fill="#8fae7a"/><circle cx="5" cy="-24" r="2.2" fill="#d9594b"/><circle cx="-4" cy="-19" r="2.2" fill="#d9594b"/>`,
    steps: `<rect x="-18" y="-7" width="8" height="7" fill="#e9c46a"/><rect x="-10" y="-14" width="8" height="14" fill="#8fb3d9"/><rect x="-2" y="-21" width="8" height="21" fill="#e9a3a0"/><rect x="6" y="-28" width="8" height="28" fill="#e9c46a"/>`,
    telescope: `<path d="M-6 0 L0 -16 L6 0 M0 -16 L0 0" stroke="#8a6a4a" stroke-width="1.6" fill="none"/><rect x="-3" y="-22" width="22" height="6" rx="2" fill="#e3c77e" transform="rotate(-35 0 -19)"/>`,
    desk: `<rect x="-11" y="-10" width="22" height="2.5" fill="#a8825a"/><path d="M-9 -8 V0 M9 -8 V0" stroke="#a8825a" stroke-width="1.6"/><path d="M-8 -11 L0 -12.5 L8 -11" stroke="#fbf6ea" stroke-width="2.4" fill="none"/>`,
    counter: `<path d="M-7 0 L0 -22 L7 0 Z" fill="#6f9a86"/><circle cy="-26" r="4.5" fill="#f3dcc0"/><ellipse cx="1" cy="-31" rx="6" ry="1.8" fill="#b5503f"/><rect x="5" y="-14" width="5" height="6" fill="#3e5a8a"/>`,
    starfloat: `<path d="M0 0 V-18" stroke="#8a7f9a" stroke-width=".8"/><path d="M0 -25 L1.6 -20.5 L6 -20.5 L2.4 -17.6 L3.7 -13 L0 -15.8 L-3.7 -13 L-2.4 -17.6 L-6 -20.5 L-1.6 -20.5 Z" fill="#f6e3a3"/>`,
    sign: `<rect x="-1" y="-24" width="2" height="24" fill="#8a6a4a"/><rect x="0" y="-22" width="14" height="4" fill="#f0e2c4"/><rect x="-12" y="-15" width="12" height="4" fill="#f0e2c4"/>`,
    flower: `<rect x="-.6" y="-8" width="1.2" height="8" fill="#4f6f47"/><circle cy="-9" r="2.4" fill="#e9a3a0"/>`,
    grass: `<path d="M-3 0 L-2 -6 L-1 0 M1 0 L2 -8 L3 0" stroke="#4f6f47" stroke-width="1.2" fill="none"/>`,
  };
  let posterN = 0;
  FL.planetPoster = (world, { stars = true } = {}) => {
    const id = `pp${++posterN}`;
    const cx = 150, cy = 178, R = 104;
    // props on the visible top arc, placed by longitude
    const art = (world.props || []).filter(p => p[1] > 5).map(([type, , lon, s = 1]) => {
      const a = Math.max(-62, Math.min(62, (lon - 90) * 0.6));
      const rad = (a * Math.PI) / 180;
      const x = cx + Math.sin(rad) * (R - 2), y = cy - Math.cos(rad) * (R - 2);
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)}) scale(${s})">${PROP_ART[type] || ''}</g>`;
    }).join('');
    return `<svg viewBox="0 0 300 300" class="planet-poster" role="img" aria-label="${FL.esc(world.fr)}">
      <defs>
        <filter id="${id}e" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="${posterN}" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <radialGradient id="${id}g" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${world.ground}"/><stop offset=".7" stop-color="${world.ground}"/><stop offset="1" stop-color="${world.shade}"/></radialGradient>
      </defs>
      ${stars ? `<g opacity=".8" filter="url(#${id}e)">${star(40, 50, 6)}${star(250, 40, 5)}${star(268, 150, 4)}${star(30, 170, 4)}${star(210, 280, 3)}</g>` : ''}
      <g filter="url(#${id}e)">
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}g)"/>
        <circle cx="${cx - 30}" cy="${cy - 28}" r="${R * 0.42}" fill="#fff" opacity=".12"/>
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#2b2436" stroke-width="2.2"/>
        ${art}
      </g>
    </svg>`;
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
          c.querySelectorAll('.has-planet').forEach(n => n.classList.remove('has-planet')); // a canvas copies blank: show the poster
          c.querySelectorAll('[id]:not(clipPath)').forEach(n => n.removeAttribute('id'));
          half.append(c);
          return half;
        }
        let p = null;
        if (s.single) p = s.single;
        else if (!s.wide) p = side === 'left' ? s.left : s.right;
        const c = p ? p.el.cloneNode(true) : blank();
        c.classList.remove('landing');
        c.querySelectorAll('.has-planet').forEach(n => n.classList.remove('has-planet'));
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
