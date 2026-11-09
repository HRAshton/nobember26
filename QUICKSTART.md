# Quick start

1. Run `start-windows.bat` or `npm start` and open http://localhost:3000.
2. To play without installing anything, open `play-offline.html` instead.
3. Test using gem, goblet, scruffy, gold, and silk, followed by choya for perfume and prophecies for the final book.

The images are already included. No screenshot preparation or network access is needed.

To change the configured clues and codes, edit `config.js` using `docs/CUSTOMIZATION.md`. Run `npm run validate`, then `python build_standalone.py` to update the offline page. Normal server mode uses configuration edits immediately.

Generate paper cards with `npm run print:cards`. Progress is saved automatically in the browser you use to play.
