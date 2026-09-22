# ds-context

Compile a local design-system folder into a context pack for a coding agent.

The tool reads files on disk. It does not crawl Storybook, call the Figma API, or call a model. Token counts are an estimate of about 4 characters per token, not a Claude tokenizer.

## Run

```bash
python3 ds_context.py build fixtures/acme
```

The pack is written to `fixtures/acme/dist`.

## Acme fixture

| Strategy | Estimate | Contents |
| --- | --- | --- |
| full | ~665 | Tokens, API with examples, patterns, anti-patterns, screen examples |
| compact | ~375 | Tokens, API without examples, anti-patterns |
| components | ~180 | Overview and API only |

Full pack by file: `design-system.md` ~292, `components.md` ~160, `patterns.md` ~87, `anti-patterns.md` ~54, `examples.md` ~72. The manifest is excluded from these totals.

## Where it sits

`figma-to-design-md` can produce the spec. ds-context packs it. A model writes the screen. `ui-repair` patches design-system violations. `ds-eval` scores the result. `prompt-regress` diffs two prompt versions.
