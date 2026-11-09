# Black Lion Gift Quest v1.4

A personal, offline gift quest with a Guild Wars 2 style inventory. Find physical notes, redeem codes for gems, buy keys, open chests, and read journals that lead to the next gift.

## Start

- Run `start-windows.bat` or `npm start`, then open http://localhost:3000. Requires Node.js 18 or later.
- Alternatively, open `play-offline.html`. Images, styles, and scripts are embedded in this single file.
- Playing requires no internet connection or Python installation. A local server provides consistent browser save behavior.

## Personalize

Edit `config.js` using `docs/CUSTOMIZATION.md`. It contains five regular gifts and two sequential secret gifts, with Russian quotations and source attributions. The journal hint button emphasizes the key phrase in the quotation. The number of regular chests follows the `gifts` array.

Main codes are `gem`, `goblet`, `scruffy`, `gold`, and `silk`. The perfume code is `choya`, granting 10 gems. The dedicated final book code is `prophecies`, granting 100 gems. Main codes grant 100 gems each.

After editing, run `npm run validate` and `python build_standalone.py` to update the offline file. `npm start` reads the current configuration directly. Generate paper cards with `npm run print:cards`; see `docs/PRINTABLE_CODES.md`.

## Play

Each main code grants 100 gems. A key costs 100 gems. Each regular chest gives four items: a journal, junk, a material, and a collectible. The journal appears last and remains readable in the Quest Bag.

Sell junk manually at the Merchant. All regular junk together is worth 90 silver, which exchanges for 90 gems. The code `choya` grants the remaining 10 gems for the first secret key. That chest provides the clue to the perfume under the grand piano. Place the `prophecies` code with the perfume gift. It grants 100 gems for the second secret key and the final legendary journal leading to the book. Each chest gives four rewards.

`I` opens Inventory, `O` opens Black Lion, `M` toggles sound, and `Esc` closes an overlay or window. Double-click to use an item, right-click for its menu. On a phone, select an item and press Use / Read; hold an item for its menu. Arrow keys in the reader navigate collected journals.

## Saves

Progress is saved automatically in the current browser. Wallet displays currencies and keys. The personal quest uses its own browser save key. Previous personal saves upgrade automatically. A previously redeemed ten-gem prophecies code becomes the equivalent choya redemption. A previously completed book chest stays complete and receives one key to open the newly added perfume chest.

## Assets and development

The 39 local assets include item and menu icons, window and slot textures, and an old Lion's Arch background. Source pages, exact crop rectangles, and source hashes are in `docs/ASSET_SOURCES.json`. The third-party license file is retained beside the asset records.

The complete local set skips the optional metadata API fallback. The single-file version embeds its assets and makes no external requests. See `docs/LOCAL_ASSET_PIPELINE.md` to replace images.

- `npm test`: engine, save, configuration, server, and interface checks.
- `npm run validate`: configuration and economy validation.
- `python tools/finish_local.py --check --strict`: verify required source layers.
- `python tools/finish_local.py --strict --standalone`: crop assets and rebuild the offline file; requires Pillow from requirements-local.txt.
- `python tools/selftest.py`: crop compiler checks.
- `python scripts/browser-smoke.py`: full walkthrough, mobile layout, save reload, and offline asset checks. Requires Playwright and Edge on Windows or Chromium on Linux. Set QUEST_BROWSER_EXECUTABLE for another installed browser.
- Additional browser checks: `scripts/browser-wallet-smoke.py`, `scripts/browser-api-icons-smoke.py`, `scripts/release-shots.py`.

Screenshots are in `previews/`. Test details are in `TEST_RESULTS.md`.

## GitHub Pages

Run `npm run build:pages` to generate `_site/` with the playable static site. Paths are relative, including for a repository subpath such as `/quest/`.

Push this repository to GitHub on `main` or `master`. In Settings > Pages, choose GitHub Actions as the build source. The included workflow runs validation and tests, builds the site, and deploys the Pages artifact. It can also be started manually from Actions.

The Pages artifact contains the game HTML, JavaScript, styles, local assets, and `.nojekyll`. The offline file can be played separately. Browser progress is stored per origin and the configured quest key.
