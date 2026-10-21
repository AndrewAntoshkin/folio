# Intent OS design bar (read before every UI change)

You are the design lead and the engineer. A senior Apple/Linear-level designer reviews every pixel. "Works" is not done; "feels inevitable" is done.

## Style (ours)
- Fog/glass from the home screen: light warm-grey, translucent surfaces, soft large shadows, 20px radius windows, 14px inner groups, hairline 1px borders at ~6% black.
- Type: one family as in the demo. Scale: 26/600 window title, 13/500 section label (secondary 50%), 15/400 row label (primary 88%), 15/400 value (secondary 55%), 13/400 helper. Max 2 weights per screen. No grey-on-grey low-contrast body text.
- 8pt grid. Window padding 28. Group inner padding 16 horizontal, row min-height 52, vertical centering always. Dividers inset 16 from group left edge.

## Layout rules
- Every row is a 2-column grid: label (flex, wraps) | control (auto, right-aligned, vertically centered). Never let a label push a control or overlap a divider.
- Icon + label always inline on one baseline (icon 16-18px, gap 10), never stacked.
- Segmented controls: same height (32), same widths across rows, aligned to the same right edge.
- Buttons and inputs aligned to the row's right edge, 32-36 height.
- All system windows: same size (760x560), same sidebar width (200), sidebar has no bg change, selected item = subtle pill only.
- Copy: short. "Когда Погода хочет сдвинуть дни" -> group title "Погода", rows "Сдвинуть дни", "Добавить модуль".

## Motion & responsiveness
- Open: scrim fades 0->1 and backdrop blur 0->24px in 240ms; window scale 0.96->1 + opacity, spring (stiffness ~300, damping ~30) or cubic-bezier(0.2,0.8,0.2,1) 280ms, from the invoking element's origin when possible.
- Close: faster, 180ms, scale to 0.98 + fade, ease-in. Interruptible (closing mid-open reverses smoothly).
- Section switch: content crossfades 120ms with 4px slide, window frame never resizes.
- Every interactive element has hover (bg +4%), pressed (scale 0.98 / bg +8%), focus-visible ring (accent 2px). Toggles/segments animate the thumb 160ms. Feedback < 100ms.
- prefers-reduced-motion: fades only.

## Process (mandatory)
1. Screenshot every changed surface at 1280x800 and 390x844, RU + EN.
2. Critique at 2x zoom as a design lead: alignment, rhythm, wrapping, contrast, hierarchy, dead space. Write the list.
3. Fix, re-screenshot. Repeat until the list is empty.
4. Record a short video of open/close and section switch.
5. Report only after that, with the screenshots.
