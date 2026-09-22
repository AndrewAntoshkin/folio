from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

from ds_eval import repo_root


def ensure_ast_parser() -> Path:
    root = repo_root() / "tools" / "ast"
    script = root / "parse_tsx.mjs"
    nm = root / "node_modules" / "@babel" / "parser"
    if not nm.exists():
        subprocess.run(["npm", "install"], cwd=root, check=True, capture_output=True, text=True)
    return script


def parse_tsx(source: str) -> dict:
    script = ensure_ast_parser()
    tmp = repo_root() / "tools" / "ast" / ".tmp-task.tsx"
    tmp.write_text(source, encoding="utf-8")
    try:
        proc = subprocess.run(
            ["node", str(script), str(tmp)],
            capture_output=True,
            text=True,
            check=False,
        )
    finally:
        if tmp.exists():
            tmp.unlink()
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or "tsx parse failed")
    return json.loads(proc.stdout)
