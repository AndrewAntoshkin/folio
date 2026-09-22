"""Docs for the AI-native design-system loop. Artifacts are read from the fixtures."""

from __future__ import annotations

import html
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GITHUB = "https://github.com/AndrewAntoshkin/"

CHECK_RU = {
    "exports a component": "экспортирует компонент",
    "handles a click": "обрабатывает клик",
    "no dangerouslySetInnerHTML": "нет dangerouslySetInnerHTML",
    "has a heading": "есть заголовок",
    "no !important": "нет !important",
    "imports the design system": "импортирует дизайн-систему",
    "no raw button": "нет сырого button",
    "no hardcoded hex": "нет захардкоженного hex",
    "uses Dialog, not a modal div": "Dialog, а не div.modal",
    "no magic padding number": "нет магического padding",
}

VERDICT_RU = {"improved": "вырос", "regressed": "упал", "unchanged": "без сдвига"}


def _page(slug: str, lang: str) -> str:
    return f"{slug}.html" if lang == "ru" else f"{slug}-en.html"


def _link(slug: str, lang: str) -> str:
    return f'<a href="{_page(slug, lang)}">{slug}</a>'


def _load(name: str, rel: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / rel)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _text(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def _pre(text: str) -> str:
    return "<pre><code>" + html.escape(text.rstrip("\n")) + "</code></pre>"


def _section(anchor: str, title: str, *parts: str) -> str:
    return f'<section id="{anchor}"><h2>{title}</h2>' + "".join(parts) + "</section>"


def load(slug: str, lang: str) -> dict:
    ru = lang == "ru"
    builders = {
        "ds-context": _context,
        "ui-repair": _repair,
        "prompt-regress": _regress,
    }
    return builders[slug](ru, lang)


def _groups(raw: list[tuple[str, list[tuple[str, str]]]]) -> list[dict]:
    return [
        {"label": label, "items": [{"href": href, "label": text} for text, href in items]}
        for label, items in raw
    ]


def _context(ru: bool, lang: str) -> dict:
    mod = _load("ds_context_docs", "ds-context/ds_context.py")
    source = ROOT / "ds-context/fixtures/acme"
    packs = {name: mod.pack(source, name) for name in ("full", "compact", "components")}
    full = packs["full"]
    repair = _link("ui-repair", lang)
    eval_ = _link("ds-eval", lang)
    regress = _link("prompt-regress", lang)
    strategy_rows = []
    contents = {
        "full": (
            "Токены, API с примерами, паттерны, антипаттерны и примеры экранов",
            "Tokens, API with examples, patterns, anti-patterns, and screen examples",
        ),
        "compact": (
            "Токены, API без примеров и антипаттерны. Отдельный examples.md не пишется",
            "Tokens, API without examples, and anti-patterns. No separate examples.md",
        ),
        "components": (
            "Только обзор с токенами и API. Паттерны и примеры не пишутся",
            "Overview with tokens and the API only. No patterns or examples",
        ),
    }
    for name in ("full", "compact", "components"):
        total = sum(mod.estimate_tokens(text) for file, text in packs[name].items() if file != "manifest.json")
        label = contents[name][0 if ru else 1]
        strategy_rows.append(f"<tr><td>{name}</td><td>~{total}</td><td>{label}</td></tr>")
    file_rows = []
    for name, text in full.items():
        if name == "manifest.json":
            continue
        file_rows.append(f"<tr><td><code>{name}</code></td><td>~{mod.estimate_tokens(text)}</td></tr>")
    manifest = full["manifest.json"]
    tree = """fixtures/acme/
  tokens.css
  components.json
  patterns.md
  anti-patterns.md
  examples.md
  dist/
    design-system.md
    components.md
    patterns.md
    anti-patterns.md
    examples.md
    manifest.json"""
    stdout = _context_stdout(mod, packs)
    if ru:
        lead = "Модель плохо следует дизайн-системе ещё и потому, что ей отдают плохой контекст: простыню доков, половину Storybook и ни одного антипаттерна. ds-context собирает из локальных файлов короткий пакет и показывает, сколько токенов стоит каждая стратегия упаковки."
        groups = [
            ("Основное", [("Зачем", "#why"), ("Вход", "#inputs"), ("Запуск", "#run")]),
            ("Пакет", [("Выход", "#output"), ("Стратегии", "#strategies"), ("Манифест", "#manifest")]),
            ("Контур", [("Куда встаёт", "#chain"), ("Предел", "#limits")]),
            ("Ссылки", [("GitHub", GITHUB + "ds-context")]),
        ]
        body = "".join([
            _section("why", "Зачем",
                "<p>Агент путает систему не только из-за слабой модели. Ему часто отдают либо ничего, либо весь Storybook сразу. В первом случае он рисует свой Button. Во втором тонет в токенах и примерах, которые не относятся к задаче.</p>",
                f"<p>ds-context стоит перед моделью. Он собирает контекст, который потом можно отдать Claude или Codex и проверить в {eval_}.</p>"),
            _section("inputs", "Вход",
                "<p>MVP читает папку. Он не открывает Storybook и не ходит в Figma API. Файл из Figma попадает сюда уже как markdown, например после figma-to-design-md. Фикстура Acme — пять файлов:</p>",
                _pre(tree),
                "<p><code>tokens.css</code> — шкала, с которой потом сверяется починка.</p>",
                _pre(_text("ds-context/fixtures/acme/tokens.css")),
                "<p><code>components.json</code> — имя, пропсы, пример и чего избегать. Пример попадает в пакет только в стратегии full.</p>",
                _pre(_text("ds-context/fixtures/acme/components.json")),
                "<p>Три markdown-файла задают паттерны, запреты и короткие примеры экранов.</p>",
                _pre(_text("ds-context/fixtures/acme/patterns.md")),
                _pre(_text("ds-context/fixtures/acme/anti-patterns.md")),
                _pre(_text("ds-context/fixtures/acme/examples.md"))),
            _section("run", "Запуск",
                _pre("python3 ds-context/ds_context.py build ds-context/fixtures/acme"),
                "<p>Команда пишет пакет в <code>ds-context/fixtures/acme/dist</code>. Это офлайн-сборка: без ключей и без вызова модели. Печать команды на этой фикстуре:</p>",
                _pre(stdout)),
            _section("output", "Выход",
                "<p><code>design-system.md</code> — то, что можно положить в контекст целиком. В стратегии full сюда же встроены паттерны, антипаттерны и примеры. Отдельные файлы в <code>dist/</code> повторяют исходные markdown.</p>",
                _pre(full["design-system.md"]),
                "<p><code>components.md</code> — API. Пример и строка Avoid берутся из JSON.</p>",
                _pre(full["components.md"])),
            _section("strategies", "Стратегии",
                "<p>Оценка размера — около 4 символов на токен. Это не токенайзер Claude. Манифест в сумму не входит. На фикстуре Acme:</p>",
                "<table><thead><tr><th>Стратегия</th><th>Оценка</th><th>Что внутри</th></tr></thead><tbody>"
                + "".join(strategy_rows) + "</tbody></table>",
                "<p>Полный пакет по файлам:</p>",
                "<table><thead><tr><th>Файл</th><th>Оценка</th></tr></thead><tbody>"
                + "".join(file_rows) + "</tbody></table>"),
            _section("manifest", "Манифест",
                f"<p>Манифест нужен следующему шагу контура: выбрать стратегию под бюджет токенов и отдать модели только эти файлы. Имена компонентов и токенов лежат списком, чтобы {repair} и {eval_} сверялись с тем же источником.</p>",
                _pre(manifest)),
            _section("chain", "Куда встаёт",
                _pre("Figma / локальная спека\n→ ds-context\n→ модель\n→ ui-repair\n→ ds-eval\n→ prompt-regress"),
                f"<p>ds-context готовит контекст. {eval_} измеряет, помог ли он. {regress} показывает, не сломала ли новая версия промпта то, что уже проходило.</p>"),
            _section("limits", "Предел",
                "<p>Инструмент не открывает Storybook и не ходит в Figma. Он не выбирает кусок пакета под один экран: стратегии глобальные. Оценка токенов годится, чтобы сравнить пакеты между собой, и не годится как счёт из API.</p>"),
        ])
    else:
        lead = "A model misses the design system when the context is wrong: nothing, or the entire Storybook. ds-context turns a local folder into a short pack and shows what each packing strategy costs in tokens."
        groups = [
            ("Basics", [("Why", "#why"), ("Input", "#inputs"), ("Run", "#run")]),
            ("Pack", [("Output", "#output"), ("Strategies", "#strategies"), ("Manifest", "#manifest")]),
            ("Loop", [("Where it sits", "#chain"), ("Limit", "#limits")]),
            ("Links", [("GitHub", GITHUB + "ds-context")]),
        ]
        body = "".join([
            _section("why", "Why",
                "<p>An agent drifts off the system for two different reasons. Sometimes it receives no spec. Sometimes it receives every token and every example at once. In the first case it invents a Button. In the second it drowns.</p>",
                f"<p>ds-context sits in front of the model. It builds the pack you can hand to Claude or Codex and then measure with {eval_}.</p>"),
            _section("inputs", "Input",
                "<p>The MVP reads a folder. It does not crawl Storybook or call the Figma API. A Figma file arrives as markdown, for example from figma-to-design-md. The Acme fixture is five files:</p>",
                _pre(tree),
                "<p><code>tokens.css</code> is the scale a later repair checks against.</p>",
                _pre(_text("ds-context/fixtures/acme/tokens.css")),
                "<p><code>components.json</code> holds the name, props, example, and what to avoid. The example is copied into the pack only for the full strategy.</p>",
                _pre(_text("ds-context/fixtures/acme/components.json")),
                "<p>Three markdown files set the patterns, the bans, and short screen examples.</p>",
                _pre(_text("ds-context/fixtures/acme/patterns.md")),
                _pre(_text("ds-context/fixtures/acme/anti-patterns.md")),
                _pre(_text("ds-context/fixtures/acme/examples.md"))),
            _section("run", "Run",
                _pre("python3 ds-context/ds_context.py build ds-context/fixtures/acme"),
                "<p>The command writes the pack to <code>ds-context/fixtures/acme/dist</code>. Offline. No keys and no model call. On this fixture it prints:</p>",
                _pre(stdout)),
            _section("output", "Output",
                "<p><code>design-system.md</code> is the file you can put in context whole. The full strategy inlines patterns, anti-patterns, and examples. The separate files in <code>dist/</code> repeat the source markdown.</p>",
                _pre(full["design-system.md"]),
                "<p><code>components.md</code> is the API. The example and the Avoid line come from the JSON.</p>",
                _pre(full["components.md"])),
            _section("strategies", "Strategies",
                "<p>The size estimate is about 4 characters per token. It is not the Claude tokenizer. The manifest is excluded from the total. On the Acme fixture:</p>",
                "<table><thead><tr><th>Strategy</th><th>Estimate</th><th>Contents</th></tr></thead><tbody>"
                + "".join(strategy_rows) + "</tbody></table>",
                "<p>Full pack by file:</p>",
                "<table><thead><tr><th>File</th><th>Estimate</th></tr></thead><tbody>"
                + "".join(file_rows) + "</tbody></table>"),
            _section("manifest", "Manifest",
                f"<p>The manifest is for the next step in the loop: pick a strategy under a token budget and pass only those files to the model. Component and token names are listed so {repair} and {eval_} can check against the same source.</p>",
                _pre(manifest)),
            _section("chain", "Where it sits",
                _pre("Figma / local spec\n→ ds-context\n→ model\n→ ui-repair\n→ ds-eval\n→ prompt-regress"),
                f"<p>ds-context prepares the context. {eval_} measures whether it helped. {regress} shows whether a new prompt broke cases that used to pass.</p>"),
            _section("limits", "Limit",
                "<p>The tool does not open Storybook or Figma. It does not choose a slice of the pack for one screen: the strategies are global. The token estimate is for comparing packs, not for an API bill.</p>"),
        ])
    return {"lead": lead, "groups": _groups(groups), "body": body}


def _context_stdout(mod, packs: dict) -> str:
    lines = [
        "source  ds-context/fixtures/acme",
        "out     ds-context/fixtures/acme/dist",
        "pack    files",
    ]
    for name, text in packs["full"].items():
        if name == "manifest.json":
            continue
        lines.append(f"        {name:<18} ~{mod.estimate_tokens(text):>4} tokens")
    lines.append("strategies (estimate, ~4 chars/token, manifest excluded)")
    for strategy in ("full", "compact", "components"):
        total = sum(mod.estimate_tokens(text) for name, text in packs[strategy].items() if name != "manifest.json")
        lines.append(f"        {strategy:<12} ~{total:>4}")
    return "\n".join(lines)


def _repair(ru: bool, lang: str) -> dict:
    mod = _load("ui_repair_docs", "ui-repair/ui_repair.py")
    fixture = ROOT / "ui-repair/fixtures"
    before = _text("ui-repair/fixtures/Settings.jsx")
    token_map = mod.tokens(fixture)
    after = mod.repair(before, token_map)
    found = mod.issues(before)
    before_checks = mod.results(before)
    after_checks = dict(mod.results(after))
    eval_ = _link("ds-eval", lang)
    context = _link("ds-context", lang)
    rows = []
    for name, passed in before_checks:
        label = CHECK_RU[name] if ru else name
        mark = ("да" if ru else "pass") if passed else ("нет" if ru else "fail")
        later = "да" if ru else "pass"
        if not after_checks[name]:
            later = "нет" if ru else "fail"
        rows.append(f"<tr><td>{html.escape(label)}</td><td>{mark}</td><td>{later}</td></tr>")
    before_score = round(100 * sum(ok for _, ok in before_checks) / len(before_checks))
    after_score = round(100 * sum(after_checks.values()) / len(after_checks))
    scan = f"{len(found)} issues\n" + "\n".join(f"  {item}" for item in found)
    if ru:
        lead = f"Линтер говорит, что в коде сырой button и цвет #8B5CF6. ui-repair применяет правила системы и оставляет патч. На фикстуре локальная рубрика из 10 проверок вырастает с {before_score} до {after_score}. Это не вызов модели и не прогон ds-eval."
        groups = [
            ("Основное", [("Зачем", "#why"), ("Правила", "#rules"), ("Запуск", "#run")]),
            ("Фикстура", [("До", "#before"), ("После", "#after"), ("Проверки", "#score")]),
            ("Контур", [("Куда встаёт", "#chain"), ("Предел", "#limits")]),
            ("Ссылки", [("GitHub", GITHUB + "ui-repair")]),
        ]
        body = "".join([
            _section("why", "Зачем",
                "<p>Найти нарушение мало. Команде нужен патч: сырой <code>&lt;button&gt;</code> становится Button, захардкоженный <code>#8B5CF6</code> становится токеном, самодельный modal становится Dialog. ui-repair делает эту замену правилами и показывает, какая проверка перевернулась.</p>",
                "<p>Живой агент должен отдавать патч того же вида. В этом MVP правила уже детерминированные, чтобы пример можно было повторить без ключа.</p>"),
            _section("rules", "Правила",
                "<p>Каждое правило смотрит на текст фикстуры и на <code>tokens.css</code> рядом. На Acme <code>--color-accent</code> равен <code>#8B5CF6</code>, <code>--space-3</code> равен <code>12px</code>.</p>",
                "<table><thead><tr><th>Находит</th><th>Пишет</th></tr></thead><tbody>"
                "<tr><td>hex, если значение совпало с токеном</td><td><code>var(--color-accent)</code></td></tr>"
                "<tr><td><code>padding: 13</code></td><td><code>var(--space-3)</code></td></tr>"
                "<tr><td><code>&lt;div className=\"modal\"&gt;</code></td><td><code>&lt;Dialog&gt;</code></td></tr>"
                "<tr><td>сырой <code>&lt;button&gt;</code></td><td><code>&lt;Button&gt;</code> и импорт из <code>@ds</code></td></tr>"
                "<tr><td>кнопка, внутри которой только ×</td><td><code>aria-label=\"Close\"</code></td></tr>"
                "</tbody></table>",
                "<p>Импорт добавляется одной строкой, если в файле ещё нет <code>from \"@ds\"</code>: <code>import { Button, Dialog } from \"@ds\";</code></p>"),
            _section("run", "Запуск",
                _pre("python3 ui-repair/ui_repair.py scan ui-repair/fixtures\npython3 ui-repair/ui_repair.py fix ui-repair/fixtures --out ui-repair/examples"),
                "<p><code>scan</code> печатает список и ничего не пишет. <code>fix</code> кладёт <code>Settings.jsx</code> в <code>ui-repair/examples</code> и печатает локальный счёт до и после. На фикстуре scan находит:</p>",
                _pre(scan)),
            _section("before", "До",
                "<p>Файл <code>ui-repair/fixtures/Settings.jsx</code>. Фиолетовый фон числом, отступ 13, Save сырым тегом, модалка из div и крестик без имени.</p>",
                _pre(before)),
            _section("after", "После",
                "<p>Тот же файл после <code>fix</code>. Это результат правил, не ответ модели.</p>",
                _pre(after)),
            _section("score", "Проверки",
                f"<p>Десять проверок, равный вес. До починки счёт {before_score}: пять структурных проверок уже проходили, пять проверок системы нет. После — {after_score}.</p>",
                "<table><thead><tr><th>Проверка</th><th>До</th><th>После</th></tr></thead><tbody>"
                + "".join(rows) + "</tbody></table>",
                f"<p>Это не балл {eval_} и не результат Claude. Следующий шаг контура — прогнать патч тем же harness: сборка, axe, Playwright. Здесь виден только ремонт по правилам и то, какие проверки он закрыл.</p>"),
            _section("chain", "Куда встаёт",
                f"<p>{context} говорит, какие компоненты и токены существуют. ui-repair приводит файл к этому списку. {eval_} проверяет, стал ли экран рабочим, а не только формально чистым.</p>"),
            _section("limits", "Предел",
                "<p>Правила знают фикстуру: конкретный hex, padding 13, класс modal, крестик. Чужой код с другими нарушениями они не починят. Нет диффа в стиле git, нет скриншота и нет живого агента. Счёт "
                f"{before_score} → {after_score} легко читать и легко переоценить.</p>"),
        ])
    else:
        lead = f"A linter says the file has a raw button and #8B5CF6. ui-repair applies system rules and writes a patch. On the fixture a 10-check rubric moves from {before_score} to {after_score}. That is not a model call and not a ds-eval run."
        groups = [
            ("Basics", [("Why", "#why"), ("Rules", "#rules"), ("Run", "#run")]),
            ("Fixture", [("Before", "#before"), ("After", "#after"), ("Checks", "#score")]),
            ("Loop", [("Where it sits", "#chain"), ("Limit", "#limits")]),
            ("Links", [("GitHub", GITHUB + "ui-repair")]),
        ]
        body = "".join([
            _section("why", "Why",
                "<p>Finding a violation is the small half. The team needs a patch: a raw <code>&lt;button&gt;</code> becomes Button, <code>#8B5CF6</code> becomes a token, a homemade modal becomes Dialog. ui-repair makes that replacement with rules and shows which check flipped.</p>",
                "<p>A live agent should emit a patch of the same shape. This MVP keeps the rules deterministic so the example runs without a key.</p>"),
            _section("rules", "Rules",
                "<p>Each rule reads the fixture text and the <code>tokens.css</code> beside it. On Acme, <code>--color-accent</code> is <code>#8B5CF6</code> and <code>--space-3</code> is <code>12px</code>.</p>",
                "<table><thead><tr><th>Finds</th><th>Writes</th></tr></thead><tbody>"
                "<tr><td>a hex that matches a token value</td><td><code>var(--color-accent)</code></td></tr>"
                "<tr><td><code>padding: 13</code></td><td><code>var(--space-3)</code></td></tr>"
                "<tr><td><code>&lt;div className=\"modal\"&gt;</code></td><td><code>&lt;Dialog&gt;</code></td></tr>"
                "<tr><td>a raw <code>&lt;button&gt;</code></td><td><code>&lt;Button&gt;</code> and an import from <code>@ds</code></td></tr>"
                "<tr><td>a button whose only child is ×</td><td><code>aria-label=\"Close\"</code></td></tr>"
                "</tbody></table>",
                "<p>The import is one line, added when the file has no <code>from \"@ds\"</code> yet: <code>import { Button, Dialog } from \"@ds\";</code></p>"),
            _section("run", "Run",
                _pre("python3 ui-repair/ui_repair.py scan ui-repair/fixtures\npython3 ui-repair/ui_repair.py fix ui-repair/fixtures --out ui-repair/examples"),
                "<p><code>scan</code> prints the list and writes nothing. <code>fix</code> puts <code>Settings.jsx</code> in <code>ui-repair/examples</code> and prints the local score before and after. On the fixture, scan reports:</p>",
                _pre(scan)),
            _section("before", "Before",
                "<p><code>ui-repair/fixtures/Settings.jsx</code>. A purple background as a number, padding 13, Save as a raw button, a div modal, and a close mark with no name.</p>",
                _pre(before)),
            _section("after", "After",
                "<p>The same file after <code>fix</code>. This is the rule result, not a model reply.</p>",
                _pre(after)),
            _section("score", "Checks",
                f"<p>Ten checks, equal weight. Before the repair the score is {before_score}: five structural checks already passed, five system checks did not. After, it is {after_score}.</p>",
                "<table><thead><tr><th>Check</th><th>Before</th><th>After</th></tr></thead><tbody>"
                + "".join(rows) + "</tbody></table>",
                f"<p>This is not a {eval_} score and not a Claude result. The next step is to run the patch through that harness: build, axe, Playwright. What you see here is a rule repair and which checks it closed.</p>"),
            _section("chain", "Where it sits",
                f"<p>{context} says which components and tokens exist. ui-repair moves a file onto that list. {eval_} checks whether the screen works, not only whether the tags look clean.</p>"),
            _section("limits", "Limit",
                f"<p>The rules know this fixture: one hex, padding 13, a modal class, a close mark. They will not repair an arbitrary codebase. There is no git-style diff, no screenshot, and no live agent. A jump from {before_score} to {after_score} is easy to read and easy to over-read.</p>"),
        ])
    return {"lead": lead, "groups": _groups(groups), "body": body}


def _regress(ru: bool, lang: str) -> dict:
    mod = _load("prompt_regress_docs", "prompt-regress/prompt_regress.py")
    left = ROOT / "prompt-regress/prompts/v12.md"
    right = ROOT / "prompt-regress/prompts/v13.md"
    before = {case["id"]: case for case in mod.load_run(left)}
    after = {case["id"]: case for case in mod.load_run(right)}
    rows = []
    counts = {"improved": 0, "regressed": 0, "unchanged": 0}
    for case_id in before:
        kind = mod.classify(before[case_id], after[case_id])
        counts[kind] += 1
        old, new = before[case_id], after[case_id]
        verdict = VERDICT_RU[kind] if ru else kind
        passed = ("нет → да" if new["pass"] else "да → нет") if ru else ("fail → pass" if new["pass"] else "pass → fail")
        if old["pass"] == new["pass"]:
            passed = ("да" if new["pass"] else "нет") if ru else ("pass" if new["pass"] else "fail")
        rows.append(
            "<tr>"
            f"<td><code>{html.escape(case_id)}</code></td>"
            f"<td>{passed}</td>"
            f"<td>{old['ds']} → {new['ds']}</td>"
            f"<td>{verdict}</td>"
            f"<td>{html.escape(new['note'])}</td>"
            "</tr>"
        )
    tokens_before = sum(case["tokens"] for case in before.values())
    tokens_after = sum(case["tokens"] for case in after.values())
    sample = {
        "v12": before["select-001"],
        "v13": after["select-001"],
    }
    eval_ = _link("ds-eval", lang)
    context = _link("ds-context", lang)
    summary = (
        f"v12 → v13\n"
        f"{counts['improved']} improved / {counts['regressed']} regressed / {counts['unchanged']} unchanged\n"
        f"tokens  {tokens_before} → {tokens_after}"
    )
    if ru:
        lead = f"Промпт v13 может починить селект и сломать подтверждение удаления. prompt-regress сравнивает два записанных прогона одного набора: какие кейсы выросли, какие упали, и что сказано в заметке проверки. Опубликованный дифф — {len(before)} фикстурных кейсов, не живой вызов модели."
        groups = [
            ("Основное", [("Зачем", "#why"), ("Промпты", "#prompts"), ("Запуск", "#run")]),
            ("Отчёт", [("Дифф", "#diff"), ("Все кейсы", "#cases"), ("Запись", "#record")]),
            ("Контур", [("Куда встаёт", "#chain"), ("Предел", "#limits")]),
            ("Ссылки", [("GitHub", GITHUB + "prompt-regress")]),
        ]
        body = "".join([
            _section("why", "Зачем",
                "<p>Новая версия системного промпта редко бывает целиком лучше. Она поднимает одни UI-задачи и роняет другие: модель начинает брать Select и одновременно забывает danger-вариант у удаления. Смотреть на средний балл здесь вредно.</p>",
                f"<p>prompt-regress версионирует промпт и показывает дифф по кейсам. Данные для диффа — записанный прогон, того же рода, что фикстуры в {eval_}.</p>"),
            _section("prompts", "Промпты",
                "<p><code>prompts/v12.md</code> просит скорость и разрешает нативный контрол, если компонент системы неясен.</p>",
                _pre(_text("prompt-regress/prompts/v12.md")),
                "<p><code>prompts/v13.md</code> называет компоненты и запрещает сырой button, hex и самодельную модалку. Если кейс спорит с системой, промпт велит следовать системе.</p>",
                _pre(_text("prompt-regress/prompts/v13.md"))),
            _section("run", "Запуск",
                _pre("python3 prompt-regress/prompt_regress.py diff \\\n  prompt-regress/prompts/v12.md \\\n  prompt-regress/prompts/v13.md"),
                "<p>Имя файла промпта находит парный JSON: <code>prompts/v12.md</code> читает <code>runs/v12.json</code>. В кейсе лежат pass, балл DS, токены и заметка. Скриншота в этой фикстуре нет: поле можно добавить, когда прогон его сохранит.</p>"),
            _section("diff", "Дифф",
                "<p>Кейс improved или regressed, если pass/fail перевернулся или балл DS сдвинулся на 10 пунктов и больше. Иначе он unchanged.</p>",
                "<table><thead><tr><th>Условие</th><th>Метка</th></tr></thead><tbody>"
                "<tr><td>pass перевернулся в fail, или DS упал на 10+</td><td>regressed</td></tr>"
                "<tr><td>fail перевернулся в pass, или DS вырос на 10+</td><td>improved</td></tr>"
                "<tr><td>pass тот же и DS сдвинулся меньше чем на 10</td><td>unchanged</td></tr>"
                "</tbody></table>",
                f"<p>На {len(before)} записанных кейсах команда печатает:</p>",
                _pre(summary),
                "<p>Колонка токенов — сумма из записанного прогона, не счёт из API.</p>"),
            _section("cases", "Все кейсы",
                "<p>Заметки скопированы из <code>runs/v13.json</code>. Восемь кейсов не сдвинулись достаточно, чтобы попасть в дифф. Средний балл это спрятал бы.</p>",
                "<table><thead><tr><th>Кейс</th><th>Pass</th><th>DS</th><th>Итог</th><th>Заметка</th></tr></thead><tbody>"
                + "".join(rows) + "</tbody></table>"),
            _section("record", "Запись",
                "<p>Один кейс в двух прогонах. Форма записи одинаковая: id, pass, ds, tokens, note.</p>",
                _pre(json.dumps(sample, indent=2))),
            _section("chain", "Куда встаёт",
                f"<p>{context} фиксирует, какой контекст видела модель. {eval_} считает кейс. prompt-regress сравнивает два таких прогона, когда меняется промпт, пакет контекста или модель. Регрессия здесь — не падение общего числа, а список кейсов, которые перевернулись.</p>"),
            _section("limits", "Предел",
                f"<p>Команда не запускает модель и не рендерит UI. Заметки и баллы лежат в JSON, который записан заранее. Пока нет скриншотов, объяснение — одна строка на кейс. {counts['improved']} / {counts['regressed']} / {counts['unchanged']} относится к этим {len(before)} фикстурам, не к набору из ста задач.</p>"),
        ])
    else:
        lead = f"Prompt v13 can fix the select and break the delete confirm. prompt-regress compares two recorded runs of one suite: which cases rose, which fell, and what the grader note says. The published diff is {len(before)} fixture cases, not a live model call."
        groups = [
            ("Basics", [("Why", "#why"), ("Prompts", "#prompts"), ("Run", "#run")]),
            ("Report", [("Diff", "#diff"), ("Every case", "#cases"), ("Record", "#record")]),
            ("Loop", [("Where it sits", "#chain"), ("Limit", "#limits")]),
            ("Links", [("GitHub", GITHUB + "prompt-regress")]),
        ]
        body = "".join([
            _section("why", "Why",
                "<p>A new system prompt is rarely better everywhere. It lifts some UI tasks and drops others: the model starts using Select and forgets the danger variant on delete. An average score hides that.</p>",
                f"<p>prompt-regress versions the prompt and shows a per-case diff. The diff reads a recorded run, the same kind of fixture {eval_} already publishes.</p>"),
            _section("prompts", "Prompts",
                "<p><code>prompts/v12.md</code> asks for speed and allows a native control when a system component is unclear.</p>",
                _pre(_text("prompt-regress/prompts/v12.md")),
                "<p><code>prompts/v13.md</code> names the components and bans a raw button, a hex, and a custom modal. When a case conflicts with the system, the prompt says to follow the system.</p>",
                _pre(_text("prompt-regress/prompts/v13.md"))),
            _section("run", "Run",
                _pre("python3 prompt-regress/prompt_regress.py diff \\\n  prompt-regress/prompts/v12.md \\\n  prompt-regress/prompts/v13.md"),
                "<p>The prompt filename finds its JSON: <code>prompts/v12.md</code> reads <code>runs/v12.json</code>. A case stores pass, DS score, tokens, and a note. This fixture has no screenshot. The field can be filled when a run saves one.</p>"),
            _section("diff", "Diff",
                "<p>A case is improved or regressed when pass/fail flips, or the DS score moves by 10 points or more. Otherwise it is unchanged.</p>",
                "<table><thead><tr><th>Condition</th><th>Label</th></tr></thead><tbody>"
                "<tr><td>pass flips to fail, or DS drops by 10+</td><td>regressed</td></tr>"
                "<tr><td>fail flips to pass, or DS rises by 10+</td><td>improved</td></tr>"
                "<tr><td>pass stays and DS moves by less than 10</td><td>unchanged</td></tr>"
                "</tbody></table>",
                f"<p>On {len(before)} recorded cases the command prints:</p>",
                _pre(summary),
                "<p>The token column is the sum stored on the recorded run, not an API bill.</p>"),
            _section("cases", "Every case",
                "<p>Notes are copied from <code>runs/v13.json</code>. Eight cases did not move enough to enter the diff. An average would hide that.</p>",
                "<table><thead><tr><th>Case</th><th>Pass</th><th>DS</th><th>Verdict</th><th>Note</th></tr></thead><tbody>"
                + "".join(rows) + "</tbody></table>"),
            _section("record", "Record",
                "<p>One case in both runs. The record shape is the same: id, pass, ds, tokens, note.</p>",
                _pre(json.dumps(sample, indent=2))),
            _section("chain", "Where it sits",
                f"<p>{context} records what the model was allowed to see. {eval_} scores a case. prompt-regress compares two of those runs when the prompt, the context pack, or the model changes. Regression here is the list of cases that flipped, not a drop in one headline number.</p>"),
            _section("limits", "Limit",
                f"<p>The command does not call a model and does not render UI. Notes and scores live in JSON that was recorded earlier. Until a run stores screenshots, the explanation is one line per case. {counts['improved']} / {counts['regressed']} / {counts['unchanged']} belongs to these {len(before)} fixtures, not to a 100-case suite.</p>"),
        ])
    return {"lead": lead, "groups": _groups(groups), "body": body}
