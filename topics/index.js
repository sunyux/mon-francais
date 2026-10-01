/* Topic registry. To add a topic:
   1. copy topics/_template.js to topics/<id>.js and fill it in
   2. add an entry below with ready:true
   The topic page (topic.html?t=<id>) builds everything else automatically. */
window.FL = window.FL || {};
FL.TOPICS = [
  {
    id: 'time', emoji: '⏰', ready: true,
    fr: "Le temps et l'heure", zh: '时间', en: 'Time',
    blurb: { zh: '年、季节、月份、星期、日期、几点钟', en: 'Years, seasons, months, days, dates, telling time' },
    scripts: ['topics/time.js', 'topics/time-clock.js'],
    // each topic is a little world; props are [type, latitude, longitude, scale]
    world: {
      fr: 'Le Gardien des heures', zh: '守钟人', en: 'The Clock Keeper', no: 'I',
      greet: { fr: 'Bonjour ! Je suis le gardien des heures.' },
      line: { fr: 'Sur cette petite planète, un gardien veille sur l’heure.', zh: '在这颗小星球上，守钟人看守着时间。', en: 'On this small planet, a keeper watches over the time.' },
      ground: '#e8cfa2', shade: '#a2835a',
      props: [['clocktower', 64, 92], ['keeper', 38, 62], ['lamp', 30, 130], ['grass', 20, 30], ['grass', -10, 100], ['flower', 12, 75], ['flower', 44, 150], ['grass', 55, 200], ['flower', -20, 200]],
    },
  },
  {
    id: 'nombres', emoji: '✦', ready: true,
    fr: 'Les nombres', zh: '数字', en: 'Numbers',
    blurb: { zh: '0 到十亿、序数词、怎么问数字、加减乘除', en: '0 to a billion, ordinals, asking about numbers, arithmetic' },
    scripts: ['topics/nombres.js', 'topics/nombres-compteur.js'],
    world: {
      fr: 'La Compteuse d’étoiles', zh: '数星星的人', en: 'The Star Counter', no: 'II',
      greet: { fr: 'Bonsoir ! Je compte les étoiles. J’en suis à' },
      line: { fr: 'Sur cette planète, une femme compte les étoiles, une par une.', zh: '在这颗星球上，有个女人一颗一颗地数星星。', en: 'On this planet, a woman counts the stars, one by one.' },
      ground: '#c4d3e6', shade: '#6a7fa6',
      props: [['telescope', 60, 96], ['desk', 42, 50], ['counter', 36, 70], ['starfloat', 52, 140], ['starfloat', 28, 120, 0.8], ['starfloat', 70, 20, 0.7], ['grass', 15, 30], ['flower', 20, 160]],
    },
  },
  { id: 'presenter', emoji: '👋', fr: 'Se présenter', zh: '自我介绍', en: 'Introductions', blurb: { zh: '名字、国籍、职业', en: 'Name, nationality, job' },
    world: { fr: 'La Voyageuse', zh: '旅人', en: 'The Traveller', no: 'III', ground: '#d4dfbc', shade: '#86a06a', props: [['house', 64, 95], ['sign', 34, 40], ['grass', 20, 150]] } },
  { id: 'famille', emoji: '👨‍👩‍👧', fr: 'La famille', zh: '家庭', en: 'Family', blurb: { zh: '家庭成员、主有形容词', en: 'Family members, possessives' },
    world: { fr: 'La Maison des quatre', zh: '四口之家', en: 'The House of Four', no: 'IV', ground: '#ebcabf', shade: '#ad8378', props: [['house', 62, 70], ['house', 50, 125, 0.8], ['tree', 35, 20]] } },
  { id: 'nourriture', emoji: '🥐', fr: 'La nourriture', zh: '食物', en: 'Food', blurb: { zh: '点餐、部分冠词', en: 'Ordering, partitive articles' },
    world: { fr: 'Le Verger', zh: '果园', en: 'The Orchard', no: 'V', ground: '#e6dba0', shade: '#a39552', props: [['tree', 64, 80], ['tree', 42, 140, 0.8], ['flower', 30, 40]] } },
];
