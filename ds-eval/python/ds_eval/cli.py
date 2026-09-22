from __future__ import annotations

from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

from ds_eval.env import load_env
from ds_eval import repo_root
from ds_eval.dashboard import serve_dashboard
from ds_eval.loader import load_cases, load_models, select_cases
from ds_eval.regression import compare_runs
from ds_eval.report import write_report
from ds_eval.runner import run_suite

app = typer.Typer(no_args_is_help=True, add_completion=False, help="Design System AI Eval Harness")
console = Console()


@app.command()
def init(target: Path = typer.Argument(Path("."), help="Design system directory")) -> None:
    """Write a ds.manifest.yaml if missing."""
    manifest = target / "ds.manifest.yaml"
    if manifest.exists():
        console.print(f"already exists: {manifest}")
        raise typer.Exit()
    manifest.write_text(
        "name: Custom DS\nversion: 0.1.0\ncomponents:\n  path: ./src/components\ntokens:\n  path: ./src/tokens.css\ndocumentation:\n  path: ./docs\n",
        encoding="utf-8",
    )
    console.print(f"wrote {manifest}")


@app.command("list")
def list_cases(
    suite: str | None = typer.Option(None),
    category: str | None = typer.Option(None),
) -> None:
    cases = select_cases(load_cases(), suite=suite, category=category)
    table = Table(title="eval cases")
    table.add_column("id")
    table.add_column("category")
    table.add_column("difficulty")
    table.add_column("title")
    for case in cases:
        table.add_row(case.id, case.category, case.difficulty, case.title)
    console.print(table)


@app.command()
def run(
    model: str = typer.Option(..., "--model", help="Name from models.yaml"),
    suite: str = typer.Option("smoke", "--suite"),
    system: Path | None = typer.Option(None, "--system"),
    output: Path | None = typer.Option(None, "--output"),
    category: str | None = typer.Option(None, "--category"),
    limit: int | None = typer.Option(None, "--limit"),
    case_id: str | None = typer.Option(None, "--case"),
    runtime: bool | None = typer.Option(None, "--runtime/--no-runtime", help="Playwright + axe. Default on for live models."),
) -> None:
    load_env()
    try:
        run_dir = run_suite(
            model_name=model,
            suite=None if case_id else suite,
            system=system,
            output=output,
            category=category,
            limit=limit,
            case_id=case_id,
            with_runtime=runtime,
        )
    except Exception as exc:
        console.print(f"[red]{exc}[/red]")
        raise typer.Exit(1) from exc
    write_report(run_dir)
    summary_path = run_dir / "summary.json"
    import json

    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    table = Table(title=f"{summary['run_id']}  overall {summary['overall']}")
    table.add_column("case")
    table.add_column("overall", justify="right")
    table.add_column("DS", justify="right")
    table.add_column("a11y", justify="right")
    for case in summary["cases"]:
        table.add_row(
            case["id"],
            str(case["scores"]["overall"]),
            str(case["scores"].get("ds_compliance")),
            str(case["scores"].get("accessibility")),
        )
    console.print(table)
    console.print(f"wrote {run_dir}")


@app.command()
def compare(run_a: str = typer.Argument(...), run_b: str = typer.Argument(...)) -> None:
    root = repo_root() / "runs"
    a = Path(run_a) if Path(run_a).exists() else root / run_a
    b = Path(run_b) if Path(run_b).exists() else root / run_b
    result = compare_runs(a, b)
    (b / "compare.json").write_text(__import__("json").dumps(result, indent=2), encoding="utf-8")
    table = Table(title=f"{result['a']['model']} vs {result['b']['model']}")
    table.add_column("axis")
    table.add_column("delta", justify="right")
    for key, delta in result["deltas"].items():
        table.add_row(key, f"{delta:+.1f}")
    console.print(table)
    console.print(
        f"{result['counts']['improved']} improved · {result['counts']['regressions']} regressions · {result['counts']['unchanged']} unchanged"
    )


@app.command()
def report(run_id: str = typer.Argument(...)) -> None:
    path = Path(run_id) if Path(run_id).exists() else repo_root() / "runs" / run_id
    paths = write_report(path)
    for kind, file in paths.items():
        console.print(f"{kind}: {file}")


@app.command()
def dashboard(port: int = typer.Option(8001, "--port")) -> None:
    load_env()
    serve_dashboard(port=port)


def main() -> None:
    app()


if __name__ == "__main__":
    main()
