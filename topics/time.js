/* Topic: Le temps et l'heure — content from Time.pdf
   Every entry: fr + zh + en. Optional: note {zh,en}, alt [other accepted answers]. */
FL.registerTopic({
  id: 'time',
  emoji: '⏰',
  title: { fr: "Le temps et l'heure", zh: '时间', en: 'Time' },
  intro: {
    zh: '年、季节、月份、星期、日期和几点钟。把鼠标放在任何动词上可以看变位，点击法语可以听发音。',
    en: 'Years, seasons, months, days, dates and clock time. Hover any verb to see its conjugation; click French to hear it.',
  },

  /* ---------- 1. vocabulary ---------- */
  groups: [
    {
      id: 'annee', emoji: '📅', title: { fr: "L'année", zh: '年', en: 'The year' },
      tip: { zh: 'en + 年份：en 2026', en: 'en + year: en 2026' },
      words: [
        { fr: "l'année (f.)", zh: '年；年份', en: 'year' },
        { fr: "l'an (m.)", zh: '年（计数用）', en: 'year (counting)', note: { zh: '例：deux ans 两年', en: 'e.g. deux ans = two years' } },
        { fr: 'en 2026', zh: '在2026年', en: 'in 2026' },
        { fr: 'chaque année', zh: '每年', en: 'every year' },
        { fr: 'tous les ans', zh: '每年', en: 'every year' },
      ],
    },
    {
      id: 'saisons', emoji: '🌸', title: { fr: 'Les saisons', zh: '季节', en: 'Seasons' },
      tip: { zh: '只有春天用 au printemps，其余用 en：en été, en automne, en hiver', en: 'Only spring takes “au”: au printemps; the rest take “en”' },
      words: [
        { fr: 'le printemps', zh: '春天', en: 'spring' },
        { fr: 'au printemps', zh: '在春天', en: 'in spring' },
        { fr: "l'été (m.)", zh: '夏天', en: 'summer' },
        { fr: 'en été', zh: '在夏天', en: 'in summer' },
        { fr: "l'automne (m.)", zh: '秋天', en: 'autumn' },
        { fr: 'en automne', zh: '在秋天', en: 'in autumn' },
        { fr: "l'hiver (m.)", zh: '冬天', en: 'winter' },
        { fr: 'en hiver', zh: '在冬天', en: 'in winter' },
      ],
    },
    {
      id: 'mois', emoji: '🗓️', title: { fr: 'Les mois', zh: '月份', en: 'Months' },
      tip: { zh: '月份小写。en + 月份 / au mois de + 月份：en mai = au mois de mai', en: 'Months are lowercase. en mai = au mois de mai (in May)' },
      words: [
        { fr: 'janvier', zh: '一月', en: 'January' },
        { fr: 'février', zh: '二月', en: 'February' },
        { fr: 'mars', zh: '三月', en: 'March' },
        { fr: 'avril', zh: '四月', en: 'April' },
        { fr: 'mai', zh: '五月', en: 'May' },
        { fr: 'juin', zh: '六月', en: 'June' },
        { fr: 'juillet', zh: '七月', en: 'July' },
        { fr: 'août', zh: '八月', en: 'August' },
        { fr: 'septembre', zh: '九月', en: 'September' },
        { fr: 'octobre', zh: '十月', en: 'October' },
        { fr: 'novembre', zh: '十一月', en: 'November' },
        { fr: 'décembre', zh: '十二月', en: 'December' },
        { fr: 'le mois', zh: '月', en: 'month' },
      ],
    },
    {
      id: 'semaine', emoji: '📆', title: { fr: 'Les jours de la semaine', zh: '星期', en: 'Days of the week' },
      tip: { zh: '星期小写。lundi = 这个周一；le lundi = 每个周一', en: 'Lowercase. lundi = this Monday; le lundi = every Monday' },
      words: [
        { fr: 'lundi', zh: '星期一', en: 'Monday' },
        { fr: 'mardi', zh: '星期二', en: 'Tuesday' },
        { fr: 'mercredi', zh: '星期三', en: 'Wednesday' },
        { fr: 'jeudi', zh: '星期四', en: 'Thursday' },
        { fr: 'vendredi', zh: '星期五', en: 'Friday' },
        { fr: 'samedi', zh: '星期六', en: 'Saturday' },
        { fr: 'dimanche', zh: '星期日', en: 'Sunday' },
        { fr: 'le week-end', zh: '周末', en: 'the weekend' },
        { fr: 'la semaine', zh: '星期；周', en: 'week' },
      ],
    },
    {
      id: 'date', emoji: '📌', title: { fr: 'La date', zh: '日期', en: 'The date' },
      tip: { zh: 'le + 数字 + 月份。1号用序数词 premier：le premier mai', en: 'le + number + month. The 1st uses “premier”: le premier mai' },
      words: [
        { fr: 'la date', zh: '日期', en: 'date' },
        { fr: 'le premier mai', zh: '5月1日', en: 'May 1st', alt: ['le 1er mai'] },
        { fr: 'le 15 juillet', zh: '7月15日', en: 'July 15th', alt: ['le quinze juillet'] },
        { fr: 'hier', zh: '昨天', en: 'yesterday' },
        { fr: "aujourd'hui", zh: '今天', en: 'today' },
        { fr: 'demain', zh: '明天', en: 'tomorrow' },
      ],
    },
    {
      id: 'journee', emoji: '🌤️', title: { fr: 'La journée', zh: '一天中的时段', en: 'Times of day' },
      tip: { zh: 'le soir = 晚上（时间点）；la soirée = 整个晚上的时段 / 晚会', en: 'le soir = evening (point in time); la soirée = the whole evening / a party' },
      words: [
        { fr: 'la journée', zh: '一天；白天', en: 'the day (daytime)' },
        { fr: 'le matin', zh: '早上；上午', en: 'morning' },
        { fr: 'le midi', zh: '中午', en: 'noon / lunchtime' },
        { fr: "l'après-midi (m.)", zh: '下午', en: 'afternoon' },
        { fr: 'le soir', zh: '晚上', en: 'evening' },
        { fr: 'la soirée', zh: '晚上（整段）；晚会', en: 'the evening; a party' },
        { fr: 'la nuit', zh: '夜里', en: 'night' },
        { fr: 'le moment', zh: '时刻；时段', en: 'moment' },
        { fr: "l'heure (f.)", zh: '小时；钟点', en: 'hour; time' },
        { fr: 'la minute', zh: '分钟', en: 'minute' },
        { fr: 'midi', zh: '中午十二点', en: 'noon (12:00)' },
        { fr: 'minuit', zh: '午夜十二点', en: 'midnight' },
        { fr: 'une demi-heure', zh: '半小时', en: 'half an hour' },
        { fr: "un quart d'heure", zh: '一刻钟', en: 'a quarter of an hour' },
      ],
    },
    {
      id: 'adverbes', emoji: '⏳', title: { fr: 'Les adverbes de temps', zh: '时间副词', en: 'Time words' },
      tip: { zh: 'ce/cet/cette 这… · prochain(e) 下… · dernier/dernière 上…', en: 'ce/cet/cette = this · prochain(e) = next · dernier/dernière = last' },
      words: [
        { fr: 'maintenant', zh: '现在', en: 'now' },
        { fr: 'tôt', zh: '早', en: 'early' },
        { fr: 'tard', zh: '晚', en: 'late' },
        { fr: 'cette semaine', zh: '这周', en: 'this week' },
        { fr: 'la semaine prochaine', zh: '下周', en: 'next week' },
        { fr: 'la semaine dernière', zh: '上周', en: 'last week' },
        { fr: 'ce mois-ci', zh: '这个月', en: 'this month' },
        { fr: 'le mois prochain', zh: '下个月', en: 'next month' },
        { fr: 'le mois dernier', zh: '上个月', en: 'last month' },
        { fr: 'cette année', zh: '今年', en: 'this year' },
        { fr: "l'année prochaine", zh: '明年', en: 'next year' },
        { fr: "l'année dernière", zh: '去年', en: 'last year' },
      ],
    },
  ],

  /* ---------- 2. grammar rules ---------- */
  rules: [
    {
      emoji: '🕐', title: { fr: "Dire l'heure", zh: '怎么说几点', en: 'Telling the time' },
      tip: { zh: '时间 = 数字 + heure(s) + 分钟。1点用单数 une heure。书面写成 15h30。', en: 'Time = number + heure(s) + minutes. 1 o’clock is singular: une heure. Written as 15h30.' },
      rows: [
        { fr: 'Il est trois heures.', zh: '现在三点。', en: "It's three o'clock." },
        { fr: 'Il est une heure.', zh: '现在一点。（单数）', en: "It's one o'clock. (singular)" },
        { fr: 'Il est quinze heures trente.', zh: '15:30（官方24小时制）', en: '15:30 (official 24h)' },
        { fr: 'Il est trois heures et demie.', zh: '三点半（口语）', en: 'Half past three (spoken)' },
        { fr: 'Il est trois heures et quart.', zh: '三点一刻', en: 'Quarter past three' },
        { fr: 'Il est quatre heures moins le quart.', zh: '差一刻四点（3:45）', en: 'Quarter to four (3:45)' },
        { fr: 'Il est quatre heures moins dix.', zh: '差十分四点（3:50）', en: 'Ten to four (3:50)' },
        { fr: 'Il est midi. / Il est minuit.', zh: '中午十二点 / 午夜十二点', en: "It's noon. / It's midnight." },
        { fr: 'huit heures du matin', zh: '早上八点', en: '8 a.m.' },
        { fr: "trois heures de l'après-midi", zh: '下午三点', en: '3 p.m.' },
        { fr: 'huit heures du soir', zh: '晚上八点', en: '8 p.m.' },
      ],
    },
    {
      emoji: '📍', title: { fr: 'Les prépositions de temps', zh: '时间介词', en: 'Time prepositions' },
      tip: { zh: 'à + 钟点 · en + 月份/季节/年份 · du … au … · de … à …', en: 'à + clock time · en + month/season/year · du … au … · de … à …' },
      rows: [
        { fr: 'à huit heures', zh: 'à + 钟点：在八点', en: 'at eight o’clock' },
        { fr: 'en mai, en été, en 2026', zh: 'en + 月份、季节、年份', en: 'in May, in summer, in 2026' },
        { fr: 'au printemps', zh: '例外：在春天', en: 'exception: in spring' },
        { fr: 'du lundi au vendredi', zh: 'du … au … + 星期：从周一到周五', en: 'from Monday to Friday' },
        { fr: 'du premier au cinq mai', zh: 'du … au … + 日期：从5月1日到5日', en: 'from May 1st to 5th' },
        { fr: 'de neuf heures à dix-sept heures', zh: 'de … à … + 钟点：从9点到17点', en: 'from 9:00 to 17:00' },
      ],
    },
  ],

  /* ---------- 3. core questions ---------- */
  questions: [
    {
      word: 'Quand ?', zh: '什么时候', en: 'When?',
      q: { fr: 'Vous partez quand ?', zh: '您什么时候出发？', en: 'When are you leaving?' },
      a: [{ fr: 'Je pars demain.', zh: '我明天出发。', en: "I'm leaving tomorrow." }],
    },
    {
      word: 'Quelle heure ?', zh: '几点', en: 'What time?',
      q: { fr: 'Quelle heure est-il ?', zh: '现在几点？', en: 'What time is it?' },
      a: [
        { fr: 'Il est quelle heure ?', zh: '（口语）几点了？', en: '(spoken) What time is it?' },
        { fr: 'Il est dix heures et demie.', zh: '十点半。', en: "It's half past ten." },
      ],
    },
    {
      word: 'À quelle heure ?', zh: '在几点', en: 'At what time?',
      q: { fr: 'À quelle heure tu pars ?', zh: '你几点出发？', en: 'What time are you leaving?' },
      a: [{ fr: 'Je pars à huit heures.', zh: '我八点出发。', en: "I'm leaving at eight." }],
    },
    {
      word: 'Quel jour ?', zh: '星期几', en: 'What day?',
      q: { fr: 'Quel jour sommes-nous ?', zh: '今天星期几？', en: 'What day is it today?' },
      a: [
        { fr: 'Nous sommes lundi.', zh: '今天星期一。', en: "It's Monday." },
        { fr: 'On est quel jour ?', zh: '（口语）今天星期几？', en: '(spoken) What day is it?' },
        { fr: 'On est le lundi 15 octobre.', zh: '今天10月15日星期一。', en: "It's Monday, October 15th." },
      ],
    },
    {
      word: 'Quelle date ?', zh: '几号', en: 'What date?',
      q: { fr: "Quelle est la date aujourd'hui ?", zh: '今天几号？', en: "What's the date today?" },
      a: [{ fr: "Aujourd'hui, c'est le 15 juillet.", zh: '今天是7月15日。', en: "Today is July 15th." }],
    },
    {
      word: 'Quel mois ?', zh: '几月', en: 'What month?',
      q: { fr: 'En quel mois sommes-nous ?', zh: '现在是几月？', en: 'What month is it?' },
      a: [
        { fr: 'Nous sommes en mai.', zh: '现在是五月。', en: "It's May." },
        { fr: 'On est en mai.', zh: '（口语）现在是五月。', en: "(spoken) It's May." },
      ],
    },
    {
      word: 'En quel mois ?', zh: '在几月', en: 'In which month?',
      q: { fr: 'En quel mois est ton anniversaire ?', zh: '你的生日在几月？', en: 'Which month is your birthday?' },
      a: [
        { fr: "C'est au mois de mai.", zh: '在五月。', en: "It's in May." },
        { fr: "C'est en octobre.", zh: '在十月。', en: "It's in October." },
      ],
    },
    {
      word: 'Quelle saison ?', zh: '什么季节', en: 'Which season?',
      q: { fr: 'Quelle est ta saison préférée ?', zh: '你最喜欢什么季节？', en: 'What is your favourite season?' },
      a: [{ fr: "Ma saison préférée, c'est l'automne.", zh: '我最喜欢秋天。', en: 'My favourite season is autumn.' }],
    },
    {
      word: 'En quelle saison ?', zh: '在哪个季节', en: 'In which season?',
      q: { fr: 'En quelle saison est Noël ?', zh: '圣诞节在哪个季节？', en: 'Which season is Christmas in?' },
      a: [{ fr: 'En hiver.', zh: '在冬天。', en: 'In winter.' }],
    },
  ],

  /* ---------- 4. verbs (conjugations come from assets/js/verbs.js) ---------- */
  verbs: [
    { inf: 'partir', ex: { fr: 'Je pars à huit heures.', zh: '我八点出发。', en: 'I leave at eight.' } },
    { inf: 'aller', ex: { fr: 'Nous allons au cinéma samedi.', zh: '我们周六去看电影。', en: "We're going to the cinema on Saturday." } },
    { inf: 'rentrer', ex: { fr: 'Elle rentre le soir.', zh: '她晚上回家。', en: 'She goes home in the evening.' } },
    { inf: 'venir', ex: { fr: 'Tu viens demain ?', zh: '你明天来吗？', en: 'Are you coming tomorrow?' } },
    { inf: 'arriver', ex: { fr: "Le train arrive à midi.", zh: '火车中午到。', en: 'The train arrives at noon.' } },
    { inf: 'être', ex: { fr: 'Nous sommes lundi.', zh: '今天星期一。', en: "It's Monday." } },
    { inf: 'commencer', ex: { fr: 'Le cours commence à neuf heures.', zh: '课九点开始。', en: 'Class starts at nine.' } },
    { inf: 'finir', ex: { fr: 'Je finis à dix-sept heures.', zh: '我十七点结束。', en: 'I finish at 5 p.m.' } },
    { inf: 'se lever', ex: { fr: 'Je me lève tôt.', zh: '我起得很早。', en: 'I get up early.' } },
  ],

  // the opening spread: book title, words floating around the planet, the live block
  opening: {
    title: ['Le temps', 'et', "l'heure"],
    cover: ['Le temps', "et l'heure"],
    floaters: ['janvier', 'lundi', "l'été", 'midi', 'demain', 'minuit', 'le soir', 'mai'],
    live: 'time',
    hint: { zh: '拖动旋转星球 · 点击钟楼听时间', en: 'Drag to turn the planet · tap the clock tower to hear the time' },
  },

  widgets: ['clock'],
  quizExtras: ['clock'],

  /* ---------- 5. story ---------- */
  story: {
    title: { fr: 'Une semaine avec Léa', zh: '和 Léa 的一周', en: 'A week with Léa' },
    scenes: [
      { emoji: '🛏️⏰', bg: 'dawn', time: '07:00', fr: "C'est lundi. Il est sept heures du matin.", zh: '今天星期一。现在是早上七点。', en: "It's Monday. It's seven in the morning." },
      { emoji: '👩‍🦰🚶‍♀️', bg: 'morning', time: '07:45', fr: 'Léa se lève tôt. Elle part à huit heures moins le quart.', zh: 'Léa 起得很早。她七点四十五出门。', en: 'Léa gets up early. She leaves at a quarter to eight.' },
      { emoji: '💼🏢', bg: 'morning', time: '09:00', fr: 'Elle travaille du lundi au vendredi, de neuf heures à dix-sept heures.', zh: '她从周一到周五工作，从九点到十七点。', en: 'She works Monday to Friday, from nine to five.' },
      { emoji: '🥗☀️', bg: 'noon', time: '12:00', fr: 'À midi, elle mange avec Tom. Ils parlent du week-end.', zh: '中午，她和 Tom 一起吃饭。他们聊周末。', en: 'At noon she eats with Tom. They talk about the weekend.' },
      { emoji: '🏠🌆', bg: 'evening', time: '18:30', fr: 'Le soir, elle rentre à la maison à six heures et demie.', zh: '晚上，她六点半回家。', en: 'In the evening she gets home at half past six.' },
      { emoji: '📅🌻', bg: 'summer', fr: "Aujourd'hui, nous sommes le 15 juillet. C'est l'été !", zh: '今天是7月15日。夏天到了！', en: "Today is July 15th. It's summer!" },
      { emoji: '🚆👭', bg: 'morning', time: '10:15', fr: 'Demain, sa sœur arrive de Lyon. Elle vient en train à dix heures et quart.', zh: '明天，她的姐姐从里昂来。她坐十点一刻的火车来。', en: 'Tomorrow her sister arrives from Lyon. She comes by train at a quarter past ten.' },
      { emoji: '🏖️😎', bg: 'afternoon', fr: 'Le week-end, elles vont à la plage. Il fait beau !', zh: '周末，她们去海滩。天气真好！', en: "At the weekend they go to the beach. It's lovely weather!" },
      { emoji: '🎂🍂', bg: 'autumn', fr: "L'anniversaire de Léa ? C'est en octobre, en automne.", zh: 'Léa 的生日？在十月，秋天。', en: "Léa's birthday? It's in October, in autumn." },
      { emoji: '🌙😴', bg: 'night', time: '00:00', fr: 'Dimanche soir, il est tard. Il est minuit. Bonne nuit, Léa !', zh: '周日晚上，很晚了。已经午夜了。晚安，Léa！', en: "Sunday night, it's late. It's midnight. Good night, Léa!" },
    ],
  },
});
