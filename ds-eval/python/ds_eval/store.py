from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from ds_eval import repo_root


def db_path() -> Path:
    path = repo_root() / "runs" / "history.sqlite"
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(db_path())
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS runs (
            id TEXT PRIMARY KEY,
            model TEXT,
            provider TEXT,
            created_at TEXT,
            overall REAL,
            cost_usd REAL,
            latency_ms INTEGER,
            case_count INTEGER,
            summary_path TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS cases (
            run_id TEXT,
            case_id TEXT,
            overall REAL,
            ds_compliance REAL,
            artifact_dir TEXT,
            PRIMARY KEY (run_id, case_id)
        )
        """
    )
    return conn


def record_run(summary: dict, run_dir: Path) -> None:
    conn = connect()
    conn.execute(
        """
        INSERT OR REPLACE INTO runs
        (id, model, provider, created_at, overall, cost_usd, latency_ms, case_count, summary_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            summary["run_id"],
            summary.get("model"),
            (summary.get("model_config") or {}).get("provider"),
            summary.get("created_at"),
            summary.get("overall"),
            summary.get("cost_usd"),
            summary.get("latency_ms"),
            summary.get("case_count"),
            str(run_dir / "summary.json"),
        ),
    )
    conn.execute("DELETE FROM cases WHERE run_id = ?", (summary["run_id"],))
    for case in summary.get("cases") or []:
        conn.execute(
            """
            INSERT INTO cases (run_id, case_id, overall, ds_compliance, artifact_dir)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                summary["run_id"],
                case["id"],
                (case.get("scores") or {}).get("overall"),
                (case.get("scores") or {}).get("ds_compliance"),
                str(run_dir / "cases" / case["id"]),
            ),
        )
    conn.commit()
    conn.close()


def list_runs() -> list[dict]:
    conn = connect()
    rows = conn.execute("SELECT summary_path FROM runs ORDER BY created_at").fetchall()
    conn.close()
    items = []
    for (path,) in rows:
        file = Path(path)
        if file.exists():
            items.append(json.loads(file.read_text(encoding="utf-8")))
    return items
