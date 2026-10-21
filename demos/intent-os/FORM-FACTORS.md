# Form factors: real model, not a showcase

Principle: ONE Intent OS, same spaces/modules/rules/participants/plan state. A form factor changes the *projection*: what is shown, density, input, and safety, never the data. Every module the desktop has must exist on every device (possibly in a reduced representation), and every action must work.

## Shared contract per module
Each module type defines 3 representations: `full` (desktop/tablet space), `compact` (phone card / tablet grid), `glance` (car: 1 big value + 1 line + max 2 actions). Implement once in the module registry, render per device. No device-specific fake content.

## Car (Авто): driving-first
States (visible toggle in the car status bar, demo-only: «Едем / Стоим», P/D):
- **Едем (driving):** glanceable in ≤2s, no scrolling lists, no typing, max 2 actions per card, text ≥ 24px, targets ≥ 64px.
- **Стоим (parked):** unlocks a full grid of spaces and modules, typing allowed.

Layout (driving):
- Left 60%: **primary lane** = navigation always, if a route exists (ETA, next maneuver, arrival time, «Добавить остановку»).
- Right 40%: **context lane** = a vertical stack of 2 glance cards chosen by the OS from the active spaces: now playing, next event («Созвон с Лео в 17:30 · Подключиться голосом»), incoming message (read aloud, reply by voice), rule-triggered suggestions (e.g. «Без снега, будильник 07:30 подтверждён»). The context lane changes with a smooth crossfade when priority changes; there's a small «почему» line.
- Bottom **dock**: spaces as large icons (Мой день, Лиссабон, Спортзал, Входящие…) plus a mic. Tapping a space shows its modules as glance cards in the context lane (the map stays).
- **Voice** is the intent line: the mic button opens the voice surface (listening/thinking/answering), and the result lands as a glance card. Outward actions (send/book/pay) get a spoken confirmation sheet with big Да/Нет.
- Notifications: non-urgent ones are held until parked (counter on the dock), urgent ones are a banner + voice.
- Handoff: a module dragged from desktop/phone lands in the context lane highlighted with «Продолжено в Авто · Вернуть».
- Dark high-contrast theme, no glass blur over the map, haptic-like press scale.

## Phone (Телефон)
- Home: clock, suggestions, cards (compact) for all spaces, scrollable; intent line as bottom bar.
- Opening a card = space view: modules as a vertical stack of `compact` cards, tap to expand to `full` in a bottom sheet (drag to dismiss), participants in the header, plan progress as a sticky top strip.
- Control center = pull-down sheet from the top-right; space switcher = horizontal card carousel (swipe up gesture/button).
- Every desktop action reachable.

## Tablet (Планшет)
- Home: 2-column grid. Space view: two-pane (module list/stack left 40%, selected module full right 60%), or a 2-column module grid; no clipped neighbours, no overlapping pagers. Dock bottom with space padding reserved.
- Settings as a centered modal 640 wide.

## Acceptance (must demo end-to-end on each device)
1. Open Лиссабон -> see flights, stay, weather modules -> book TAP (with confirm) -> plan progress updates -> profile counters update.
2. Rule fires (rain Friday) -> suggestion appears in the right place for that device (car: voice + glance card).
3. Drag/handoff desktop -> car -> Вернуть.
4. Switch devices mid-flow: state identical, the same module stays in focus.
Record a video per device of the flow. Critique loop per DESIGN.md.
