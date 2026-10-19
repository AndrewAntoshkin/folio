---
name: ui-review
description: Use before shipping a screen or flow to check layout, states, and keyboard access.
---

# Review a screen

Review one screen the way a user would use it.

## Steps
1. Open the screen at 390 px and at 1280 px.
2. Use it with the keyboard only: Tab order, visible focus, Escape closes overlays.
3. Check the states: loading, empty, error, long text.
4. Compare spacing, type, and color with the design system.
5. Write findings in three groups: `blocking`, `should-fix`, `note`.

## Each finding has
- the element
- what is wrong
- the fix
- how to check it

## Done when
- No `blocking` items remain
- Both widths were checked after the fixes
