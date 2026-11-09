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

Each secret code has `final: true` and belongs to one entry of the ordered `bonus` array. The first supplies the missing 10 gems after exchanging all junk. Each following secret code supplies a full 100-gem key.

```js
codes: [
  { code: 'START-LION', gems: 100 },
  { code: 'GIFT-ONE', gems: 100 },
  { code: 'GIFT-TWO', gems: 100 },
  { code: 'choya', gems: 10, final: true },
  { code: 'prophecies', gems: 100, final: true }
]
```

Code matching ignores case and surrounding whitespace. Each code can be redeemed once. Main code order is unrestricted; physical placement controls the natural sequence.

## Economy and ending

- One key costs 100 gems.
- 100 copper, or 1 silver, exchanges for 1 gem.
- All regular chest junk together sells for exactly 9000 copper, or 90 silver, regardless of gift count.
- Choya adds 10 gems, allowing the first secret key. Prophecies adds 100 gems for the second secret key.
- The next secret chest appears once all regular chests and earlier secret stages are complete, its own code is redeemed, and an unused key is owned.
- Materials and collectibles cannot be sold. Buyback returns junk for exactly its original sale price.

The bonus array contains perfume first and legendary second. Each entry has a unique id, its matching secret code, title, subtitle, clue, and hint. Edit bonus[0] for the perfume journal and bonus[1] for the final book journal. A legacy single-object bonus configuration is also supported.

## Before playing

1. Replace the demo text and codes.
2. Run `npm run validate` and `npm test`.
3. Rebuild `play-offline.html` with `python build_standalone.py`.
4. Walk through the entire quest, including junk sales and the secret code.
5. Start with a clean test browser profile, or explicitly clear test progress with `localStorage.removeItem(QUEST_CONFIG.storageKey); location.reload();`.
6. Keep the configuration fixed during play and retain a copy for restoring backups.

The English translation includes a narrowly scoped upgrade for the previous demo's saves. Changing the actual clues, codes, or gift IDs still changes save compatibility.

Sound is initially disabled. Toggle it with Sound or M; the preference is saved separately. Reduced motion skips the long chest animation while preserving rewards. Generate paper cards using `npm run print:cards` and `docs/PRINTABLE_CODES.md`.
