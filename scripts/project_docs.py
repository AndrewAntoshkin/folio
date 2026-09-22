"""Turn the original project docs into in-site pages."""
from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "content" / "projects" / "raw"

SLUGS = [
    "ds-eval",
    "ds-health",
    "figma-to-design-md",
    "spektr",
    "ds-lint",
    "design-system-ai-starter",
    "ds-coverage",
]

INTERNAL = {
    "/ds-eval/": "ds-eval",
    "/ds-health/": "ds-health",
    "/figma-to-design-md/": "figma-to-design-md",
    "/ds-lint/": "ds-lint",
    "/design-system-ai-starter/": "design-system-ai-starter",
    "/ds-coverage/": "ds-coverage",
    "/spektr/": "spektr",
    "https://antoshkin.tech/ds-eval/": "ds-eval",
    "https://antoshkin.tech/ds-health/": "ds-health",
    "https://antoshkin.tech/figma-to-design-md/": "figma-to-design-md",
    "https://antoshkin.tech/ds-lint/": "ds-lint",
    "https://antoshkin.tech/design-system-ai-starter/": "design-system-ai-starter",
    "https://antoshkin.tech/ds-coverage/": "ds-coverage",
    "https://antoshkin.tech/spektr/": "spektr",
}

GITHUB = {
    "ds-eval": "https://github.com/AndrewAntoshkin/ds-eval",
}

LABELS = {
    "Basics": "Основное",
    "Benchmark": "Бенчмарк",
    "Extend": "Дальше",
    "Examples": "Примеры",
    "Links": "Ссылки",
    "API": "API",
    "Why": "Зачем",
    "How It Works": "Как устроено",
    "Run Locally": "Запуск",
    "CLI": "CLI",
    "Dataset": "Датасет",
    "Graders": "Проверки",
    "Scoring": "Оценка",
    "Regression": "Регрессия",
    "Dashboard": "Дашборд",
    "Custom Design System": "Своя система",
    "Limitations": "Пределы",
    "Pipeline": "Цепочка",
    "What It Measures": "Что измеряет",
    "Healthy Site": "Здоровый сайт",
    "Fragmented Site": "Раздробленный сайт",
    "Reading Reports": "Как читать отчёт",
    "Score Guide": "Шкала",
    "Installation": "Установка",
    "Setup": "Настройка",
    "CLI Options": "Параметры",
    "Output Structure": "Структура файлов",
    "Foundations": "Основы",
    "Components": "Компоненты",
    "Gap Detection": "Пробелы",
    "The Problem": "Проблема",
    "Usage": "Запуск",
    "What It Detects": "Что находит",
    "Token Sources": "Откуда токены",
    "Output Example": "Пример отчёта",
    "Inline Ignore": "Игнор в коде",
    "CI Integration": "CI",
    "Quick Start": "Быстрый старт",
    "Who This Is For": "Кому это",
    "Commands": "Команды",
    "Supported Inputs": "Что принимает",
    "Before / After": "До и после",
    "CSS Tokens": "CSS-токены",
    "JSON Tokens": "JSON-токены",
    "Healthy Codebase": "Здоровый код",
    "Low Adoption": "Слабое внедрение",
    "Inventory File": "Инвентарь",
    "GitHub": "GitHub",
    "npm": "npm",
    "What You See": "Что видно",
    "Pin Inspections": "Закрепить замер",
    "Development Only": "Только в разработке",
    "Props": "Свойства",
    "Keyboard Shortcuts": "Клавиши",
    "Getting Started": "С чего начать",
    "Why This Exists": "Зачем это есть",
    "Healthy Site Example": "Пример здорового сайта",
    "Fragmented Site Example": "Пример раздробленного сайта",
    "Foundations Example": "Пример основ",
    "Components Example": "Пример компонента",
    "CLI Commands": "Команды",
    "CSS Token Example": "Пример CSS-токенов",
    "JSON Token Example": "Пример JSON-токенов",
    "Axis": "Ось",
    "Weight": "Вес",
    "Source": "Источник",
    "Category": "Категория",
    "Count": "Сколько",
    "What it tests": "Что проверяет",
    "Model": "Модель",
    "Overall": "Общий",
    "File": "Файл",
    "Contents": "Содержимое",
    "Flag": "Флаг",
    "Default": "По умолчанию",
    "Description": "Описание",
    "Score": "Оценка",
    "Meaning": "Что значит",
    "Command": "Команда",
    "What it does": "Что делает",
    "Code": "Код",
    "Field": "Поле",
    "Type": "Тип",
    "Section": "Раздел",
    "What it tells you": "Что показывает",
    "Range": "Диапазон",
    "Label": "Метка",
    "Purpose": "Назначение",
    "Format": "Формат",
    "Example": "Пример",
    "Option": "Параметр",
    "Signal": "Сигнал",
    "Value": "Значение",
    "Name": "Имя",
    "Status": "Статус",
    "Request": "Запрос",
    "Response": "Ответ",
    "1. Get a Figma token": "1. Возьми токен Figma",
    "2. Get the file key": "2. Возьми ключ файла",
    "CSS custom properties": "CSS-переменные",
    "JSON tokens (DTCG compatible)": "JSON-токены (формат DTCG)",
    "Markdown tables": "Markdown-таблицы",
    "Before": "До",
    "After": "После",
    "Array format": "Формат массива",
    "Object format": "Формат объекта",
}


