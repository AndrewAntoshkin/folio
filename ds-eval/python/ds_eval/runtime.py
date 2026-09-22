from __future__ import annotations

import json
import shutil
import socket
import subprocess
import time
from pathlib import Path

from ds_eval.sandbox import prepare_sandbox, write_generated_files
from ds_eval.schemas import EvalCase, GraderResult, Viewport


class RuntimeOutcome:
    def __init__(self) -> None:
        self.log: list[str] = []
        self.screenshot: Path | None = None
        self.reliability = GraderResult(name="reliability", kind="deterministic", score=0, passed=False)
        self.functional = GraderResult(name="functional", kind="deterministic", score=0, passed=False)
        self.accessibility = GraderResult(name="accessibility", kind="deterministic", score=0, passed=False)


def _free_port() -> int:
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


def _log(outcome: RuntimeOutcome, case_dir: Path, message: str) -> None:
    outcome.log.append(message)
    (case_dir / "runtime.log").write_text("\n".join(outcome.log) + "\n", encoding="utf-8")


def run_runtime(template: Path, files: dict[str, str], case_dir: Path, case: EvalCase) -> RuntimeOutcome:
    outcome = RuntimeOutcome()
    sandbox = case_dir / "app"
    screenshot = case_dir / "screenshot.png"
    try:
        _log(outcome, case_dir, f"prepare sandbox from {template}")
        prepare_sandbox(template, sandbox)
        write_generated_files(sandbox, files)
        npm = shutil.which("npm")
        if not npm:
            raise RuntimeError("npm is not installed")
        _log(outcome, case_dir, "npm run build")
        build = subprocess.run([npm, "run", "build"], cwd=sandbox, capture_output=True, text=True)
        _log(outcome, case_dir, (build.stdout or "")[-2000:])
        if build.returncode != 0:
            _log(outcome, case_dir, build.stderr[-2000:])
            outcome.reliability = GraderResult(
                name="reliability",
                kind="deterministic",
                score=0,
                passed=False,
                details={"build": "failed"},
                reasoning=build.stderr[-500:] or "vite build failed",
            )
            return outcome

        from playwright.sync_api import sync_playwright

        port = _free_port()
        preview = subprocess.Popen(
            [npm, "run", "preview", "--", "--host", "127.0.0.1", "--port", str(port), "--strictPort"],
            cwd=sandbox,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        url = f"http://127.0.0.1:{port}/"
        _log(outcome, case_dir, f"preview {url}")
        try:
            _wait_http(url, timeout=30)
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(viewport={"width": case.viewport.width, "height": case.viewport.height})
                console_errors: list[str] = []
                page_errors: list[str] = []
                page.on("pageerror", lambda exc: page_errors.append(str(exc)))
                page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
                page.goto(url, wait_until="networkidle")
                page.screenshot(path=str(screenshot), full_page=True)
                outcome.screenshot = screenshot if screenshot.exists() else None
                axe = _run_axe(page, sandbox)
                interactions = _run_assertions(page, case)
                browser.close()
        finally:
            preview.terminate()
            try:
                preview.wait(timeout=5)
            except Exception:
                preview.kill()

        boot_ok = not page_errors
        outcome.reliability = GraderResult(
            name="reliability",
            kind="deterministic",
            score=100 if boot_ok else 40,
            passed=boot_ok,
            details={"build": "ok", "screenshot": bool(outcome.screenshot), "page_errors": page_errors, "console_errors": console_errors[:8]},
            reasoning="runtime ok" if boot_ok else "; ".join(page_errors[:3]),
        )
        passed_n = sum(1 for item in interactions if item.get("passed"))
        total_n = max(1, len(interactions))
        func_score = round(100 * passed_n / total_n, 1)
        outcome.functional = GraderResult(
            name="functional",
            kind="deterministic",
            score=func_score,
            passed=passed_n == total_n,
            details={"assertions": interactions},
            reasoning=f"{passed_n}/{total_n} interaction assertions passed",
        )
        outcome.accessibility = _axe_grader(axe)
        _log(outcome, case_dir, f"screenshot={bool(outcome.screenshot)} functional={func_score} a11y={outcome.accessibility.score}")
        return outcome
    except Exception as exc:
        _log(outcome, case_dir, f"error: {exc}")
        outcome.reliability = GraderResult(
            name="reliability",
            kind="deterministic",
            score=0,
            passed=False,
            details={"error": str(exc)},
            reasoning=str(exc),
        )
        return outcome


def _wait_http(url: str, timeout: int) -> None:
    import urllib.request

    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=1)
            return
        except Exception as exc:
            last = exc
            time.sleep(0.25)
    raise RuntimeError(f"preview did not start: {last}")


def _run_axe(page, sandbox: Path) -> dict:
    axe_js = sandbox / "node_modules" / "axe-core" / "axe.min.js"
    if not axe_js.exists():
        return {"error": "axe-core is not installed"}
    page.add_script_tag(path=str(axe_js))
    return page.evaluate("async () => await axe.run()")


def _axe_grader(axe: dict) -> GraderResult:
    if axe.get("error"):
        return GraderResult(
            name="accessibility",
            kind="deterministic",
            score=0,
            passed=False,
            details=axe,
            reasoning=str(axe.get("error")),
        )
    violations = axe.get("violations") or []
    serious = [v for v in violations if v.get("impact") in {"serious", "critical"}]
    score = max(0, 100 - 15 * len(violations) - 10 * len(serious))
    return GraderResult(
        name="accessibility",
        kind="deterministic",
        score=score,
        passed=score >= 70,
        details={
            "violation_count": len(violations),
            "violations": [
                {"id": v.get("id"), "impact": v.get("impact"), "description": v.get("description")}
                for v in violations[:12]
            ],
        },
        reasoning="axe-core on the rendered page" if not violations else f"{len(violations)} axe violations",
    )


def _run_assertions(page, case: EvalCase) -> list[dict]:
    results = [{"kind": "render", "passed": True, "detail": "page loaded"}]
    assertions = list(case.assertions) or _default_assertions(case)
    for assertion in assertions:
        target = assertion.target or ""
        try:
            locator = _locator(page, target)
            if assertion.kind == "visible":
                locator.first.wait_for(state="visible", timeout=5000)
                results.append({"kind": "visible", "target": target, "passed": True})
            elif assertion.kind == "click":
                locator.first.click(timeout=5000)
                results.append({"kind": "click", "target": target, "passed": True})
            else:
                results.append({"kind": assertion.kind, "target": target, "passed": False, "detail": "unknown assertion"})
        except Exception as exc:
            results.append({"kind": assertion.kind, "target": target, "passed": False, "detail": str(exc)})
    return results


def _default_assertions(case: EvalCase) -> list:
    from ds_eval.schemas import Assertion

    if case.id == "page-settings-001":
        return [
            Assertion(kind="visible", target="text=Settings"),
            Assertion(kind="click", target="role=tab[name=Notifications]"),
            Assertion(kind="click", target="role=tab[name=Profile]"),
            Assertion(kind="visible", target='role=button[name="Save"]'),
        ]
    return [Assertion(kind="visible", target="css=.app-shell")]


def _locator(page, target: str):
    if target.startswith("text="):
        return page.get_by_text(target[5:], exact=False)
    if target.startswith("css="):
        return page.locator(target[4:])
    if target.startswith("role="):
        body = target[5:]
        name = None
        role = body
        if "[name=" in body:
            role, rest = body.split("[name=", 1)
            name = rest.rstrip("]").strip("\"'")
        return page.get_by_role(role, name=name)
    return page.get_by_text(target, exact=False)
