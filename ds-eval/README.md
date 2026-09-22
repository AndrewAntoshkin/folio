# ds-eval

Can AI coding agents actually use your design system correctly?

`ds-eval` is a local benchmark: same UI tasks, same design system, different models. It grades DS compliance, accessibility heuristics, code quality, and (optionally) a real Vite build.

```
Design System → Eval Task → Adapter → Generated UI
      → AST / DS compliance / a11y / code quality → runs/ → dashboard
```

## Quick start

No API keys required for the fixture models.

```bash
cd ds-eval
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

ds-eval list --suite smoke
ds-eval run --model fixture --suite smoke
ds-eval run --model fixture-naive --suite smoke
ds-eval compare <RUN_FIXTURE> <RUN_NAIVE>
ds-eval dashboard --port 8001
```

Live models (keys from env only):

```bash
export ANTHROPIC_API_KEY=…
export OPENAI_API_KEY=…
ds-eval run --model claude --suite smoke
ds-eval run --model codex --suite smoke
```

Optional browser runtime:

```bash
pip install -e ".[runtime]"
python -m playwright install chromium
npm --prefix examples/demo-design-system install
ds-eval run --model fixture --suite smoke --runtime
```

## CLI

```text
ds-eval init
ds-eval list
ds-eval run --model fixture --suite smoke
ds-eval compare RUN_A RUN_B
ds-eval report RUN_ID
ds-eval dashboard
```

## Dataset

Smoke suite is 10 cases: components, patterns, pages, accessibility, edge cases, adversarial prompts (e.g. “make it #8B5CF6”).

## Graders

Deterministic in this slice: DS imports, forbidden native controls, raw colors, labels, export shape. LLM visual/UX judges are wired in the schema and skipped until enabled. Weights live in `DEFAULT_WEIGHTS`.

## Custom design system

```bash
ds-eval init ./my-design-system
ds-eval run --system ./my-design-system --model fixture --suite smoke
```
