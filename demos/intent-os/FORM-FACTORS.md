# Form factors: real model, not a showcase

Principle: ONE Intent OS, same spaces/modules/rules/participants/plan state. A form factor changes the *projection*: what is shown, density, input, and safety, never the data. Every module the desktop has must exist on every device (possibly in a reduced representation), and every action must work.

## Shared contract per module
Each module type defines 3 representations: `full` (desktop/tablet space), `compact` (phone card / tablet grid), `glance` (car: 1 big value + 1 line + max 2 actions). Implement once in the module registry, render per device. No device-specific fake content.

## Car (Авто): deliberately reduced
User decision, overrides the earlier draft: the car does NOT project everything. No parked grid, no dock of all spaces, no lists, no typing.

The car screen is a 16:9 cockpit display (1280×720), dark smoked glass over cool dark with a soft warm glow, big light numerals with small units, one warm amber accent, thin icons. It shows only these, never a grid of everything:
- **Navigation (the hero, ~60% wide).** A dark live map: the puck moves along the route heading-up, the driven part dims, the street grid and buildings scroll under it. A maneuver tile on the map counts the distance down (big «240 м» plus a thin arrow, then the next maneuver) and flips when the turn is passed. «Добавить остановку» is a voice intent.
- **Trip tile.** Big ETA minutes and arrival time; destination, km left and traffic on one line. Updates live.
- **Media tile.** Album art disc (spins while playing), title, artist, a ticking progress bar with elapsed/remaining, previous/play-pause/next.
- **ONE context card at a time**, chosen by the OS, under the trip and media tiles (the right column is ~32%). One big value, one line, a one-line «почему» and at most 2 actions (targets ≥ 64px). It slides in over 320ms and out over 180ms and changes at most every 10s unless something urgent happens. Priority, highest first: handed-off module → spoken-confirm result → rule suggestion (rain Friday) → call/meeting within 25 min (live «мин/с» countdown) → unread message (read aloud on request) → next call/meeting → «Дорога свободна».
- **A mic.** A breathing mic orb at the bottom of the thin icon rail opens the voice overlay (listening → thinking → speaking, live transcript, suggested phrases). Voice is the only way to reach spaces: «открой Лиссабон» switches the context to that space and shows its one relevant glance card.

Plus a 48px status strip: clock (the same clock as every other device), temperature, current space name, plan progress, held-notification counter.

Switching to or from the car never remounts the page: the frame spring-morphs to the new size (450ms), the frame colour goes light → dark (400ms), the map fades in and the tiles stagger in 40ms apart. Reduced motion turns all of this into fades.

Only driving-relevant module types have a `glance` view: route/map, media, call/meeting, messages/chat, rule suggestions/plans. Other types (checklists, documents, charts, listings…) simply don't appear in the car. The exception is a module the user hands off explicitly: it lands as the context card with «Продолжено в Авто · Вернуть», reduced to one value and ≤ 2 actions (e.g. the TAP option with «Забронировать»).

Kept from the full model:
- **Same underlying state.** The car reads and writes the same modules; nothing is duplicated.
- **Spoken confirm.** Outward actions (send/book/pay) always get a spoken confirmation with big Да/Нет, by voice or by tap.
- **Held notifications.** Non-urgent ones are held while driving (a counter in the status strip) and released when the user leaves the car; urgent ones are a banner plus voice.
- **Handoff in/out.** A module dragged from desktop/phone becomes the context card; «Вернуть» sends it back to the device it came from, in focus.
- Dark high-contrast theme, no blur over the route itself, press scale on every control.

## Phone (Телефон)
- Home: clock, suggestions, cards (compact) for all spaces, scrollable; intent line as bottom bar.
- Opening a card = space view: modules as a vertical stack of `compact` cards, tap to expand to `full` in a bottom sheet (drag to dismiss), participants in the header, plan progress as a sticky top strip.
- Control center = pull-down sheet from the top-right; space switcher = horizontal card carousel (swipe up gesture/button).
- Every desktop action reachable.

## Tablet (Планшет)
- Home: 2-column grid. Space view: two-pane (module list/stack left 40%, selected module full right 60%), or a 2-column module grid; no clipped neighbours, no overlapping pagers. Dock bottom with space padding reserved.
- Settings as a centered modal 640 wide.

## Acceptance (must demo end-to-end on each device)
1. Open Лиссабон -> see flights, stay, weather modules -> book TAP (with confirm) -> plan progress updates -> profile counters update. Car: hand the flights module off (or say «открой Лиссабон», then «забронируй TAP») -> the TAP card -> «Забронировать» -> spoken confirm Да -> the card shows «Забронировано» and «План 1 из 4».
2. Rule fires (rain Friday) -> suggestion appears in the right place for that device (car: voice + the one context card, accepted by «да» or a tap).
3. Drag/handoff desktop -> car -> Вернуть.
4. Switch devices mid-flow: state identical, the same module stays in focus (car: the module is the context card if it has a glance view, otherwise the space is kept and the module is back in focus when leaving the car).
Record a video per device of the flow. Critique loop per DESIGN.md.