def label(text: str, lang: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if lang == "ru":
        return LABELS.get(text, text)
    return text


def _matching_div(html: str, start: int) -> tuple[str, int]:
    depth = 0
    i = start
    while i < len(html):
        if html.startswith("<div", i):
            depth += 1
            i = html.find(">", i) + 1
            continue
        if html.startswith("</div>", i):
            depth -= 1
            i += 6
            if depth == 0:
                return html[start:i], i
            continue
        i += 1
    raise ValueError("unclosed div")


def _inner(div_html: str) -> str:
    open_end = div_html.find(">") + 1
    return div_html[open_end:-6]


def _text(html: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", html)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    return text.strip()


def _inline(html: str, lang: str) -> str:
    html = re.sub(r"\sstyle=\"[^\"]*\"", "", html)
    html = re.sub(r"<code class=\"ic\">", "<code>", html)
    html = re.sub(
        r'<span class="tag tag-(det|llm)">(.*?)</span>',
        lambda m: f"@@TAG{m.group(1)}@@{m.group(2)}@@END@@",
        html,
    )
    html = re.sub(r"<span[^>]*>", "", html)
    html = re.sub(r"</span>", "", html)
    if lang == "ru":
        html = html.replace("@@TAGdet@@deterministic@@END@@", '<span class="tag tag-det">правило</span>')
        html = html.replace("@@TAGllm@@LLM judge@@END@@", '<span class="tag tag-llm">LLM</span>')
    html = html.replace("@@TAGdet@@", '<span class="tag tag-det">').replace("@@TAGllm@@", '<span class="tag tag-llm">')
    html = html.replace("@@END@@", "</span>")

    def repl_a(match: re.Match) -> str:
        href = match.group(1)
        body = _inline(match.group(2), lang)
        if href in INTERNAL or href.rstrip("/") + "/" in INTERNAL:
            key = href if href in INTERNAL else href.rstrip("/") + "/"
            slug = INTERNAL[key]
            page = f"{slug}.html" if lang == "ru" else f"{slug}-en.html"
            return f'<a href="{page}">{body}</a>'
        if href == "https://github.com/AndrewAntoshkin/ds-eval":
            href = GITHUB["ds-eval"]
        extra = ""
        if href.startswith("http"):
            extra = ' target="_blank" rel="noopener noreferrer"'
        return f'<a href="{href}"{extra}>{body}</a>'

    html = re.sub(r'<a href="([^"]+)"[^>]*>(.*?)</a>', repl_a, html, flags=re.S)
    html = re.sub(r"\s+", " ", html).strip()
    return html


def _blocks(html: str, lang: str) -> str:
    out: list[str] = []
    i = 0
    while i < len(html):
        while i < len(html) and html[i].isspace():
            i += 1
        if i >= len(html):
            break
        if html.startswith("<div", i):
            block, i = _matching_div(html, i)
            out.append(_div(block, lang))
            continue
        if html.startswith("<section", i):
            end = html.find("</section>", i)
            inner_start = html.find(">", i) + 1
            sid = re.search(r'id="([^"]+)"', html[i:inner_start])
            ident = sid.group(1) if sid else ""
            inner = _blocks(html[inner_start:end], lang)
            out.append(f'<section id="{ident}">{inner}</section>')
            i = end + len("</section>")
            continue
        if html.startswith("<h1", i) or html.startswith("<h2", i) or html.startswith("<h3", i):
            end = html.find(">", i)
            close = "</h2>" if html.startswith("<h2", i) else "</h3>" if html.startswith("<h3", i) else "</h1>"
            stop = html.find(close, i)
            body = _inline(html[end + 1:stop], lang)
            if html.startswith("<h1", i):
                i = stop + len(close)
                continue
            tag = "h2" if html.startswith("<h2", i) else "h3"
            title = label(_text(body), lang) if tag == "h2" else body
            # h3 may contain code; keep inline html but translate known plain titles
            if tag == "h3":
                plain = _text(body)
                title = label(plain, lang) if plain in LABELS else body
            out.append(f"<{tag}>{title}</{tag}>")
            i = stop + len(close)
            continue
        if html.startswith("<p", i):
            stop = html.find("</p>", i)
            inner = html[html.find(">", i) + 1:stop]
            if 'class="lead"' in html[i:html.find(">", i) + 1]:
                i = stop + 4
                continue
            out.append(f"<p>{_inline(inner, lang)}</p>")
            i = stop + 4
            continue
        if html.startswith("<ul", i) or html.startswith("<ol", i):
            stop = html.find("</ul>", i) if html.startswith("<ul", i) else html.find("</ol>", i)
            close_len = 5
            out.append(_inline(html[i:stop + close_len], lang))
            i = stop + close_len
            continue
        if html.startswith("<!--", i):
            i = html.find("-->", i) + 3
            continue
        nxt = html.find("<", i + 1)
        if nxt == -1:
            break
        i = nxt
    return "\n".join(part for part in out if part)


def _div(block: str, lang: str) -> str:
    if 'class="dash"' in block[:80]:
        return _dash(block, lang)
    if 'class="fl"' in block[:40]:
        return _features(block, lang)
    if 'class="tbl"' in block[:40]:
        return _table(block, lang)
    if 'class="code-wrap"' in block[:60]:
        pre = re.search(r"<pre>(.*?)</pre>", block, re.S)
        code = pre.group(1).strip("\n") if pre else ""
        code = re.sub(r"<span[^>]*>", "", code)
        code = re.sub(r"</span>", "", code)
        return f"<pre><code>{code}</code></pre>"
    if 'class="preview"' in block[:40] or 'class="tree"' in block[:40]:
        text = _text(block)
        return f"<pre><code>{text}</code></pre>"
    if 'class="score-bar"' in block[:50]:
        return _scores(block, lang)
    if 'class="page-nav"' in block[:50]:
        link = re.search(r'<a href="([^"]+)"[^>]*>.*?<span class="pn-title">(.*?)</span>', block, re.S)
        if not link:
            return ""
        href, title = link.group(1), _text(link.group(2))
        if href == "https://github.com/AndrewAntoshkin/ds-eval":
            href = GITHUB["ds-eval"]
        caption = "Код" if lang == "ru" else "Source"
        return f'<p><a href="{href}" target="_blank" rel="noopener noreferrer">{caption}</a></p>'
    return ""


def _features(block: str, lang: str) -> str:
    items = re.findall(
        r'<div class="f-title">(.*?)</div>\s*<p class="f-desc">(.*?)</p>',
        block,
        re.S,
    )
    lis = []
    for title, desc in items:
        lis.append(f"<li><strong>{_inline(title, lang)}</strong><span>{_inline(desc, lang)}</span></li>")
    return '<ul class="feature-list">' + "".join(lis) + "</ul>"


def _table(block: str, lang: str) -> str:
    head = re.search(r'<div class="tbl-head">(.*?)</div>', block, re.S)
    headers = re.findall(r"<span>(.*?)</span>", head.group(1) if head else "")
    rows = re.findall(r'<div class="tbl-row">(.*?)</div>', block, re.S)
    th = "".join(f"<th>{label(_text(cell), lang)}</th>" for cell in headers)
    body = []
    for row in rows:
        cells = re.findall(r"<span[^>]*>(.*?)</span>", row, re.S)
        body.append("<tr>" + "".join(f"<td>{_inline(cell, lang)}</td>" for cell in cells) + "</tr>")
    return f"<table><thead><tr>{th}</tr></thead><tbody>{''.join(body)}</tbody></table>"


def _scores(block: str, lang: str) -> str:
    items = re.findall(
        r'<div class="score-value[^"]*">(.*?)</div>\s*<div class="score-label">(.*?)</div>',
        block,
        re.S,
    )
    rows = "".join(f"<tr><td>{_inline(value, lang)}</td><td>{_inline(name, lang)}</td></tr>" for value, name in items)
    head = "Значение" if lang == "ru" else "Score"
    what = "Что значит" if lang == "ru" else "Meaning"
    return f"<table><thead><tr><th>{head}</th><th>{what}</th></tr></thead><tbody>{rows}</tbody></table>"


def _dash(block: str, lang: str) -> str:
    kicker = _text(re.search(r'class="dash-kicker">(.*?)</div>', block, re.S).group(1))
    title = _text(re.search(r'class="dash-title">(.*?)</div>', block, re.S).group(1))
    meta_raw = re.search(r'class="dash-meta">(.*?)</div>', block, re.S).group(1)
    meta = _text(re.sub(r"<br\s*/?>", " · ", meta_raw))
    models = re.findall(r'class="dash-model"><span>(.*?)</span><b>(.*?)</b>', block, re.S)
    rows = re.findall(
        r'class="dash-row"><span>(.*?)</span>.*?<em>(.*?)</em><em>(.*?)</em>',
        block,
        re.S,
    )
    foot_raw = re.search(r'class="dash-foot">(.*?)</div>', block, re.S).group(1)
    foot_parts = [
        _text(part)
        for part in re.findall(r"<(?:b|span)[^>]*>(.*?)</(?:b|span)>", foot_raw, re.S)
    ]
    foot = " · ".join(part for part in foot_parts if part) or _text(foot_raw)
    if lang == "ru":
        kicker = "Пример · фикстуры, не живой вызов API"
        title = "Ответ со системой против наивного · smoke"
        meta = "10 прогонов · $0 · офлайн"
        foot = "DS −81.3, когда ответ игнорирует дизайн-систему. 10 регрессий."
    scores = "".join(f'<p><span>{name}</span><b>{value}</b></p>' for name, value in models)
    trs = "".join(f"<tr><td>{name}</td><td>{a}</td><td>{b}</td></tr>" for name, a, b in rows)
    axis = "Ось" if lang == "ru" else "Axis"
    return (
        f'<figure class="bench"><figcaption><span>{kicker}</span><strong>{title}</strong><em>{meta}</em></figcaption>'
        f'<div class="bench-scores">{scores}</div>'
        f'<table><thead><tr><th>{axis}</th><th>{models[0][0]}</th><th>{models[1][0]}</th></tr></thead><tbody>{trs}</tbody></table>'
        f"<p>{foot}</p></figure>"
    )


def _sidebar(html: str) -> list[dict]:
    side = re.search(r'<nav class="sidebar">(.*?)</nav>', html, re.S)
    if not side:
        return []
    groups = []
    for block in re.split(r'<div class="nav-section">', side.group(1))[1:]:
        block = block.split("</div>", 1)[0]
        label_m = re.search(r'class="nav-label">(.*?)</p>', block, re.S)
        items = []
        for href, text in re.findall(r'<a href="([^"]+)"[^>]*>(.*?)</a>', block, re.S):
            text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text)).strip()
            if href == "https://github.com/AndrewAntoshkin/ds-eval":
                href = GITHUB["ds-eval"]
            items.append({"href": href, "label": text})
        if label_m and items:
            groups.append({"label": _text(label_m.group(1)), "items": items})
    return groups


