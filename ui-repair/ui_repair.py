#!/usr/bin/env python3
"""Find design-system violations and apply deterministic repairs.

The MVP does not call a model. Rules rewrite a fixture file. The score is a
local 10-check rubric, not a ds-eval run. A later step can send the patch
through ds-eval.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


CHECKS = (
    "exports a component",
    "handles a click",
    "no dangerouslySetInnerHTML",
    "has a heading",
    "no !important",
    "imports the design system",
    "no raw button",
    "no hardcoded hex",
    "uses Dialog, not a modal div",
    "no magic padding number",
)


def read_sources(path: Path) -> str:
    if path.is_file():
        return path.read_text(encoding="utf-8")
    chunks = []
    for file in sorted(path.glob("*.jsx")):
        chunks.append(file.read_text(encoding="utf-8"))
    if not chunks:
        raise SystemExit(f"no jsx in {path}")
    return "\n".join(chunks)


def tokens(path: Path) -> dict[str, str]:
    css_path = path / "tokens.css" if path.is_dir() else path.parent / "tokens.css"
    if not css_path.exists():
        return {}
    return dict(re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", css_path.read_text(encoding="utf-8")))


def issues(source: str) -> list[str]:
    found = []
    if "<button" in source:
        found.append("raw <button>")
    if re.search(r"#[0-9A-Fa-f]{3,8}", source):
        found.append("hardcoded hex color")
    if 'className="modal"' in source or "className='modal'" in source:
        found.append("hand-rolled modal")
    if re.search(r"padding:\s*13\b", source):
        found.append("padding 13 is off the space scale")
    if re.search(r"<button[^>]*>×</button>", source) or re.search(r"<button[^>]*>\s*</button>", source):
        found.append("icon button without an accessible name")
    if "from \"@ds\"" not in source and "from '@ds'" not in source:
        found.append("no design-system import")
    return found


def repair(source: str, token_map: dict[str, str]) -> str:
    text = source
    for name, value in token_map.items():
        text = text.replace(value.strip(), f"var({name})")
    text = text.replace("padding: 13", 'padding: "var(--space-3)"')
    text = text.replace('<div className="modal">', "<Dialog>")
    text = text.replace("</div>\n      </div>", "</Dialog>\n      </div>")
    text = text.replace("<button", "<Button")
    text = text.replace("</button>", "</Button>")
    text = text.replace("<Button>×</Button>", '<Button aria-label="Close">×</Button>')
    if "from '@ds'" not in text and 'from "@ds"' not in text:
        text = 'import { Button, Dialog } from "@ds";\n' + text
    return text


def results(source: str) -> list[tuple[str, bool]]:
    return [
        (CHECKS[0], "export function" in source),
        (CHECKS[1], "onClick" in source),
        (CHECKS[2], "dangerouslySetInnerHTML" not in source),
        (CHECKS[3], "<h1" in source or "<h2" in source),
        (CHECKS[4], "!important" not in source),
        (CHECKS[5], 'from "@ds"' in source or "from '@ds'" in source),
        (CHECKS[6], "<button" not in source),
        (CHECKS[7], re.search(r"#[0-9A-Fa-f]{3,8}", source) is None),
        (CHECKS[8], "<Dialog" in source and 'className="modal"' not in source),
        (CHECKS[9], re.search(r"padding:\s*13\b", source) is None),
    ]


def score_of(source: str) -> int:
    rows = results(source)
    return round(100 * sum(ok for _, ok in rows) / len(rows))


def print_score(label: str, source: str) -> None:
    rows = results(source)
    print(f"{label}  {score_of(source)}")
    for name, ok in rows:
        mark = "pass" if ok else "fail"
        print(f"  {mark:<4} {name}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Scan and repair design-system violations.")
    parser.add_argument("command", choices=["scan", "fix", "score"])
    parser.add_argument("path", type=Path)
    parser.add_argument("after", nargs="?", type=Path)
    parser.add_argument("--out", type=Path, default=None)
    args = parser.parse_args()
    path = args.path.resolve()
    source = read_sources(path)
    if args.command == "scan":
        found = issues(source)
        print(f"{len(found)} issues")
        for item in found:
            print(f"  {item}")
        return
    if args.command == "fix":
        out = args.out.resolve() if args.out else Path("/tmp/ui-repair-out")
        out.mkdir(parents=True, exist_ok=True)
        fixed = repair(source, tokens(path))
        (out / "Settings.jsx").write_text(fixed, encoding="utf-8")
        print(f"wrote {out / 'Settings.jsx'}")
        print_score("before", source)
        print_score("after ", fixed)
        return
    after_source = read_sources(args.after.resolve()) if args.after else source
    print_score("before" if args.after else "score", source)
    if args.after:
        print_score("after ", after_source)


if __name__ == "__main__":
    main()
