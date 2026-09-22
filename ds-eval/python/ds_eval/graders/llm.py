from __future__ import annotations

import base64
import json
import os
import time
from pathlib import Path

import httpx

from ds_eval.schemas import EvalCase, GraderResult, ModelConfig

VISUAL_RUBRIC = ["layout", "hierarchy", "spacing", "alignment", "consistency", "component_usage", "visual_polish", "information_density"]
UX_RUBRIC = ["task_completion", "interaction_clarity", "correct_pattern", "error_prevention", "feedback", "information_architecture"]


def _scale(values: dict[str, float], keys: list[str]) -> float:
    nums = [float(values.get(k, 0)) for k in keys]
    if not nums:
        return 0
    return round(100 * (sum(nums) / (5 * len(nums))), 1)


def grade_visual(case: EvalCase, screenshot: Path, config: ModelConfig) -> GraderResult:
    prompt = (
        "Score this generated UI screenshot against the task. "
        f"Task: {case.title}. {case.prompt}\n"
        f"Return JSON only with integer 0-5 scores for: {', '.join(VISUAL_RUBRIC)} "
        "and a reasoning object with one sentence per key."
    )
    data, usage = _judge(config, prompt, screenshot)
    if data is None:
        return GraderResult(name="visual", kind="llm", score=0, passed=False, details={"error": usage.get("error")}, reasoning=usage.get("error", "vision judge failed"))
    score = _scale(data, VISUAL_RUBRIC)
    return GraderResult(
        name="visual",
        kind="llm",
        score=score,
        passed=score >= 60,
        details={"scores": {k: data.get(k) for k in VISUAL_RUBRIC}, "reasoning": data.get("reasoning"), **usage},
        reasoning="vision LLM rubric 0–5 scaled to 0–100",
    )


def grade_ux(case: EvalCase, source: str, screenshot: Path | None, config: ModelConfig) -> GraderResult:
    prompt = (
        "Score the UX of this generated settings UI, not just visuals. "
        f"Task: {case.title}. {case.prompt}\n"
        f"Source:\n{source[:6000]}\n"
        f"Return JSON only with integer 0-5 scores for: {', '.join(UX_RUBRIC)} "
        "and a reasoning object with one sentence per key."
    )
    data, usage = _judge(config, prompt, screenshot)
    if data is None:
        return GraderResult(name="ux", kind="llm", score=0, passed=False, details={"error": usage.get("error")}, reasoning=usage.get("error", "UX judge failed"))
    score = _scale(data, UX_RUBRIC)
    return GraderResult(
        name="ux",
        kind="llm",
        score=score,
        passed=score >= 60,
        details={"scores": {k: data.get(k) for k in UX_RUBRIC}, "reasoning": data.get("reasoning"), **usage},
        reasoning="UX LLM rubric 0–5 scaled to 0–100",
    )


def _judge(config: ModelConfig, prompt: str, screenshot: Path | None) -> tuple[dict | None, dict]:
    if config.provider == "anthropic":
        return _anthropic_judge(config, prompt, screenshot)
    if config.provider == "openai":
        return _openai_judge(config, prompt, screenshot)
    return None, {"error": f"no LLM judge for provider {config.provider}"}


def _image_b64(path: Path) -> str:
    return base64.b64encode(path.read_bytes()).decode("ascii")


def _parse_json(text: str) -> dict | None:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        payload = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) else None


def _anthropic_judge(config: ModelConfig, prompt: str, screenshot: Path | None) -> tuple[dict | None, dict]:
    key = os.environ.get("ANTHROPIC_API_KEY")
    model = config.model or "claude-sonnet-4-5"
    if not key:
        return None, {"error": "ANTHROPIC_API_KEY is not set"}
    content: list[dict] = []
    if screenshot and screenshot.exists():
        content.append(
            {
                "type": "image",
                "source": {"type": "base64", "media_type": "image/png", "data": _image_b64(screenshot)},
            }
        )
    content.append({"type": "text", "text": prompt})
    t0 = time.perf_counter()
    try:
        with httpx.Client(timeout=120) as client:
            response = client.post(
                "https://api.anthropic.com/v1/messages",
                headers={"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                json={"model": model, "max_tokens": 1024, "temperature": 0, "messages": [{"role": "user", "content": content}]},
            )
            response.raise_for_status()
            body = response.json()
    except Exception as exc:
        return None, {"error": str(exc)}
    text = "".join(part.get("text", "") for part in body.get("content", []) if part.get("type") == "text")
    usage = body.get("usage") or {}
    meta = {
        "input_tokens": int(usage.get("input_tokens") or 0),
        "output_tokens": int(usage.get("output_tokens") or 0),
        "latency_ms": int((time.perf_counter() - t0) * 1000),
        "model": body.get("model") or model,
    }
    return _parse_json(text), meta


def _openai_judge(config: ModelConfig, prompt: str, screenshot: Path | None) -> tuple[dict | None, dict]:
    key = os.environ.get("OPENAI_API_KEY")
    model = config.model or "gpt-4.1"
    if not key:
        return None, {"error": "OPENAI_API_KEY is not set"}
    user_content: list[dict] = [{"type": "text", "text": prompt}]
    if screenshot and screenshot.exists():
        user_content.append(
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{_image_b64(screenshot)}"}}
        )
    t0 = time.perf_counter()
    try:
        with httpx.Client(timeout=120) as client:
            response = client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"authorization": f"Bearer {key}", "content-type": "application/json"},
                json={"model": model, "temperature": 0, "messages": [{"role": "user", "content": user_content}]},
            )
            response.raise_for_status()
            body = response.json()
    except Exception as exc:
        return None, {"error": str(exc)}
    text = body["choices"][0]["message"]["content"] or ""
    usage = body.get("usage") or {}
    meta = {
        "input_tokens": int(usage.get("prompt_tokens") or 0),
        "output_tokens": int(usage.get("completion_tokens") or 0),
        "latency_ms": int((time.perf_counter() - t0) * 1000),
        "model": body.get("model") or model,
    }
    return _parse_json(text), meta
