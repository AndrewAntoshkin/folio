from __future__ import annotations

from pathlib import Path

import yaml

from ds_eval import repo_root
from ds_eval.schemas import DesignSystemManifest, EvalCase, ModelConfig


def load_yaml(path: Path) -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def load_models(path: Path | None = None) -> dict[str, ModelConfig]:
    path = path or repo_root() / "models.yaml"
    raw = load_yaml(path).get("models") or {}
    return {name: ModelConfig.model_validate(item) for name, item in raw.items()}


def load_suites(path: Path | None = None) -> dict[str, list[str]]:
    path = path or repo_root() / "datasets" / "suites.yaml"
    data = load_yaml(path)
    return {str(k): list(v) for k, v in data.items()}


def load_cases(root: Path | None = None) -> list[EvalCase]:
    root = root or repo_root() / "datasets"
    cases: list[EvalCase] = []
    for path in sorted(root.rglob("*.yaml")):
        if path.name == "suites.yaml":
            continue
        payload = load_yaml(path)
        if not payload:
            continue
        cases.append(EvalCase.model_validate(payload))
    return cases


def select_cases(
    cases: list[EvalCase],
    suite: str | None = None,
    category: str | None = None,
    limit: int | None = None,
    case_id: str | None = None,
) -> list[EvalCase]:
    suites = load_suites()
    selected = list(cases)
    if case_id:
        selected = [c for c in selected if c.id == case_id]
        if category:
            selected = [c for c in selected if c.category == category]
        if limit is not None:
            selected = selected[:limit]
        return selected
    if suite:
        ids = suites.get(suite)
        if ids is None:
            raise ValueError(f"Unknown suite {suite!r}. Known: {', '.join(suites)}")
        resolved = list(ids)
        if len(resolved) == 1 and resolved[0] in suites:
            resolved = list(suites[resolved[0]])
        if resolved != ["*"]:
            allow = set(resolved)
            selected = [c for c in selected if c.id in allow]
    if category:
        selected = [c for c in selected if c.category == category]
    if limit is not None:
        selected = selected[:limit]
    return selected


def load_manifest(system_dir: Path) -> DesignSystemManifest:
    path = system_dir / "ds.manifest.yaml"
    if path.exists():
        return DesignSystemManifest.model_validate(load_yaml(path))
    return DesignSystemManifest(name=system_dir.name)


def build_ds_docs(system_dir: Path) -> str:
    chunks: list[str] = []
    for rel in ("docs/components.md", "docs/rules.md", "src/tokens.css"):
        path = system_dir / rel
        if path.exists():
            chunks.append(f"# {rel}\n{path.read_text(encoding='utf-8')}")
    return "\n\n".join(chunks)
