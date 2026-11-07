/* Quest configuration. Edit gifts, clues and codes here. */
window.QUEST_CONFIG = {
  title: 'Black Lion Gift Quest',
  storageKey: 'gw2-black-lion-quest-v1',
  seed: 'tyria-gifts-2026',
  economy: {
    keyPriceGems: 100,
    copperPerGem: 100,            // 1 silver = 1 gem
    junkTotalCopper: 9000         // 90 silver = 90 gems, in total
  },
  codes: [
    { code: 'START-LION', gems: 100, description: 'The Journey Begins' },
    { code: 'GIFT-ONE', gems: 100, description: 'Code from the first gift' },
    { code: 'GIFT-TWO', gems: 100, description: 'Code from the second gift' },
    { code: 'LAST-SECRET', gems: 10, description: 'A Secret Discovery', final: true }
  ],
  gifts: [
    {
      id: 'gift-1',
      bookTitle: 'The Cartographer\'s Journal I',
      subtitle: 'At the Edge of Dawn',
      clue: 'Where morning begins and water boils, look behind the box of your favorite tea.',
      hint: 'Demo hint: the kitchen, behind the tea box.',
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
      clue: 'Where hundreds of lives rest on shelves, seek the page that no one has turned.',
      hint: 'Demo hint: the bookcase.',
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
      clue: 'The final trail leads to the keeper of time. Look where you can hear its quiet ticking.',
      hint: 'Demo hint: near the clock.',
      junkName: 'Empty Merchant Box',
      junkIcon: '▣',
      material: 'Crystalline Shard',
      materialIcon: '✦',
      collectible: 'Captain\'s Emblem',
      collectibleIcon: '⚜'
    }
  ],
  bonus: {
    title: 'The Last Page of the Legend',
    subtitle: 'Legendary Reward',
    clue: 'Everything you sought was part of one story. Its final secret awaits where the greatest surprise is hidden.',
    hint: 'Demo hint for the final gift. Replace before playing.'
  }
};
