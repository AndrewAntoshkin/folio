---
name: component-docs
description: Use when a shared component needs documentation or a new variant.
---

# Component docs

Document what the component does today, not what it should do.

## Steps
1. Read the component, its types, tests, and 3 real call sites.
2. Write: purpose, props table, states, keyboard behavior.
3. Add 2 pairs of "Do" and "Don't" taken from real usage.
4. Add a "Do not use for" line.
5. Mark anything you could not verify as `unknown`.

## Done when
- Every prop and variant in the doc exists in the code
- No invented props
