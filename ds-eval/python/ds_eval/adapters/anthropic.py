from __future__ import annotations

import json
import os
import time

import httpx

from ds_eval.adapters.base import EvalContext, ModelAdapter
from ds_eval.files_parse import normalize_files, parse_generated_files
from ds_eval.schemas import GenerationResult


class AnthropicAdapter(ModelAdapter):
    def generate(self, prompt: str, context: EvalContext) -> GenerationResult:
        key = os.environ.get("ANTHROPIC_API_KEY")
        model = self.config.model or "claude-sonnet-4-5"
        if not key:
            return GenerationResult(
                files={},
                error="ANTHROPIC_API_KEY is not set",
                model=model,
                provider="anthropic",
                system_prompt=context.system_prompt,
                task_prompt=prompt,
            )
        t0 = time.perf_counter()
        payload = {
            "model": model,
            "max_tokens": 8192,
            "temperature": self.config.temperature,
            "system": context.system_prompt,
            "messages": [{"role": "user", "content": prompt}],
        }
        try:
            with httpx.Client(timeout=180) as client:
                response = client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json=payload,
                )
                if response.status_code >= 400:
                    return GenerationResult(
                        files={},
                        error=f"HTTP {response.status_code}: {response.text[:800]}",
                        model=model,
                        provider="anthropic",
                        system_prompt=context.system_prompt,
                        task_prompt=prompt,
                    )
                body = response.json()
        except Exception as exc:
            return GenerationResult(
                files={},
                error=str(exc),
                model=model,
                provider="anthropic",
                system_prompt=context.system_prompt,
                task_prompt=prompt,
            )
        text = "".join(part.get("text", "") for part in body.get("content", []) if part.get("type") == "text")
        usage = body.get("usage") or {}
        in_tok = int(usage.get("input_tokens") or 0)
        out_tok = int(usage.get("output_tokens") or 0)
        used_model = body.get("model") or model
        return GenerationResult(
            files=normalize_files(parse_generated_files(text)),
            raw_text=text,
            input_tokens=in_tok,
            output_tokens=out_tok,
            cost_usd=round(in_tok * 3e-6 + out_tok * 15e-6, 6),
            latency_ms=int((time.perf_counter() - t0) * 1000),
            model=used_model,
            provider="anthropic",
            system_prompt=context.system_prompt,
            task_prompt=prompt,
        )
