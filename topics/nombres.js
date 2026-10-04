/* Topic: Les nombres — the star counter's little world.
   Every entry: fr + zh + en. Optional: note {zh,en}, alt [other accepted answers]. */
FL.registerTopic({
  id: 'nombres',
  emoji: '✦',
  title: { fr: 'Les nombres', zh: '数字', en: 'Numbers' },
  intro: {
    zh: '从零数到十亿：基数词、序数词、怎么问数字，还有加减乘除。点任何法语听发音。',
    en: 'Counting from zero to a billion: cardinals, ordinals, asking about numbers, and arithmetic. Click any French to hear it.',
  },

  opening: {
    title: ['Les', 'nombres'],
    cover: ['Les nombres'],
    floaters: ['un', 'dix', 'vingt et un', 'soixante-dix', 'quatre-vingts', 'cent', 'mille', 'premier'],
    live: 'stars',
    hint: { zh: '拖动旋转星球 · 点击望远镜听她数到哪里了', en: 'Drag to turn the planet · tap the telescope to hear her count' },
  },

  /* ---------- 1. vocabulary ---------- */
  groups: [
    {
      id: 'zero-dix', emoji: '', title: { fr: 'De zéro à dix', zh: '零到十', en: 'Zero to ten' },
      memo: [
        { zh: '和英语、拉丁语是亲戚：deux → duo，trois → trio，quatre → quarter，sept → September，dix → decimal。', en: 'Cousins of English and Latin: deux → duo, trois → trio, quatre → quarter, sept → September, dix → decimal.' },
        { zh: 'cinq、six、sept、huit、neuf、dix 单独说时词尾要读出来；放在名词前，six、huit、dix 的尾音常常不发音（six livres）。', en: 'Cinq, six, sept, huit, neuf, dix sound their last letter alone; before a noun six, huit, dix usually drop it (six livres).' },
      ],
      tip: { zh: 'six、dix 单独说时读 /s/；在辅音前不发音（six livres）；在元音前读 /z/（dix ans）。', en: 'Six and dix end in /s/ alone, are silent before a consonant (six livres) and sound /z/ before a vowel (dix ans).' },
      words: [
        { fr: 'zéro', zh: '0 零', en: '0 zero' },
        { fr: 'un', zh: '1 一', en: '1 one', alt: ['une'], note: { zh: '阴性名词前用 une：une étoile', en: 'une before a feminine noun: une étoile' } },
        { fr: 'deux', zh: '2 二', en: '2 two' },
        { fr: 'trois', zh: '3 三', en: '3 three' },
        { fr: 'quatre', zh: '4 四', en: '4 four' },
        { fr: 'cinq', zh: '5 五', en: '5 five' },
        { fr: 'six', zh: '6 六', en: '6 six' },
        { fr: 'sept', zh: '7 七', en: '7 seven', note: { zh: 'p 不发音', en: 'the p is silent' } },
        { fr: 'huit', zh: '8 八', en: '8 eight' },
        { fr: 'neuf', zh: '9 九', en: '9 nine' },
        { fr: 'dix', zh: '10 十', en: '10 ten' },
      ],
    },
    {
      id: 'onze-vingt', emoji: '', title: { fr: 'De onze à vingt', zh: '十一到二十', en: 'Eleven to twenty' },
      memo: [
        { zh: '11–16 全部以 -ze 结尾，并且藏着 1–6：onze←un，douze←deux，treize←trois，quatorze←quatre，quinze←cinq，seize←six。', en: '11–16 all end in -ze and hide 1–6: onze←un, douze←deux, treize←trois, quatorze←quatre, quinze←cinq, seize←six.' },
        { zh: '从 17 开始改用加法：dix-sept = 10 + 7，dix-huit = 10 + 8，dix-neuf = 10 + 9。', en: 'From 17 French switches to adding: dix-sept = 10 + 7, dix-huit = 10 + 8, dix-neuf = 10 + 9.' },
      ],
      tip: { zh: '11–16 是独立的词；17、18、19 = dix + 7/8/9，中间加连字符。', en: '11–16 are words of their own; 17, 18, 19 = dix + 7/8/9, with a hyphen.' },
      words: [
        { fr: 'onze', zh: '11 十一', en: '11 eleven' },
        { fr: 'douze', zh: '12 十二', en: '12 twelve' },
        { fr: 'treize', zh: '13 十三', en: '13 thirteen' },
        { fr: 'quatorze', zh: '14 十四', en: '14 fourteen' },
        { fr: 'quinze', zh: '15 十五', en: '15 fifteen' },
        { fr: 'seize', zh: '16 十六', en: '16 sixteen' },
        { fr: 'dix-sept', zh: '17 十七', en: '17 seventeen' },
        { fr: 'dix-huit', zh: '18 十八', en: '18 eighteen' },
        { fr: 'dix-neuf', zh: '19 十九', en: '19 nineteen' },
        { fr: 'vingt', zh: '20 二十', en: '20 twenty', note: { zh: 't 单独时不发音', en: 'the t is silent on its own' } },
      ],
    },
    {
      id: 'dizaines', emoji: '', title: { fr: 'Les dizaines, de 20 à 69', zh: '二十到六十九', en: 'Tens, 20 to 69' },
      memo: [
        { zh: '整十都是“数字 + -ante”：trente←trois，quarante←quatre，cinquante←cinq，soixante←six。只有 vingt 例外。', en: 'The tens are “digit + -ante”: trente←trois, quarante←quatre, cinquante←cinq, soixante←six. Only vingt is different.' },
        { zh: '“et un” 只出现在个位是 1 的时候（21、31、41、51、61，还有 71）；其他都用连字符。', en: '“Et un” appears only when the unit is 1 (21, 31, 41, 51, 61, and 71); everything else takes a hyphen.' },
      ],
      tip: { zh: '21、31、41、51、61 用 et un；其他都用连字符：vingt-deux, trente-cinq。', en: '21, 31, 41, 51, 61 use “et un”; all others take a hyphen: vingt-deux, trente-cinq.' },
      words: [
        { fr: 'vingt et un', zh: '21 二十一', en: '21 twenty-one' },
        { fr: 'vingt-deux', zh: '22 二十二', en: '22 twenty-two' },
        { fr: 'trente', zh: '30 三十', en: '30 thirty' },
        { fr: 'trente et un', zh: '31 三十一', en: '31 thirty-one' },
        { fr: 'quarante', zh: '40 四十', en: '40 forty' },
        { fr: 'quarante-cinq', zh: '45 四十五', en: '45 forty-five' },
        { fr: 'cinquante', zh: '50 五十', en: '50 fifty' },
        { fr: 'soixante', zh: '60 六十', en: '60 sixty' },
        { fr: 'soixante et un', zh: '61 六十一', en: '61 sixty-one' },
        { fr: 'soixante-neuf', zh: '69 六十九', en: '69 sixty-nine' },
      ],
    },
    {
      id: 'soixante-dix', emoji: '', title: { fr: 'De 70 à 99', zh: '七十到九十九', en: '70 to 99' },
      memo: [
        { zh: '把它当成算式来念：70 = 60 + 10，71 = 60 + 11，80 = 4 × 20，90 = 4 × 20 + 10。看图里的蓝棍和粉棍。', en: 'Read it as a sum: 70 = 60 + 10, 71 = 60 + 11, 80 = 4 × 20, 90 = 4 × 20 + 10. Look at the blue and rose sticks in the pictures.' },
        { zh: '所以 71 是 soixante et onze（因为 60 + 11），而 81 没有 et：quatre-vingt-un。', en: 'So 71 is soixante et onze (60 + 11), while 81 has no et: quatre-vingt-un.' },
        { zh: 'quatre-vingts 只有在后面什么都不跟的时候才有 s：二十“们”凑满了才加 s。', en: 'Quatre-vingts keeps its s only when nothing follows it.' },
      ],
      tip: { zh: '70 = 60 + 10（soixante-dix）；80 = 4 × 20（quatre-vingts）；90 = 4 × 20 + 10。80 有 s，81 起去掉 s，也不用 et。比利时和瑞士说 septante（70）、nonante（90）。', en: '70 = 60 + 10; 80 = 4 × 20; 90 = 4 × 20 + 10. 80 has an s, which drops from 81 on, and there is no “et”. Belgium and Switzerland say septante (70) and nonante (90).' },
      words: [
        { fr: 'soixante-dix', zh: '70 七十（60 + 10）', en: '70 seventy (60 + 10)' },
        { fr: 'soixante et onze', zh: '71 七十一（60 + 11）', en: '71 seventy-one (60 + 11)' },
        { fr: 'soixante-douze', zh: '72 七十二（60 + 12）', en: '72 seventy-two (60 + 12)' },
        { fr: 'soixante-dix-neuf', zh: '79 七十九（60 + 19）', en: '79 seventy-nine (60 + 19)' },
        { fr: 'quatre-vingts', zh: '80 八十（4 × 20）', en: '80 eighty (4 × 20)' },
        { fr: 'quatre-vingt-un', zh: '81 八十一', en: '81 eighty-one', note: { zh: '没有 et，也没有 s', en: 'no “et” and no s' } },
        { fr: 'quatre-vingt-cinq', zh: '85 八十五', en: '85 eighty-five' },
        { fr: 'quatre-vingt-dix', zh: '90 九十（4 × 20 + 10）', en: '90 ninety (4 × 20 + 10)' },
        { fr: 'quatre-vingt-onze', zh: '91 九十一', en: '91 ninety-one' },
        { fr: 'quatre-vingt-dix-neuf', zh: '99 九十九', en: '99 ninety-nine' },
      ],
    },
    {
      id: 'grands', emoji: '', title: { fr: 'Les grands nombres', zh: '大数字', en: 'Big numbers' },
      memo: [
        { zh: 'cent 被乘而且在最后时加 s（deux cents），后面再跟数字就不加（deux cent un）。mille 永远不加 s。', en: 'Cent takes an s when multiplied and last (deux cents), not when more follows (deux cent un). Mille never takes an s.' },
        { zh: 'million、milliard 是名词，所以会加 s（deux millions），后面跟名词要加 de：un million d\'étoiles。', en: 'Million and milliard are nouns, so they take an s (deux millions) and need de before a noun: un million d\'étoiles.' },
        { zh: '小心：milliard = 英语的 billion（十亿）；法语的 billion 是一万亿。', en: 'Careful: milliard = English billion (10⁹); French billion is a trillion.' },
      ],
      tip: { zh: 'cents 只在末尾加 s（deux cents，但 deux cent un）；mille 永远不加 s；million、milliard 是名词，要加 s（deux millions）。法语用空格分千位：1 000 000，小数点用逗号：2,5。', en: 'Cents takes an s only at the end (deux cents but deux cent un); mille never does; million and milliard are nouns and do (deux millions). French separates thousands with spaces (1 000 000) and uses a comma for decimals (2,5).' },
      words: [
        { fr: 'cent', zh: '100 一百', en: '100 a hundred', note: { zh: '不说 un cent', en: 'not “un cent”' } },
        { fr: 'cent un', zh: '101 一百零一', en: '101 a hundred and one' },
        { fr: 'deux cents', zh: '200 两百', en: '200 two hundred' },
        { fr: 'deux cent cinquante', zh: '250 两百五十', en: '250 two hundred and fifty' },
        { fr: 'mille', zh: '1 000 一千', en: '1,000 a thousand', note: { zh: '不说 un mille', en: 'not “un mille”' } },
        { fr: 'deux mille', zh: '2 000 两千', en: '2,000 two thousand' },
        { fr: 'dix mille', zh: '10 000 一万', en: '10,000 ten thousand', note: { zh: '法语没有“万”，说“十个千”', en: 'French counts ten thousands, as English does' } },
        { fr: 'cent mille', zh: '100 000 十万', en: '100,000 a hundred thousand' },
        { fr: 'un million', zh: '1 000 000 一百万', en: '1,000,000 a million' },
        { fr: 'un milliard', zh: '1 000 000 000 十亿', en: 'a billion' },
      ],
    },
    {
      id: 'ordinaux', emoji: '', title: { fr: 'Les ordinaux en -ième', zh: '序数词 -ième', en: 'Ordinals in -ième' },
      memo: [
        { zh: '规律：基数词 + -ième（≈ 英语 -th）。去掉词尾 e：quatre → quatrième。', en: 'Rule: cardinal + -ième (≈ English -th). Drop a final e: quatre → quatrième.' },
        { zh: '只有三个要小心：cinq → cinquième（加 u），neuf → neuvième（f 变 v），un → premier / première（完全不同）。', en: 'Only three to watch: cinq → cinquième (add u), neuf → neuvième (f becomes v), un → premier / première (a word of its own).' },
        { zh: '缩写看最后的字母：1er、1re、2e、3e……', en: 'Abbreviations keep the last letters: 1er, 1re, 2e, 3e…' },
      ],
      tip: { zh: '数字 + ième：去掉末尾的 e（quatre → quatrième），cinq 加 u（cinquième），neuf 的 f 变 v（neuvième）。只有 1 特殊：premier / première。写法：1er、2e、3e。', en: 'Number + ième: drop a final e (quatre → quatrième), cinq adds u (cinquième), neuf turns f into v (neuvième). Only 1 is special: premier / première. Written 1er, 2e, 3e.' },
      words: [
        { fr: 'premier', zh: '第一（阳）1er', en: 'first (m.) 1st', alt: ['première'] },
        { fr: 'première', zh: '第一（阴）1re', en: 'first (f.) 1st' },
        { fr: 'deuxième', zh: '第二 2e', en: 'second 2nd', note: { zh: '也说 second / seconde', en: 'also second / seconde' } },
        { fr: 'troisième', zh: '第三 3e', en: 'third 3rd' },
        { fr: 'quatrième', zh: '第四 4e', en: 'fourth 4th' },
        { fr: 'cinquième', zh: '第五 5e', en: 'fifth 5th' },
        { fr: 'neuvième', zh: '第九 9e', en: 'ninth 9th' },
        { fr: 'dixième', zh: '第十 10e', en: 'tenth 10th' },
        { fr: 'vingt et unième', zh: '第二十一 21e', en: 'twenty-first 21st' },
        { fr: 'centième', zh: '第一百 100e', en: 'hundredth 100th' },
        { fr: 'dernier', zh: '最后一个（阳）', en: 'last (m.)', alt: ['dernière'] },
      ],
    },
    {
      id: 'calcul', emoji: '', title: { fr: 'Le calcul', zh: '加减乘除', en: 'Arithmetic' },
      memo: [
        { zh: '四个运算名词都是阴性，而且和英语拼写一样：une addition, une soustraction, une multiplication, une division。', en: 'The four operation nouns are feminine and spelled almost like English: une addition, une soustraction, une multiplication, une division.' },
        { zh: 'fois = 次，一次 = une fois，所以“乘”就是“几次”：trois fois deux = 三次二。', en: 'Fois means “time(s)”: une fois = once, so times is literally “three times two”.' },
        { zh: 'égale → equal，le double → double，la moitié ← mi（中间、一半，和 midi 的 mi 一样）。', en: 'Égale → equal, le double → double, la moitié ← mi (half, the same mi as in midi).' },
      ],
      tip: { zh: '说结果可以用 égale（等于），也可以用 font：Deux plus trois égale cinq / font cinq。', en: 'Give the result with “égale” or “font”: deux plus trois égale cinq / font cinq.' },
      words: [
        { fr: 'plus', zh: '加 +', en: 'plus +', note: { zh: '算数时 s 发音', en: 'the s is pronounced in sums' } },
        { fr: 'moins', zh: '减 −', en: 'minus −' },
        { fr: 'fois', zh: '乘 ×', en: 'times ×' },
        { fr: 'divisé par', zh: '除以 ÷', en: 'divided by ÷' },
        { fr: 'égale', zh: '等于 =', en: 'equals =' },
        { fr: 'une addition', zh: '加法', en: 'an addition' },
        { fr: 'une soustraction', zh: '减法', en: 'a subtraction' },
        { fr: 'une multiplication', zh: '乘法', en: 'a multiplication' },
        { fr: 'une division', zh: '除法', en: 'a division' },
        { fr: 'le résultat', zh: '结果', en: 'the result' },
        { fr: 'le double', zh: '两倍', en: 'double' },
        { fr: 'la moitié', zh: '一半', en: 'half' },
      ],
    },
    {
      id: 'mots', emoji: '', title: { fr: 'Les mots pour compter', zh: '和数字有关的词', en: 'Words for counting' },
      memo: [
        { zh: '三个“数”别混：un chiffre = 数字符号（0–9，像 cipher），un nombre = 数量（像 number），un numéro = 编号（电话、房间号，像 No.）。', en: 'Three “numbers”: un chiffre = a digit (0–9, cf. cipher), un nombre = a quantity, un numéro = a label (phone, room, cf. No.).' },
        { zh: 'compter ↔ English count / compute，都是“算”。le prix ↔ price，l\'âge ↔ age，l\'étage = 楼层（étage = “一层层”）。', en: 'Compter ↔ count / compute. Le prix ↔ price, l\'âge ↔ age, l\'étage = floor (a layer).' },
        { zh: 'centime 来自 cent（一百）：一欧元的百分之一。', en: 'Centime comes from cent (a hundred): one hundredth of a euro.' },
      ],
      tip: { zh: 'nombre = 数量／数；chiffre = 数字符号（0–9）；numéro = 编号（电话、房间、门牌）。', en: 'nombre = a number (amount); chiffre = a digit (0–9); numéro = a number used as a label (phone, room, house).' },
      words: [
        { fr: 'compter', zh: '数；计算', en: 'to count' },
        { fr: 'combien', zh: '多少', en: 'how much / how many' },
        { fr: 'un nombre', zh: '数；数量', en: 'a number (amount)' },
        { fr: 'un chiffre', zh: '数字符号', en: 'a digit' },
        { fr: 'un numéro', zh: '编号；号码', en: 'a number (label)' },
        { fr: "l'âge (m.)", zh: '年龄', en: 'age' },
        { fr: "l'étage (m.)", zh: '楼层', en: 'floor (storey)' },
        { fr: 'le prix', zh: '价格', en: 'the price' },
        { fr: "l'euro (m.)", zh: '欧元', en: 'euro' },
        { fr: 'le centime', zh: '分（欧分）', en: 'cent' },
        { fr: 'environ', zh: '大约', en: 'about, roughly' },
        { fr: 'une étoile', zh: '星星', en: 'a star' },
      ],
    },
  ],

  /* ---------- 2. rules ---------- */
  rules: [
    {
      emoji: '', title: { fr: 'Construire un nombre', zh: '数字怎么组成', en: 'How numbers are built' },
      tip: { zh: '法语从 70 开始用“二十进位”：70 = 60 + 10，80 = 4 × 20，90 = 4 × 20 + 10。', en: 'From 70, French counts in twenties: 70 = 60 + 10, 80 = 4 × 20, 90 = 4 × 20 + 10.' },
      rows: [
        { fr: 'vingt et un', zh: '21：个位是 1 时用 et', en: '21: “et” when the unit is 1' },
        { fr: 'vingt-deux', zh: '22：其他用连字符', en: '22: otherwise a hyphen' },
        { fr: 'soixante et onze', zh: '71 = 60 + 11', en: '71 = 60 + 11' },
        { fr: 'quatre-vingts', zh: '80 = 4 × 20，末尾有 s', en: '80 = 4 × 20, with an s' },
        { fr: 'quatre-vingt-un', zh: '81：没有 et，没有 s', en: '81: no “et”, no s' },
        { fr: 'quatre-vingt-dix-sept', zh: '97 = 4 × 20 + 17', en: '97 = 4 × 20 + 17' },
        { fr: 'deux cents, deux cent trois', zh: '200 有 s，203 没有', en: '200 has an s, 203 does not' },
        { fr: 'trois mille', zh: '3 000：mille 不变', en: '3,000: mille never changes' },
        { fr: 'cinq cent un millions six cent vingt-deux mille sept cent trente et un', zh: '501 622 731：三位一组读', en: '501,622,731: read in groups of three' },
      ],
    },
    {
      emoji: '', title: { fr: 'Les ordinaux dans la vie', zh: '序数词怎么用', en: 'Ordinals in use' },
      tip: { zh: '日期只有 1 号用 premier，其他用基数：le premier mai，le deux mai。国王和世纪：Louis XIV 读 Louis quatorze，但 le vingt et unième siècle。', en: 'Dates use premier only for the 1st: le premier mai, le deux mai. Kings take cardinals (Louis XIV = Louis quatorze), centuries take ordinals (le vingt et unième siècle).' },
      rows: [
        { fr: "C'est la première fois.", zh: '这是第一次。', en: "It's the first time." },
        { fr: "J'habite au troisième étage.", zh: '我住在四楼（法国的三层）。', en: 'I live on the third floor.' },
        { fr: 'Prenez la deuxième rue à droite.', zh: '在第二条街右转。', en: 'Take the second street on the right.' },
        { fr: 'le vingt et unième siècle', zh: '二十一世纪', en: 'the twenty-first century' },
        { fr: 'le premier mai, le deux mai', zh: '5月1日，5月2日', en: 'May 1st, May 2nd' },
        { fr: 'le dernier jour', zh: '最后一天', en: 'the last day' },
      ],
    },
    {
      emoji: '', title: { fr: 'Dire un calcul', zh: '怎么说算式', en: 'Saying a calculation' },
      tip: { zh: '问：Combien font … ? 答：… font / égale …', en: 'Ask: Combien font … ? Answer: … font / égale …' },
      rows: [
        { fr: 'Deux plus trois égale cinq.', zh: '2 + 3 = 5', en: '2 + 3 = 5' },
        { fr: 'Dix moins quatre font six.', zh: '10 − 4 = 6', en: '10 − 4 = 6' },
        { fr: 'Six fois sept font quarante-deux.', zh: '6 × 7 = 42', en: '6 × 7 = 42' },
        { fr: 'Vingt divisé par quatre égale cinq.', zh: '20 ÷ 4 = 5', en: '20 ÷ 4 = 5' },
        { fr: 'La moitié de dix, c’est cinq.', zh: '十的一半是五。', en: 'Half of ten is five.' },
        { fr: 'Le double de six, c’est douze.', zh: '六的两倍是十二。', en: 'Double six is twelve.' },
      ],
    },
  ],

  /* ---------- 3. asking about numbers ---------- */
  questions: [
    {
      word: 'Combien ?', zh: '多少', en: 'How many?',
      q: { fr: "Combien d'étoiles y a-t-il ?", zh: '有多少颗星星？', en: 'How many stars are there?' },
      a: [{ fr: 'Il y en a cinq cents.', zh: '有五百颗。', en: 'There are five hundred.' }],
    },
    {
      word: 'C’est combien ?', zh: '多少钱', en: 'How much is it?',
      q: { fr: "C'est combien ?", zh: '多少钱？', en: 'How much is it?' },
      a: [
        { fr: 'Ça fait combien ?', zh: '（结账时）一共多少钱？', en: '(paying) How much does it come to?' },
        { fr: "C'est trois euros cinquante.", zh: '三欧五十。', en: "It's three euros fifty." },
      ],
    },
    {
      word: 'Quel âge ?', zh: '几岁', en: 'How old?',
      q: { fr: 'Quel âge as-tu ?', zh: '你几岁？', en: 'How old are you?' },
      a: [
        { fr: "J'ai vingt-deux ans.", zh: '我二十二岁。', en: "I'm twenty-two." },
        { fr: 'Vous avez quel âge ?', zh: '（礼貌）您多大年纪？', en: '(polite) How old are you?' },
      ],
    },
    {
      word: 'Quel numéro ?', zh: '什么号码', en: 'What number?',
      q: { fr: 'Quel est ton numéro de téléphone ?', zh: '你的电话号码是多少？', en: "What's your phone number?" },
      a: [{ fr: "C'est le zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit.", zh: '06 12 34 56 78（法国电话两位两位地读）', en: '06 12 34 56 78 (French phone numbers are read in pairs)' }],
    },
    {
      word: 'À quel étage ?', zh: '几楼', en: 'Which floor?',
      q: { fr: 'Tu habites à quel étage ?', zh: '你住几楼？', en: 'Which floor do you live on?' },
      a: [{ fr: "J'habite au troisième étage.", zh: '我住在三层（中国的四楼）。', en: 'I live on the third floor.' }],
    },
    {
      word: 'Combien font… ?', zh: '等于多少', en: 'What is…?',
      q: { fr: 'Combien font sept fois huit ?', zh: '七乘八等于多少？', en: 'What is seven times eight?' },
      a: [{ fr: 'Sept fois huit font cinquante-six.', zh: '七乘八等于五十六。', en: 'Seven times eight is fifty-six.' }],
    },
    {
      word: 'Le combien ?', zh: '几号', en: 'Which date?',
      q: { fr: "On est le combien aujourd'hui ?", zh: '今天几号？', en: "What's the date today?" },
      a: [{ fr: 'On est le trois octobre.', zh: '今天十月三日。', en: "It's October 3rd." }],
    },
    {
      word: 'Combien de temps ?', zh: '多长时间', en: 'How long?',
      q: { fr: 'Ça prend combien de temps ?', zh: '要多长时间？', en: 'How long does it take?' },
      a: [{ fr: 'Environ vingt minutes.', zh: '大约二十分钟。', en: 'About twenty minutes.' }],
    },
    {
      word: 'Quelle place ?', zh: '第几名', en: 'Which place?',
      q: { fr: 'Tu es arrivé à quelle place ?', zh: '你得了第几名？', en: 'What place did you come?' },
      a: [{ fr: 'Je suis arrivé deuxième.', zh: '我得了第二名。', en: 'I came second.' }],
    },
  ],

  /* ---------- 4. verbs ---------- */
  verbs: [
    { inf: 'compter', ex: { fr: 'Elle compte les étoiles.', zh: '她数星星。', en: 'She counts the stars.' } },
    { inf: 'calculer', ex: { fr: 'Je calcule vite.', zh: '我算得很快。', en: 'I calculate quickly.' } },
    { inf: 'coûter', ex: { fr: 'Ça coûte combien ?', zh: '这个多少钱？', en: 'How much does it cost?' } },
    { inf: 'ajouter', ex: { fr: "J'ajoute trois étoiles.", zh: '我加上三颗星星。', en: 'I add three stars.' } },
    { inf: 'avoir', ex: { fr: "Elle a vingt-deux ans.", zh: '她二十二岁。', en: "She's twenty-two." } },
    { inf: 'faire', ex: { fr: 'Deux et deux font quatre.', zh: '二加二等于四。', en: 'Two and two make four.' } },
  ],

  widgets: ['stars'],
  quizExtras: ['nombres'],

  proverbs: [
    { fr: 'Jamais deux sans trois.', zh: '事不过三（好事坏事都成三）。', en: 'Things come in threes.' },
    { fr: 'Un tiens vaut mieux que deux tu l’auras.', zh: '一鸟在手，胜过二鸟在林。', en: 'A bird in the hand is worth two in the bush.' },
    { fr: 'Se mettre en quatre.', zh: '竭尽全力。', en: 'To bend over backwards.' },
    { fr: 'Faire les cent pas.', zh: '来回踱步。', en: 'To pace up and down.' },
    { fr: 'Couper la poire en deux.', zh: '各让一步。', en: 'To meet halfway.' },
  ],

  /* ---------- 5. story ---------- */
  story: {
    title: { fr: 'La Compteuse d’étoiles', zh: '数星星的人', en: 'The Star Counter' },
    scenes: [
      { emoji: '', bg: 'night', fr: 'Sur une toute petite planète, une femme compte les étoiles.', zh: '在一颗很小很小的星球上，一个女人在数星星。', en: 'On a very small planet, a woman counts the stars.' },
      { emoji: '', bg: 'night', fr: 'Un, deux, trois… Elle compte lentement, jusqu’à dix.', zh: '一、二、三……她慢慢地数，一直数到十。', en: 'One, two, three… She counts slowly, up to ten.' },
      { emoji: '', bg: 'evening', fr: 'Puis onze, douze, treize… Elle écrit chaque nombre dans un grand cahier.', zh: '然后十一、十二、十三……她把每个数都写进一本大本子里。', en: 'Then eleven, twelve, thirteen… She writes every number in a big notebook.' },
      { emoji: '', bg: 'evening', time: '20:00', fr: 'Un soir, Léa arrive à huit heures. « Bonsoir ! Combien d’étoiles y a-t-il ? »', zh: '一天晚上，Léa 八点到了。“晚上好！有多少颗星星？”', en: 'One evening Léa arrives at eight. “Good evening! How many stars are there?”' },
      { emoji: '', bg: 'night', fr: '« Cinq cent un millions six cent vingt-deux mille sept cent trente et une ! »', zh: '“五亿零一百六十二万二千七百三十一颗！”', en: '“Five hundred and one million, six hundred and twenty-two thousand, seven hundred and thirty-one!”' },
      { emoji: '', bg: 'dawn', fr: '« Et toi, tu as quel âge ? » « J’ai vingt-deux ans. J’habite au troisième étage, à Paris. »', zh: '“那你几岁？”“我二十二岁，住在巴黎的三层。”', en: '“And how old are you?” “I’m twenty-two. I live on the third floor, in Paris.”' },
      { emoji: '', bg: 'morning', fr: '« Sept fois huit ? » demande la Compteuse. « Cinquante-six ! » répond Léa.', zh: '“七乘八？”数星星的人问。“五十六！”Léa 回答。', en: '“Seven times eight?” asks the Counter. “Fifty-six!” answers Léa.' },
      { emoji: '', bg: 'night', fr: 'Ce soir-là, elles comptent ensemble. La première étoile, la deuxième, la troisième…', zh: '那天晚上，她们一起数。第一颗星，第二颗，第三颗……', en: 'That night they count together. The first star, the second, the third…' },
      { emoji: '', bg: 'night', fr: '« Une seule étoile suffit, » dit Léa, « si c’est la tienne. »', zh: '“一颗星星就够了，”Léa 说，“只要是你的那一颗。”', en: '“One star is enough,” says Léa, “if it’s yours.”' },
    ],
  },
});