def _lead(html: str) -> str:
    match = re.search(r'<p class="lead">(.*?)</p>', html, re.S)
    return _text(match.group(1)) if match else ""


def _raw(slug: str) -> str:
    path = RAW / f"{slug}.html"
    if path.exists() and "http-equiv=\"refresh\"" not in path.read_text(encoding="utf-8")[:400]:
        return path.read_text(encoding="utf-8")
    html = subprocess.check_output(["git", "show", f"HEAD:{slug}/index.html"], cwd=ROOT, text=True)
    RAW.mkdir(parents=True, exist_ok=True)
    path.write_text(html, encoding="utf-8")
    return html


def english_doc(slug: str) -> dict:
    html = _raw(slug)
    article = re.search(r"<article>(.*)</article>", html, re.S).group(1)
    return {
        "lead": _lead(article),
        "groups": _sidebar(html),
        "body": _blocks(article, "en"),
    }


LEADS_RU = {
    "ds-eval": "Может ли агент пользоваться дизайн-системой, которую он не придумал сам? ds-eval прогоняет одни и те же UI-задачи через разные модели и оценивает собранный интерфейс.",
    "ds-health": "Вставляешь URL и получаешь отчёт о здоровье дизайн-системы. Инструмент считает цвета, типографику, отступы и радиусы на живом сайте в настоящем браузере.",
    "figma-to-design-md": "Забирает переменные, стили и компоненты из Figma через REST API и собирает markdown-спеки, которые агент может читать напрямую.",
    "ds-lint": "Сканирует код и находит захардкоженные цвета, отступы, размеры шрифта и радиусы, которые должны быть токенами.",
    "design-system-ai-starter": "Превращает живую дизайн-систему в спеки, которым агент может следовать. Понимает CSS-переменные, JSON-токены и формат DTCG.",
    "ds-coverage": "Считает, какая часть кодовой базы реально использует дизайн-систему. Показывает неиспользуемые компоненты, дубли и дыры во внедрении.",
    "spektr": "Оверлей спецификации для React. Зажми Alt и наведись на элемент: отступы, типографика и цвета прямо в браузере, как Figma Inspect.",
}


