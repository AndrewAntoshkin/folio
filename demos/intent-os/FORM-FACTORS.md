# Form factors: real model, not a showcase

Principle: ONE Intent OS, same spaces/modules/rules/participants/plan state. A form factor changes the *projection*: what is shown, density, input, and safety, never the data. Every module the desktop has must exist on every device (possibly in a reduced representation), and every action must work.

Devices: desktop, tablet, phone. `?device=desktop|tablet|phone`, keys 1/2/3 (no modifier), or the «Вид» switcher.

## Shared contract per module
Each module type defines 2 representations: `full` (desktop/tablet space) and `compact` (phone card / tablet grid). Implement once in the module registry, render per device. No device-specific fake content.

## The switcher («Вид»)
A glass bar in its own 56px band above the OS (it never covers the device), DESIGN.md tokens throughout:
- Label left («Вид» / «View as»), segmented control right, 16px between them; 8pt grid (40px bar = 4 + 32 + 4, 16px left padding).
- Segmented control 32px high, equal-width segments (min 96px), icon 16 + 8 gap + label 13px. A white thumb slides under the choice in 160ms (cubic-bezier(.2,.8,.2,1)).
- States: hover +4% fill, pressed .98 scale and +8% fill, focus-visible 2px accent ring. Arrow keys move the choice (radiogroup, roving tabindex).
- A small accent dot marks the device the current context suggests (trip → phone). While a module is dragged the bar gets an accent ring and a segment lights up as a drop target (handoff).
- At ≤ 520px viewport it compacts to icons only and the phone bleeds full screen under it (no bezel).

## The switch: one shared-element morph
Switching devices never remounts the page. The same windows and intents reflow from one layout into the other in 450ms on the DESIGN.md spring (stiffness ~300, damping ~30). Nothing cuts, nothing washes grey, and every frame shows readable content.
1. **The frame** springs from the old device to the new one (an empty shell with the bezel ring); the real old background (fog with its mist, or the night fog) crossfades into the new one over 400ms, and the page around the frame does the same.
2. **Shared elements are the live nodes in their new layout**, travelling from where they were: clock, date, intent line, suggestion chips, home cards, status items, space title, collaborators, plan, modules, flow labels, settings/profile windows. They keep a uniform scale so text never distorts. A grid opening into a column (or closing back) staggers its axes so cards never cross: when the shared elements end up more column-like, rows spread first; otherwise columns spread first.
3. **The intent line reflows for real**: one solid element whose width springs between the two layouts while it travels, above everything else.
4. **Two drawings of one thing** (a desktop module and its phone card) are a container transform: the box matches the other one's width and is cut at the bottom to its height, then opens on the same spring. The old drawing stays solid until 100ms and is gone at 160ms; the new one (glass and content) fades in from 140ms. Every frame shows one of the two.
5. **Everything else**: a frozen copy of the old screen (a shadow-root clone under the old device classes) is below 0.15 opacity by 90ms and gone at 120ms; the new screen's other parts fade in from 90ms. Scrims and veils cover the whole moving frame, so no device-shaped column appears.
6. Interrupting a switch settles the running one and starts the next from its layout; no frozen copies, shells or inline styles are left behind.

Reduced motion: nothing moves or scales. The old device (frame and screen) fades out in 160ms, the new one fades in from 120ms.

The keyboard-hints coach only appears on a fresh desktop load; a switch removes it and never brings it back.

## Phone (Телефон)
- Home: clock, suggestions, cards (compact) for all spaces, scrollable; intent line as bottom bar.
- Opening a card = space view: modules as a vertical stack of `compact` cards, tap to expand to `full` in a bottom sheet (drag to dismiss), participants in the header, plan progress as a sticky top strip.
- Control center = full-width pull-down sheet from the top; space switcher = horizontal card carousel (swipe up gesture/button).
- Every desktop action reachable.

## Tablet (Планшет)
- Home: 2-column grid. Space view: two-pane (module list/stack left 40%, selected module full right 60%), or a 2-column module grid; no clipped neighbours, no overlapping pagers. Dock bottom with space padding reserved.
- Settings as a centered modal 640 wide.

## Acceptance (must demo end-to-end on each device)
1. Open Лиссабон -> see flights, stay, weather modules -> book TAP (with confirm) -> plan progress updates -> profile counters update.
2. Rule fires (rain Friday) -> suggestion appears in the right place for that device.
3. Drag/handoff a module from desktop onto «Телефон» in the switcher -> it lands in focus on the phone.
4. Switch devices mid-flow (home, space, settings open): state identical, the same module stays in focus, and the freeze frames at 0/90/180/270/360/450ms show readable content with no double exposure.
Record a video per device of the flow. Critique loop per DESIGN.md.
