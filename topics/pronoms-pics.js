/* Pictures for Les pronoms. The same little people every time:
   moi in gold, toi in blue, lui in green, elle in plum — so a colour already says who.
   The role shows in the drawing: the subject acts (an arrow goes out), the direct object is hit
   by the arrow, the indirect object is handed a letter (à), the stressed one is in the spotlight.
   Possessions: a book is masculine (le livre), a key is feminine (la clé). */
(function () {
  const FL = window.FL, K = FL.picKit, C = FL.PIC_COLORS;
  const { wash, ink, text } = K;

  const LOOK = {
    me: { coat: C.sun, hair: '#5a3d2b' },
    you: { coat: C.blue, hat: 'beret' },
    him: { coat: C.green, hat: 'top' },
    her: { coat: C.plum, hair: '#5a3d2b', hat: 'plume' },
  };
  const WHO = {
    je: ['me'], tu: ['you'], il: ['him'], elle: ['her'], nous: ['me', 'you'], vous: ['you', 'you'],
    ils: ['him', 'her'], elles: ['her', 'her'], on: ['crowd'],
  };
  // draw a few people centred on x; hl lights them up
  const people = (list, x, y = 54, { hl = false, s = 1 } = {}) => {
    if (list[0] === 'crowd') return [0, 1, 2, 3].map(i => K.person(x - 15 + i * 10, y - (i % 2) * 3, { coat: C.grey, s: 0.8 * s, hl })).join('');
    const gap = 12 * s;
    return list.map((p, i) => K.person(x + (i - (list.length - 1) / 2) * gap, y, { ...LOOK[p], s, hl })).join('');
  };
  const other = (x, y = 54) => K.person(x, y, { coat: C.grey, s: 0.9, dim: true });
  const letter = (x, y) => `<rect x="${x - 6}" y="${y - 4}" width="12" height="8" fill="${C.paper}" stroke-width="1"/><path d="M${x - 6} ${y - 4} L${x} ${y + 1} L${x + 6} ${y - 4}" fill="none" stroke-width="1"/>`;
  const thing = (kind, x, y, { dashed = false, s = 1 } = {}) => {
    const art = kind === 'f' ? K.key(x, y, s) : K.book(x, y, s);
    return dashed ? `<g stroke-dasharray="2 2" opacity=".85">${art}</g>` : art;
  };
  const things = (kinds, x, y, opts = {}) => kinds.map((k, i) => thing(k, x + (i - (kinds.length - 1) / 2) * 20 * (opts.s || 1), y, opts)).join('');

  // the scenes
  const subject = who => wash(C.sun) + ink(people(WHO[who], 22, 54, { hl: true }) + K.arrow(34, 34, 48, 34) + K.star(54, 34, 5));
  const stressed = who => wash(C.sun) + ink(people(WHO[who], 30, 54, { hl: true }) + K.bubble(36, 4, 24, 13, '!', { size: 11 }));
  const direct = who => wash(C.rose) + ink(other(10) + K.arrow(17, 38, 32, 38, { w: 1.8 }) + people(WHO[who], 46, 54, { hl: true }));
  const indirect = who => wash(C.green) + ink(other(10) + letter(24, 30) + K.curve(16, 36, 26, 18, 36, 34) + text(26, 16, 'à', { size: 9 }) + people(WHO[who], 48, 54, { hl: true }));
  // possessive adjective: owner — a line — the thing(s)
  const owns = (who, kinds) => wash(C.gold) + ink(people(WHO[who], 16, 56, { s: 0.95 }) + `<path d="M24 40 Q32 30 38 36" fill="none" stroke-dasharray="1 2" stroke-width="1"/>` + things(kinds, 44, 34, { s: kinds.length > 1 ? 0.62 : 1.15 }));
  // possessive pronoun: the thing alone, said to be someone's (the noun is gone, so it is drawn in dashes)
  const theirs = (who, kinds) => wash(C.lilac) + ink(things(kinds, 32, 22, { dashed: true, s: kinds.length > 1 ? 0.85 : 1.2 }) + `<path d="M12 36 H54" stroke-width=".8" fill="none"/>` + people(WHO[who], 32, 60, { s: 0.85, hl: true }));

  const ADJ = {
    mon: ['je', ['m']], ma: ['je', ['f']], mes: ['je', ['m', 'f', 'm']],
    ton: ['tu', ['m']], ta: ['tu', ['f']], tes: ['tu', ['m', 'f', 'm']],
    son: ['il', ['m']], sa: ['elle', ['f']], ses: ['il', ['m', 'f', 'm']],
    notre: ['nous', ['m']], nos: ['nous', ['m', 'f', 'm']],
    votre: ['vous', ['m']], vos: ['vous', ['m', 'f', 'm']],
    leur: ['ils', ['m']], leurs: ['ils', ['m', 'f', 'm']],
  };
  const STEM = [['mien', 'je'], ['tien', 'tu'], ['sien', 'il'], ['nôtre', 'nous'], ['vôtre', 'vous'], ['leur', 'ils']];
  function possessivePronoun(fr) {
    const [art, word] = fr.split(' ');
    const who = (STEM.find(([k]) => word.startsWith(k)) || [, 'je'])[1];
    const kinds = art === 'le' ? ['m'] : art === 'la' ? ['f']
      : /nnes$/.test(word) ? ['f', 'f'] : /ens$/.test(word) ? ['m', 'm'] : ['m', 'f']; // les nôtres, les leurs: either
    return theirs(who, kinds);
  }
  // a pointing hand and what it points at
  const point = (target, { label = '' } = {}) => wash(C.sky) + ink(K.hand(14, 34, 1) + target + (label ? text(32, 60, label, { size: 8 }) : ''));

  FL.pictures.pronoms = (w, g) => {
    const f = w.fr;
    switch (g) {
      case 'sujets': return WHO[f] ? subject(f) : '';
      case 'toniques': return stressed({ moi: 'je', toi: 'tu', lui: 'il', elle: 'elle', nous: 'nous', vous: 'vous', eux: 'ils', elles: 'elles' }[f]);
      case 'cod': return direct({ me: 'je', te: 'tu', le: 'il', la: 'elle', nous: 'nous', vous: 'vous', les: 'ils' }[f]);
      case 'coi':
        if (f === 'lui') return wash(C.green) + ink(other(8) + letter(21, 30) + K.curve(13, 36, 22, 18, 31, 34) + text(22, 16, 'à', { size: 9 }) + K.person(42, 54, LOOK.him) + text(50, 40, '/', { size: 10 }) + K.person(56, 54, LOOK.her));
        return indirect({ me: 'je', te: 'tu', nous: 'nous', vous: 'vous', leur: 'ils' }[f]);
      case 'indefinis':
        if (f === 'on') return wash(C.grey) + ink(people(['crowd'], 32, 54) + K.bubble(34, 4, 26, 13, '…', { size: 10 }));
        if (f === "quelqu'un") return wash(C.lilac) + ink(`<g opacity=".55">${K.person(30, 56, { coat: C.grey, s: 1.3 })}</g>` + text(48, 26, '?', { size: 22 }));
        if (f === 'quelque chose') return wash(C.gold) + ink(`<rect x="16" y="24" width="28" height="24" fill="${C.leaf}"/><path d="M14 24 h32 v-6 h-32 Z M30 18 v30" fill="${C.sand}"/>` + text(50, 22, '?', { size: 18 }));
        if (f === 'chacun') return wash(C.green) + ink([0, 1, 2].map(i => K.person(12 + i * 20, 58, { coat: [C.green, C.blue, C.sun][i], s: 0.85 }) + K.book(12 + i * 20, 26, 0.7)).join(''));
        if (f === 'chacune') return wash(C.rose) + ink([0, 1, 2].map(i => K.person(12 + i * 20, 58, { ...LOOK.her, s: 0.85 }) + K.key(14 + i * 20, 26, 0.7)).join(''));
        return '';
      case 'y-en':
        if (f === 'y') return wash(C.green) + ink(K.house(44, 52, 1.2) + K.pin(44, 20) + K.person(12, 56, { ...LOOK.me, s: 0.9 }) + K.curve(18, 40, 26, 20, 34, 34) + text(22, 60, 'à …', { size: 8 }));
        if (f === 'en') return wash(C.rose) + ink(`<path d="M10 30 h30 l-4 20 h-22 Z" fill="${C.sand}"/>` + [16, 24, 32].map((x, i) => `<circle cx="${x}" cy="26" r="4" fill="${C.red}" stroke-width="1"/>`).join('') + K.arrow(40, 32, 50, 32) + `<circle cx="54" cy="24" r="4" fill="${C.red}" stroke-width="1"/><circle cx="54" cy="38" r="4" fill="${C.red}" stroke-width="1"/>` + text(26, 60, 'de …', { size: 8 }));
        return '';
      case 'demonstratifs':
        if (f === 'ce' || f === 'cela' || f === 'ça') return point(`<path d="M34 24 q4 -8 12 -4 q8 -4 12 4 q6 2 2 10 q0 8 -10 6 q-6 6 -12 0 q-10 2 -8 -8 q-4 -4 4 -8 Z" fill="${C.paper}"/>` + text(46, 34, f === 'ce' ? "c'est" : f, { size: 8 }));
        if (f === 'celui') return point(thing('m', 46, 32, { dashed: true, s: 1.4 }), { label: 'celui-ci' });
        if (f === 'celle') return point(thing('f', 46, 32, { dashed: true, s: 1.4 }), { label: 'celle-ci' });
        if (f === 'ceux') return point(things(['m', 'm', 'm'], 44, 32, { dashed: true, s: 0.62 }), { label: 'ceux-ci' });
        if (f === 'celles') return point(things(['f', 'f'], 44, 32, { dashed: true, s: 0.75 }), { label: 'celles-ci' });
        return '';
      case 'adj-demonstratifs':
        if (f === 'ce') return point(thing('m', 46, 32, { s: 1.4 }), { label: 'ce livre' });
        if (f === 'cet') return point(K.person(46, 50, { ...LOOK.him, s: 1.1 }), { label: 'cet ami' });
        if (f === 'cette') return point(thing('f', 46, 32, { s: 1.4 }), { label: 'cette clé' });
        if (f === 'ces') return point(things(['m', 'm', 'm'], 44, 32, { s: 0.62 }), { label: 'ces livres' });
        return '';
      case 'adj-possessifs': return ADJ[f] ? owns(...ADJ[f]) : '';
      case 'pronoms-possessifs': return possessivePronoun(f);
    }
    return '';
  };
})();
