---
name: motion
description: Use when adding or reviewing animation and transitions in a UI.
---

# Motion

Animate only when it explains a change.

## Steps
1. Skip it if the action happens all the time or comes from a keyboard shortcut.
2. Say what the motion explains: where something came from, what changed, or that an action worked.
3. Use CSS transitions first. Animate only `transform` and `opacity`.
4. Keep it under 300 ms with an ease-out curve: `cubic-bezier(0.23, 1, 0.32, 1)`.
5. Never scale from `0`. Start at `0.95`.
6. Add the fallback:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

## Done when
- Fast repeated clicks do not break it
- It works with reduced motion on
