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
      clue: 'Первый след ищи внизу. Я лежу на земле и терпеливо жду, когда ты опустишь взгляд.',
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
      clue: 'Здесь чашки ждут горячего чая, а тарелки ждут нового застолья. Среди них спрятался твой следующий подарок.',
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
      clue: 'Рядом с маленьким окном в большой мир нашлось место и для меня. Ищи возле планшета.',
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
      clue: 'Надо мной рождаются слова и начинаются приключения. Приподними клавиатуру. Следующая находка ждёт под ней.',
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
      clue: 'Здесь дорожные одежды отдыхают между странствиями. Осмотри стойку, на которой они ждут своего часа.',
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
      clue: 'Не всякая мелодия слышна ушами. Иногда её можно узнать по аромату. Загляни под рояль, там тебя ждёт следующая находка.',
      hint: 'Under the grand piano.'
    },
    {
      id: 'legendary',
      code: 'prophecies',
      title: 'The Last Page of the Legend',
      subtitle: 'Legendary Reward',
      clue: 'Шесть находок уже стали частью твоей истории. Последняя ждёт среди чужих, там, где книги стоят плечом к плечу.',
      hint: 'Among the books.'
    }
  ]
};
