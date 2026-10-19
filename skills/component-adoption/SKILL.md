---
name: component-adoption
description: Use when a codebase may contain local copies of design-system components such as its own Button or Modal.
---

# Find duplicate components

Find places where the code uses its own Button, Modal, or Input instead of the design system's.

## Steps
1. Measure usage:
```bash
npx @andrewaitken/ds-coverage src/ --ds @acme/ui
```
   Replace `@acme/ui` with the package name of your design system.
2. List local components that share a name with a system export.
3. For each one, compare props. If the system component covers it, replace it.
4. If it does not, report the missing prop. Do not patch the system component.
5. Run the scan again and compare the numbers.

## Done when
- Coverage went up, or each remaining duplicate has a reason
- No behavior changed on the touched screens
