from __future__ import annotations

import os
from pathlib import Path

from ds_eval import repo_root


def load_env() -> None:
    for path in (
        Path.cwd() / ".env",
        repo_root() / ".env",
        repo_root().parent / ".env",
        Path.home() / ".env",
    ):
        if not path.exists():
            continue
        for raw in path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip("'").strip('"')
            if key and key not in os.environ:
                os.environ[key] = value
