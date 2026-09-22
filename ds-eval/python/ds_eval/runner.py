from __future__ import annotations

import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

from ds_eval import repo_root
from ds_eval.adapters import build_adapter
from ds_eval.adapters.base import EvalContext
from ds_eval.env import load_env
from ds_eval.files_parse import normalize_files
from ds_eval.graders import composite_score, grade_case
from ds_eval.loader import build_ds_docs, load_cases, load_manifest, load_models, select_cases
from ds_eval.prompting import SYSTEM_PROMPT, user_prompt
from ds_eval.runtime import run_runtime
from ds_eval.schemas import GenerationResult, ModelConfig
from ds_eval.store import record_run


def _stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")


def _write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def _artifact_dir(run_dir: Path, case_id: str) -> Path:
    path = run_dir / "cases" / case_id
    path.mkdir(parents=True, exist_ok=True)
    return path


def run_suite(
    model_name: str,
    suite: str | None = "smoke",
    system: Path | None = None,
    output: Path | None = None,
    category: str | None = None,
    limit: int | None = None,
    case_id: str | None = None,
    with_runtime: bool | None = None,
) -> Path:
    load_env()
    root = repo_root()
    system_dir = (system or root / "examples" / "demo-design-system").resolve()
    models = load_models()
    if model_name not in models:
        raise ValueError(f"Unknown model {model_name!r}. Known: {', '.join(models)}")
    config: ModelConfig = models[model_name]
    if with_runtime is None:
        with_runtime = config.provider != "fixture"
    adapter = build_adapter(config)
    cases = select_cases(load_cases(), suite=suite, category=category, limit=limit, case_id=case_id)
    if not cases:
        raise ValueError("No eval cases matched.")
    if config.provider in {"anthropic", "openai"}:
        import os

        needed = "ANTHROPIC_API_KEY" if config.provider == "anthropic" else "OPENAI_API_KEY"
        if not os.environ.get(needed):
            raise RuntimeError(f"{needed} is required for --model {model_name}")

    run_id = output.name if output else f"{_stamp()}-{model_name}"
    run_dir = (output or root / "runs" / run_id).resolve()
    run_dir.mkdir(parents=True, exist_ok=True)

    ds_docs = build_ds_docs(system_dir)
    manifest = load_manifest(system_dir)
    results: list[dict] = []

    for case in cases:
        case_dir = _artifact_dir(run_dir, case.id)
        task_prompt = user_prompt(case, ds_docs)
        generation: GenerationResult = adapter.generate(
            task_prompt,
            EvalContext(case=case, ds_docs=ds_docs, system_prompt=SYSTEM_PROMPT),
        )
        generation.files = normalize_files(generation.files)
        _write(case_dir / "system.md", SYSTEM_PROMPT)
        _write(case_dir / "prompt.md", task_prompt)
        _write(case_dir / "generation.json", generation.model_dump_json(indent=2))
        for rel, content in generation.files.items():
            _write(case_dir / "source" / Path(rel).name, content)
            _write(case_dir / "source" / rel, content)

        runtime = None
        if with_runtime and generation.files and not generation.error:
            runtime = run_runtime(system_dir, generation.files, case_dir, case)

        graders = grade_case(case, generation.files, runtime=runtime, model_config=config)
        _write(case_dir / "graders.json", json.dumps([g.model_dump() for g in graders], indent=2))
        axes = composite_score(graders)
        judge_cost = 0.0
        judge_tokens = 0
        for grader in graders:
            judge_tokens += int((grader.details or {}).get("input_tokens") or 0)
            judge_tokens += int((grader.details or {}).get("output_tokens") or 0)
        record = {
            "id": case.id,
            "title": case.title,
            "category": case.category,
            "difficulty": case.difficulty,
            "error": generation.error,
            "scores": axes,
            "graders": [g.model_dump() for g in graders],
            "generation": {
                "model": generation.model,
                "provider": generation.provider or config.provider,
                "input_tokens": generation.input_tokens,
                "output_tokens": generation.output_tokens,
                "cost_usd": generation.cost_usd,
                "latency_ms": generation.latency_ms,
                "system_prompt": generation.system_prompt or SYSTEM_PROMPT,
                "task_prompt": generation.task_prompt or task_prompt,
            },
            "artifacts": {
                "dir": str(case_dir),
                "screenshot": (case_dir / "screenshot.png").exists(),
                "source": (case_dir / "source" / "Task.tsx").exists(),
            },
        }
        _write(case_dir / "result.json", json.dumps(record, indent=2))
        results.append(record)

    overall = round(sum(r["scores"]["overall"] for r in results) / len(results), 1) if results else 0
    axes_keys = ["ds_compliance", "functional", "visual", "ux", "accessibility", "code_quality", "reliability"]
    aggregates = {
        key: round(sum(r["scores"].get(key, 0) for r in results) / len(results), 1) if results else 0
        for key in axes_keys
    }
    summary = {
        "run_id": run_dir.name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "model": model_name,
        "model_config": config.model_dump(),
        "suite": suite or (case_id or "custom"),
        "design_system": manifest.model_dump(),
        "case_count": len(results),
        "overall": overall,
        "aggregates": aggregates,
        "cost_usd": round(sum(r["generation"]["cost_usd"] for r in results), 4),
        "latency_ms": sum(r["generation"]["latency_ms"] for r in results),
        "live": config.provider != "fixture",
        "cases": results,
    }
    _write(run_dir / "summary.json", json.dumps(summary, indent=2))
    shutil.copy2(root / "models.yaml", run_dir / "models.yaml")
    record_run(summary, run_dir)
    return run_dir
