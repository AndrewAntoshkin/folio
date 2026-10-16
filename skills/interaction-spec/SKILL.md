---
name: interaction-spec
description: Use before building an action that saves data, calls a server, or can be undone.
---

# Interaction spec

Write the behavior before the code.

## Steps
1. Write one line each for: trigger, pending state, success, error, cancel, undo.
2. Say where focus goes after the action.
3. For destructive actions, name the point of no return.
4. Turn the spec into two tests: one keyboard path and one error path.
5. Build it.

## Example
- Trigger: click "Save"
- Pending: button disabled, label "Saving..."
- Error: message under the form, button enabled, input values kept
- Cancel: closes the form, nothing saved

## Done when
- No state is left to guesswork
- Both tests pass
