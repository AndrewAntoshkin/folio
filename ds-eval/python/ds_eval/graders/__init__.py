from __future__ import annotations

from ds_eval.graders.ast import grade_ast, grade_compliance_from_ast
from ds_eval.graders.llm import grade_ux, grade_visual
from ds_eval.graders.static import grade_code_quality
from ds_eval.runtime import RuntimeOutcome
from ds_eval.schemas import DEFAULT_WEIGHTS, EvalCase, GraderResult, ModelConfig


def grade_case(
    case: EvalCase,
    files: dict[str, str],
    runtime: RuntimeOutcome | None = None,
    model_config: ModelConfig | None = None,
    screenshot=None,
) -> list[GraderResult]:
    static = grade_ast(case, files)
    results = [
        static,
        grade_compliance_from_ast(case, files, static),
        grade_code_quality(case, files),
    ]
    if runtime:
        results.append(runtime.reliability)
        results.append(runtime.functional)
        results.append(runtime.accessibility)
        shot = screenshot or runtime.screenshot
    else:
        results.append(
            GraderResult(
                name="reliability",
                kind="deterministic",
                score=0,
                passed=False,
                details={"runtime": "skipped"},
                reasoning="browser runtime was not executed",
            )
        )
        results.append(
            GraderResult(
                name="functional",
                kind="deterministic",
                score=0,
                passed=False,
                details={"runtime": "skipped"},
                reasoning="Playwright interactions were not executed",
            )
        )
        results.append(
            GraderResult(
                name="accessibility",
                kind="deterministic",
                score=0,
                passed=False,
                details={"runtime": "skipped"},
                reasoning="axe-core was not executed",
            )
        )
        shot = screenshot

    if model_config and model_config.provider in {"anthropic", "openai"} and shot and files:
        source = "\n".join(files.values())
        results.append(grade_visual(case, shot, model_config))
        results.append(grade_ux(case, source, shot, model_config))
    else:
        results.append(
            GraderResult(
                name="visual",
                kind="llm",
                score=0,
                passed=False,
                details={"skipped": True},
                reasoning="vision judge requires a live model screenshot",
            )
        )
        results.append(
            GraderResult(
                name="ux",
                kind="llm",
                score=0,
                passed=False,
                details={"skipped": True},
                reasoning="UX judge requires a live model screenshot",
            )
        )
    return results


def composite_score(results: list[GraderResult], weights: dict[str, float] | None = None) -> dict[str, float]:
    weights = weights or DEFAULT_WEIGHTS
    by_name = {item.name: item for item in results}
    axes: dict[str, float] = {}
    ds_scores = [by_name[name].score for name in ("ds_compliance", "static") if name in by_name]
    axes["ds_compliance"] = sum(ds_scores) / len(ds_scores) if ds_scores else 0
    for axis in ("functional", "visual", "ux", "accessibility", "code_quality", "reliability"):
        axes[axis] = by_name[axis].score if axis in by_name else 0
    remaining = dict(weights)
    skipped = [k for k in ("visual", "ux") if by_name.get(k) and by_name[k].details.get("skipped")]
    leftover = sum(remaining.pop(k) for k in skipped)
    if leftover and remaining:
        bump = leftover / len(remaining)
        remaining = {k: v + bump for k, v in remaining.items()}
    overall = sum(axes.get(k, 0) * remaining.get(k, 0) for k in remaining)
    axes["overall"] = round(overall, 1)
    for key, value in list(axes.items()):
        axes[key] = round(value, 1)
    return axes
