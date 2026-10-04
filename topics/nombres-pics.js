/* Pictures for Les nombres. Cardinals draw themselves from their value:
   stars up to ten, a ten-frame up to twenty, ten-sticks and stars up to 99,
   and squares of a hundred / boxes of a thousand beyond. */
(function () {
  const FL = window.FL, K = FL.picKit, C = FL.PIC_COLORS;
  const { wash, ink, text } = K;

  const valueOf = w => {
    const m = /^([\d ]+)\s/.exec(w.zh);
    return m ? +m[1].replace(/\s/g, '') : null;
  };
  // n stars in a dice-like arrangement (n ≤ 10)
  const DICE = {
    0: [], 1: [[32, 32]], 2: [[22, 32], [42, 32]], 3: [[20, 40], [32, 24], [44, 40]],
    4: [[22, 22], [42, 22], [22, 42], [42, 42]], 5: [[20, 20], [44, 20], [32, 32], [20, 44], [44, 44]],
  };
  const starsN = n => {
    if (DICE[n]) return DICE[n].map(([x, y]) => K.star(x, y, 7)).join('');
    // two rows of up to five
    const top = Math.ceil(n / 2), out = [];
    for (let i = 0; i < n; i++) {
      const row = i < top ? 0 : 1, col = row ? i - top : i, cnt = row ? n - top : top;
      out.push(K.star(32 + (col - (cnt - 1) / 2) * 11, row ? 42 : 24, 5));
    }
    return out.join('');
  };
  // a full ten as a stick of beads
  const stick = (x, y0 = 10, h = 44) => `<rect x="${x - 2.5}" y="${y0}" width="5" height="${h}" rx="2.5" fill="${C.blue}" stroke-width="1"/>` +
    Array.from({ length: 9 }, (_, i) => `<path d="M${x - 2.5} ${(y0 + (h / 10) * (i + 1)).toFixed(1)} h5" stroke-width=".6"/>`).join('');
  function cardinal(n) {
    if (n === 0) return wash(C.sky) + ink(`<ellipse cx="32" cy="32" rx="13" ry="18" fill="none" stroke-dasharray="3 3"/>`);
    if (n <= 10) return wash(C.sky) + ink(starsN(n));
    if (n <= 20) {
      // a ten-frame (two rows of five) filled, then the rest below
      let s = '';
      for (let i = 0; i < 10; i++) s += `<rect x="${7 + (i % 5) * 10}" y="${8 + Math.floor(i / 5) * 10}" width="10" height="10" fill="none" stroke-width=".8"/>` + K.star(12 + (i % 5) * 10, 13 + Math.floor(i / 5) * 10, 3.6);
      for (let i = 0; i < n - 10; i++) s += K.star(12 + (i % 5) * 10, 38 + Math.floor(i / 5) * 10, 3.6, C.rose);
      return wash(C.sky) + ink(s);
    }
    if (n < 100) {
      // tens as sticks, grouped the way French says them:
      // 70–79 = soixante + dix…  (six blue, then a rose ten)
      // 80–99 = quatre-vingts    (four bundles of two, then a rose ten for 90–99)
      const tens = Math.floor(n / 10), units = n % 10;
      const twenties = n >= 80, sixty = n >= 70 && n < 80;
      let s = '', x = 6;
      for (let i = 0; i < tens; i++) {
        const extra = (sixty && i === 6) || (twenties && i === 8);
        if (twenties && i > 0 && i % 2 === 0 && i < 8) x += 2.5; // a gap between bundles of twenty
        if (extra) x += 2.5;
        s += `<rect x="${x}" y="8" width="4" height="36" rx="2" fill="${extra ? C.rose : C.blue}" stroke-width=".9"/>`;
        x += 5.2;
      }
      const ux = Math.max(x + 3, 30);
      for (let i = 0; i < units; i++) s += K.star(ux + (i % 2) * 7, 12 + Math.floor(i / 2) * 7.5, 3, C.gold);
      const how = n >= 70 && n < 80 ? `60 + ${n - 60}` : n >= 80 ? `4×20${n > 80 ? ` + ${n - 80}` : ''}` : n;
      return wash(C.sky) + ink(s + text(32, 58, how, { size: 10 }));
    }
    if (n < 1000) {
      const h = Math.floor(n / 100), rest = n % 100;
      let s = '';
      for (let i = 0; i < h; i++) s += `<rect x="${6 + i * 6}" y="${10 + i * 4}" width="26" height="26" fill="${C.gold}" stroke-width="1"/><path d="M${6 + i * 6} ${23 + i * 4} h26 M${19 + i * 6} ${10 + i * 4} v26" stroke-width=".5"/>`;
      if (rest) s += stick(48, 12, 28) + K.star(56, 50, 4, C.rose) + text(50, 58, `+${rest}`, { size: 8 });
      return wash(C.gold) + ink(s + text(20, 56, n, { size: 11 }));
    }
    // big numbers: the digits written out, with the groups of three marked
    const groups = n.toLocaleString('fr-FR').split(/\s| | /);
    const size = groups.length > 3 ? 7.4 : groups.length > 2 ? 9 : 12;
    const t = groups.map((gp, i) => `<tspan fill="${i % 2 ? C.navy : C.ink}">${gp}</tspan>`).join(' ');
    return wash(C.lilac) + ink(`<text x="32" y="38" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="${size}" font-weight="700" stroke="none">${t}</text>`
      + groups.map((_, i) => K.star(32 + (i - (groups.length - 1) / 2) * 9, 16, 3)).join(''));
  }
  // a little podium / a queue of people, the nth one lit
  function ordinal(n, fem) {
    if (n > 5) {
      return wash(C.gold) + ink(`<rect x="10" y="12" width="44" height="40" rx="3" fill="${C.paper}"/>` + text(32, 40, `${n}${n === 1 ? (fem ? 're' : 'er') : 'e'}`, { size: 18 }) + K.star(48, 18, 4));
    }
    let s = '';
    for (let i = 0; i < 5; i++) s += K.person(9 + i * 11.5, 52, { coat: i + 1 === n ? (fem ? C.plum : C.red) : C.grey, s: 0.9, hl: i + 1 === n, dim: i + 1 !== n });
    return wash(C.gold) + ink(`<path d="M2 52 H62" fill="none"/>` + s + text(9 + (n - 1) * 11.5, 61, `${n}${n === 1 ? (fem ? 're' : 'er') : 'e'}`, { size: 8 }));
  }
  const ORD = { premier: [1], 'première': [1, true], 'deuxième': [2], 'troisième': [3], 'quatrième': [4], 'cinquième': [5], 'neuvième': [9], 'dixième': [10], 'vingt et unième': [21], 'centième': [100] };
  // an operation drawn with stars: a ○ b
  const sum = (a, op, b, res) => wash(C.sky) + ink(
    Array.from({ length: a }, (_, i) => K.star(10 + (i % 2) * 8, 22 + Math.floor(i / 2) * 9, 3.4)).join('') +
    text(30, 32, op, { size: 14, italic: false }) +
    Array.from({ length: b }, (_, i) => K.star(40 + (i % 2) * 8, 22 + Math.floor(i / 2) * 9, 3.4, C.rose)).join('') +
    (res != null ? text(32, 58, res, { size: 10 }) : ''));

  FL.pictures.nombres = (w, g) => {
    const f = w.fr;
    if (['zero-dix', 'onze-vingt', 'dizaines', 'soixante-dix', 'grands'].includes(g)) {
      const n = valueOf(w);
      return n == null ? '' : cardinal(n);
    }
    if (ORD[f]) return ordinal(ORD[f][0], ORD[f][1]);
    switch (f) {
      case 'dernier': {
        let s = '';
        for (let i = 0; i < 5; i++) s += K.person(9 + i * 11.5, 52, { coat: i === 4 ? C.navy : C.grey, s: 0.9, hl: i === 4, dim: i !== 4 });
        return wash(C.gold) + ink(`<path d="M2 52 H62" fill="none"/>` + s + K.arrow(32, 8, 52, 8, { w: 1.2 }));
      }
      case 'plus': return sum(2, '+', 3, '= 5');
      case 'moins': return wash(C.sky) + ink(Array.from({ length: 5 }, (_, i) => K.star(12 + i * 10, 26, 4, i > 2 ? C.paper : C.gold) + (i > 2 ? `<path d="M${7 + i * 10} 31 L${17 + i * 10} 21" stroke="${C.red}"/>` : '')).join('') + text(32, 52, '5 − 2 = 3', { size: 10 }));
      case 'fois': return wash(C.sky) + ink(Array.from({ length: 6 }, (_, i) => K.star(14 + (i % 3) * 12, 18 + Math.floor(i / 3) * 14, 4.4)).join('') + text(32, 58, '2 × 3 = 6', { size: 10 }));
      case 'divisé par': return wash(C.sky) + ink(`<path d="M32 8 V44" stroke-dasharray="2 2"/>` + Array.from({ length: 6 }, (_, i) => K.star(i < 3 ? 18 : 46, 14 + (i % 3) * 11, 4, i < 3 ? C.gold : C.rose)).join('') + text(32, 58, '6 ÷ 2 = 3', { size: 10 }));
      case 'égale': return wash(C.green) + ink(`<path d="M10 30 h44 M10 40 h44" stroke-width="3"/>`);
      case 'une addition': return sum(3, '+', 2, '3 + 2');
      case 'une soustraction': return wash(C.sky) + ink(text(32, 38, '7 − 4', { size: 16 }));
      case 'une multiplication': return wash(C.sky) + ink(text(32, 38, '6 × 7', { size: 16 }));
      case 'une division': return wash(C.sky) + ink(text(32, 38, '20 ÷ 4', { size: 16 }));
      case 'le résultat': return wash(C.green) + ink(text(26, 30, '2+3 =', { size: 11 }) + `<circle cx="46" cy="40" r="11" fill="${C.sun}"/>` + text(46, 45, '5', { size: 14 }));
      case 'le double': return wash(C.sky) + ink(Array.from({ length: 3 }, (_, i) => K.star(14, 16 + i * 14, 4.5)).join('') + K.arrow(22, 30, 34, 30) + Array.from({ length: 6 }, (_, i) => K.star(42 + (i % 2) * 10, 16 + Math.floor(i / 2) * 14, 4.5, C.rose)).join(''));
      case 'la moitié': return wash(C.sky) + ink(`<circle cx="32" cy="32" r="20" fill="none"/><path d="M32 12 A20 20 0 0 1 32 52 Z" fill="${C.gold}"/><path d="M32 8 V56" stroke-dasharray="2 2"/>` + text(48, 60, '½', { size: 10 }));
      case 'compter': return wash(C.sky) + ink(`<path d="M10 16 v26 M17 16 v26 M24 16 v26 M31 16 v26 M7 36 L35 20" fill="none"/><path d="M44 16 v26 M51 16 v26" fill="none"/>` + text(32, 58, '7', { size: 10 }));
      case 'combien': return wash(C.lilac) + ink(K.star(16, 20, 4) + K.star(24, 34, 3) + K.star(12, 44, 3.5) + K.star(46, 46, 3) + text(42, 38, '?', { size: 30 }));
      case 'un nombre': return wash(C.sky) + ink(text(32, 42, '42', { size: 26 }) + K.star(52, 14, 4));
      case 'un chiffre': return wash(C.sky) + ink(`<rect x="18" y="12" width="28" height="38" rx="3" fill="${C.paper}"/>` + text(32, 42, '7', { size: 28 }));
      case 'un numéro': return wash(C.sky) + ink(`<rect x="8" y="18" width="48" height="26" rx="4" fill="${C.paper}"/>` + text(32, 36, 'n° 12', { size: 13 }));
      case "l'âge (m.)": return wash(C.rose) + ink(`<rect x="14" y="34" width="36" height="16" rx="2" fill="${C.rose}"/><path d="M14 40 Q20 44 26 40 T38 40 T50 40" fill="none" stroke-width="1"/>` + [20, 28, 36, 44].map(x => `<rect x="${x - 1.2}" y="24" width="2.4" height="10" fill="${C.sky}" stroke-width=".8"/><path d="M${x} 19 Q${x + 2} 22 ${x} 23 Q${x - 2} 22 ${x} 19 Z" fill="${C.sun}" stroke-width=".6"/>`).join('') + text(32, 60, '22 ans', { size: 8 }));
      case "l'étage (m.)": return wash(C.sky) + ink(`<rect x="18" y="6" width="28" height="50" fill="${C.paper}"/>` + [0, 1, 2, 3].map(i => `<path d="M18 ${18 + i * 10} h28" stroke-width=".8"/><rect x="${24}" y="${9 + i * 10}" width="5" height="5" fill="${i === 0 ? '#ffd98a' : C.sky}" stroke-width=".8"/><rect x="${35}" y="${9 + i * 10}" width="5" height="5" fill="${i === 0 ? '#ffd98a' : C.sky}" stroke-width=".8"/>`).join('') + K.arrow(58, 12, 48, 12, { w: 1.2 }) + text(58, 22, '3e', { size: 7 }));
      case 'le prix': return wash(C.gold) + ink(`<path d="M10 24 L24 10 H52 V38 H24 Z" fill="${C.paper}"/><circle cx="19" cy="24" r="2.5" fill="none"/>` + text(38, 29, '3,50 €', { size: 9 }) + `<path d="M19 24 Q12 40 22 52" fill="none" stroke-width="1"/>`);
      case "l'euro (m.)": return wash(C.gold) + ink(K.coin(32, 32, 16, '€'));
      case 'le centime': return wash(C.gold) + ink(K.coin(24, 34, 10, '1', '#c98a5a') + K.coin(44, 30, 7, 'c', '#c98a5a'));
      case 'environ': return wash(C.sky) + ink(text(32, 40, '≈ 20', { size: 20 }));
      case 'une étoile': return wash(C.lilac) + ink(K.star(32, 32, 16));
    }
    return '';
  };
})();
