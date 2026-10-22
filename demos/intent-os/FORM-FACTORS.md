# Form factors: real model, not a showcase

Principle: ONE Intent OS, same spaces/modules/rules/participants/plan state. A form factor changes the *projection*: what is shown, density, input, and safety, never the data. Every module the desktop has must exist on every device (possibly in a reduced representation), and every action must work.

Devices: desktop and phone. `?device=desktop|phone`, keys 1/2 (no modifier, ignored while a field has focus), or the «Вид» switcher.

## Shared contract per module
Each module type defines 2 representations: `full` (desktop space, phone sheet) and `compact` (phone card). Implement once in the module registry, render per device. No device-specific fake content.

## The switcher («Вид»)
A glass bar in its own 52px band above the OS (8 + 36 + 8; it never covers the device), DESIGN.md tokens throughout:
- 8pt grid: a 36px bar = 4 + 28 + 4, 4px padding all round, radius 12. Label cell left («Вид» / «View as», 12px each side, so its text sits 16px from the bar edge and 16px from the control), segmented control right, 4px gap.
- Segmented control 28px high, radius 8, no inner padding: the white thumb is exactly one segment (equal-width segments, min 104px; icon 16 + 8 gap + label 13px) and slides under the choice in 160ms (cubic-bezier(.2,.8,.2,1)). The bar width is snapped to whole pixels.
- States: hover +4% fill, pressed .98 scale and +8% fill, focus-visible 2px accent ring. Arrow keys move the choice (radiogroup, roving tabindex).
- A small accent dot marks the device the current context suggests (trip → phone). While a module is dragged the bar gets an accent ring and a segment lights up as a drop target (handoff).
- At ≤ 520px viewport it compacts to icons only and the phone bleeds full screen under it (no bezel).

## The switch: frame morph, shared chrome, content fade-through
Switching devices never remounts the page. The frame springs from one device to the other in 450ms on the DESIGN.md spring (stiffness ~300, damping ~30); the chrome that both layouts share travels with it; the content does a fade-through. Nothing cuts, nothing washes grey, no card ever crosses another or leaves a gap.
1. **The frame** springs from the old device to the new one (an empty shell with the bezel ring); the real old background (fog with its mist, or the night fog) crossfades into the new one over 400ms, and the page around the frame does the same.
2. **Shared elements: the clock (time and date), the intent line and the status items (avatar, weather)** are the live nodes in their new layout, travelling from where they were with a uniform scale, so text never distorts. They run on the same spring 1.8× ahead of the frame (home by 250ms), so they are all but in place before the new content shows. One is not shared when the two layouts draw it differently (the desktop's «10° · 14:13» pill and the phone's «10°») or when its new place would clip where it starts (the phone's docked intent line inside the desktop's masked list at 390px); it fades through with the content.
3. **The content fades through, as one.** Everything else on the old screen (a frozen copy: a shadow-root clone under the old device classes) fades out together and is gone at 100ms (front-loaded: under a tenth by 60ms). Everything else on the new screen fades in together from 120ms on one curve (240ms, cubic-bezier(.2,.8,.2,1)), rising 8px from 0.96 scale; full-screen layers only fade. Cards, chips, modules, sheets, windows: nothing travels, so a column never has to cross a grid, and the chip row fades as one group.
4. **Paths are planned before anything moves** (`ffPlan`), in page pixels: a straight line from where an element was to where it lands, held inside the moving frame (8px inset, as far as its two ends allow) so nothing is cut at the frame edge. Wherever a shared element would pass over the content on screen at that moment (the old content until 60ms, the new once past a tenth at 130ms; faint content under a list's fade counts too) — the intent line also over another shared element — it fades to 0 for that stretch, 45ms each way. An overlap with the old content inside its start box, or with the new content inside its landing box, is layered by design (the dock over the list's faded edge). In practice the intent line fades while it crosses the screen and the avatar while it would cross the weather pill.
5. **The intent line reflows for real**: one solid element whose width springs between the two layouts while it travels.
6. **Veils.** Scrims and veils cover the whole moving frame, so no device-shaped column appears. A veil that is up in both layouts (settings, profile) stays solid the whole way: the frozen copy keeps only what is above it, and while backdrop blur cannot render under the moving screen's clip, the parts below the veil get the same blur as a filter. *Parked panels* (the phone's control centre above the screen) sit out the morph, because the moving screen does not clip and the rise would bring them in.
7. **The bezel** thins on the spring and its ink fades while it is thin (gone below a third of its width), so no hairline is left round the screen.
8. **One clock.** Every part of the morph is set to the time of one bare timing animation on each frame, and a part's fade for a crossing rides in its own path keyframes, so composited parts can never run ahead of the frame, the clip and the intent line on a late frame. The clock starts on the first frame that shows the morph (that frame is 0ms) and the first few frames, which carry the costly first paint, move it on one frame each, so the start is never skipped; after that it keeps real time.
   For tests, `FF.seek(t)` holds every part at t ms and `FF.play()` lets it run on, so freeze frames taken after a real key press are exact.
