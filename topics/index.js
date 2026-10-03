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
  },
  { id: 'nombres', emoji: '🔢', fr: 'Les nombres', zh: '数字', en: 'Numbers', blurb: { zh: '0 到 100，价格、电话号码', en: '0–100, prices, phone numbers' } },
  { id: 'presenter', emoji: '👋', fr: 'Se présenter', zh: '自我介绍', en: 'Introductions', blurb: { zh: '名字、国籍、职业', en: 'Name, nationality, job' } },
  { id: 'famille', emoji: '👨‍👩‍👧', fr: 'La famille', zh: '家庭', en: 'Family', blurb: { zh: '家庭成员、主有形容词', en: 'Family members, possessives' } },
  { id: 'nourriture', emoji: '🥐', fr: 'La nourriture', zh: '食物', en: 'Food', blurb: { zh: '点餐、部分冠词', en: 'Ordering, partitive articles' } },
];
