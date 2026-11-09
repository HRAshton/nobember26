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
    { code: 'prophecies', gems: 10, description: 'Dedicated final code', final: true }
  ],
  gifts: [
    {
      id: 'gift-1',
      bookTitle: 'The Cartographer\'s Journal I',
      subtitle: 'At the Edge of Dawn',
      clue: '\u041f\u0435\u0440\u0432\u044b\u0439 \u0441\u043b\u0435\u0434 \u0438\u0449\u0438 \u0432\u043d\u0438\u0437\u0443. \u042f \u043b\u0435\u0436\u0443 \u043d\u0430 \u0437\u0435\u043c\u043b\u0435 \u0438 \u0442\u0435\u0440\u043f\u0435\u043b\u0438\u0432\u043e \u0436\u0434\u0443, \u043a\u043e\u0433\u0434\u0430 \u0442\u044b \u043e\u043f\u0443\u0441\u0442\u0438\u0448\u044c \u0432\u0437\u0433\u043b\u044f\u0434.',
      hint: 'On the ground.',
      junkName: 'Worn Lion Seal',
      junkIcon: '\u265c',
      material: 'Pile of Glittering Dust',
      materialIcon: '\u2727',
      collectible: 'Miniature Lion\'s Arch Anchor',
      collectibleIcon: '\u2693'
    },
    {
      id: 'gift-2',
      bookTitle: 'The Cartographer\'s Journal II',
      subtitle: 'Among Forgotten Stories',
      clue: '\u0417\u0434\u0435\u0441\u044c \u0447\u0430\u0448\u043a\u0438 \u0436\u0434\u0443\u0442 \u0433\u043e\u0440\u044f\u0447\u0435\u0433\u043e \u0447\u0430\u044f, \u0430 \u0442\u0430\u0440\u0435\u043b\u043a\u0438 \u0436\u0434\u0443\u0442 \u043d\u043e\u0432\u043e\u0433\u043e \u0437\u0430\u0441\u0442\u043e\u043b\u044c\u044f. \u0421\u0440\u0435\u0434\u0438 \u043d\u0438\u0445 \u0441\u043f\u0440\u044f\u0442\u0430\u043b\u0441\u044f \u0442\u0432\u043e\u0439 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u043f\u043e\u0434\u0430\u0440\u043e\u043a.',
      hint: 'Among the dishes.',
      junkName: 'Broken Dragon Tooth',
      junkIcon: '\u25c6',
      material: 'Orichalcum Ore',
      materialIcon: '\u2b21',
      collectible: 'Old Caravan Token',
      collectibleIcon: '\u2723'
    },
    {
      id: 'gift-3',
      bookTitle: 'The Cartographer\'s Journal III',
      subtitle: 'When Time Stands Still',
      clue: '\u0420\u044f\u0434\u043e\u043c \u0441 \u043c\u0430\u043b\u0435\u043d\u044c\u043a\u0438\u043c \u043e\u043a\u043d\u043e\u043c \u0432 \u0431\u043e\u043b\u044c\u0448\u043e\u0439 \u043c\u0438\u0440 \u043d\u0430\u0448\u043b\u043e\u0441\u044c \u043c\u0435\u0441\u0442\u043e \u0438 \u0434\u043b\u044f \u043c\u0435\u043d\u044f. \u0418\u0449\u0438 \u0432\u043e\u0437\u043b\u0435 \u043f\u043b\u0430\u043d\u0448\u0435\u0442\u0430.',
      hint: 'By the tablet.',
      junkName: 'Empty Merchant Box',
      junkIcon: '\u25a3',
      material: 'Crystalline Shard',
      materialIcon: '\u2726',
      collectible: 'Captain\'s Emblem',
      collectibleIcon: '\u269c'
    },
    {
      id: 'gift-4',
      bookTitle: 'The Cartographer\'s Journal IV',
      subtitle: 'A Hidden Message',
      clue: '\u041d\u0430\u0434\u043e \u043c\u043d\u043e\u0439 \u0440\u043e\u0436\u0434\u0430\u044e\u0442\u0441\u044f \u0441\u043b\u043e\u0432\u0430 \u0438 \u043d\u0430\u0447\u0438\u043d\u0430\u044e\u0442\u0441\u044f \u043f\u0440\u0438\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f. \u041f\u0440\u0438\u043f\u043e\u0434\u043d\u0438\u043c\u0438 \u043a\u043b\u0430\u0432\u0438\u0430\u0442\u0443\u0440\u0443. \u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0430\u044f \u043d\u0430\u0445\u043e\u0434\u043a\u0430 \u0436\u0434\u0451\u0442 \u043f\u043e\u0434 \u043d\u0435\u0439.',
      hint: 'Under the keyboard.',
      junkName: 'Tarnished Copper Token',
      junkIcon: '\u25c7',
      material: 'Pile of Glittering Dust',
      materialIcon: '\u2727',
      collectible: 'Navigator\'s Keepsake',
      collectibleIcon: '\u2693'
    },
    {
      id: 'gift-5',
      bookTitle: 'The Cartographer\'s Journal V',
      subtitle: 'The Final Trail',
      clue: '\u0417\u0434\u0435\u0441\u044c \u0434\u043e\u0440\u043e\u0436\u043d\u044b\u0435 \u043e\u0434\u0435\u0436\u0434\u044b \u043e\u0442\u0434\u044b\u0445\u0430\u044e\u0442 \u043c\u0435\u0436\u0434\u0443 \u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u0438\u044f\u043c\u0438. \u041e\u0441\u043c\u043e\u0442\u0440\u0438 \u0441\u0442\u043e\u0439\u043a\u0443, \u043d\u0430 \u043a\u043e\u0442\u043e\u0440\u043e\u0439 \u043e\u043d\u0438 \u0436\u0434\u0443\u0442 \u0441\u0432\u043e\u0435\u0433\u043e \u0447\u0430\u0441\u0430.',
      hint: 'On the clothes rack.',
      junkName: 'Worn Caravan Buckle',
      junkIcon: '\u25c6',
      material: 'Orichalcum Ore',
      materialIcon: '\u2b21',
      collectible: 'Traveler\'s Emblem',
      collectibleIcon: '\u269c'
    }
  ],
  bonus: {
    title: 'The Last Page of the Legend',
    subtitle: 'Legendary Reward',
    clue: '\u041f\u044f\u0442\u044c \u043d\u0430\u0445\u043e\u0434\u043e\u043a \u0443\u0436\u0435 \u0441\u0442\u0430\u043b\u0438 \u0447\u0430\u0441\u0442\u044c\u044e \u0442\u0432\u043e\u0435\u0439 \u0438\u0441\u0442\u043e\u0440\u0438\u0438. \u041f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f \u0436\u0434\u0451\u0442 \u0441\u0440\u0435\u0434\u0438 \u0447\u0443\u0436\u0438\u0445, \u0442\u0430\u043c, \u0433\u0434\u0435 \u043a\u043d\u0438\u0433\u0438 \u0441\u0442\u043e\u044f\u0442 \u043f\u043b\u0435\u0447\u043e\u043c \u043a \u043f\u043b\u0435\u0447\u0443.',
    hint: 'Among the books.'
  }
};
