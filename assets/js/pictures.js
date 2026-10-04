/* pictures.js — small ink-and-watercolor pictures for vocabulary, drawn as SVG
   in the same hand as the little worlds: a soft wash behind, a wobbly ink line on top,
   and the same cone-shaped people who live on the planets.

   A topic registers a drawer:  FL.pictures[topicId] = (word, groupId) => inner SVG or ''.
   FL.pic(word, groupId, topicId) wraps it in a 64×64 frame (or returns '' when there is none). */
(function () {
  const FL = window.FL;
  FL.pictures = FL.pictures || {};

  const INK = '#2b2436';
  const C = {
    ink: INK, paper: '#fbf6ea', gold: '#e3c77e', sun: '#f1c75b', red: '#c8594b', rose: '#e9a3a0',
    blue: '#8fb3d9', navy: '#3e5a8a', green: '#8fae7a', leaf: '#c98a3a', plum: '#8a5a86',
    lilac: '#cbb7d6', sky: '#cfdcea', skin: '#f3dcc0', grey: '#b9b2a6', night: '#3a3f66', sand: '#e8cfa2',
  };
  FL.PIC_COLORS = C;

  // one shared set of filters for every picture on the page
  function defs() {
    if (document.getElementById('fl-pic-defs')) return;
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.id = 'fl-pic-defs';
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    s.innerHTML = `
      <filter id="fl-wob" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="fl-wash" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="8" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feGaussianBlur in="d" stdDeviation=".5"/>
      </filter>`;
    document.body.appendChild(s);
  }
  if (document.body) defs(); else document.addEventListener('DOMContentLoaded', defs);

  /* ---------- the kit: each returns SVG markup in a 64×64 box ---------- */
  const K = {
    // a soft watercolor blot behind the drawing
    wash: (color = C.sky, cx = 32, cy = 34, r = 25) =>
      `<g filter="url(#fl-wash)" opacity=".45"><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.86}" fill="${color}"/></g>`,
    ink: (inner, w = 1.6) => `<g filter="url(#fl-wob)" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`,
    text: (x, y, t, { size = 11, fill = INK, italic = true, weight = 600, anchor = 'middle', font = 'Cormorant Garamond, Georgia, serif' } = {}) =>
      `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${font}" font-size="${size}" font-weight="${weight}" ${italic ? 'font-style="italic"' : ''} fill="${fill}" stroke="none">${FL.esc(String(t))}</text>`,

    // the planets' people: a cone coat, a round head, an optional hat
    person: (x, y, { coat = C.blue, s = 1, hat = null, hl = false, dim = false, hair = null } = {}) => {
      const g = `<g transform="translate(${x} ${y}) scale(${s})" opacity="${dim ? 0.35 : 1}">
        ${hl ? `<g filter="url(#fl-wash)" opacity=".55"><circle cx="0" cy="-13" r="13" fill="${C.sun}"/></g>` : ''}
        <path d="M-6 0 L0 -17 L6 0 Z" fill="${coat}"/>
        <circle cx="0" cy="-20" r="4.2" fill="${C.skin}"/>
        ${hair ? `<path d="M-4.2 -20.5 A4.2 4.2 0 0 1 4.2 -20.5 Z" fill="${hair}"/>` : ''}
        ${hat === 'top' ? `<path d="M-5.5 -23.5 H5.5 M-3 -23.5 V-29 H3 V-23.5" fill="${INK}"/>` : ''}
        ${hat === 'beret' ? `<ellipse cx="1" cy="-24" rx="5" ry="1.6" fill="${C.red}"/>` : ''}
        ${hat === 'plume' ? `<path d="M-3 -23.5 V-29 H3 V-23.5 Z" fill="${INK}"/><path d="M2 -28 Q6 -33 8 -30" fill="none"/>` : ''}
      </g>`;
      return g;
    },
    arrow: (x1, y1, x2, y2, { color = INK, w = 1.6, dash = '' } = {}) => {
      const a = Math.atan2(y2 - y1, x2 - x1), h = 4;
      const p1 = [x2 - h * Math.cos(a - 0.5), y2 - h * Math.sin(a - 0.5)], p2 = [x2 - h * Math.cos(a + 0.5), y2 - h * Math.sin(a + 0.5)];
      return `<g stroke="${color}" stroke-width="${w}" fill="none" ${dash ? `stroke-dasharray="${dash}"` : ''}><path d="M${x1} ${y1} L${x2} ${y2}"/><path d="M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${x2} ${y2} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}" stroke-dasharray="none"/></g>`;
    },
    curve: (x1, y1, cx, cy, x2, y2, { color = INK, w = 1.6 } = {}) => {
      const a = Math.atan2(y2 - cy, x2 - cx), h = 4;
      return `<g stroke="${color}" stroke-width="${w}" fill="none"><path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}"/><path d="M${(x2 - h * Math.cos(a - 0.5)).toFixed(1)} ${(y2 - h * Math.sin(a - 0.5)).toFixed(1)} L${x2} ${y2} L${(x2 - h * Math.cos(a + 0.5)).toFixed(1)} ${(y2 - h * Math.sin(a + 0.5)).toFixed(1)}"/></g>`;
    },
    star: (x, y, r = 5, fill = C.gold) => {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
        d += `${i ? 'L' : 'M'}${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)} `;
      }
      return `<path d="${d}Z" fill="${fill}" stroke-width="1"/>`;
    },
    sun: (x, y, r = 8) => {
      let rays = '';
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        rays += `M${(x + Math.cos(a) * (r + 3)).toFixed(1)} ${(y + Math.sin(a) * (r + 3)).toFixed(1)} L${(x + Math.cos(a) * (r + 7)).toFixed(1)} ${(y + Math.sin(a) * (r + 7)).toFixed(1)} `;
      }
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.sun}"/><path d="${rays}" fill="none"/>`;
    },
    moon: (x, y, r = 9) => `<path d="M${x + r * 0.3} ${y - r} A${r} ${r} 0 1 0 ${x + r * 0.3} ${y + r} A${r * 0.75} ${r * 0.75} 0 1 1 ${x + r * 0.3} ${y - r} Z" fill="${C.gold}"/>`,
    clock: (x, y, r, h, m, { fill = C.paper, wedge = null } = {}) => {
      const ang = d => (d - 90) * Math.PI / 180;
      const ha = ang((h % 12) * 30 + m / 2), ma = ang(m * 6);
      let ticks = '';
      for (let i = 0; i < 12; i++) {
        const a = ang(i * 30), r1 = i % 3 ? r - 2.2 : r - 3.5;
        ticks += `M${(x + Math.cos(a) * r1).toFixed(1)} ${(y + Math.sin(a) * r1).toFixed(1)} L${(x + Math.cos(a) * (r - 0.8)).toFixed(1)} ${(y + Math.sin(a) * (r - 0.8)).toFixed(1)} `;
      }
      // a filled slice from 12 o'clock, for half and quarter hours
      const w = wedge ? (() => {
        const a2 = ang(wedge * 6), big = wedge > 30 ? 1 : 0;
        return `<path d="M${x} ${y} L${x} ${y - r} A${r} ${r} 0 ${big} 1 ${(x + Math.cos(a2) * r).toFixed(1)} ${(y + Math.sin(a2) * r).toFixed(1)} Z" fill="${C.rose}" stroke="none" opacity=".75"/>`;
      })() : '';
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>${w}<path d="${ticks}" stroke-width="1"/>
        <path d="M${x} ${y} L${(x + Math.cos(ha) * r * 0.5).toFixed(1)} ${(y + Math.sin(ha) * r * 0.5).toFixed(1)}" stroke-width="2.2"/>
        <path d="M${x} ${y} L${(x + Math.cos(ma) * r * 0.78).toFixed(1)} ${(y + Math.sin(ma) * r * 0.78).toFixed(1)}" stroke-width="1.5"/>
        <circle cx="${x}" cy="${y}" r="1.4" fill="${C.red}" stroke="none"/>`;
    },
    // a calendar leaf: a red band on top, a big line of text in the middle
    page: (x, y, w, h, { top = '', big = '', band = C.red, fill = C.paper, small = '', bigSize = 15, topSize = 7 } = {}) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}"/>
       <rect x="${x}" y="${y}" width="${w}" height="${Math.min(9, h * 0.26)}" rx="2" fill="${band}"/>
       <path d="M${x + w * 0.3} ${y - 2} V${y + 3} M${x + w * 0.7} ${y - 2} V${y + 3}"/>
       ${top ? K.text(x + w / 2, y + Math.min(9, h * 0.26) - 2, top, { size: topSize, fill: C.paper, italic: false, weight: 700, font: 'EB Garamond, Georgia, serif' }) : ''}
       ${big ? K.text(x + w / 2, y + h * 0.66 + bigSize * 0.25, big, { size: bigSize }) : ''}
       ${small ? K.text(x + w / 2, y + h - 3, small, { size: 6.5, italic: false, weight: 500 }) : ''}`,
    flower: (x, y, s = 1, petal = C.rose) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 V14" fill="none"/><path d="M0 9 Q5 5 8 8 Q4 11 0 9" fill="${C.green}" stroke-width="1"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-5" rx="3.2" ry="5" fill="${petal}" transform="rotate(${a})" stroke-width="1"/>`).join('')}<circle r="2.6" fill="${C.sun}" stroke-width="1"/></g>`,
    leaf: (x, y, s = 1, fill = C.leaf) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(-30)"><path d="M0 -14 Q11 -4 0 14 Q-11 -4 0 -14 Z" fill="${fill}"/><path d="M0 -10 V16" fill="none" stroke-width="1"/></g>`,
    snow: (x, y, r = 11) => {
      let d = '';
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3, ex = x + Math.cos(a) * r, ey = y + Math.sin(a) * r;
        const bx = x + Math.cos(a) * r * 0.6, by = y + Math.sin(a) * r * 0.6;
        d += `M${x} ${y} L${ex.toFixed(1)} ${ey.toFixed(1)} `;
        d += `M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + Math.cos(a + 0.8) * 3.5).toFixed(1)} ${(by + Math.sin(a + 0.8) * 3.5).toFixed(1)} M${bx.toFixed(1)} ${by.toFixed(1)} L${(bx + Math.cos(a - 0.8) * 3.5).toFixed(1)} ${(by + Math.sin(a - 0.8) * 3.5).toFixed(1)} `;
      }
      return `<path d="${d}" fill="none" stroke="${C.navy}"/>`;
    },
    book: (x, y, s = 1, fill = C.navy) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-9 -6 L0 -4 L9 -6 V7 L0 9 L-9 7 Z" fill="${fill}"/><path d="M0 -4 V9" fill="none"/></g>`,
    key: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-5" cy="0" r="4.5" fill="${C.gold}"/><path d="M-0.5 0 H10 M6 0 V4 M9 0 V3" fill="none"/></g>`,
    house: (x, y, s = 1, { door = true } = {}) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-10" y="-12" width="20" height="14" fill="${C.paper}"/><path d="M-13 -12 L0 -23 L13 -12 Z" fill="${C.red}"/>${door ? '<rect x="-2.5" y="-6" width="5" height="8" fill="#ffd98a" stroke-width="1"/>' : ''}</g>`,
    bubble: (x, y, w, h, t, { size = 9 } = {}) => `<path d="M${x} ${y} h${w} v${h} h-${w * 0.55} l-4 5 v-5 h-${w * 0.45} Z" fill="${C.paper}"/>${K.text(x + w / 2, y + h * 0.72, t, { size })}`,
    hand: (x, y, dir = 1) => `<g transform="translate(${x} ${y}) scale(${dir} 1)"><path d="M-8 -3 H4 Q8 -3 8 0 Q8 3 4 3 H-2 M-8 3 H-2 M-8 -3 V3" fill="${C.skin}"/><path d="M4 -3 H14" fill="none"/></g>`,
    pin: (x, y) => `<path d="M${x} ${y} Q${x - 7} ${y - 9} ${x - 6} ${y - 13} A6 6 0 1 1 ${x + 6} ${y - 13} Q${x + 7} ${y - 9} ${x} ${y} Z" fill="${C.red}"/><circle cx="${x}" cy="${y - 13}" r="2.2" fill="${C.paper}"/>`,
    coin: (x, y, r, t, fill = C.gold) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/><circle cx="${x}" cy="${y}" r="${r - 2.5}" fill="none" stroke-width="1"/>${K.text(x, y + r * 0.38, t, { size: r * 1.05, italic: false })}`,
    hills: (y = 50, fill = C.sand) => `<path d="M2 ${y} Q16 ${y - 7} 32 ${y - 1} T62 ${y - 2} V62 H2 Z" fill="${fill}"/>`,
  };
  FL.picKit = K;

  /* ---------- the frame every picture sits in ---------- */
  FL.pic = (w, groupId, topicId, { cls = '' } = {}) => {
    const draw = FL.pictures[topicId];
    if (!draw) return '';
    let inner = '';
    try { inner = draw(w, groupId) || ''; } catch (e) { console.warn('picture', w.fr, e); }
    if (!inner) return '';
    return `<svg class="wpic ${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${inner}</svg>`;
  };
})();