9. **A frame that does not move** (a phone-width window, where both layouts fill the viewport) has nothing to bridge the gap, so the two screens cross-fade instead: the old one fades out over 100ms on a symmetric curve and the new one starts at 40ms, so no frame is empty. The frame is measured in layout pixels (`documentElement.clientWidth/Height`), never `innerWidth`, which a zoomed-out mobile viewport inflates.
10. Interrupting a switch settles the running one and starts the next from its layout; no frozen copies, shells or inline styles are left behind.

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
- **Backdrop.** A dimmed scrim. The active stack card shows its accent ring only once the keyboard is in use (a tap or drag clears it), and drops it while the sheet is open and during a morph. What the large sheet covers (the space title row, the stack, the dock) sits out, so neither a morph nor the frozen copy can show it around a moving sheet. Swiping between modules pages their content inside one continuous sheet.
- **The morph lands in this form.** The sheet fades in with the rest of the new screen; the frozen copy hides the stack rows the sheet covered (rows under its top edge are cut there).
- **Closing keeps the content.** The sheet slides down with its content as it was: entrance animations (a chat bubble's pop) only fill backwards, so a finished one can never be rewound to blank.
- **Control centre** = full-width pull-down sheet from the top. Pull down from the weather pill (it follows the finger) or tap it; close by pushing the grabber up, swiping up anywhere on its content once it is scrolled to the end (from a slider too: a horizontal drag stays with the slider), tapping the grabber, or tapping the dimmed screen below it (the scrim takes that tap, so nothing underneath is hit).
- **Space switcher** = horizontal card carousel: swipe up from the home bar (or tap it) to open and again to return, tap empty space to return, swipe a card up to close that space.
- **Sheets, windows, notifications.** A module sheet also dismisses when its content is pulled down from the top (every scroller inside at 0). Settings and profile drag down by the grabber, the header band, or the body pulled down at its top; past 120px or on a flick they close. Notifications close on a swipe up at the end of the list; an item swipes sideways to dismiss (the × is for pointers).
- **Touch targets** are 40 minimum: small visual controls (avatars, condition ×, colour dots, segments) keep their size and get a 40×40 hit area.
- **Keyboard.** Inputs carry an `enterkeyhint` (go / send). The viewport resizes with the keyboard (`interactive-widget=resizes-content`) and the phone frame follows `visualViewport`, so the docked intent line and a sheet's reply field sit just above the keyboard on iOS as well.
- Every desktop action reachable.

## Acceptance (must demo end-to-end on each device)
1. Open Лиссабон -> see flights, stay, weather modules -> book TAP (with confirm) -> plan progress updates -> profile counters update.
2. Rule fires (rain Friday) -> suggestion appears in the right place for that device.
3. Drag/handoff a module from desktop onto «Телефон» in the switcher -> it lands in focus on the phone.
4. Switch devices mid-flow (home, space, settings open): state identical, the same module stays in focus, and the freeze frames at 0/90/180/270/360/450ms show no hole, overlap or ghost (90ms is the fade-through's quiet point: frame, background, clock and status only).
Record a video per device of the flow. Critique loop per DESIGN.md.
