# Decisions and remaining content

## Recorded design decisions, October 31, 2026

- 12:01 UTC: inventory-style quest with Black Lion Chests, physical codes, gems, and keys.
- 12:02 UTC: source configuration instead of an admin interface.
- 12:11 UTC: establish requirements before implementation.
- 12:14 UTC: identical closed chests, ordered gifts, journal clues, localStorage, and close visual references.
- 12:16 UTC: configurable gift count.
- 12:18 UTC: sell junk for almost one key; a separate final code supplies the difference.
- 12:23 UTC: one player, unrestricted main-code order, manual junk sales, strongest reward last.
- 12:27 UTC: exactly four drops; the extra chest is hidden and granted after the final key purchase in the natural flow.
- 12:30 UTC: inventory implementation approved.
- 12:34 UTC: inventory mechanics confirmed and an archive backup requested.
- Later completion: local assets found, cropped, and embedded; form navigation corrected; Git baseline and completed build saved.
- English revision: translate all project text, remove em dashes and visible disclaimer/copyright/publication notices; retain source asset records and the third-party license.

## Current fixed behavior

One player, source configuration, localStorage, identical main chests with ordered journals, four rewards, separate Quest Bag, Material Storage, manual sales and buyback, currency exchange, and one hidden final chest. A key and each main code equal 100 gems; total junk equals 90 silver; the final code equals 10 gems.

## Content still supplied by the organizer

1. Final gift count and actual physical gifts and locations.
2. Real codes, their placement, and the method of finding the secret code.
3. Personalized journal titles, clues, and final message.
4. Optional custom decorative item choices and imagery.

The delivered configuration uses three demo gifts. Technical choices already implemented include responsive desktop/mobile layouts, shortcuts, optional synthesized sound, reduced motion, growing bags, deterministic junk allocation, persistent buyback, and JSON save transfer.

To repeat a test run, use a separate browser profile or deliberately clear only the quest's storage key. The English release recognizes the exact previous demo save checksums; edits to actual quest content continue to use ordinary compatibility checks.
