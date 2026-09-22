from __future__ import annotations

import re

from ds_eval.schemas import EvalCase, GraderResult

HEX = re.compile(r"#[0-9A-Fa-f]{3,8}\b")
RGB = re.compile(r"\b(?:rgb|hsl)a?\(", re.I)
NATIVE = {
    "native-button": re.compile(r"<button\b"),
    "native-select": re.compile(r"<select\b"),
    "native-input": re.compile(r"<input\b"),
    "inline-style": re.compile(r"style=\{\{"),
}
DS_IMPORT = re.compile(r"""from\s+['"]@ds(?:/[^'"]*)?['"]\s+import\s+([^\n]+)""")
JSX_TAG = re.compile(r"<([A-Z][A-Za-z0-9]*)\b")


def _source(files: dict[str, str]) -> str:
    return "\n".join(files.values())


def _imported_names(source: str) -> set[str]:
    names: set[str] = set()
    for match in DS_IMPORT.finditer(source):
        chunk = match.group(1)
        for part in chunk.replace("{", " ").replace("}", " ").split(","):
            token = part.strip().split(" as ")[0].strip()
            if token and token != "type":
                names.add(token)
    names.update(JSX_TAG.findall(source))
    return names


def grade_static(case: EvalCase, files: dict[str, str]) -> GraderResult:
    source = _source(files)
    found = _imported_names(source)
    missing = [name for name in case.required_components if name not in found]
    hex_hits = HEX.findall(source)
    rgb_hits = RGB.findall(source)
    native_hits = {key: bool(pat.search(source)) for key, pat in NATIVE.items()}
    uses_ds = bool(DS_IMPORT.search(source))

    deductions = 0
    notes: list[str] = []
    if missing:
        deductions += 40
        notes.append("missing required components: " + ", ".join(missing))
    if not uses_ds:
        deductions += 25
        notes.append("no @ds imports")
    if hex_hits or rgb_hits:
        deductions += 20
        notes.append(f"raw colors: {hex_hits[:6]}")
    if native_hits.get("inline-style"):
        deductions += 10
        notes.append("inline style object")

    score = max(0, 100 - deductions)
    return GraderResult(
        name="static",
        kind="deterministic",
        score=score,
        passed=score >= 70,
        details={
            "found_components": sorted(found),
            "missing_required": missing,
            "hex": hex_hits,
            "native": native_hits,
            "uses_ds_imports": uses_ds,
        },
        reasoning="; ".join(notes) or "source follows token/component rules",
    )


def grade_compliance(case: EvalCase, files: dict[str, str]) -> GraderResult:
    source = _source(files)
    found = _imported_names(source)
    required_ok = [name for name in case.required_components if name in found]
    missing = [name for name in case.required_components if name not in found]
    forbidden_hits: list[str] = []
    for pattern in case.forbidden_patterns:
        if pattern in NATIVE and NATIVE[pattern].search(source):
            forbidden_hits.append(pattern)
        elif pattern == "raw-color" and (HEX.search(source) or RGB.search(source)):
            forbidden_hits.append(pattern)
        elif pattern == "native-select" and re.search(r"<select\b", source):
            forbidden_hits.append(pattern)

    total = max(1, len(case.required_components) + len(case.forbidden_patterns))
    good = len(required_ok) + (len(case.forbidden_patterns) - len(forbidden_hits))
    score = round(100 * good / total, 1)
    return GraderResult(
        name="ds_compliance",
        kind="deterministic",
        score=score,
        passed=not missing and not forbidden_hits,
        details={
            "required": case.required_components,
            "found": required_ok,
            "missing": missing,
            "forbidden_hits": forbidden_hits,
        },
        reasoning="compliance against required/forbidden component rules",
    )


def grade_code_quality(case: EvalCase, files: dict[str, str]) -> GraderResult:
    source = _source(files)
    deductions = 0
    notes: list[str] = []
    if "any" in source:
        deductions += 10
        notes.append("uses any")
    if source.count("function ") + source.count("=>") > 12:
        deductions += 10
        notes.append("high function count")
    if "document.getElementById" in source:
        deductions += 15
        notes.append("direct DOM access")
    if len(source) > 9000:
        deductions += 15
        notes.append("very large generated file")
    if "export function Task" not in source and "export default" not in source:
        deductions += 20
        notes.append("no Task export")
    score = max(0, 100 - deductions)
    return GraderResult(
        name="code_quality",
        kind="deterministic",
        score=score,
        passed=score >= 70,
        details={"bytes": len(source)},
        reasoning="; ".join(notes) or "structure looks like a maintainable React task",
    )


def grade_accessibility_static(case: EvalCase, files: dict[str, str]) -> GraderResult:
    source = _source(files)
    deductions = 0
    notes: list[str] = []
    labeled = "Label" in source or "<label" in source or "label=" in source
    if "<input" in source and "aria-" not in source and not labeled:
        deductions += 30
        notes.append("input without label")
    if "placeholder=" in source and not labeled:
        deductions += 15
        notes.append("placeholder used as the only label")
    if "onClick" in source and "onKeyDown" not in source and "Button" not in source:
        deductions += 10
        notes.append("click handler on a non-button")
    if case.metadata.get("label_required") and not labeled:
        deductions += 25
        notes.append("label required by case")
    score = max(0, 100 - deductions)
    return GraderResult(
        name="accessibility",
        kind="deterministic",
        score=score,
        passed=score >= 70,
        details={},
        reasoning="; ".join(notes) or "basic label/keyboard heuristics passed",
    )
