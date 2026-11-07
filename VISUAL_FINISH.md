# Completed visual build

The project includes 38 local image regions: chest, key, gem and material icons; journal, bag, wallet and navigation crops; window and slot textures; an old Lion's Arch background.

The interface remains interactive HTML. Text, prices, buttons, and clues are rendered separately from the bitmap surfaces.

Sources are recorded in docs/ASSET_SOURCES.json. Raw inputs and crop coordinates are in local-input. Generated images, CSS, icon mapping, and hashes are in assets/real-ui. The offline file embeds its assets and skips external requests.

The shared click handler recognizes navigation buttons rather than the window container. Submitting a code or exchanging currency no longer recreates the form before it submits. Window frames use nine-slice borders without covering the interactive center.

Version 1.3 translates the interface, accessibility labels, engine messages, demo journals, tools, tests, and documentation into English. The copyright footer, publication notices, and em dashes have been removed. The third-party source license remains with the assets.

The translated demo preserves saves from the preceding unchanged demo. Ordinary configuration compatibility validation remains active. See TEST_RESULTS.md and previews/ for verification.

The decorative map, health orb, skill bar, and location labels have been removed. GitHub Pages uses the `_site/` artifact built by `npm run build:pages` and the included Actions workflow.