def _groups(raw_groups: list[dict], lang: str) -> list[dict]:
    groups = []
    for group in raw_groups:
        items = []
        for item in group["items"]:
            text = item["label"]
            if item["href"].startswith("#"):
                text = label(text, lang)
            items.append({"href": item["href"], "label": text})
        groups.append({"label": label(group["label"], lang), "items": items})
    return groups


def _apply_ru(html: str) -> str:
    from ru_phrases import PHRASES

    pieces = re.split(r"(<pre>.*?</pre>)", html, flags=re.S)
    phrases = sorted(PHRASES.items(), key=lambda pair: len(pair[0]), reverse=True)
    out = []
    for piece in pieces:
        if piece.startswith("<pre>"):
            out.append(piece)
            continue
        for src, dst in phrases:
            piece = piece.replace(src, dst)
        out.append(piece)
    return "".join(out)


def load_doc(slug: str, lang: str) -> dict:
    if slug in {"ds-context", "ui-repair", "prompt-regress"}:
        from chain_docs import load
        return load(slug, lang)
    if slug == "spektr":
        return _spektr(lang)
    html = _raw(slug)
    article = re.search(r"<article>(.*)</article>", html, re.S).group(1)
    body = _blocks(article, lang)
    lead = _lead(article)
    if lang == "ru":
        body = _apply_ru(body)
        lead = LEADS_RU[slug]
    groups = _groups(_sidebar(html), lang)
    if slug == "ds-eval":
        body, groups = _with_published(body, groups, lang)
    return {"lead": lead, "groups": groups, "body": body}


