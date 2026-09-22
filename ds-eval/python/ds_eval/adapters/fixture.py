from __future__ import annotations

from pathlib import Path

from ds_eval import repo_root
from ds_eval.adapters.base import EvalContext, ModelAdapter
from ds_eval.schemas import GenerationResult, ModelConfig


class FixtureAdapter(ModelAdapter):
    """Replay checked-in generated UI. Used for offline / CI runs."""

    def generate(self, prompt: str, context: EvalContext) -> GenerationResult:
        pack = self.config.pack or "good"
        case_id = context.case.id
        path = repo_root() / "examples" / "fixtures" / pack / case_id / "Task.tsx"
        if not path.exists():
            return GenerationResult(
                files={},
                model=f"fixture:{pack}",
                error=f"Missing fixture {path}",
            )
        return GenerationResult(
            files={"src/task/Task.tsx": path.read_text(encoding="utf-8")},
            model=f"fixture:{pack}",
            provider="fixture",
            latency_ms=1,
        )
