# Printable code cards

Edit the codes in `config.js`, then run:

```sh
npm run validate
npm run print:cards
```

The default output is `black-lion-PRIVATE-code-cards.html` beside the project directory. Open it, press Ctrl+P, select A4, and enable background printing for colored cards.

Choose another path with:

```powershell
npm run print:cards -- "C:\Users\USER\Desktop\gift-codes.html"
```

- QUEST START: hand over before the first chest.
- AFTER GIFT #1: place the second main code with the first physical gift.
- AFTER GIFT #2: place the third main code with the second physical gift, continuing as needed.
- SECRET CODE 1, choya: hide separately for discovery after the five ordinary gifts.
- SECRET CODE 2, prophecies: place with the perfume under the grand piano.

For the current five ordinary gifts, the sheet contains five main cards and two secret cards, seven cards in total. The generator validates the configuration, escapes HTML, and leaves game progress unchanged.
