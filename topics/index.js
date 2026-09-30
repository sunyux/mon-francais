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
      line: { fr: 'Sur cette petite planète, un gardien veille sur l’heure.', zh: '在这颗小星球上，守钟人看守着时间。', en: 'On this small planet, a keeper watches over the time.' },
      ground: '#e8cfa2', shade: '#a2835a',
      props: [['clocktower', 64, 92], ['keeper', 38, 62], ['lamp', 30, 130], ['grass', 20, 30], ['grass', -10, 100], ['flower', 12, 75], ['flower', 44, 150], ['grass', 55, 200], ['flower', -20, 200]],
    },
  },
  { id: 'nombres', emoji: '🔢', fr: 'Les nombres', zh: '数字', en: 'Numbers', blurb: { zh: '0 到 100，价格、电话号码', en: '0–100, prices, phone numbers' },
    world: { fr: 'Le Bâtisseur de marches', zh: '搭台阶的人', en: 'The Step Builder', no: 'II', ground: '#bcd0e0', shade: '#6d8ca6', props: [['steps', 66, 90], ['grass', 20, 40], ['flower', 30, 140]] } },
  { id: 'presenter', emoji: '👋', fr: 'Se présenter', zh: '自我介绍', en: 'Introductions', blurb: { zh: '名字、国籍、职业', en: 'Name, nationality, job' },
    world: { fr: 'La Voyageuse', zh: '旅人', en: 'The Traveller', no: 'III', ground: '#d4dfbc', shade: '#86a06a', props: [['house', 64, 95], ['sign', 34, 40], ['grass', 20, 150]] } },
  { id: 'famille', emoji: '👨‍👩‍👧', fr: 'La famille', zh: '家庭', en: 'Family', blurb: { zh: '家庭成员、主有形容词', en: 'Family members, possessives' },
    world: { fr: 'La Maison des quatre', zh: '四口之家', en: 'The House of Four', no: 'IV', ground: '#ebcabf', shade: '#ad8378', props: [['house', 62, 70], ['house', 50, 125, 0.8], ['tree', 35, 20]] } },
  { id: 'nourriture', emoji: '🥐', fr: 'La nourriture', zh: '食物', en: 'Food', blurb: { zh: '点餐、部分冠词', en: 'Ordering, partitive articles' },
    world: { fr: 'Le Verger', zh: '果园', en: 'The Orchard', no: 'V', ground: '#e6dba0', shade: '#a39552', props: [['tree', 64, 80], ['tree', 42, 140, 0.8], ['flower', 30, 40]] } },
];
