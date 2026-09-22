from __future__ import annotations

import json
from pathlib import Path

from ds_eval import repo_root


def write_report(run_dir: Path) -> dict[str, Path]:
    summary = json.loads((run_dir / "summary.json").read_text(encoding="utf-8"))
    cases = summary.get("cases") or []
    agg = summary.get("aggregates") or {}
    lines = [
        f"# {summary.get('run_id')}",
        "",
        f"Model: **{summary.get('model')}**",
        f"Overall: **{summary.get('overall')}**",
        f"Cases: {summary.get('case_count')} · cost ${summary.get('cost_usd'):.4f}",
        "",
        "| Case | Category | Overall | DS | A11y | Code |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for case in cases:
        s = case["scores"]
        lines.append(
            f"| {case['id']} | {case['category']} | {s['overall']} | {s.get('ds_compliance')} | {s.get('accessibility')} | {s.get('code_quality')} |"
        )
    lines += [
        "",
        "## Aggregates",
        "",
        f"- DS compliance: {agg.get('ds_compliance')}",
        f"- Functional: {agg.get('functional')}",
        f"- Accessibility: {agg.get('accessibility')}",
        f"- Code quality: {agg.get('code_quality')}",
        f"- Reliability: {agg.get('reliability')}",
    ]
    md = "\n".join(lines) + "\n"
    html = f"<!doctype html><meta charset=utf-8><title>{summary.get('run_id')}</title><pre>{md}</pre>"
    paths = {
        "json": run_dir / "report.json",
        "md": run_dir / "summary.md",
        "html": run_dir / "report.html",
    }
    paths["json"].write_text(json.dumps(summary, indent=2), encoding="utf-8")
    paths["md"].write_text(md, encoding="utf-8")
    paths["html"].write_text(html, encoding="utf-8")
    return paths
