# Motion Lab

The page shell follows the tokens below. The twelve live experiments are free Skiper UI components, kept visually identical to the originals. See `LICENSE` for what may be used.

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

Tiles are 16:10 frames, not phone shells. A component that is not mobile-shaped fills the frame.

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

The page shell (hero, grid, dialog) uses transform and opacity. The experiments themselves keep the original Skiper motion, including scroll-linked transforms, springs, SVG filters, and canvas.

- Load an experiment only once its frame is near the viewport.
- `prefers-reduced-motion: reduce`: do not auto-scroll. Framer Motion snaps its own transitions.

## Why React islands

The free components are React, Framer Motion, GSAP, and Swiper. Rewriting that motion in vanilla JS would drift from the original springs, scroll offsets, and coverflow. `motion-lab/islands/` builds one static bundle (`islands.js`, `islands.css`) with esbuild and Tailwind. The portfolio stays a static site. Each tile is an iframe pointed at `preview.html`, so `vh`, sticky, and scroll progress use that frame as the viewport and do not take over the page.

## Adding an experiment

1. Add the free component at `motion-lab/islands/components/<id>.tsx`.
2. Export it from `motion-lab/islands/entry.jsx`.
3. Run `npm run build` in `motion-lab/islands/`.
4. Append `{ id, scroll, hero, source, kicker, title, line, idea, tokens }` in `motion-lab/lab.js`.

Only components marked free on skiper-ui.com. Do not add a paid id.
