from __future__ import annotations

import json
from pathlib import Path


def compare_runs(run_a: Path, run_b: Path) -> dict:
    a = json.loads((run_a / "summary.json").read_text(encoding="utf-8"))
    b = json.loads((run_b / "summary.json").read_text(encoding="utf-8"))
    by_a = {c["id"]: c for c in a["cases"]}
    by_b = {c["id"]: c for c in b["cases"]}
    ids = sorted(set(by_a) & set(by_b))
    improved = []
    regressions = []
    unchanged = []
    for case_id in ids:
        delta = round(by_b[case_id]["scores"]["overall"] - by_a[case_id]["scores"]["overall"], 1)
        row = {"id": case_id, "delta": delta, "before": by_a[case_id]["scores"]["overall"], "after": by_b[case_id]["scores"]["overall"]}
        if delta >= 1:
            improved.append(row)
        elif delta <= -1:
            regressions.append(row)
        else:
            unchanged.append(row)

    axes = ["overall", "ds_compliance", "functional", "accessibility", "code_quality", "reliability"]

    def axis_avg(summary: dict, key: str) -> float:
        if key == "overall":
            return float(summary.get("overall") or 0)
        return float((summary.get("aggregates") or {}).get(key) or 0)

    return {
        "a": {"run_id": a["run_id"], "model": a["model"], "overall": a["overall"]},
        "b": {"run_id": b["run_id"], "model": b["model"], "overall": b["overall"]},
        "deltas": {key: round(axis_avg(b, key) - axis_avg(a, key), 1) for key in axes},
        "improved": improved,
        "regressions": regressions,
        "unchanged": unchanged,
        "counts": {
            "improved": len(improved),
            "regressions": len(regressions),
            "unchanged": len(unchanged),
        },
    }
