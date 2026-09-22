#!/usr/bin/env python3
"""Diff two recorded UI-eval runs for two prompt versions.

The MVP does not call a model. It reads run JSON next to the prompts:
  prompts/v12.md  →  runs/v12.json
A case is improved or regressed when pass/fail flips, or the DS score moves by 10+ points.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def load_run(prompt: Path) -> list[dict]:
    run = prompt.parent.parent / "runs" / f"{prompt.stem}.json"
    if not run.exists():
        raise SystemExit(f"missing run file: {run}")
    data = json.loads(run.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit(f"{run} must be a list of cases")
    return data


def classify(before: dict, after: dict) -> str:
    if before["pass"] != after["pass"]:
        return "improved" if after["pass"] else "regressed"
    delta = after["ds"] - before["ds"]
    if delta >= 10:
        return "improved"
    if delta <= -10:
        return "regressed"
    return "unchanged"


def diff(left: Path, right: Path) -> None:
    before = {case["id"]: case for case in load_run(left)}
    after = {case["id"]: case for case in load_run(right)}
    ids = list(dict.fromkeys([*before, *after]))
    buckets = {"improved": [], "regressed": [], "unchanged": []}
    for case_id in ids:
        if case_id not in before or case_id not in after:
            raise SystemExit(f"{case_id} is missing from one run")
        kind = classify(before[case_id], after[case_id])
        buckets[kind].append((before[case_id], after[case_id]))
    print(f"{left.stem} → {right.stem}")
    print(
        f"{len(buckets['improved'])} improved / "
        f"{len(buckets['regressed'])} regressed / "
        f"{len(buckets['unchanged'])} unchanged"
    )
    tokens_before = sum(case["tokens"] for case in before.values())
    tokens_after = sum(case["tokens"] for case in after.values())
    print(f"tokens  {tokens_before} → {tokens_after}")
    for kind in ("improved", "regressed"):
        if not buckets[kind]:
            continue
        print(kind)
        for old, new in buckets[kind]:
            print(
                f"  {old['id']:<16} DS {old['ds']:>3} → {new['ds']:<3}  {new['note']}"
            )


def main() -> None:
    parser = argparse.ArgumentParser(description="Diff two recorded prompt runs.")
    parser.add_argument("command", choices=["diff"])
    parser.add_argument("left", type=Path)
    parser.add_argument("right", type=Path)
    args = parser.parse_args()
    diff(args.left.resolve(), args.right.resolve())


if __name__ == "__main__":
    main()
