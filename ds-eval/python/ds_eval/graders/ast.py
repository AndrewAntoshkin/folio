from __future__ import annotations

from ds_eval.ast_parse import parse_tsx
from ds_eval.schemas import EvalCase, GraderResult

DS_SOURCES = ("@ds", "src/components", "../components", "./components")


def _source(files: dict[str, str]) -> str:
    return "\n".join(files.values())


def grade_ast(case: EvalCase, files: dict[str, str]) -> GraderResult:
    source = _source(files)
    try:
        parsed = parse_tsx(source)
    except Exception as exc:
        return GraderResult(
            name="static",
            kind="deterministic",
            score=0,
            passed=False,
            details={"parse_error": str(exc)},
            reasoning=f"AST parse failed: {exc}",
        )

    imported: set[str] = set()
    ds_import = False
    for item in parsed.get("imports") or []:
        source_name = item.get("source") or ""
        if source_name == "@ds" or source_name.endswith("/components") or source_name in DS_SOURCES:
            ds_import = True
            imported.update(item.get("names") or [])
    tags = set(parsed.get("jsx_tags") or [])
    found = imported | {name for name in tags if name[:1].isupper()}
    missing = [name for name in case.required_components if name not in found]
    hex_hits = list(parsed.get("hex_literals") or [])
    native = list(parsed.get("native_elements") or [])
    forbidden_hits: list[str] = []
    if "native-button" in case.forbidden_patterns and "button" in native:
        forbidden_hits.append("native-button")
    if "native-select" in case.forbidden_patterns and "select" in native:
        forbidden_hits.append("native-select")
    if "native-input" in case.forbidden_patterns and "input" in native:
        forbidden_hits.append("native-input")
    if "raw-color" in case.forbidden_patterns and hex_hits:
        forbidden_hits.append("raw-color")

    deductions = 0
    notes: list[str] = []
    if missing:
        deductions += 40
        notes.append("missing required components: " + ", ".join(missing))
    if not ds_import:
        deductions += 25
        notes.append("no design-system import")
    if hex_hits:
        deductions += 20
        notes.append(f"hardcoded colors: {hex_hits[:6]}")
    if forbidden_hits:
        deductions += 15
        notes.append("forbidden: " + ", ".join(forbidden_hits))
    if not parsed.get("has_task_export"):
        deductions += 10
        notes.append("no Task export")

    score = max(0, 100 - deductions)
    return GraderResult(
        name="static",
        kind="deterministic",
        score=score,
        passed=score >= 70 and not missing and not forbidden_hits,
        details={
            "found_components": sorted(found),
            "missing_required": missing,
            "hex": hex_hits,
            "native_elements": native,
            "uses_ds_imports": ds_import,
            "forbidden_hits": forbidden_hits,
            "parser": "babel",
        },
        reasoning="; ".join(notes) or "AST shows DS imports and no token violations",
    )


def grade_compliance_from_ast(case: EvalCase, files: dict[str, str], static: GraderResult) -> GraderResult:
    details = static.details
    missing = details.get("missing_required") or []
    forbidden_hits = details.get("forbidden_hits") or []
    found = [name for name in case.required_components if name not in missing]
    total = max(1, len(case.required_components) + len(case.forbidden_patterns))
    good = len(found) + (len(case.forbidden_patterns) - len(forbidden_hits))
    score = round(100 * max(0, good) / total, 1)
    return GraderResult(
        name="ds_compliance",
        kind="deterministic",
        score=score,
        passed=not missing and not forbidden_hits,
        details={
            "required": case.required_components,
            "found": found,
            "missing": missing,
            "forbidden_hits": forbidden_hits,
        },
        reasoning="AST compliance against required/forbidden component rules",
    )
