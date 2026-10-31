# Black Lion Gift Quest v1.3

A personal, offline gift quest with a Guild Wars 2 style inventory. Find physical notes, redeem codes for gems, buy keys, open chests, and read journals that lead to the next gift.

## Start

- Run `start-windows.bat` or `npm start`, then open http://localhost:3000. Requires Node.js 18 or later.
- Alternatively, open `play-offline.html`. Images, styles, and scripts are embedded in this single file.
- Playing requires no internet connection or Python installation. A local server provides consistent browser save behavior.

## Personalize

Edit `config.js` using `docs/CUSTOMIZATION.md`. It currently contains three demo gifts and English clues. The number of regular chests follows the `gifts` array.

Demo codes: `START-LION`, `GIFT-ONE`, `GIFT-TWO`, `LAST-SECRET`.

After editing, run `npm run validate` and `python build_standalone.py` to update the offline file. `npm start` reads the current configuration directly. Generate paper cards with `npm run print:cards`; see `docs/PRINTABLE_CODES.md`.

## Play

Each main code grants 100 gems. A key costs 100 gems. Each regular chest gives four items: a journal, junk, a material, and a collectible. The journal appears last and remains readable in the Quest Bag.

Sell junk manually at the Merchant. All regular junk together is worth 90 silver, which exchanges for 90 gems. The secret code grants the remaining 10 gems. Buying the extra key reveals a final chest with a legendary journal.

`I` opens Inventory, `O` opens Black Lion, `M` toggles sound, and `Esc` closes an overlay or window. Double-click to use an item, right-click for its menu. On a phone, select an item and press Use / Read; hold an item for its menu. Arrow keys in the reader navigate collected journals. The skill bar and minimap are decorative.

## Saves

Progress is saved automatically in the current browser. Wallet displays currencies and keys. The English demo preserves progress from the previous unchanged demo; other configuration changes retain the existing compatibility checks.

## Assets and development

The 47 local assets include item and menu icons, window and slot textures, a health orb, skill images, a minimap crop, and an old Lion's Arch background. Source pages, exact crop rectangles, and source hashes are in `docs/ASSET_SOURCES.json`. The third-party license file is retained beside the asset records.

The complete local set skips the optional metadata API fallback. The single-file version embeds its assets and makes no external requests. See `docs/LOCAL_ASSET_PIPELINE.md` to replace images.

- `npm test`: engine, save, configuration, server, and interface checks.
- `npm run validate`: configuration and economy validation.
- `python tools/finish_local.py --check --strict`: verify required source layers.
- `python tools/finish_local.py --strict --standalone`: crop assets and rebuild the offline file; requires Pillow from requirements-local.txt.
- `python tools/selftest.py`: crop compiler checks.
- `python scripts/browser-smoke.py`: full walkthrough, mobile layout, save reload, and offline asset checks. Requires Playwright and Edge on Windows or Chromium on Linux. Set QUEST_BROWSER_EXECUTABLE for another installed browser.
- Additional browser checks: `scripts/browser-wallet-smoke.py`, `scripts/browser-api-icons-smoke.py`, `scripts/release-shots.py`.

Screenshots are in `previews/`. Test details are in `TEST_RESULTS.md`.
