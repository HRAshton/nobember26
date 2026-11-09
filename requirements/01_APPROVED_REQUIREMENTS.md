# Functional requirements

## Concept

A personal gift quest for one player, presented as a Guild Wars 2 style inventory. The player finds physical codes, redeems them for gems, buys keys, opens chests, and reads journals that lead to physical gifts. There is no registration, admin interface, or server-side gameplay. All content is configured in source.

The number of physical gifts is configurable: N equals gifts.length. Regular chests start as one stack of N identical items. Their contents follow opening order, regardless of the icon clicked.

## Rewards

- A regular chest consumes one key and produces exactly four items: a clue journal, junk, a material, and a deterministic decorative collectible.
- The journal is revealed last and remains readable in the Quest Bag. It cannot be sold or deleted.
- Journal content is hidden until the chest is opened.
- Decorative variety must not change the total sellable junk budget.
- Reward state is persisted before animation, preventing duplicate loot on reload.

## Economy and codes

- One main code per gift, each granting 100 gems; one key costs 100 gems.
- Codes ignore case and surrounding whitespace. Each is usable once. Main code order is unrestricted.
- Junk is sold manually through Sell or Sell Junk. Buyback returns sold items for exactly the original sale price.
- All regular junk together is worth exactly 90 silver, or 9000 copper, for every supported N.
- Currency Exchange converts 100 copper to one gem. Whole gems only; leftover copper stays in the wallet.
- Choya grants 10 gems for the first secret stage. Prophecies grants 100 gems for the second secret stage.
- Materials and collectibles are not sellable. Starting coins, gems, and keys are zero.

## Bonus chest

Two secret chests appear sequentially after the five ordinary chests. The first requires choya, an unused key, and completion of the ordinary gifts. Its journal leads to perfume under the grand piano. The second requires prophecies, an unused key, and completion of the perfume stage. Its legendary journal leads to the book among books.

Each chest consumes one key and grants four non-sellable rewards. Future secret stages remain hidden until eligible. Early code redemption and spare keys cannot change the secret opening order or create a dead end.

## Inventory and screens

Starter Backpack and Quest Bag each begin with 20 slots and expand for larger quests. Materials can be deposited in Material Storage. Collectibles use a separate collection. Search, automatic compaction, tooltips, selection, context menus, and wallet are available. Items and journals must not disappear because of capacity.

Screens include Inventory, Black Lion Chest, Merchant, Currency Exchange, Gem Store, Redeem Code, Book Reader, and Wallet. The initial screen resembles an open inventory, without an introductory landing page.

## Persistence and presentation

localStorage tracks codes, currencies, keys, opened chests, bonus flags, items, journals, material deposits, and buyback. Saving is automatic; there are no import or export controls in the interface. A fixed configuration produces repeatable rewards after a deliberate reset.

The interface uses game references, compact proportions, item rarity borders, readable tooltips, double-click actions, keyboard controls, and a mobile layout. Audio is optional and reduced-motion preferences are honored.

Current presentation requirements: English text throughout, no em dashes, and no visible copyright, disclaimer, or publication notices. Asset provenance and the third-party license stay in the source tree.