def _with_published(body: str, groups: list[dict], lang: str) -> tuple[str, list[dict]]:
    import json

    from chain_docs import _pre

    summary = (ROOT / "ds-eval/runs/fixture-good/summary.md").read_text(encoding="utf-8")
    result = json.loads(
        (ROOT / "ds-eval/runs/fixture-good/component-select-001/result.json").read_text(encoding="utf-8")
    )
    source = (ROOT / "ds-eval/runs/fixture-good/component-select-001/source/Task.tsx").read_text(encoding="utf-8")
    skipped = {item["name"] for item in result["graders"] if item.get("details", {}).get("skipped")}
    rows = []
    for line in summary.splitlines():
        if not line.startswith("| ") or line.startswith("| ---") or line.startswith("| Case"):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) != 6:
            continue
        rows.append("".join(f"<td>{cell}</td>" for cell in cells))
    axis_rows = []
    labels = {
        "ds_compliance": "DS",
        "functional": "Функции" if lang == "ru" else "Functional",
        "visual": "Визуал" if lang == "ru" else "Visual",
        "ux": "UX",
        "accessibility": "A11y",
        "code_quality": "Код" if lang == "ru" else "Code",
        "reliability": "Сборка" if lang == "ru" else "Build",
        "overall": "Общий" if lang == "ru" else "Overall",
    }
    skip_note = "пропуск, вес ушёл на остальные оси" if lang == "ru" else "skipped, weight moved to the other axes"
    for key, value in result["scores"].items():
        note = skip_note if key in skipped else ""
        axis_rows.append(f"<tr><td>{labels.get(key, key)}</td><td>{value}</td><td>{note}</td></tr>")
    if lang == "ru":
        section = (
            '<section id="published"><h2>Опубликованный прогон</h2>'
            "<p>Таблица из 100 кейсов выше — устройство датасета, а не размер этого прогона. "
            "Опубликованный smoke лежит в <code>ds-eval/runs/fixture-good</code>: модель <code>fixture</code>, "
            "10 кейсов, общий балл 87.8, стоимость $0. Это не вызов Claude или Codex. "
            "Блок compare в разделе «Регрессия» показывает форму отчёта, не этот прогон.</p>"
            "<table><thead><tr><th>Кейс</th><th>Категория</th><th>Общий</th><th>DS</th><th>A11y</th><th>Код</th></tr></thead><tbody>"
            + "".join(f"<tr>{row}</tr>" for row in rows)
            + "</tbody></table>"
            "<p>Один кейс целиком: <code>component-select-001</code>. Задача — селект страны с подписью, подсказкой и ошибкой. "
            "Ответ фикстуры — <code>source/Task.tsx</code>.</p>"
            + _pre(source)
            + "<p>Оси этого кейса. Визуальный и UX-судьи выключены: ноль в записи означает пропуск, не оценку экрана. "
            "Их вес перераспределяется на остальные оси, поэтому общий балл не равен нулю.</p>"
            "<table><thead><tr><th>Ось</th><th>Балл</th><th></th></tr></thead><tbody>"
            + "".join(axis_rows)
            + "</tbody></table></section>"
        )
        nav = "Опубликованный прогон"
    else:
        section = (
            '<section id="published"><h2>Published run</h2>'
            "<p>The 100-case table above is the shape of the dataset, not the size of this run. "
            "The published smoke lives in <code>ds-eval/runs/fixture-good</code>: model <code>fixture</code>, "
            "10 cases, overall 87.8, cost $0. It is not a Claude or Codex call. "
            "The compare block under Regression shows the report shape, not this run.</p>"
            "<table><thead><tr><th>Case</th><th>Category</th><th>Overall</th><th>DS</th><th>A11y</th><th>Code</th></tr></thead><tbody>"
            + "".join(f"<tr>{row}</tr>" for row in rows)
            + "</tbody></table>"
            "<p>One case in full: <code>component-select-001</code>. The task is a country select with a label, helper, and error. "
            "The fixture answer is <code>source/Task.tsx</code>.</p>"
            + _pre(source)
            + "<p>Axes for this case. The visual and UX judges are off: a zero in the record means skipped, not a judgment of the screen. "
            "Their weight moves onto the other axes, which is why the overall is not zero.</p>"
            "<table><thead><tr><th>Axis</th><th>Score</th><th></th></tr></thead><tbody>"
            + "".join(axis_rows)
            + "</tbody></table></section>"
        )
        nav = "Published run"
    body = body.replace('<section id="pipeline">', section + '<section id="pipeline">', 1)
    for group in groups:
        if any(item["href"] == "#dataset" for item in group["items"]):
            group["items"].insert(1, {"href": "#published", "label": nav})
            break
    return body, groups


