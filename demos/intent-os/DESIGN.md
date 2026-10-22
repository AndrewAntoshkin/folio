# Intent OS design bar (read before every UI change)

You are the design lead and the engineer. A senior Apple/Linear-level designer reviews every pixel. "Works" is not done; "feels inevitable" is done.

## Style (ours)
- Fog/glass from the home screen: light warm-grey, translucent surfaces, soft large shadows, hairline 1px borders at ~6% black.
- Type: one family as in the demo, one scale for everything: **11 / 13 / 15 / 17 / 20 / 26 / 34 / 48 / 72**. 26/600 window title, 13/500 section label (secondary 50%), 15/400 row label (primary 88%), 15/400 value (secondary 55%), 13/400 helper, 11 for tags and captions only. Max 2 weights per screen. No grey-on-grey low-contrast body text.

## Grid (enforced by `tools/grid-audit.js`, zero violations required)
- **Spacing**: padding, margin and gap are 0, 4 or a multiple of 8. 4 is only for tight pairs (icon + label inside a chip, avatar stacks, segmented track insets).
- **Outer margins**: phone screen 16, desktop screen 24 or 32. Windows, sheets and cards: 24 on desktop, 16 on phone. Text inside a card may sit one step in (margin + 16), never anywhere else.
- **Radii by level**: level 0 surfaces (windows, sheets, cards, menus, popovers, toasts) 24 · level 1 groups (setting groups, rows, tiles, maps, calendars) 16 · level 2+ 8. Controls up to 40 tall: 8 or pill. Pieces up to 24 (tags, icon tiles, keys): 4 or 8. Pills and circles anywhere. A corner flush with its parent follows the parent; a child is never rounder than its container.
- **Icons**: glyphs 16 / 20 / 24 (12 only inside a 16 tile). Icon boxes and avatars 16 / 24 / 32 / 40, glyph centred in the box.
- **Controls**: heights 24 / 32 / 40 / 48 (touch: 40 minimum). Icon-only buttons are square. Transparent controls align by their ink (text/glyph), painted ones by their box.
- **Rows**: label-left / control-right rows share one column: every label starts on the same x, every control ends on the same x, controls vertically centred. Row min-height 48 (account row 64). Dividers inset 16 from the group's left edge.
- **Card grids**: cards in a grid share column widths and one gutter (16 between cards, 8 between control-centre tiles), and the first two text baselines line up across a row.
- **No orphans**: every item that starts a row lines up with something else in its container (a left edge, the shared right column, or a centred band). Content centred in equal columns (hourly strips, weekday headers) aligns to its column.
- **No collisions**: text never runs into other text or under a floating panel it does not belong to.

## Layout rules
- Every row is a 2-column grid: label (flex, wraps) | control (auto, right-aligned, vertically centered). Never let a label push a control or overlap a divider.
- Icon + label always inline on one baseline (icon 16, gap 8), never stacked.
- Segmented controls: same height (32, touch 40), same widths across rows, aligned to the same right edge. On phone the settings sections are a full-width segmented track.
- Buttons and inputs aligned to the row's right edge, 32 tall (touch 40).
- All system windows: same size (760x560), header row 80, sidebar width 200, sidebar has no bg change, selected item = subtle pill only.
- Copy: short. "Когда Погода хочет сдвинуть дни" -> group title "Погода", rows "Сдвинуть дни", "Добавить модуль".

## Motion & responsiveness
- Open: scrim fades 0->1 and backdrop blur 0->24px in 240ms; window scale 0.96->1 + opacity, spring (stiffness ~300, damping ~30) or cubic-bezier(0.2,0.8,0.2,1) 280ms, from the invoking element's origin when possible.
- Close: faster, 180ms, scale to 0.98 + fade, ease-in. Interruptible (closing mid-open reverses smoothly).
- Section switch: content crossfades 120ms with 4px slide, window frame never resizes.
- Every interactive element has hover (bg +4%), pressed (scale 0.98 / bg +8%), focus-visible ring (accent 2px). Toggles/segments animate the thumb 160ms. Feedback < 100ms.
- prefers-reduced-motion: fades only.

## Process (mandatory)
1. Screenshot every changed surface at 1440x900 and 390x844, RU + EN, and run the grid audit: `node demos/intent-os/tools/grid-audit.js /tmp/grid --shots` (serve the repo root on :8765 first). It opens every surface in both languages and both form factors, measures computed rects and styles, and lists every off-grid value; the report must say `violations: 0`.
2. Critique at 2x zoom as a design lead: alignment, rhythm, wrapping, contrast, hierarchy, dead space. Write the list.
3. Fix, re-screenshot. Repeat until the list is empty.
4. Record a short video of open/close and section switch.
5. Report only after that, with the screenshots.
