from __future__ import annotations

import json
import re


_FENCE = re.compile(r"^```(?:json|tsx|ts|jsx|javascript)?\s*|\s*```$", re.I | re.M)


def parse_generated_files(text: str) -> dict[str, str]:
    stripped = _FENCE.sub("", text.strip()).strip()
    if "export function Task" in stripped or "export default function Task" in stripped:
        if not stripped.lstrip().startswith("{"):
            return {"src/task/Task.tsx": stripped}
    data = _load_json(stripped) or _load_json(_extract_json_object(stripped))
    if not data:
        return {"src/task/Task.tsx": stripped} if stripped else {}
    files = data.get("files") if isinstance(data.get("files"), dict) else data
    if not isinstance(files, dict):
        return {"src/task/Task.tsx": stripped}
    return {str(k): str(v) for k, v in files.items() if isinstance(v, str)}


def normalize_files(files: dict[str, str]) -> dict[str, str]:
    if not files:
        return {}
    out: dict[str, str] = {}
    for key, value in files.items():
        rel = key.replace("\\", "/").lstrip("./")
        if rel.endswith(("Task.tsx", "Task.ts", "Task.jsx", "Task.jsx.tsx")):
            out["src/task/Task.tsx"] = value
        else:
            out[rel] = value
    if "src/task/Task.tsx" not in out and len(out) == 1:
        out = {"src/task/Task.tsx": next(iter(out.values()))}
    return out


def _load_json(text: str | None) -> dict | None:
    if not text:
        return None
    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) else None


def _extract_json_object(text: str) -> str | None:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    return text[start : end + 1]
