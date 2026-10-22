# Form factors: real model, not a showcase

Principle: ONE Intent OS, same spaces/modules/rules/participants/plan state. A form factor changes the *projection*: what is shown, density, input, and safety, never the data. Every module the desktop has must exist on every device (possibly in a reduced representation), and every action must work.

Devices: desktop and phone. `?device=desktop|phone`, keys 1/2 (no modifier), or the «Вид» switcher.

## Shared contract per module
Each module type defines 2 representations: `full` (desktop space, phone sheet) and `compact` (phone card). Implement once in the module registry, render per device. No device-specific fake content.

## The switcher («Вид»)
A glass bar in its own 52px band above the OS (8 + 36 + 8; it never covers the device), DESIGN.md tokens throughout:
- 8pt grid: a 36px bar = 4 + 28 + 4, 4px padding all round, radius 12. Label cell left («Вид» / «View as», 12px each side, so its text sits 16px from the bar edge and 16px from the control), segmented control right, 4px gap.
- Segmented control 28px high, radius 8, no inner padding: the white thumb is exactly one segment (equal-width segments, min 104px; icon 16 + 8 gap + label 13px) and slides under the choice in 160ms (cubic-bezier(.2,.8,.2,1)). The bar width is snapped to whole pixels.
- States: hover +4% fill, pressed .98 scale and +8% fill, focus-visible 2px accent ring. Arrow keys move the choice (radiogroup, roving tabindex).
- A small accent dot marks the device the current context suggests (trip → phone). While a module is dragged the bar gets an accent ring and a segment lights up as a drop target (handoff).
- At ≤ 520px viewport it compacts to icons only and the phone bleeds full screen under it (no bezel).