def _spektr(lang: str) -> dict:
    ru = lang == "ru"
    groups = [
        {
            "label": "Основное" if ru else "Basics",
            "items": [
                {"href": "#see", "label": "Что видно" if ru else "What You See"},
                {"href": "#install", "label": "Установка" if ru else "Installation"},
                {"href": "#start", "label": "Быстрый старт" if ru else "Quick Start"},
                {"href": "#dev", "label": "Только в разработке" if ru else "Development Only"},
            ],
        },
        {
            "label": "API",
            "items": [
                {"href": "#props", "label": "Свойства" if ru else "Props"},
                {"href": "#keys", "label": "Клавиши" if ru else "Keyboard Shortcuts"},
            ],
        },
        {
            "label": "Примеры" if ru else "Examples",
            "items": [{"href": "#examples", "label": "Примеры" if ru else "Examples"}],
        },
        {
            "label": "Ссылки" if ru else "Links",
            "items": [
                {"href": "https://github.com/AndrewAntoshkin/spektr", "label": "GitHub"},
                {"href": "https://www.npmjs.com/package/@andrewaitken/spektr", "label": "npm"},
            ],
        },
    ]
    if ru:
        body = """
<section id="see"><h2>Что видно</h2>
<p>Пока идёт замер, оверлей показывает четыре слоя.</p>
<ul class="feature-list">
<li><strong>Рамка</strong><span>Синий контур и размеры: ширина × высота.</span></li>
<li><strong>Padding</strong><span>Зелёный слой внутреннего отступа.</span></li>
<li><strong>Margin</strong><span>Оранжевый слой внешнего отступа.</span></li>
<li><strong>Спека</strong><span>Типографика, цвета, радиус и параметры раскладки.</span></li>
</ul>
<p>Alt+клик закрепляет замер. Повторный Alt+клик снимает его.</p>
</section>
<section id="install"><h2>Установка</h2>
<p>Пакет ставится через менеджер пакетов.</p>
<pre><code>npm install @andrewaitken/spektr</code></pre>
</section>
<section id="start"><h2>Быстрый старт</h2>
<p>Импортируй обёртку и положи в неё любое дерево React.</p>
<pre><code>import { Spektr } from '@andrewaitken/spektr';

function App() {
  return (
    &lt;Spektr&gt;
      &lt;YourApp /&gt;
    &lt;/Spektr&gt;
  );
}</code></pre>
</section>
<section id="dev"><h2>Только в разработке</h2>
<p>Оверлей не нужен в продакшене. Включай его только в dev-сборке.</p>
<pre><code>&lt;Spektr enabled={process.env.NODE_ENV === 'development'}&gt;
  &lt;YourApp /&gt;
&lt;/Spektr&gt;</code></pre>
</section>
<section id="props"><h2>Свойства</h2>
<ul class="feature-list">
<li><strong>children</strong><span>Дерево, которое можно инспектировать.</span></li>
<li><strong>enabled</strong><span>Включает и выключает оверлей.</span></li>
<li><strong>Spektr</strong><span>Основная обёртка. Ловит мышь и рисует оверлей через React Portal.</span></li>
<li><strong>Overlay</strong><span>Нижний слой: padding, margin, подпись размеров и тултип спецификации.</span></li>
<li><strong>computeSpecs(el)</strong><span>Снимает визуальные свойства DOM-элемента: размер, шрифт, цвет, радиус, тень, gap.</span></li>
</ul>
<pre><code>import { computeSpecs } from '@andrewaitken/spektr';

const el = document.querySelector('.my-button');
const specs = computeSpecs(el);
console.log(specs.fontSize);</code></pre>
</section>
<section id="keys"><h2>Клавиши</h2>
<ul class="feature-list">
<li><strong>Alt + hover</strong><span>Инспектировать элемент под курсором.</span></li>
<li><strong>Alt + click</strong><span>Закрепить или снять текущий замер.</span></li>
<li><strong>Отпустить Alt</strong><span>Скрыть оверлей, если замер не закреплён.</span></li>
</ul>
</section>
<section id="examples"><h2>Примеры</h2>
<p>Каждый пример на странице инструмента интерактивный: его можно нажать, переключить и набрать текст, удерживая Alt.</p>
<ul class="feature-list">
<li><strong>Кнопки</strong><span>Варианты с разным padding, фоном, обводкой и радиусом.</span></li>
<li><strong>Типографика</strong><span>Кегль, насыщенность, line-height и трекинг на шкале.</span></li>
<li><strong>Карточка</strong><span>Аватар, текст и кнопки. Вложенные padding, gap и радиус.</span></li>
<li><strong>Форма</strong><span>Поле, чекбокс, подпись. Padding, обводка и кегль.</span></li>
<li><strong>Бейджи</strong><span>Плотный padding, радиус-пилюля и смысловые цвета.</span></li>
<li><strong>Навигация</strong><span>Флекс с логотипом, ссылками и CTA. Gap и выравнивание.</span></li>
<li><strong>Список</strong><span>Повторяющийся ритм, интерактивный переключатель, padding и gap.</span></li>
</ul>
<p><a href="https://github.com/AndrewAntoshkin/spektr" target="_blank" rel="noopener noreferrer">GitHub</a> · <a href="https://www.npmjs.com/package/@andrewaitken/spektr" target="_blank" rel="noopener noreferrer">npm</a></p>
</section>
"""
    else:
        body = """
<section id="see"><h2>What You See</h2>
<p>While you inspect, the overlay draws four layers.</p>
<ul class="feature-list">
<li><strong>Highlight</strong><span>Blue outline with dimensions, width × height.</span></li>
<li><strong>Padding</strong><span>Green overlay for inner spacing.</span></li>
<li><strong>Margin</strong><span>Orange overlay for outer spacing.</span></li>
<li><strong>Spec tooltip</strong><span>Typography, colors, border-radius, and layout.</span></li>
</ul>
<p>Alt+click pins the inspection. Alt+click again unpins it.</p>
</section>
<section id="install"><h2>Installation</h2>
<p>Install via your package manager.</p>
<pre><code>npm install @andrewaitken/spektr</code></pre>
</section>
<section id="start"><h2>Quick Start</h2>
<p>Import the wrapper and put it around any part of the React tree.</p>
<pre><code>import { Spektr } from '@andrewaitken/spektr';

function App() {
  return (
    &lt;Spektr&gt;
      &lt;YourApp /&gt;
    &lt;/Spektr&gt;
  );
}</code></pre>
</section>
<section id="dev"><h2>Development Only</h2>
<p>The overlay does not belong in production. Turn it on only in the dev build.</p>
<pre><code>&lt;Spektr enabled={process.env.NODE_ENV === 'development'}&gt;
  &lt;YourApp /&gt;
&lt;/Spektr&gt;</code></pre>
</section>
<section id="props"><h2>Props</h2>
<ul class="feature-list">
<li><strong>children</strong><span>The tree to make inspectable.</span></li>
<li><strong>enabled</strong><span>Turns the overlay on or off.</span></li>
<li><strong>Spektr</strong><span>The wrapper. It captures the pointer and renders the overlay through a React portal.</span></li>
<li><strong>Overlay</strong><span>The low-level layer: padding, margin, the dimension label, and the spec tooltip.</span></li>
<li><strong>computeSpecs(el)</strong><span>Reads visual properties from a DOM element: size, type, color, radius, shadow, and gap.</span></li>
</ul>
<pre><code>import { computeSpecs } from '@andrewaitken/spektr';

const el = document.querySelector('.my-button');
const specs = computeSpecs(el);
console.log(specs.fontSize);</code></pre>
</section>
<section id="keys"><h2>Keyboard Shortcuts</h2>
<ul class="feature-list">
<li><strong>Alt + hover</strong><span>Inspect the element under the cursor.</span></li>
<li><strong>Alt + click</strong><span>Pin or unpin the current inspection.</span></li>
<li><strong>Release Alt</strong><span>Hide the overlay unless it is pinned.</span></li>
</ul>
</section>
<section id="examples"><h2>Examples</h2>
<p>Each example on the tool page is interactive: click, toggle, and type while holding Alt.</p>
<ul class="feature-list">
<li><strong>Buttons</strong><span>Variants with different padding, background, border, and radius.</span></li>
<li><strong>Typography</strong><span>Font size, weight, line-height, and letter-spacing across a scale.</span></li>
<li><strong>Card</strong><span>Avatar, text, and actions. Nested padding, gap, and radius.</span></li>
<li><strong>Form</strong><span>Fields and a checkbox. Padding, border, type size, and label spacing.</span></li>
<li><strong>Badges</strong><span>Tight padding, a pill radius, and semantic colors.</span></li>
<li><strong>Navigation</strong><span>A flex row with a logo, links, and a CTA. Gap and alignment.</span></li>
<li><strong>List</strong><span>A repeating rhythm with a toggle. Padding, gap, and border.</span></li>
</ul>
<p><a href="https://github.com/AndrewAntoshkin/spektr" target="_blank" rel="noopener noreferrer">GitHub</a> · <a href="https://www.npmjs.com/package/@andrewaitken/spektr" target="_blank" rel="noopener noreferrer">npm</a></p>
</section>
"""
    return {"lead": LEADS_RU["spektr"] if ru else "Spektr is a design spec overlay for React. Hold Alt and hover any element to inspect spacing, typography, and colors — like Figma Inspect, but in the browser.", "groups": groups, "body": body}
