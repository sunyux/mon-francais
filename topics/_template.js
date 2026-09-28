/* Template for a new topic. Copy to topics/<id>.js, fill in, then add it to topics/index.js.
   Only `groups` is required; every other section appears only if you fill it in. */
FL.registerTopic({
  id: 'myTopic',
  emoji: '✨',
  title: { fr: 'Titre', zh: '标题', en: 'Title' },
  intro: { zh: '一句话介绍', en: 'One-line intro' },

  // 1. vocabulary: one card per group
  groups: [
    {
      id: 'g1', emoji: '📚', title: { fr: 'Groupe', zh: '分组', en: 'Group' },
      tip: { zh: '小提示（可选）', en: 'Optional tip' },
      words: [
        { fr: 'le mot', zh: '词', en: 'word' },
        // note: { zh, en } shows a small note; alt: ['…'] are other accepted typed answers
      ],
    },
  ],

  // 2. grammar rules (optional)
  rules: [
    { emoji: '📐', title: { fr: 'Règle', zh: '规则', en: 'Rule' }, tip: { zh: '', en: '' },
      rows: [{ fr: 'Exemple.', zh: '例句。', en: 'Example.' }] },
  ],

  // 3. key questions (optional)
  questions: [
    { word: 'Qui ?', zh: '谁', en: 'Who?',
      q: { fr: 'Qui est-ce ?', zh: '这是谁？', en: 'Who is it?' },
      a: [{ fr: "C'est Léa.", zh: '是 Léa。', en: "It's Léa." }] },
  ],

  // 4. verbs: infinitives from assets/js/verbs.js (add new verbs there, once, for the whole site)
  verbs: [{ inf: 'être', ex: { fr: 'Je suis étudiant.', zh: '我是学生。', en: "I'm a student." } }],

  // 5. story (optional). bg: dawn morning noon afternoon evening night summer autumn winter spring
  story: {
    title: { fr: 'Histoire', zh: '故事', en: 'Story' },
    scenes: [{ emoji: '🙂', bg: 'morning', fr: 'Bonjour !', zh: '你好！', en: 'Hello!' }],
  },

  // widgets: ['clock'], quizExtras: ['clock'],   // topic-specific extras (see topics/time-clock.js)
});