## The switch: one shared-element morph
Switching devices never remounts the page. The same windows and intents reflow from one layout into the other in 450ms on the DESIGN.md spring (stiffness ~300, damping ~30). Nothing cuts, nothing washes grey, and every frame shows readable content.
1. **The frame** springs from the old device to the new one (an empty shell with the bezel ring); the real old background (fog with its mist, or the night fog) crossfades into the new one over 400ms, and the page around the frame does the same.
2. **Shared elements are the live nodes in their new layout**, travelling from where they were: clock, date, intent line, suggestion chips, home cards, status items, space title, collaborators, plan, modules, flow labels, settings/profile windows. They keep a uniform scale so text never distorts. An element hidden by its list's fade (the phone's 4th card) is not shared; it fades like the rest of its screen.
3. **The travel is planned before anything moves** (`ffPlan`), in page pixels:
   - *One spring, one curve.* Every element rides the same spring with its whole box (centre and size) on one progress value, on a straight line from where it was to where it lands. All of them leave on the same frame and land at 450ms (no bows, no wave), so a column reflowing into a grid moves as one group and never zigzags left/right.
   - *Inside the frame.* Each path is held inside the moving frame (8px inset, only as far as its two ends allow), so nothing is cut at the frame edge on the way.
   - *Never over text.* Whatever would still pass over something else's text fades to 0 for that stretch, 45ms each way: the intent line first (it stays above the cards and moves 1.6× faster so the stretch is short), otherwise the smaller of the two; parts of the new screen that only fade in (the desktop's 4th home card) hold their fade while any moving glass is over them. The intent line and chips give way to any touch (2px). Two cards give way only where the upper one's glass (later in the document) would cover a line of the lower one's text or an icon; empty glass corners may brush on the way. Two things that overlap where they land (a sheet over its list) are layered by design and never count.
   - *Parked panels* (the phone's control centre above the screen) sit out the morph, because the moving screen does not clip.
4. **The intent line reflows for real**: one solid element whose width springs between the two layouts while it travels.
5. **Two drawings of one thing** (a desktop module and its phone card) are a container transform: the box takes the path's width, hangs from the path's top edge and is cut at the bottom to its height. Its glass is solid from the start, under the old drawing. The old drawing stays solid until 70ms and is gone at 120ms, so the desktop drawing is off the screen before the frame has narrowed much; the new content fades in from 90ms.
6. **Everything else**: a frozen copy of the old screen (a shadow-root clone under the old device classes) is below 0.15 opacity by 90ms and gone at 120ms; the new screen's other parts fade in from 90ms. Scrims and veils cover the whole moving frame, so no device-shaped column appears. A veil that is up in both layouts (settings, profile) stays solid the whole way: the frozen copy keeps only what is above it, and while backdrop blur cannot render under the moving screen's clip, the parts below the veil get the same blur as a filter.
7. **The bezel** thins on the spring and its ink fades while it is thin (gone below a third of its width), so no hairline is left round the screen.
8. **One clock.** Every part of the morph is set to the time of one bare timing animation on each frame, and a part's fade for a crossing rides in its own path keyframes, so composited parts can never run ahead of the frame, the clip and the intent line on a late frame. The clock starts on the first frame that shows the morph (that frame is 0ms) and the first few frames, which carry the costly first paint, move it on one frame each, so the start is never skipped; after that it keeps real time.
   For tests, `FF.seek(t)` holds every part at t ms and `FF.play()` lets it run on, so freeze frames taken after a real key press are exact.
9. Interrupting a switch settles the running one and starts the next from its layout; no frozen copies, shells or inline styles are left behind.

Reduced motion: nothing moves or scales. The old device (frame and screen) fades out in 160ms, the new one fades in from 120ms.

The keyboard-hints coach only appears on a fresh desktop load; a switch removes it and never brings it back.

## Phone (Телефон)
- Home: clock, suggestions, cards (compact) for all spaces, scrollable; intent line as bottom bar. The list fades out above the intent line; a card whose first row would not clear that fade fades out whole (no empty glass edge), and the fade eases back over the first 40px of scrolling.
- Status bar 32px each side; the unread dot sits on the avatar's edge at 45°, clear of the screen corner.
- Opening a card = space view: modules as a vertical stack of `compact` cards, tap to expand to `full` in a bottom sheet, participants in the header, plan progress as a sticky top strip.
- **The sheet is the card** (every module kind). No card inside the sheet: no inner border, shadow or second rounded box, no flow label row. Full width, 28px top radius only, opaque paper. Top to bottom:
  1. Grabber, 36×5 at 8px.
  2. A compact 48px header row: app icon, context (source · flow, de-duplicated, since the big title follows), mic.
  3. The big title.
  4. Content, which scrolls. A chat's reply field and a checklist's add row stick to the bottom of the scroll area on the sheet surface (content fades under them), and a chat stays on its newest message while the sheet changes height.
  5. Actions pinned to the bottom of the sheet with a hairline above, 34px clear of the home indicator. «More actions» is 13px in an AA tone.
- **Detents.** Large (56px below the screen top) and medium (46%); the sheet bottom is always the screen's bottom edge. The screen and the sheet clip rather than hide overflow, so nothing (a focused field, a scroll-into-view) can scroll them and move the sheet or the home indicator. Between the detents the sheet resizes, so the actions stay pinned. Below medium it slides and dismisses on distance (120px) or a flick. A tap or Enter/Space on the grabber switches detents; the scrim and Esc close it. It opens in 280ms ease-out (scrim 240ms) and closes in 180ms ease-in, always reopens at large, and a closed sheet takes the tapped card's page at once, so it only slides up.
- **Backdrop.** A dimmed scrim. The active stack card drops its accent ring while the sheet is open and during a morph. What the large sheet covers (the space title row, the stack, the dock) sits out, so neither a morph nor the frozen copy can show it around a moving sheet. Swiping between modules pages their content inside one continuous sheet.
- **The morph lands in this form.** The module itself is the surface that travels. The sheet's own fill is off while morphing, and the frozen copy hides the stack rows the sheet covered (rows under its top edge are cut there).
- Control center = full-width pull-down sheet from the top; space switcher = horizontal card carousel (swipe up gesture/button).
- Every desktop action reachable.

## Acceptance (must demo end-to-end on each device)
1. Open Лиссабон -> see flights, stay, weather modules -> book TAP (with confirm) -> plan progress updates -> profile counters update.
2. Rule fires (rain Friday) -> suggestion appears in the right place for that device.
3. Drag/handoff a module from desktop onto «Телефон» in the switcher -> it lands in focus on the phone.
4. Switch devices mid-flow (home, space, settings open): state identical, the same module stays in focus, and the freeze frames at 0/90/180/270/360/450ms show readable content with no double exposure.
Record a video per device of the flow. Critique loop per DESIGN.md.
