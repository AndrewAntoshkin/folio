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
   - *One spring, one curve.* Every element rides the same spring with its whole box (centre and size) on one progress value. Its centre follows a quadratic bow from start to end; all cards share one bow, all chips share one bow, everything else goes straight. The bow is chosen from straight → fully axis-first: the straightest one where the fewest things cross each other's text wins (a 2-column grid closing into a column needs rows to open first, or neighbours pass through each other).
   - *Small stagger.* Cards and chips set off in a wave of at most 64ms (down the rows they land in or the rows they leave, whichever crosses least) and all land at 450ms, so the reflow reads as one movement.
   - *Inside the frame.* Each path is held inside the moving frame (8px inset, only as far as its two ends allow), so nothing is cut at the frame edge on the way.
   - *Never over text.* Whatever would still pass over something else's text fades to 0 for that stretch, 45ms each way: the intent line first (it stays above the cards and moves 1.6× faster so the stretch is short), otherwise the smaller of the two; parts of the new screen that only fade in hold their fade while something passes. The intent line and chips give way to any touch (2px). Two cards give way only where the upper one's glass (later in the document) would cover a line of the lower one's text or an icon; empty glass corners may brush on the way. Two things that overlap where they land (a sheet over its list) are layered by design and never count.
   - *Parked panels* (the phone's control centre above the screen) sit out the morph, because the moving screen does not clip.
4. **The intent line reflows for real**: one solid element whose width springs between the two layouts while it travels.
5. **Two drawings of one thing** (a desktop module and its phone card) are a container transform: the box takes the path's width and is cut at the bottom to its height. The old drawing stays solid until 70ms and is gone at 120ms, so the desktop drawing is off the screen before the frame has narrowed much; the new one (glass and content) fades in from 90ms.
6. **Everything else**: a frozen copy of the old screen (a shadow-root clone under the old device classes) is below 0.15 opacity by 90ms and gone at 120ms; the new screen's other parts fade in from 90ms. Scrims and veils cover the whole moving frame, so no device-shaped column appears.
7. **The bezel** thins on the spring and its ink fades while it is thin (gone below a third of its width), so no hairline is left round the screen.
8. Interrupting a switch settles the running one and starts the next from its layout; no frozen copies, shells or inline styles are left behind.

Reduced motion: nothing moves or scales. The old device (frame and screen) fades out in 160ms, the new one fades in from 120ms.

The keyboard-hints coach only appears on a fresh desktop load; a switch removes it and never brings it back.

## Phone (Телефон)
- Home: clock, suggestions, cards (compact) for all spaces, scrollable; intent line as bottom bar. The list fades out above the intent line; a card whose first row would not clear that fade fades out whole (no empty glass edge), and the fade eases back over the first 40px of scrolling.
- Status bar 32px each side; the unread dot sits on the avatar's edge at 45°, clear of the screen corner.
- Opening a card = space view: modules as a vertical stack of `compact` cards, tap to expand to `full` in a bottom sheet (drag to dismiss), participants in the header, plan progress as a sticky top strip.
- Control center = full-width pull-down sheet from the top; space switcher = horizontal card carousel (swipe up gesture/button).
- Every desktop action reachable.

## Acceptance (must demo end-to-end on each device)
1. Open Лиссабон -> see flights, stay, weather modules -> book TAP (with confirm) -> plan progress updates -> profile counters update.
2. Rule fires (rain Friday) -> suggestion appears in the right place for that device.
3. Drag/handoff a module from desktop onto «Телефон» in the switcher -> it lands in focus on the phone.
4. Switch devices mid-flow (home, space, settings open): state identical, the same module stays in focus, and the freeze frames at 0/90/180/270/360/450ms show readable content with no double exposure.
Record a video per device of the flow. Critique loop per DESIGN.md.
