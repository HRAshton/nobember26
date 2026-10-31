# Prepare your gift quest

All quest content is configured in `config.js`.

## Gifts and clues

Each object in `gifts` corresponds to one regular chest. Use unique lowercase IDs such as gift-1 and gift-2.

```js
{
  id: 'gift-4',
  bookTitle: 'The Fourth Journal',
  subtitle: 'A New Chapter',
  clue: 'The riddle shown after opening the chest.',
  hint: 'An organizer hint stored in the configuration.',
  junkName: 'Worn Copper Coin',
  junkIcon: '◇',
  material: 'Glittering Sand',
  materialIcon: '✧',
  collectible: 'Old Captain Emblem',
  collectibleIcon: '✦'
}
```

The required fields are bookTitle, subtitle, clue, junkName, material, and collectible. Copy an entry and change its ID and text to add another gift. The supplied artwork cycles across gifts.

Each chest contains a journal, junk, a material, and a collectible. Closed chests look identical. Journals remain in the Quest Bag and cannot be sold or consumed.

## Codes

Provide one main code per gift. Each main code grants economy.keyPriceGems gems, normally 100. Give the first code at the start; place the second code with physical gift 1, and so on. The final regular gift does not need another main code.

One separate code must have `final: true`. It supplies the missing gems for the last key, normally 10. Hide it where it will be discovered near the end.

```js
codes: [
  { code: 'START-LION', gems: 100 },
  { code: 'GIFT-ONE', gems: 100 },
  { code: 'GIFT-TWO', gems: 100 },
  { code: 'LAST-SECRET', gems: 10, final: true }
]
```

Code matching ignores case and surrounding whitespace. Each code can be redeemed once. Main code order is unrestricted; physical placement controls the natural sequence.

## Economy and ending

- One key costs 100 gems.
- 100 copper, or 1 silver, exchanges for 1 gem.
- All regular chest junk together sells for exactly 9000 copper, or 90 silver, regardless of gift count.
- The final code adds 10 gems, allowing one extra key.
- The bonus chest appears once all regular chests are open, the final code is redeemed, and an unused key is owned.
- Materials and collectibles cannot be sold. Buyback returns junk for exactly its original sale price.

Edit bonus.title, bonus.subtitle, bonus.clue, and bonus.hint for the final journal. The final clue is hidden until that chest is opened.

## Before playing

1. Replace the demo text and codes.
2. Run `npm run validate` and `npm test`.
3. Rebuild `play-offline.html` with `python build_standalone.py`.
4. Walk through the entire quest, including junk sales and the secret code.
5. Start with a clean test browser profile, or explicitly clear test progress with `localStorage.removeItem('gw2-black-lion-quest-v1'); location.reload();`.
6. Keep the configuration fixed during play and retain a copy for restoring backups.

The English translation includes a narrowly scoped upgrade for the previous demo's saves. Changing the actual clues, codes, or gift IDs still changes save compatibility.

Sound is initially disabled. Toggle it with Sound or M; the preference is saved separately. Reduced motion skips the long chest animation while preserving rewards. Generate paper cards using `npm run print:cards` and `docs/PRINTABLE_CODES.md`.
