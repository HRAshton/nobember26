# Local asset pipeline

The current build already includes 47 image regions. Source screenshots are in `local-input/screenshots/`; crop coordinates are in `local-input/slices.local.json`; compiled assets are in `assets/real-ui/`. See `ASSET_SOURCES.json` for provenance and source hashes.

## Rebuild

Install Pillow from requirements-local.txt, then run:

```sh
python tools/finish_local.py --check --strict
python tools/finish_local.py --strict --standalone
python tools/create_contact_sheet.py
python tools/selftest.py
```

The Windows and macOS/Linux finish scripts run the same pipeline. No downloads are needed for the included image set.

## Replace artwork

Put pre-cut images in `local-input/ready-slices/` using the names in tools/finish_local.py. Examples include window_frame.png, window_title.png, slot_empty.png, chest_panel.png, merchant_panel.png, trading_panel.png, and item_chest.png. Ready-made slices take priority over mapped source regions.

To use a whole screenshot, open `tools/calibrate.html`, choose the image, select an element type, draw its rectangle, and download slices.local.json. Place the mapping and source images in their corresponding local-input directories.

```json
{
  "version": 1,
  "regions": [
    {"name": "window_title", "file": "inventory.png", "rect": [50, 60, 360, 36]},
    {"name": "window_frame", "file": "inventory.png", "rect": [30, 30, 430, 460], "slice": [20, 20, 20, 20]}
  ]
}
```

Coordinates are x, y, width, height in source pixels. The example coordinates must be adapted to the selected screenshot. Nine-slice margins are left, top, right, bottom. Select clean surfaces without text, prices, or items that would duplicate HTML content. The compiler rejects unsupported filenames and rectangles outside the source image.

Strict mode requires window_frame, window_title, slot_empty, chest_panel, merchant_panel, and trading_panel. Partial builds may omit strict mode. The compiler produces skin.css, asset-map.js, asset-report.json with hashes, PNG crops, and optionally play-offline.html. The contact sheet provides a quick visual inspection.

Additional targets include the health orb, minimap, skill slots, and menu icons. For a custom optional API-based icon set, tools/fetch_api_icons.py remains available; the included completed set does not use it.

To revert the bitmap skin, remove the real-ui stylesheet link and use the original asset map. Logic, currencies, and journal behavior are independent of the skin. The original code remains available in the Git backup.

`npm start` serves the project on port 3000. A second device can use the computer's local network address. Progress remains separate in each browser; use Wallet exports to transfer it.
