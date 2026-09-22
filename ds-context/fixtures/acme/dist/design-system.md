# Design system

Components: Button, Input, Dialog, Select.

## Tokens

| Token | Value |
| --- | --- |
| `--color-accent` | #8B5CF6 |
| `--color-text` | #212223 |
| `--color-surface` | #ffffff |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--radius-2` | 8px |
| `--font-size-body` | 14px |

# Patterns

## Destructive confirm
Ask for confirmation before a delete. Use Dialog, name the object, and make the confirm button the danger variant.

## Empty state
Show one next action. Do not invent a second illustration style.

## Settings
Group fields by task. Use Input with a label. Actions sit in the page footer, not inside the form card.

# Anti-patterns

- Do not hardcode #8B5CF6. Use var(--color-accent).
- Do not build a modal from a positioned div.
- Do not add a button with no accessible name.
- Do not pick 13px of padding. Use the space scale.

# Examples

A settings page uses Input for the name and email, Select for the country, and Button for save.
A delete flow opens Dialog. The confirm action is variant="danger". The close control has an accessible name.
Empty lists use the empty-state pattern: one sentence and one Button.
