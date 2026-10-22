# Motion Lab

Visual rules for prototypes on this page. New experiments use these tokens and nothing else.

## Character

Fog and glass on black. Soft gradients, large type, one calm mint accent. Motion explains where something came from or that an action finished.

## Grid

8pt only. Every space, size, and offset is a multiple of 8.

| Token | px |
| --- | --- |
| space.1 | 8 |
| space.2 | 16 |
| space.3 | 24 |
| space.4 | 32 |
| space.5 | 40 |
| space.6 | 48 |
| space.8 | 64 |
| space.10 | 80 |

Stage: 392 × 640. Padding inside a phone is space.3 (24).

## Type

One scale. Do not invent sizes. Line height is the next step, or the size plus 8.

| Token | px | Use |
| --- | --- | --- |
| type.1 | 12 | Captions, status |
| type.2 | 16 | Body, keys |
| type.3 | 20 | Leads |
| type.4 | 24 | Card titles |
| type.5 | 32 | Sheet titles |
| type.6 | 40 | Amounts |
| type.7 | 48 | Large amounts |
| type.8 | 64 | Page title, hero digits |

Family: Google Sans, already loaded by the site. Weight 400 for display, 500 for labels.

## Color

| Token | Value |
| --- | --- |
| bg | #000 |
| ink | #ffffff |
| fog | rgba(255, 255, 255, 0.72) |
| quiet | rgba(255, 255, 255, 0.55) |
| mint | #cae8bd |
| glass | linear white 14% → 5%, 1px line at 16% |
| mist | mint and cool blue radial washes, never a photo |

Text on mint is #000. Do not put white on mint.

## Springs

Springs drive motion. CSS easing below is only the fallback for hover on the page chrome. Prototype motion is a numerical spring: `stiffness`, `damping`, `mass`.

| Token | stiffness | damping | mass | Feel |
| --- | --- | --- | --- | --- |
| spring.soft | 170 | 22 | 1 | Cards, shared element |
| spring.snappy | 320 | 28 | 1 | Keys, menu items |
| spring.gentle | 120 | 20 | 1 | Stack settle |
| spring.sheet | 210 | 30 | 1 | Sheets, no bounce past the edge |
| spring.pop | 420 | 26 | 0.9 | Success |
| spring.digit | 280 | 19 | 1 | Digit reels, slight overshoot |

Duration tokens exist for holds between poses, not for the travel itself.

| Token | ms |
| --- | --- |
| duration.fast | 180 |
| duration.base | 320 |
| duration.slow | 560 |
| duration.sheet | 680 |

## Motion rules

- Animate `transform` and `opacity` only.
- Never scale from 0. Closed surfaces start at 0.08 or the folded pose.
- A gesture under the finger is 1:1 (`direct.drag`). The spring runs on release.
- Opacity may lag the surface so type does not appear while the shape is still folded (`opacity.reveal`, `opacity.crossfade`, `opacity.stagger`).
- Start the loop only while the phone is in view. Pause it offscreen.
- `prefers-reduced-motion: reduce`: snap to the hero pose, do not loop. Replay and taps still change the pose, instantly.

## Adding an experiment

1. Add `motion-lab/experiments/<id>.js`.
2. Export `{ id, kicker, title, line, idea, tokens, hero, css, mount }`.
3. Append the module to the list in `motion-lab/lab.js`.

`mount(root, ctx)` returns `{ tick(dt), seek(ms), replay(), destroy() }`. `ctx` has `lang`, `reduced`, `detail`. Copy is `{ ru, en }`. The hero value is the still frame, in milliseconds, used when motion is reduced.
