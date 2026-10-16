---
name: a11y-pass
description: Use when a screen needs a quick accessibility and typography check.
---

# A11y pass

Check the running page, not only the code.

## Steps
1. Text contrast is at least 4.5:1. Borders and focus rings are at least 3:1.
2. Every button, link, and input has a name a screen reader can read.
3. Tab through the page. Focus is always visible and never trapped, except inside an open dialog.
4. Dialogs: focus moves in on open, Escape closes, focus returns to the trigger.
5. Inputs on mobile use at least 16 px text.
6. Numbers in tables use `font-variant-numeric: tabular-nums`.

## Done when
- Each issue has the element, the measured value, and a fix
- The page works with keyboard only
