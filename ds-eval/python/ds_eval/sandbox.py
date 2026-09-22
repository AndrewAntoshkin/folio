from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path


def ensure_node_modules(template: Path) -> None:
    if (template / "node_modules").exists():
        return
    npm = shutil.which("npm")
    if not npm:
        raise RuntimeError("npm is required to install the demo design system")
    proc = subprocess.run([npm, "install"], cwd=template, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or "npm install failed")


def prepare_sandbox(template: Path, sandbox: Path) -> Path:
    ensure_node_modules(template)
    if sandbox.exists():
        shutil.rmtree(sandbox)
    shutil.copytree(
        template,
        sandbox,
        ignore=shutil.ignore_patterns("node_modules", "dist", ".git"),
    )
    os.symlink(template / "node_modules", sandbox / "node_modules", target_is_directory=True)
    return sandbox


def write_generated_files(sandbox: Path, files: dict[str, str]) -> None:
    for rel, content in files.items():
        path = sandbox / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
