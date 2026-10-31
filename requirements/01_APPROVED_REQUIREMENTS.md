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
- The separate final code grants 10 gems.
- Materials and collectibles are not sellable. Starting coins, gems, and keys are zero.

## Bonus chest

The hidden chest is absent from initial counts and previews. It appears once all main chests are open, the final code has been redeemed, an unused key is owned, and no bonus chest has been granted. Normal progression reveals it immediately after the extra key purchase. The same eligibility check handles an early secret code or spare key without a dead end.

Its closed appearance matches the ordinary chest. Opening it consumes one key and grants a legendary journal plus three non-sellable rewards. The final clue is not exposed before opening.

## Inventory and screens

Starter Backpack and Quest Bag each begin with 20 slots and expand for larger quests. Materials can be deposited in Material Storage. Collectibles use a separate collection. Search, automatic compaction, tooltips, selection, context menus, and wallet are available. Items and journals must not disappear because of capacity.

Screens include Inventory, Black Lion Chest, Merchant, Currency Exchange, Gem Store, Redeem Code, Book Reader, and Wallet. The initial screen resembles an open inventory, without an introductory landing page.

## Persistence and presentation

localStorage tracks codes, currencies, keys, opened chests, bonus flags, items, journals, material deposits, and buyback. Export/import supports moving compatible saves between browsers. A fixed configuration produces repeatable rewards after a deliberate reset.

The interface uses game references, compact proportions, item rarity borders, readable tooltips, double-click actions, keyboard controls, and a mobile layout. Audio is optional and reduced-motion preferences are honored.

Current presentation requirements: English text throughout, no em dashes, and no visible copyright, disclaimer, or publication notices. Asset provenance and the third-party license stay in the source tree.
