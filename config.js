/* Quest configuration. Edit gifts, clues and codes here. */
window.QUEST_CONFIG = {
  title: 'Black Lion Gift Quest',
  storageKey: 'gw2-black-lion-quest-personal-v1',
  seed: 'tyria-gifts-2026',
  economy: {
    keyPriceGems: 100,
    copperPerGem: 100,            // 1 silver = 1 gem
    junkTotalCopper: 9000         // 90 silver = 90 gems, in total
  },
  codes: [
    { code: 'gem', gems: 100, description: 'The Journey Begins' },
    { code: 'goblet', gems: 100, description: 'Second gift' },
    { code: 'scruffy', gems: 100, description: 'Third gift' },
    { code: 'gold', gems: 100, description: 'Fourth gift' },
    { code: 'silk', gems: 100, description: 'Fifth gift' },
    { code: 'choya', gems: 10, description: 'Perfume secret code', final: true },
    { code: 'prophecies', gems: 100, description: 'Dedicated final book code', final: true }
  ],
  gifts: [
    {
      id: 'gift-1',
      bookTitle: 'The Cartographer\'s Journal I',
      subtitle: 'At the Edge of Dawn',
      clue: "И сияли звёзды, и благоухала земля.",
      clueFocus: "земля",
      quoteAuthor: "Giacomo Puccini",
      quoteSource: "Tosca · Act III · Cavaradossi",
      hint: 'On the ground.',
      junkName: 'Worn Lion Seal',
      junkIcon: '♜',
      material: 'Pile of Glittering Dust',
      materialIcon: '✧',
      collectible: 'Miniature Lion\'s Arch Anchor',
      collectibleIcon: '⚓'
    },
    {
      id: 'gift-2',
      bookTitle: 'The Cartographer\'s Journal II',
      subtitle: 'Among Forgotten Stories',
      clue: "Выпьем из радостных бокалов.",
      clueFocus: "бокалов",
      quoteAuthor: "Giuseppe Verdi",
      quoteSource: "La traviata · Act I · Brindisi",
      hint: 'Among the dishes.',
      junkName: 'Broken Dragon Tooth',
      junkIcon: '◆',
      material: 'Orichalcum Ore',
      materialIcon: '⬡',
      collectible: 'Old Caravan Token',
      collectibleIcon: '✣'
    },
    {
      id: 'gift-3',
      bookTitle: 'The Cartographer\'s Journal III',
      subtitle: 'When Time Stands Still',
      clue: "Что толку в книге без картинок и разговоров?",
      clueFocus: "картинок и разговоров",
      quoteAuthor: "Lewis Carroll",
      quoteSource: "Alice’s Adventures in Wonderland · Chapter I",
      hint: 'By the tablet.',
      junkName: 'Empty Merchant Box',
      junkIcon: '▣',
      material: 'Crystalline Shard',
      materialIcon: '✦',
      collectible: 'Captain\'s Emblem',
      collectibleIcon: '⚜'
    },
    {
      id: 'gift-4',
      bookTitle: 'The Cartographer\'s Journal IV',
      subtitle: 'A Hidden Message',
      clue: "Слова, по моему нескромному мнению, наш самый неиссякаемый источник магии.",
      clueFocus: "Слова",
      quoteAuthor: "Albus Dumbledore",
      quoteSource: "Harry Potter and the Deathly Hallows: Part 2 · Film",
      hint: 'Under the keyboard.',
      junkName: 'Tarnished Copper Token',
      junkIcon: '◇',
      material: 'Pile of Glittering Dust',
      materialIcon: '✧',
      collectible: 'Navigator\'s Keepsake',
      collectibleIcon: '⚓'
    },
    {
      id: 'gift-5',
      bookTitle: 'The Cartographer\'s Journal V',
      subtitle: 'The Final Trail',
      clue: "Послушай, старое пальто.",
      clueFocus: "пальто",
      quoteAuthor: "Giacomo Puccini",
      quoteSource: "La bohème · Act IV · Colline",
      hint: 'On the clothes rack.',
      junkName: 'Worn Caravan Buckle',
      junkIcon: '◆',
      material: 'Orichalcum Ore',
      materialIcon: '⬡',
      collectible: 'Traveler\'s Emblem',
      collectibleIcon: '⚜'
    }
  ],
  bonus: [
    {
      id: 'perfume',
      code: 'choya',
      title: 'A Fragrant Prelude',
      subtitle: 'A Melody in the Air',
      clue: "Если музыка питает любовь, играйте.",
      clueFocus: "музыка",
      quoteAuthor: "William Shakespeare",
      quoteSource: "Twelfth Night · Act I, Scene I · Orsino",
      hint: 'Under the grand piano.'
    },
    {
      id: 'legendary',
      code: 'prophecies',
      title: 'The Last Page of the Legend',
      subtitle: 'Legendary Reward',
      clue: "У каждого путешествия есть последний день. Не спеши.",
      clueFocus: "последний день",
      quoteAuthor: "Zhongli",
      quoteSource: "Genshin Impact · Chat: Journeys",
      hint: 'Among the books.'
    }
  ]
};
