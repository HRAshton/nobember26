# Visual finish — v1.0 (2026-10-31)

## Delivered
- Replaced the oversized website header with compact game-style top-left icon menu (Inventory, Merchant, Black Lion, Wallet).
- Replaced the website bottom navigation on desktop with decorative skill bar, health orb, mini map and party portrait; mobile retains an accessible tab bar.
- New translucent, textured panel treatment, tighter 10-column inventory slots and compact bag rail.
- Retuned Black Lion Chest window, four reward slots, tooltips and legendary highlighting.
- Added original fan-made cartographic minimap asset and leveraged pre-existing original harbor art.
- Optional online icons from the GW2 official API: chest (20316), key (19980), glittering dust (24272), silver ore (19703), shimmering dust (24273), powerful blood (24295). No network needed offline; local icons always remain available.

## Deliberate differences
These are independently written fan UI approximations, not a pixel-by-pixel clone and not a redistribution of ArenaNet UI textures, sound files or logos. Books, custom codes, exchange rates and collectible loot belong to the gift quest. Mini map/skillbar is decorative and does not simulate combat.

## Fan content policy
https://www.arena.net/en/legal/content-terms-of-use
https://www.guildwars2.com/en/media/asset-kit/

## Testing
Run `npm test`, `npm run validate` and `python scripts/browser-smoke.py`; a complete walkthrough is included in the latter.
