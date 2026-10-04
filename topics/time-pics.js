/* Pictures for Le temps et l'heure: calendars, seasons, the sun's walk across the day, clocks. */
(function () {
  const FL = window.FL, K = FL.picKit, C = FL.PIC_COLORS;
  const { wash, ink, text } = K;

  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const MSHORT = ['JANV', 'FÉVR', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];
  const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const season = m => (m < 2 || m === 11 ? 'hiver' : m < 5 ? 'printemps' : m < 8 ? 'été' : 'automne');
  const SEASON_WASH = { printemps: C.rose, 'été': C.sun, automne: C.leaf, hiver: C.sky };
  const seasonArt = (s, x = 32, y = 32, k = 1) =>
    s === 'printemps' ? K.flower(x, y - 2, k) :
    s === 'été' ? K.sun(x, y, 9 * k) :
    s === 'automne' ? K.leaf(x, y, k) : K.snow(x, y, 12 * k);

  // seven little day boxes, some lit
  const week = (lit, { y = 26, label = true } = {}) => DAYS.map((d, i) => {
    const x = 5 + i * 8;
    const on = lit.includes(i);
    return `<rect x="${x}" y="${y}" width="7" height="12" rx="1" fill="${on ? C.red : C.paper}" stroke-width="1"/>${label ? text(x + 3.5, y + 9, 'LMMJVSD'[i], { size: 6.5, fill: on ? C.paper : C.ink, italic: false, weight: 700 }) : ''}`;
  }).join('');
  // the sun on its arc above the hills: t from 0 (dawn) to 1 (dusk)
  const sky = (t, { night = false, bg = C.sky, sunColor } = {}) => {
    const x = 8 + t * 48, y = 46 - Math.sin(t * Math.PI) * 30;
    return wash(night ? C.night : bg) + ink(`<path d="M8 46 Q32 -14 56 46" fill="none" stroke-dasharray="2 3" stroke-width="1" opacity=".5"/>
      ${night ? K.moon(x, y, 8) : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${sunColor || C.sun}"/>`}
      ${K.hills(48)}`);
  };
  // three leaves in a row, one marked: past / present / next
  const triple = (which, { top = '', label = ['', '', ''] } = {}) => [0, 1, 2].map(i =>
    K.page(4 + i * 19, 18, 17, 24, { top, topSize: 4.6, big: label[i], bigSize: 8, fill: i === which ? '#fff4d6' : C.paper, band: i === which ? C.red : C.grey })).join('') +
    K.arrow(4 + which * 19 + 8.5, 56, 4 + which * 19 + 8.5, 46, { w: 1.4 });

  FL.pictures.time = (w, g) => {
    const f = w.fr;
    const mi = MONTHS.indexOf(f);
    if (mi >= 0) {
      const s = season(mi);
      return wash(SEASON_WASH[s]) + ink(K.page(10, 14, 32, 38, { top: MSHORT[mi], big: mi + 1, bigSize: 16 }) + `<g transform="translate(46 44) scale(.62)">${seasonArt(s, 0, 0)}</g>`);
    }
    const di = DAYS.indexOf(f);
    if (di >= 0) return wash(di > 4 ? C.sun : C.sky) + ink(week([di]) + text(32, 52, f.slice(0, 3) + '.', { size: 10 }));
    switch (f) {
      // the year
      case "l'année (f.)": case "l'an (m.)":
        return wash(C.sky) + ink([0, 1, 2, 3].map(i => K.page(12 + i * 3, 12 + i * 3, 30, 34, { band: C.red })).join('') + text(36, 44, '365', { size: 12 }));
      case 'en 2026': return wash(C.sky) + ink(K.page(12, 14, 40, 38, { top: 'ANNÉE', big: '2026', bigSize: 13 }));
      case 'chaque année': case 'tous les ans':
        return wash(C.green) + ink(K.page(20, 20, 24, 26, { big: '1', bigSize: 12, top: 'JANV' }) + K.curve(10, 40, 4, 8, 30, 8) + K.curve(54, 24, 60, 56, 34, 58));
      // seasons
      case 'le printemps': case 'au printemps': return wash(C.rose) + ink(K.flower(32, 30, 1.6));
      case "l'été (m.)": case 'en été': return wash(C.sun) + ink(K.sun(32, 30, 11));
      case "l'automne (m.)": case 'en automne': return wash(C.leaf) + ink(K.leaf(26, 30, 1.2) + K.leaf(42, 38, 0.8, C.red));
      case "l'hiver (m.)": case 'en hiver': return wash(C.sky) + ink(K.snow(32, 31, 16));
      case 'le mois':
        return wash(C.sky) + ink(K.page(10, 10, 44, 46, { top: 'MOIS' }) +
          Array.from({ length: 20 }, (_, i) => `<rect x="${14 + (i % 5) * 7.5}" y="${23 + Math.floor(i / 5) * 7.5}" width="5" height="5" fill="${i === 12 ? C.red : 'none'}" stroke-width=".8"/>`).join(''));
      // the week
      case 'le week-end': return wash(C.sun) + ink(week([5, 6]) + K.sun(50, 14, 5));
      case 'la semaine': return wash(C.sky) + ink(week([0, 1, 2, 3, 4, 5, 6]) + `<path d="M5 44 H60" fill="none"/>` + text(32, 54, '7', { size: 12 }));
      // dates
      case 'la date': return wash(C.sky) + ink(K.page(14, 12, 36, 40, { top: 'OCT', big: '3', bigSize: 18, small: 'samedi' }));
      case 'le premier mai': return wash(C.rose) + ink(K.page(14, 12, 36, 40, { top: 'MAI', big: '1er', bigSize: 16 }) + K.flower(50, 46, 0.6));
      case 'le 15 juillet': return wash(C.sun) + ink(K.page(14, 12, 36, 40, { top: 'JUIL', big: '15', bigSize: 18 }) + K.sun(50, 48, 4));
      case 'hier': return wash(C.grey) + ink(triple(0, { label: ['2', '3', '4'] }));
      case "aujourd'hui": return wash(C.sun) + ink(triple(1, { label: ['2', '3', '4'] }));
      case 'demain': return wash(C.green) + ink(triple(2, { label: ['2', '3', '4'] }));
      // the day
      case 'la journée': return wash(C.sky) + ink(`<path d="M8 46 Q32 -14 56 46" fill="none" stroke-dasharray="2 3" stroke-width="1"/>${[0.1, 0.5, 0.9].map(t => `<circle cx="${8 + t * 48}" cy="${46 - Math.sin(t * Math.PI) * 30}" r="4" fill="${C.sun}" stroke-width="1"/>`).join('')}${K.hills(48)}`);
      case 'le matin': return sky(0.12, { bg: C.rose });
      case 'le midi': return sky(0.5);
      case "l'après-midi (m.)": return sky(0.72);
      case 'le soir': return sky(0.93, { bg: C.leaf, sunColor: C.red });
      case 'la soirée': return wash(C.night) + ink(K.moon(46, 18, 7) + K.house(28, 46, 1.3) + K.hills(50));
      case 'la nuit': return wash(C.night) + ink(K.moon(30, 28, 12) + K.star(50, 14, 4) + K.star(14, 18, 3) + K.star(50, 42, 3));
      case 'le moment':
        return wash(C.gold) + ink(`<path d="M20 10 H44 M20 54 H44 M22 10 Q22 26 32 32 Q22 38 22 54 M42 10 Q42 26 32 32 Q42 38 42 54" fill="none"/><path d="M25 50 Q32 42 39 50 Z" fill="${C.sand}" stroke-width="1"/><path d="M32 33 V44" stroke-dasharray="1 2" stroke-width="1"/>`);
      case "l'heure (f.)": return wash(C.sky) + ink(K.clock(32, 32, 20, 3, 0));
      case 'la minute': return wash(C.sky) + ink(K.clock(32, 32, 20, 10, 1) + `<path d="M32 12 A20 20 0 0 1 34.1 12.1" stroke="${C.red}" stroke-width="3" fill="none"/>`);
      case 'midi': return wash(C.sun) + ink(K.clock(30, 36, 18, 12, 0) + K.sun(52, 12, 5));
      case 'minuit': return wash(C.night) + ink(K.clock(30, 36, 18, 12, 0) + K.moon(52, 12, 6));
      case 'une demi-heure': return wash(C.rose) + ink(K.clock(32, 32, 20, 0, 0, { wedge: 30 }));
      case "un quart d'heure": return wash(C.rose) + ink(K.clock(32, 32, 20, 0, 0, { wedge: 15 }));
      // now, early, late
      case 'maintenant': return wash(C.sun) + ink(K.clock(32, 32, 19, 10, 10) + `<circle cx="32" cy="32" r="23" fill="none" stroke="${C.red}" stroke-dasharray="3 3"/>`);
      case 'tôt': return wash(C.rose) + ink(K.clock(22, 28, 14, 6, 0) + `<circle cx="50" cy="46" r="6" fill="${C.sun}"/>` + K.hills(50, C.green));
      case 'tard': return wash(C.night) + ink(K.clock(22, 28, 14, 11, 30) + K.moon(50, 18, 7) + K.star(46, 42, 3));
      // this / next / last week, month, year
      case 'cette semaine': return wash(C.sun) + ink(triple(1, { top: 'SEM' }));
      case 'la semaine prochaine': return wash(C.green) + ink(triple(2, { top: 'SEM' }));
      case 'la semaine dernière': return wash(C.grey) + ink(triple(0, { top: 'SEM' }));
      case 'ce mois-ci': return wash(C.sun) + ink(triple(1, { label: ['9', '10', '11'], top: 'MOIS' }));
      case 'le mois prochain': return wash(C.green) + ink(triple(2, { label: ['9', '10', '11'], top: 'MOIS' }));
      case 'le mois dernier': return wash(C.grey) + ink(triple(0, { label: ['9', '10', '11'], top: 'MOIS' }));
      case 'cette année': return wash(C.sun) + ink(triple(1, { label: ['25', '26', '27'], top: 'AN' }));
      case "l'année prochaine": return wash(C.green) + ink(triple(2, { label: ['25', '26', '27'], top: 'AN' }));
      case "l'année dernière": return wash(C.grey) + ink(triple(0, { label: ['25', '26', '27'], top: 'AN' }));
    }
    return '';
  };
})();
