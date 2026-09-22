# ui-repair

Find design-system violations in a fixture and apply deterministic repairs.

This is not a model and not a ds-eval run. The rules know this fixture: one hex, `padding: 13`, a `modal` class, and a close mark.

## Run

```bash
python3 ui_repair.py scan fixtures
python3 ui_repair.py fix fixtures --out examples
```

`scan` prints the issues. `fix` writes `examples/Settings.jsx` and a local 10-check score.

## Fixture result

Ten checks, equal weight.

| | Score |
| --- | --- |
| Before | 50 |
| After | 100 |

Five structural checks already passed. The repair flips the five design-system checks: a design-system import, no raw button, no hardcoded hex, `Dialog` instead of a modal div, and no magic padding number.

## Where it sits

`ds-context` says which components and tokens exist. ui-repair moves a file onto that list. `ds-eval` is the next check, and this score is not that check.
