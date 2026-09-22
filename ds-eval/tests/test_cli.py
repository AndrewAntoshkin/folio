from typer.testing import CliRunner

from ds_eval.cli import app

runner = CliRunner()


def test_list_smoke():
    result = runner.invoke(app, ["list", "--suite", "smoke"])
    assert result.exit_code == 0, result.output
    assert "component-select-001" in result.output
    assert "adversarial-color-001" in result.output
