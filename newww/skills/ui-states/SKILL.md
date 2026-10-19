---
name: ui-states
description: Use when a component looks finished but only the happy path has been tested.
---

# Check every state

Make every state visible.

## Steps
1. Make a temporary page or story for the component.
2. Render these states: default, hover, focus, disabled, loading, empty, error, success.
3. Add stress cases: very long text, 0 items, 1000 items, 320 px width.
4. Fix what breaks.
5. Keep the page as a story or delete it. Do not leave it in production routes.

## Done when
- Every state renders without overflow or layout jumps
- Error and loading states tell the user what to do next
