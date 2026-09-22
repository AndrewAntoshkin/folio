from __future__ import annotations

import os
import time

import httpx

from ds_eval.adapters.base import EvalContext, ModelAdapter
from ds_eval.files_parse import normalize_files, parse_generated_files
from ds_eval.schemas import GenerationResult


class OpenAIAdapter(ModelAdapter):
    def generate(self, prompt: str, context: EvalContext) -> GenerationResult:
        key = os.environ.get("OPENAI_API_KEY")
        model = self.config.model or "gpt-4.1"
        if not key:
            return GenerationResult(
                files={},
                error="OPENAI_API_KEY is not set",
                model=model,
                provider="openai",
                system_prompt=context.system_prompt,
                task_prompt=prompt,
            )
        t0 = time.perf_counter()
        payload = {
            "model": model,
            "temperature": self.config.temperature,
            "messages": [
                {"role": "system", "content": context.system_prompt},
                {"role": "user", "content": prompt},
            ],
        }
        try:
            with httpx.Client(timeout=180) as client:
                response = client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"authorization": f"Bearer {key}", "content-type": "application/json"},
                    json=payload,
                )
                if response.status_code >= 400:
                    return GenerationResult(
                        files={},
                        error=f"HTTP {response.status_code}: {response.text[:800]}",
                        model=model,
                        provider="openai",
                        system_prompt=context.system_prompt,
                        task_prompt=prompt,
                    )
                body = response.json()
        except Exception as exc:
            return GenerationResult(
                files={},
                error=str(exc),
                model=model,
                provider="openai",
                system_prompt=context.system_prompt,
                task_prompt=prompt,
            )
        text = body["choices"][0]["message"]["content"] or ""
        usage = body.get("usage") or {}
        in_tok = int(usage.get("prompt_tokens") or 0)
        out_tok = int(usage.get("completion_tokens") or 0)
        used_model = body.get("model") or model
        return GenerationResult(
            files=normalize_files(parse_generated_files(text)),
            raw_text=text,
            input_tokens=in_tok,
            output_tokens=out_tok,
            cost_usd=round(in_tok * 2e-6 + out_tok * 8e-6, 6),
            latency_ms=int((time.perf_counter() - t0) * 1000),
            model=used_model,
            provider="openai",
            system_prompt=context.system_prompt,
            task_prompt=prompt,
        )
