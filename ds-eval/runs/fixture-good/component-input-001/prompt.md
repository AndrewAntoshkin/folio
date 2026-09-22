# Design system
# docs/components.md
# Components

Import from `@ds`.

- `Button variant="primary|secondary|danger|ghost"`
- `Input` `Textarea` — pair with `Label` / `HelperText` / `Field`
- `Select` — labeled select with helper and error
- `Checkbox` `Radio` `Switch`
- `Tabs`
- `Dialog`
- `Badge` `Card` `PageHeader`

Do not use native `<button>` or `<select>` in product UI. Do not hardcode colors.


# docs/rules.md
# Rules

- Tokens only: colors, spacing, radius, typography come from `src/tokens.css`.
- No raw hex or rgb in product UI.
- Dialog footer: primary + secondary only. Never 6 actions.
- Destructive actions use `Button variant="danger"` and a confirmation `Dialog`.
- Every input has a visible `Label`. Placeholder is not a label.


# src/tokens.css
:root {
  --color-bg: #0f1115;
  --color-surface: #171a21;
  --color-surface-2: #1e2330;
  --color-text: #e8eaed;
  --color-text-muted: #9aa3b2;
  --color-primary: #2dd4bf;
  --color-primary-text: #042f2e;
  --color-danger: #f87171;
  --color-border: #2a3140;
  --color-focus: #5eead4;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --font-sans: Inter, system-ui, sans-serif;
  --font-size-sm: 13px;
  --font-size-md: 14px;
  --font-size-lg: 18px;
  --font-size-xl: 28px;
  --shadow-md: 0 12px 32px -16px rgba(0, 0, 0, 0.5);
  --control-height: 40px;
}

html, body, #root { height: 100%; }
body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}
.app-shell { min-height: 100%; padding: var(--space-6); }


# Task
id: component-input-001
title: Email field with error
category: component
difficulty: easy

Create an email field with a visible label, helper text, and an error state
saying the address is invalid.


required_components: Input, Label
forbidden_patterns: raw-color

Respond with JSON only.
