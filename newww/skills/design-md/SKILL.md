---
name: design-md
description: Use when a project needs a DESIGN.md so coding agents follow the design system.
---

# DESIGN.md

Write a short file that tells agents how the UI should look.

## Steps
1. If the system lives in Figma, extract it:
```bash
npx figma-to-design-md extract --file <key> --token <token>
```
2. Otherwise read the token files and 3 to 5 core components.
3. Write `DESIGN.md` with these sections: colors, type, spacing, radii, components, rules.
4. Every value must come from a token or a component in the code. Mark guesses as `unverified`.
5. Keep it under 150 lines.

## Done when
- Each rule points to a token or file
- An agent can build a new screen from this file alone
