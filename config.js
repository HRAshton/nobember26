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
      clue: 'Лежу я где-то на земле',
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
      clue: 'Среди посуды мы стоим',
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
      clue: 'У планшета, где и место',
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
      clue: 'Под клавиатурой я',
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
      clue: 'На одеждной стойке',
      hint: 'On the clothes rack.',
      junkName: 'Worn Caravan Buckle',
      junkIcon: '◆',
      material: 'Orichalcum Ore',
      materialIcon: '⬡',
      collectible: 'Traveler\'s Emblem',
      collectibleIcon: '⚜'
    }
  ],
  bonus: {
    title: 'The Last Page of the Legend',
    subtitle: 'Legendary Reward',
    clue: 'Среди книжек',
    hint: 'Among the books.'
  }
};
