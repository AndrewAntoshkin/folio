from __future__ import annotations

import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

from ds_eval import repo_root
from ds_eval.store import list_runs


def _case_dir(run_dir: Path, case_id: str) -> Path:
    new = run_dir / "cases" / case_id
    old = run_dir / case_id
    return new if new.exists() else old


def _enrich(run_dir: Path, payload: dict) -> dict:
    for case in payload.get("cases") or []:
        folder = _case_dir(run_dir, case["id"])
        shot = folder / "screenshot.png"
        source = folder / "source" / "Task.tsx"
        prompt = folder / "prompt.md"
        system = folder / "system.md"
        runtime = folder / "runtime.log"
        graders = folder / "graders.json"
        case["has_screenshot"] = shot.exists()
        case["screenshot_url"] = f"/artifacts/{run_dir.name}/cases/{case['id']}/screenshot.png" if shot.exists() else ""
        if not case["screenshot_url"] and (run_dir / case["id"] / "screenshot.png").exists():
            case["screenshot_url"] = f"/artifacts/{run_dir.name}/{case['id']}/screenshot.png"
            case["has_screenshot"] = True
        case["source"] = source.read_text(encoding="utf-8") if source.exists() else ""
        case["prompt"] = prompt.read_text(encoding="utf-8") if prompt.exists() else (case.get("generation") or {}).get("task_prompt", "")
        case["system_prompt"] = system.read_text(encoding="utf-8") if system.exists() else (case.get("generation") or {}).get("system_prompt", "")
        case["runtime_log"] = runtime.read_text(encoding="utf-8")[-4000:] if runtime.exists() else ""
        if graders.exists() and not case.get("graders"):
            case["graders"] = json.loads(graders.read_text(encoding="utf-8"))
    return payload


def serve_dashboard(port: int = 8001) -> None:
    root = repo_root()
    dash = root / "apps" / "dashboard"

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(dash), **kwargs)

        def log_message(self, fmt: str, *args) -> None:
            return

        def do_GET(self):  # noqa: N802
            parsed = urlparse(self.path)
            if parsed.path == "/api/runs":
                runs = _runs_from_disk(root) or list_runs()
                return self._json(runs)
            if parsed.path.startswith("/api/runs/"):
                run_id = unquote(parsed.path.split("/api/runs/", 1)[1].strip("/"))
                run_dir = root / "runs" / run_id
                summary = run_dir / "summary.json"
                if not summary.exists():
                    self.send_error(404)
                    return
                payload = json.loads(summary.read_text(encoding="utf-8"))
                return self._json(_enrich(run_dir, payload))
            if parsed.path.startswith("/artifacts/"):
                rel = unquote(parsed.path.split("/artifacts/", 1)[1])
                target = (root / "runs" / rel).resolve()
                if not str(target).startswith(str((root / "runs").resolve())) or not target.exists():
                    self.send_error(404)
                    return
                self.send_response(200)
                self.send_header("Content-Type", "image/png" if target.suffix == ".png" else "text/plain; charset=utf-8")
                self.end_headers()
                self.wfile.write(target.read_bytes())
                return
            return super().do_GET()

        def _json(self, payload) -> None:
            body = json.dumps(payload).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"ds-eval dashboard  http://127.0.0.1:{port}", flush=True)
    server.serve_forever()


def _runs_from_disk(root: Path) -> list[dict]:
    items = []
    runs_dir = root / "runs"
    if not runs_dir.exists():
        return items
    for path in sorted(runs_dir.iterdir()):
        summary = path / "summary.json"
        if summary.exists():
            items.append(json.loads(summary.read_text(encoding="utf-8")))
    return items
