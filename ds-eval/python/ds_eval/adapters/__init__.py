from __future__ import annotations

from ds_eval.adapters.anthropic import AnthropicAdapter
from ds_eval.adapters.base import ModelAdapter
from ds_eval.adapters.fixture import FixtureAdapter
from ds_eval.adapters.openai import OpenAIAdapter
from ds_eval.schemas import ModelConfig

PROVIDERS = {
    "fixture": FixtureAdapter,
    "anthropic": AnthropicAdapter,
    "openai": OpenAIAdapter,
}


def build_adapter(config: ModelConfig) -> ModelAdapter:
    try:
        cls = PROVIDERS[config.provider]
    except KeyError as exc:
        raise ValueError(
            f"Unknown provider {config.provider!r}. Add it in ds_eval.adapters.PROVIDERS."
        ) from exc
    return cls(config)
