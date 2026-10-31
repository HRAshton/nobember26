# Final release — test evidence, 2026-10-31

- `npm test`: **30/30 PASS** (economic invariants, gift count 1/2/5/10/30, backup/import, printable cards, new HUD structure)
- `npm run validate`: **PASS** (100 gems/key, 9000 copper total junk, 10 gems final code; final key remains gated by economics)
- `python scripts/browser-smoke.py`: **PASS** in headless Chromium. Tested intro, context menu/Preview without spoilers, all 3 regular chests, 4 items per chest, book-last and reading, trading, selling all junk, exchange 90 silver, final 10-gem code, secret chest spawn and opening, reload persistence, audio toggle, reduced motion, 390px mobile viewport.
- `python scripts/browser-api-icons-smoke.py`: **PASS** with mocked official API (remote icons loaded from validated render.guildwars2.com paths; local images remain offline). Real external API was not reachable from this runtime.
- `python scripts/release-shots.py`: **PASS**, Trading Company and Merchant screenshot.
- `play-offline.html`: generated from the same source files via `python build_standalone.py`.

## Caveats

The game HUD and its mini map/skills are decorative. Offline mode uses original local SVG art. The layout is game-inspired, not a byte-for-byte or pixel-for-pixel reproduction of ArenaNet assets. All codes and text remain in client-side config and can be inspected by a determined player.
