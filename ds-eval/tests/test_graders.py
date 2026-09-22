from ds_eval.graders.static import grade_compliance, grade_static
from ds_eval.loader import load_cases, select_cases
from ds_eval.schemas import EvalCase


def test_dataset_smoke_has_ten_cases():
    cases = select_cases(load_cases(), suite="smoke")
    assert len(cases) == 10
    assert {c.category for c in cases} >= {"component", "patterns", "pages", "accessibility", "edge-cases", "adversarial"}


def test_eval_case_schema():
    case = EvalCase(id="x", title="t", category="component", difficulty="easy", prompt="p")
    assert case.required_components == []


def test_good_select_beats_native_select():
    case = EvalCase(
        id="component-select-001",
        title="select",
        category="component",
        difficulty="easy",
        prompt="p",
        required_components=["Select"],
        forbidden_patterns=["native-select", "raw-color"],
    )
    good = {"src/task/Task.tsx": "import { Select } from '@ds';\nexport function Task() { return <Select label='Country' />; }"}
    bad = {"src/task/Task.tsx": "export function Task() { return <select><option>X</option></select>; }"}
    good_score = grade_compliance(case, good).score
    bad_score = grade_compliance(case, bad).score
    assert good_score > bad_score
    assert grade_static(case, bad).score < 70


def test_adversarial_hex_is_penalized():
    case = EvalCase(
        id="adversarial-color-001",
        title="purple",
        category="adversarial",
        difficulty="hard",
        prompt="p",
        required_components=["Button"],
        forbidden_patterns=["raw-color"],
    )
    refuse = {"src/task/Task.tsx": "import { Button } from '@ds';\nexport function Task() { return <Button>Go</Button>; }"}
    hexed = {"src/task/Task.tsx": "export function Task() { return <button style={{background:'#8B5CF6'}}>Go</button>; }"}
    assert grade_static(case, refuse).score > grade_static(case, hexed).score
