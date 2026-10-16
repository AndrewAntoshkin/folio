---
name: token-map
description: Use when code has hardcoded colors, spacing, font sizes, or radii that should use design tokens.
---

# Token map

Replace raw UI values with the project's existing tokens.

## Steps
1. Find the token file (`tokens.css`, `tokens.json`, or `DESIGN.md`). If there is none, stop and say so.
2. Scan the files you changed:
```bash
npx @andrewaitken/ds-lint src/ --tokens tokens.css
```
3. For each finding, pick the token by meaning first (e.g. "primary action"), then by value.
4. Replace only clear matches. Never invent a token.
5. Run the scan again until the changed files are clean.

## Done when
- `ds-lint` reports no fixable findings in the changed files
- No new tokens were added
- Values without a match are listed with a reason
