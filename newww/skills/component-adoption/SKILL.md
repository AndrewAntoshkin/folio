---
name: component-adoption
description: Use when a codebase may contain local copies of design-system components such as its own Button or Modal.
---

# Component adoption

Find where the product bypasses the design system.

## Steps
1. Measure usage:
```bash
npx @andrewaitken/ds-coverage src/ --ds @acme/ui
```
2. List local components that share a name with a system export.
3. For each one, compare props. If the system component covers it, replace it.
4. If it does not, report the missing prop. Do not patch the system component.
5. Run the scan again and compare the numbers.

## Done when
- Coverage went up, or each remaining duplicate has a reason
- No behavior changed on the touched screens
