# prompt-regress

Diff two recorded UI-eval runs for two prompt versions.

The command does not call a model and does not render UI. `prompts/v12.md` reads `runs/v12.json`. A case is improved or regressed when pass/fail flips, or the DS score moves by 10 points or more.

## Run

```bash
python3 prompt_regress.py diff prompts/v12.md prompts/v13.md
```

## Fixture result

16 recorded cases:

```
6 improved / 2 regressed / 8 unchanged
tokens  26270 → 26230
```

The token column is the number stored on the run, not an API bill. This fixture has no screenshots. `6 / 2 / 8` belongs to these 16 cases, not to a 100-case suite.

## Where it sits

`ds-eval` scores a case. prompt-regress compares two of those runs when the prompt changes. Regression here is the list of cases that flipped.
