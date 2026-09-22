from __future__ import annotations

from ds_eval.schemas import EvalCase

SYSTEM_PROMPT = """You generate production React + TypeScript UI that uses ONLY the provided design system.

Rules:
- Import components from '@ds'.
- Use CSS variables from tokens.css. Never hardcode hex/rgb colors or raw px spacing.
- Do not recreate components that already exist.
- Do not use native <button>, <select> when a DS component exists.
- Export a function named Task as the page root.
- Return JSON only: { "files": { "src/task/Task.tsx": "..." } }
"""


def user_prompt(case: EvalCase, ds_docs: str) -> str:
    required = ", ".join(case.required_components) or "none"
    forbidden = ", ".join(case.forbidden_patterns) or "none"
    return f"""# Design system
{ds_docs}

# Task
id: {case.id}
title: {case.title}
category: {case.category}
difficulty: {case.difficulty}

{case.prompt}

required_components: {required}
forbidden_patterns: {forbidden}

Respond with JSON only.
"""
