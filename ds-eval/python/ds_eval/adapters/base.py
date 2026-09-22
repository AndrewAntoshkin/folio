from __future__ import annotations

from abc import ABC, abstractmethod

from ds_eval.schemas import EvalCase, GenerationResult, ModelConfig


class EvalContext:
    def __init__(self, case: EvalCase, ds_docs: str, system_prompt: str):
        self.case = case
        self.ds_docs = ds_docs
        self.system_prompt = system_prompt


class ModelAdapter(ABC):
    def __init__(self, config: ModelConfig):
        self.config = config

    @abstractmethod
    def generate(self, prompt: str, context: EvalContext) -> GenerationResult:
        raise NotImplementedError
