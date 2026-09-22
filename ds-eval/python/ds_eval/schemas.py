from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Viewport(BaseModel):
    width: int = 1280
    height: int = 800


class Assertion(BaseModel):
    kind: str
    target: str | None = None
    expected: str | bool | int | None = None


class Rubric(BaseModel):
    visual: list[str] = Field(default_factory=list)
    ux: list[str] = Field(default_factory=list)


class EvalCase(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str
    prompt: str
    required_components: list[str] = Field(default_factory=list)
    optional_components: list[str] = Field(default_factory=list)
    forbidden_patterns: list[str] = Field(default_factory=list)
    assertions: list[Assertion] = Field(default_factory=list)
    rubric: Rubric = Field(default_factory=Rubric)
    viewport: Viewport = Field(default_factory=Viewport)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ModelConfig(BaseModel):
    provider: str
    model: str | None = None
    pack: str | None = None
    label: str | None = None
    temperature: float = 0.0


class DesignSystemManifest(BaseModel):
    name: str
    version: str = "1.0"
    components: dict[str, str] = Field(default_factory=dict)
    tokens: dict[str, str] = Field(default_factory=dict)
    documentation: dict[str, str] = Field(default_factory=dict)
    rules: list[str] = Field(default_factory=list)


class GenerationResult(BaseModel):
    files: dict[str, str]
    raw_text: str = ""
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0
    latency_ms: int = 0
    model: str = ""
    provider: str = ""
    system_prompt: str = ""
    task_prompt: str = ""
    error: str | None = None


class GraderResult(BaseModel):
    name: str
    kind: str
    score: float
    max_score: float = 100
    passed: bool = True
    details: dict[str, Any] = Field(default_factory=dict)
    reasoning: str = ""


DEFAULT_WEIGHTS = {
    "ds_compliance": 0.25,
    "functional": 0.20,
    "visual": 0.15,
    "ux": 0.15,
    "accessibility": 0.10,
    "code_quality": 0.10,
    "reliability": 0.05,
}
