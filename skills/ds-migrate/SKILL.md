---
name: ds-migrate
description: Use when a screen with custom or raw controls should move to design-system components.
---

# DS migrate

Migrate one screen at a time.

## Steps
1. List the controls on the screen: buttons, inputs, selects, modals.
2. Match each one to a system component. List gaps. Do not invent props.
3. Replace the controls one by one.
4. After each replacement, check the states, events, and keyboard behavior.
5. Run the token scan:
```bash
npx @andrewaitken/ds-lint src/<screen> --tokens tokens.css
```

## Done when
- The screen behaves exactly as before
- No raw controls or hardcoded values are left
- Missing system features are reported separately
