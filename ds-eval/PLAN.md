# ds-eval — plan

Working vertical slice first, then scale the dataset.

## Slice

```
case YAML → adapter (fixture | anthropic | openai)
         → write Task.tsx into demo DS
         → optional Vite build + Playwright
         → deterministic graders
         → result.json + dashboard
```

Offline path uses two fixture packs (`fixture`, `fixture-naive`) so `run` / `compare` / dashboard work without API keys. Live models are the same pipeline with a different adapter.

## Layout

| Path | Role |
| --- | --- |
| `python/ds_eval/` | eval engine + CLI |
| `datasets/` | YAML cases + suites |
| `examples/demo-design-system/` | host React app + components + tokens |
| `examples/fixtures/` | golden / naive generated UI |
| `apps/dashboard/` | local research UI over `runs/` |
| `runs/` | reproducible run artifacts |

## Next (not in this slice)

- 100+ cases
- axe-core + visual/UX LLM judges
- multi-judge aggregation
