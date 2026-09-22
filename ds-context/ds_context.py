#!/usr/bin/env python3
"""Compile a local design-system folder into a context pack for a coding agent.

This MVP reads files on disk. It does not call Figma, Storybook, or a model.
Token counts are an estimate: about 4 characters per token, not a Claude tokenizer.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _rel(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path)


def estimate_tokens(text: str) -> int:
    return max(1, round(len(text) / 4)) if text.strip() else 0


def read_tokens(path: Path) -> list[tuple[str, str]]:
    css = path.read_text(encoding="utf-8") if path.exists() else ""
    return re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", css)


def read_components(path: Path) -> list[dict]:
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise SystemExit("components.json must be a list")
    return data


def read_md(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip() if path.exists() else ""


def token_table(tokens: list[tuple[str, str]]) -> str:
    rows = "\n".join(f"| `{name}` | {value.strip()} |" for name, value in tokens)
    return "| Token | Value |\n| --- | --- |\n" + rows


def component_api(components: list[dict], *, examples: bool) -> str:
    blocks = []
    for item in components:
        props = ", ".join(f"`{prop}`" for prop in item.get("props", []))
        block = [f"### {item['name']}", "", f"Props: {props or '—'}", ""]
        if examples and item.get("example"):
            block.extend(["Example:", "", "```jsx", item["example"], "```", ""])
        if item.get("avoid"):
            block.extend([f"Avoid: {item['avoid']}", ""])
        blocks.append("\n".join(block).strip())
    return "\n\n".join(blocks)


def pack(source: Path, strategy: str) -> dict[str, str]:
    tokens = read_tokens(source / "tokens.css")
    components = read_components(source / "components.json")
    patterns = read_md(source / "patterns.md")
    anti = read_md(source / "anti-patterns.md")
    examples = read_md(source / "examples.md")
    api = component_api(components, examples=strategy == "full")
    names = ", ".join(item["name"] for item in components)

    design = [
        "# Design system",
        "",
        f"Components: {names}.",
        "",
        "## Tokens",
        "",
        token_table(tokens),
    ]
    if strategy == "full":
        design.extend(["", patterns, "", anti, "", examples])
    elif strategy == "compact":
        design.extend(["", anti])
    files = {
        "design-system.md": "\n".join(part for part in design if part is not None).strip() + "\n",
        "components.md": "# Component API\n\n" + (api or "_No components._") + "\n",
    }
    if strategy != "components":
        files["patterns.md"] = (patterns or "# Patterns\n") + "\n"
        files["anti-patterns.md"] = (anti or "# Anti-patterns\n") + "\n"
    if strategy == "full":
        files["examples.md"] = (examples or "# Examples\n") + "\n"
    manifest = {
        "strategy": strategy,
        "source": _rel(source),
        "components": [item["name"] for item in components],
        "tokens": [name for name, _ in tokens],
        "files": {name: estimate_tokens(text) for name, text in files.items()},
    }
    manifest["tokens_total"] = sum(manifest["files"].values())
    files["manifest.json"] = json.dumps(manifest, indent=2) + "\n"
    return files


def build(source: Path, out: Path) -> None:
    strategies = {}
    written = pack(source, "full")
    out.mkdir(parents=True, exist_ok=True)
    for name, text in written.items():
        (out / name).write_text(text, encoding="utf-8")
    for strategy in ("full", "compact", "components"):
        strategies[strategy] = sum(
            estimate_tokens(text) for name, text in pack(source, strategy).items() if name != "manifest.json"
        )
    print(f"source  {source}")
    print(f"out     {out}")
    print("pack    files")
    for name in written:
        if name == "manifest.json":
            continue
        print(f"        {name:<18} ~{estimate_tokens(written[name]):>4} tokens")
    print("strategies (estimate, ~4 chars/token, manifest excluded)")
    for strategy, count in strategies.items():
        print(f"        {strategy:<12} ~{count:>4}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Compile a design-system context pack.")
    parser.add_argument("command", choices=["build"])
    parser.add_argument("source", type=Path)
    parser.add_argument("--out", type=Path, default=None)
    args = parser.parse_args()
    source = args.source.resolve()
    if not source.is_dir():
        raise SystemExit(f"not a directory: {source}")
    out = args.out.resolve() if args.out else source / "dist"
    build(source, out)


if __name__ == "__main__":
    main()
