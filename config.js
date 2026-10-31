/*
  GW2 BLACK LION GIFT QUEST — DEMO CONFIG
  Change this file to replace the demo gifts and codes.
  All values are client-side and visible in browser DevTools.
  DO NOT use genuine secrets if you need real cryptographic protection.
*/
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
    { code: 'START-LION', gems: 100, description: 'Начало пути' },
    { code: 'GIFT-ONE', gems: 100, description: 'Код из первого подарка' },
    { code: 'GIFT-TWO', gems: 100, description: 'Код из второго подарка' },
    { code: 'LAST-SECRET', gems: 10, description: 'Тайная находка', final: true }
  ],
  gifts: [
    {
      id: 'gift-1',
      bookTitle: 'Записки картографа I',
      subtitle: 'На краю рассвета',
      clue: 'Где рождается утро и закипает вода, загляни за коробку с любимым чаем.',
      hint: 'Демо-подсказка: кухня, коробка с чаем.',
      junkName: 'Потёртая львиная печать',
      junkIcon: '♜',
      material: 'Горсть мерцающей пыли',
      materialIcon: '✧',
      collectible: 'Миниатюрный якорь Львиного Архипелага',
      collectibleIcon: '⚓'
    },
    {
      id: 'gift-2',
      bookTitle: 'Записки картографа II',
      subtitle: 'Среди забытых историй',
      clue: 'Там, где на полках живут сотни чужих судеб, ищи страницу, которую никто не переворачивал.',
      hint: 'Демо-подсказка: книжный шкаф.',
      junkName: 'Сломанный зуб дракона',
      junkIcon: '◆',
      material: 'Кусочек орихалковой руды',
      materialIcon: '⬡',
      collectible: 'Знак старого каравана',
      collectibleIcon: '✣'
    },
    {
      id: 'gift-3',
      bookTitle: 'Записки картографа III',
      subtitle: 'Когда время остановится',
      clue: 'Последний след ведёт к хранителю времени. Посмотри там, где слышен его тихий ход.',
      hint: 'Демо-подсказка: рядом с часами.',
      junkName: 'Пустая шкатулка торговца',
      junkIcon: '▣',
      material: 'Кристаллический осколок',
      materialIcon: '✦',
      collectible: 'Эмблема капитана',
      collectibleIcon: '⚜'
    }
  ],
  bonus: {
    title: 'Последняя страница легенды',
    subtitle: 'Легендарная награда',
    clue: 'Всё, что ты искал, было частью одной истории. Её последний секрет ждёт там, где спрятан главный сюрприз.',
    hint: 'Демо-подсказка для финального подарка — замените перед запуском.'
  }
};
