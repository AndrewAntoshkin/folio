#!/usr/bin/env python3
"""Whole-site preview in the Refined (Framer) layout, generated into /newww."""
from __future__ import annotations

import html
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "newww"
ARTICLES = ROOT / "content" / "articles"
sys.path.insert(0, str(ROOT / "scripts"))

from project_docs import load_doc  # noqa: E402
from project_pages import PROJECTS  # noqa: E402

ORDER = ["apres-prompt", "ai-changes-processes", "halo-working-memory", "cursor-figma", "design-md", "dev-for-designers"]
TG = "https://t.me/andrewaitken"

HEAD = """<!DOCTYPE html>
<html lang="{lang}" class="nojs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="website">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><rect width=%2232%22 height=%2232%22 rx=%228%22 fill=%22%23111312%22/><text x=%2216%22 y=%2222%22 text-anchor=%22middle%22 font-family=%22system-ui,sans-serif%22 font-size=%2218%22 font-weight=%22600%22 fill=%22%234cf2a7%22>A</text></svg>">
  <script>document.documentElement.classList.remove('nojs');try{{if(sessionStorage.getItem('dock-seen'))document.documentElement.classList.add('dock-seen');else sessionStorage.setItem('dock-seen','1')}}catch(e){{}}</script>
  <link rel="stylesheet" href="/style.css?v=38">
</head>
<body>
"""

def svg(path: str, size: int = 22, extra: str = "") -> str:
    return f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" {extra}>{path}</svg>'

ICONS = {
    "home": svg('<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"/>'),
    "work": svg('<path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z"/><path d="M4 13h16"/>'),
    "pen": svg('<path d="M14 5.5 18.5 10 9 19.5H4.5V15L14 5.5Z"/><path d="m12 7.5 4.5 4.5"/>'),
    "user": svg('<circle cx="12" cy="8" r="3.25"/><path d="M5.5 19.5c1.2-3 3.4-4.5 6.5-4.5s5.3 1.5 6.5 4.5"/>'),
    "mail": svg('<path d="M4 7.5h16v10H4v-10Z"/><path d="m5 8 7 6 7-6"/>'),
}
ARROW = svg('<path d="M7 17 17 7M8 7h9v9"/>', 20)
PLUS = svg('<path d="M12 5v14M5 12h14"/>', 20)
SVC_ICONS = [
    svg('<circle cx="12" cy="12" r="8"/><path d="M12 4v8l6 4M4.5 9 12 12 4.5 15"/>', 20),
    svg('<path d="M12 3 4 8v8l8 5 8-5V8l-8-5Z"/><path d="m4 8 8 5 8-5M12 13v8"/>', 20),
    svg('<rect x="3.5" y="5" width="17" height="11" rx="1.5"/><path d="M9 20h6M12 16v4"/>', 20),
    svg('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13"/>', 20),
]


def name_for(stem: str, lang: str) -> str:
    if lang == "ru":
        return "/" if stem == "home" else f"/{stem}"
    return "/en" if stem == "home" else f"/en/{stem}"


def legacy_file_for(stem: str, lang: str) -> str:
    if stem == "home":
        return "index.html" if lang == "ru" else "en.html"
    return f"{stem}.html" if lang == "ru" else f"{stem}-en.html"


def plain(html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html)
    text = text.replace("&nbsp;", " ").replace("&#8209;", "-")
    return re.sub(r"\s+", " ", text).strip()


def minutes(html: str) -> int:
    return max(1, round(len(plain(html).split()) / 180))


MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
MONTHS_RU_N = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def fmt_date(raw: str, lang: str) -> str:
    parts = raw.split("-")
    y, m = int(parts[0]), int(parts[1])
    if len(parts) == 3:
        d = int(parts[2])
        return f"{d} {MONTHS_RU[m - 1]} {y}" if lang == "ru" else f"{MONTHS_EN[m - 1]} {d}, {y}"
    return f"{MONTHS_RU_N[m - 1]} {y}" if lang == "ru" else f"{MONTHS_EN[m - 1]} {y}"


def article(stem: str, lang: str) -> dict:
    suffix = "" if lang == "ru" else ".en"
    meta = json.loads((ARTICLES / f"{stem}{suffix}.json").read_text())
    body = (ARTICLES / f"{stem}{suffix}.body.html").read_text()
    meta["body"] = body
    meta["min"] = minutes(body)
    meta["stem"] = stem
    meta["tag_list"] = re.findall(r'class="tag">(.*?)</span>', meta["tags"])
    return meta


def cover(key: str, label: str, badge: str = "", extra: str = "") -> str:
    """Generated abstract cover (newww/img/gen/<key>.jpg, made by scripts/art.html)."""
    tag = f'<span class="tag">{badge}</span>' if badge else ""
    return (
        f'<div class="pcover {extra}"><div class="bg" style="background-image:url(/img/gen/{key}.jpg)"></div>'
        f'<span class="plogo">{label}</span>{tag}</div>'
    )


def chrome(lang: str, active: str, stem: str) -> str:
    ru = lang == "ru"
    items = [
        ("home", "Главная" if ru else "Home", "home"),
        ("projects", "Проекты" if ru else "Projects", "work"),
        ("writing", "Статьи" if ru else "Writing", "pen"),
        ("approach", "Подход" if ru else "Approach", "user"),
        ("collab", "Связь" if ru else "Contact", "mail"),
    ]
    links = "".join(
        f'<a href="{name_for(k, lang)}" aria-label="{label}"{" aria-current=\"page\"" if k == active else ""}>{ICONS[icon]}</a>'
        for k, label, icon in items
    )
    other = "en" if ru else "ru"
    return (
        f'\n<div class="dock"><nav aria-label="{"Навигация" if ru else "Navigation"}"><i aria-hidden="true"></i>{links}</nav>'
        f'<a class="lang" href="{name_for(stem, other)}" aria-label="{"English" if ru else "Русский"}">{"En" if ru else "Ru"}</a></div>\n'
        f'<a class="float" href="{TG}" target="_blank" rel="noopener">{"Написать" if ru else "Say hello"}'
        f'{svg("<path d=\"M7 17 17 7M8 7h9v9\"/>", 16, "aria-hidden=\"true\"")}</a>\n'
    )


def sec_head(title: str, count: int | None = None, link: tuple[str, str] | None = None) -> str:
    c = f"<sup>({count})</sup>" if count is not None else ""
    a = f'<a href="{link[0]}">{link[1]}</a>' if link else ""
    return f'<div class="sec-head"><h2>{title}</h2>{c}<span class="rule"></span>{a}</div>'


def reveal(inner_tag: str, delay: float = 0) -> str:
    return f'{inner_tag[:-1]} data-r style="--d:{delay}s">' if delay else f'{inner_tag[:-1]} data-r>'


def cta_and_footer(lang: str, cta: bool = True) -> str:
    ru = lang == "ru"
    if ru:
        title, text = "Есть задача?", "Напишите мне. Вместе разберёмся, с чего начать."
        fields = ("Имя", "Почта", "Пару слов о задаче", "Написать", "Сотрудничество")
        lead = "Хотите обсудить проект?<br>Расскажите о задаче и о том, чем я могу помочь."
    else:
        title, text = "Got a task?", "Write to me. We’ll figure out where to start together."
        fields = ("Name", "Email", "A few words about the task", "Write", "Collaboration")
        lead = "Want to discuss a project?<br>Would love to hear about your company and how I can help."

    cta_html = ""
    if cta:
        cta_html = f'''
  <section class="cta" data-r>
    <div class="cta-grid">
      <div class="cta-card">
        <div class="shader" aria-hidden="true"></div>
        <div class="mid"><h2>{title}</h2></div>
        <div class="bot"><p>{text}</p></div>
      </div>
      <form class="cta-form" data-subject="{fields[4]}">
        <input name="name" required placeholder="{fields[0]}" aria-label="{fields[0]}" autocomplete="name">
        <input name="email" type="email" required placeholder="{fields[1]}" aria-label="{fields[1]}" autocomplete="email">
        <textarea name="question" required placeholder="{fields[2]}" aria-label="{fields[2]}"></textarea>
        <button type="submit">{fields[3]}</button>
      </form>
    </div>
    </section>'''
    return cta_html + f'''
  <footer class="foot">
    <div class="foot-in">
      <p class="foot-mark">antoshkin.tech</p>
      <div class="foot-copy">
        <p class="foot-lead">{lead}</p>
        <a class="foot-mail" href="mailto:andrew.antoshkin@gmail.com">andrew.antoshkin@gmail.com</a>
      </div>
    </div>
  </footer>
  <script src="/motion.js?v=4"></script>
</body></html>
'''


def shell(lang: str, title: str, active: str, stem: str, inner: str, cta: bool = True, desc: str = "") -> str:
    default_desc = (
        "Ведущий дизайнер дизайн-системы в Яндексе (HR Tech). Проектирую продукты, дизайн-системы и инструменты для работы с AI-агентами."
        if lang == "ru"
        else "Lead Design Systems Designer at Yandex (HR Tech). Designing products, design systems, and developer tools for AI coding agents."
    )
    clean_desc = html.escape(plain(desc or default_desc), quote=True)
    clean_title = html.escape(plain(title), quote=True)
    return HEAD.format(lang=lang, title=clean_title, desc=clean_desc) + chrome(lang, active, stem) + inner + cta_and_footer(lang, cta)


# ── Shared blocks ───────────────────────────────────────────────────────────

FEATURED = ["pulse-ui", "intent-os", "ds-eval"]
WORKFLOW = ["agent-ui", "figma-to-design-md", "ds-lint", "ds-coverage"]
UTILITIES = ["ds-context", "ui-repair", "prompt-regress", "ds-health"]

SKILLS = [
    ("token-map", "Replace hardcoded values", "Убрать хардкод",
     "Replaces hardcoded colors, spacing, and radii with design tokens.",
     "Заменяет цвета, отступы и радиусы, прописанные в коде, на токены.",
     """---
name: token-map
description: Use when code has hardcoded colors, spacing, font sizes, or radii that should use design tokens.
---

# Replace hardcoded values

Replace raw UI values with the project's existing tokens.

## Steps
1. Find the token file (`tokens.css`, `tokens.json`, or `DESIGN.md`). If there is none, stop and say so.
2. Scan the files you changed:
```bash
npx @andrewaitken/ds-lint src/ --tokens tokens.css
```
3. For each finding, pick the token by meaning first (e.g. "primary action"), then by value.
4. Replace only clear matches. Never invent a token.
5. Run the scan again until the changed files are clean.

## Done when
- `ds-lint` reports no fixable findings in the changed files
- No new tokens were added
- Values without a match are listed with a reason
"""),
    ("design-md", "Write DESIGN.md", "Написать DESIGN.md",
     "Builds a short DESIGN.md that agents can follow.",
     "Собирает короткий DESIGN.md, по которому работает агент.",
     """---
name: design-md
description: Use when a project needs a DESIGN.md so coding agents follow the design system.
---

# Write DESIGN.md

Write a short file that tells a coding agent which colors, type, spacing, and components to use.

## Steps
1. If the system lives in Figma, extract it:
```bash
npx figma-to-design-md extract --file <key> --token <token>
```
2. Otherwise read the token files and 3 to 5 core components.
3. Write `DESIGN.md` with these sections: colors, type, spacing, radii, components, rules.
4. Every value must come from a token or a component in the code. Mark guesses as `unverified`.
5. Keep it under 150 lines.

## Done when
- Each rule points to a token or file
- No section is empty or copied from another project
"""),
    ("component-adoption", "Find duplicate components", "Найти дубли компонентов",
     "Finds local copies of design-system components and swaps them back.",
     "Находит свои копии компонентов системы и заменяет их компонентами из системы.",
     """---
name: component-adoption
description: Use when a codebase may contain local copies of design-system components such as its own Button or Modal.
---

# Find duplicate components

Find places where the code uses its own Button, Modal, or Input instead of the design system's.

## Steps
1. Measure usage:
```bash
npx @andrewaitken/ds-coverage src/ --ds @acme/ui
```
   Replace `@acme/ui` with the package name of your design system.
2. List local components that share a name with a system export.
3. For each one, compare props. If the system component covers it, replace it.
4. If it does not, report the missing prop. Do not patch the system component.
5. Run the scan again and compare the numbers.

## Done when
- Coverage went up, or each remaining duplicate has a reason
- No behavior changed on the touched screens
"""),
    ("ui-review", "Review a screen", "Проверить экран",
     "Checks a screen at 390 and 1280 px, with keyboard and real data.",
     "Проверяет экран на 390 и 1280 px, с клавиатурой и реальными данными.",
     """---
name: ui-review
description: Use before shipping a screen or flow to check layout, states, and keyboard access.
---

# Review a screen

Review one screen the way a user would use it.

## Steps
1. Open the screen at 390 px and at 1280 px.
2. Use it with the keyboard only: Tab order, visible focus, Escape closes overlays.
3. Check the states: loading, empty, error, long text.
4. Compare spacing, type, and color with the design system.
5. Write findings in three groups: `blocking`, `should-fix`, `note`.

## Each finding has
- the element
- what is wrong
- the fix
- how to check it

## Done when
- No `blocking` items remain
- Both widths were checked after the fixes
"""),
    ("component-docs", "Document a component", "Описать компонент",
     "Documents a component from its real code and usage.",
     "Описывает компонент по реальному коду и местам использования.",
     """---
name: component-docs
description: Use when a shared component needs documentation or a new variant.
---

# Document a component

Document what the component does today, not what it should do.

## Steps
1. Read the component, its types, tests, and 3 real call sites.
2. Write: purpose, props table, states, keyboard behavior.
3. Add 2 pairs of "Do" and "Don't" taken from real usage.
4. Add a "Do not use for" line.
5. Mark anything you could not verify as `unknown`.

## Done when
- Every prop and variant in the doc exists in the code
- No invented props
"""),
    ("ds-migrate", "Move a screen to the design system", "Перевести экран на дизайн-систему",
     "Moves one screen to design-system components without changing behavior.",
     "Переводит один экран на компоненты системы, не меняя поведение.",
     """---
name: ds-migrate
description: Use when a screen with custom or raw controls should move to design-system components.
---

# Move a screen to the design system

Migrate one screen at a time.

## Steps
1. List the controls on the screen: buttons, inputs, selects, modals.
2. Match each one to a system component. List gaps. Do not invent props.
3. Replace the controls one by one.
4. After each replacement, check the states, events, and keyboard behavior.
5. Run the token scan:
```bash
npx @andrewaitken/ds-lint src/<screen> --tokens tokens.css
```

## Done when
- The screen behaves exactly as before
- No raw controls or hardcoded values are left
- Missing system features are reported separately
"""),
    ("ui-states", "Check every state", "Проверить все состояния",
     "Renders every state of a component before you call it done.",
     "Показывает все состояния компонента, прежде чем считать его готовым.",
     """---
name: ui-states
description: Use when a component looks finished but only the happy path has been tested.
---

# Check every state

Make every state visible.

## Steps
1. Make a temporary page or story for the component.
2. Render these states: default, hover, focus, disabled, loading, empty, error, success.
3. Add stress cases: very long text, 0 items, 1000 items, 320 px width.
4. Fix what breaks.
5. Keep the page as a story or delete it. Do not leave it in production routes.

## Done when
- Every state renders without overflow or layout jumps
- Error and loading states tell the user what to do next
"""),
    ("motion", "Add animation", "Добавить анимацию",
     "Adds motion only where it helps, and respects reduced motion.",
     "Добавляет анимацию только там, где она помогает, и учитывает настройку «уменьшить движение».",
     """---
name: motion
description: Use when adding or reviewing animation and transitions in a UI.
---

# Add animation

Animate only when it explains a change.

## Steps
1. Skip it if the action happens all the time or comes from a keyboard shortcut.
2. Say what the motion explains: where something came from, what changed, or that an action worked.
3. Use CSS transitions first. Animate only `transform` and `opacity`.
4. Keep it under 300 ms with an ease-out curve: `cubic-bezier(0.23, 1, 0.32, 1)`.
5. Never scale from `0`. Start at `0.95`.
6. Add the fallback:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

## Done when
- Fast repeated clicks do not break it
- It works with reduced motion on
"""),
    ("a11y-pass", "Check accessibility", "Проверить доступность",
     "Checks contrast, focus, names, and readable type in the running UI.",
     "Проверяет контраст, фокус, имена и читаемость текста в работающем UI.",
     """---
name: a11y-pass
description: Use when a screen needs a quick accessibility and typography check.
---

# Check accessibility

Check the running page, not only the code.

## Steps
1. Text contrast is at least 4.5:1. Borders and focus rings are at least 3:1.
2. Every button, link, and input has a name a screen reader can read.
3. Tab through the page. Focus is always visible and never trapped, except inside an open dialog.
4. Dialogs: focus moves in on open, Escape closes, focus returns to the trigger.
5. Inputs on mobile use at least 16 px text.
6. Numbers in tables use `font-variant-numeric: tabular-nums`.

## Done when
- Each issue has the element, the measured value, and a fix
- The page works with keyboard only
"""),
    ("interaction-spec", "Describe an action", "Описать поведение действия",
     "Writes down what happens on click, on error, and on cancel.",
     "Фиксирует, что происходит при клике, ошибке и отмене.",
     """---
name: interaction-spec
description: Use before building an action that saves data, calls a server, or can be undone.
---

# Describe an action

Write the behavior before the code.

## Steps
1. Write one line each for: trigger, pending state, success, error, cancel, undo.
2. Say where focus goes after the action.
3. For destructive actions, name the point of no return.
4. Turn the spec into two tests: one keyboard path and one error path.
5. Build it.

## Example
- Trigger: click "Save"
- Pending: button disabled, label "Saving..."
- Error: message under the form, button enabled, input values kept
- Cancel: closes the form, nothing saved

## Done when
- No state is left to guesswork
- Both tests pass
"""),
]
ALL_SKILLS = SKILLS


def projects_by(slugs: list[str]) -> list[tuple[int, dict]]:
    by = {p["slug"]: p for p in PROJECTS}
    return [(0, by[slug]) for slug in slugs]


def project_cards(lang: str, items: list[tuple[int, dict]], layout: str = "plist") -> str:
    i = 0 if lang == "ru" else 1
    out = []
    for n, (idx, p) in enumerate(items):
        out.append(
            f'<a class="pcard" href="{name_for(p["slug"], lang)}" data-r style="--d:{n * 0.05}s">'
            f'{cover(p["slug"], p["name"], p["kicker"][i])}'
            f'<div class="meta-row"><p>{p["desc"][i]}</p><span class="arrow-btn">{ARROW}</span></div></a>'
        )
    return f'<div class="{layout}">{"".join(out)}</div>'


def utility_rows(lang: str, slugs: list[str]) -> str:
    i = 0 if lang == "ru" else 1
    by = {p["slug"]: p for p in PROJECTS}
    rows = []
    for n, slug in enumerate(slugs):
        p = by[slug]
        rows.append(
            f'<a class="jrow" href="{name_for(slug, lang)}" data-r style="--d:{n * 0.05}s"><div class="jleft">'
            f'<div class="jtitle">{p["name"]}</div>'
            f'<p>{p["desc"][i]}</p></div>'
            f'<span class="arrow-btn">{ARROW}</span></a>'
        )
    return f'<div class="journal">{"".join(rows)}</div>'

def skill_rows(lang: str) -> str:
    i = 2 if lang == "ru" else 1
    rows = []
    for n, (slug, en, ru, _, _, _) in enumerate(ALL_SKILLS):
        desc = ALL_SKILLS[n][4] if lang == "ru" else ALL_SKILLS[n][3]
        rows.append(
            f'<a class="jrow" href="{name_for(f"skills/{slug}", lang)}" data-r style="--d:{n * 0.04}s">'
            f'<div class="jleft"><div class="jtitle">{ru if i == 2 else en}</div>'
            f'<p>{desc}</p></div><span class="arrow-btn">{ARROW}</span></a>'
        )
    return f'<div class="journal">{"".join(rows)}</div>'


def journal(lang: str, stems: list[str], show_desc: bool = False) -> str:
    ru = lang == "ru"
    rows = []
    for n, s in enumerate(stems):
        a = article(s, lang)
        desc = f'<p>{a["tldr"]}</p>' if show_desc and a.get("tldr") else ""
        rows.append(
            f'<a class="jrow" href="{name_for(s, lang)}" data-r style="--d:{n * 0.05}s"><div class="jleft">'
            f'<div class="jtitle">{a["h1"]}</div>{desc}'
            f'<div class="jmeta"><span>{fmt_date(a["date"], lang)}</span><i></i><span>{a["min"]} {"мин" if ru else "min"}</span></div></div>'
            f'<span class="arrow-btn">{ARROW}</span></a>'
        )
    return f'<div class="journal">{"".join(rows)}</div>'


def article_cards(lang: str, stems: list[str]) -> str:
    ru = lang == "ru"
    out = []
    glows = ["rgba(202,232,189,.28)", "rgba(120,160,255,.28)"]
    for n, s in enumerate(stems):
        a = article(s, lang)
        c = a.get("cover")
        if c:
            img = f'<img src="/{c["src"]}" alt="{c.get("alt", "")}">'
        else:
            img = cover(s, re.sub(r"&nbsp;|&#8209;", " ", a["title"]).split(":")[0].split(" — ")[0][:28])
        tags = a["tag_list"][0] if a["tag_list"] else ""
        out.append(
            f'<a class="prod" href="{name_for(s, lang)}" data-r style="--d:{n * 0.08}s">'
            f'<div class="prod-img" style="--glow:{glows[n % 2]}">{img}</div>'
            f'<div class="prod-row"><div><h3>{a["h1"]}</h3><p>{tags}</p></div><span class="pill">{a["min"]} {"мин" if ru else "min"}</span></div></a>'
        )
    return f'<div class="cards2">{"".join(out)}</div>'


def faq_block(items: list[tuple[str, str]]) -> str:
    return '<div class="faq">' + "".join(
        f'<div class="qa" data-r style="--d:{n * 0.05}s"><button type="button" aria-expanded="false"><span>{q}</span><span class="plus">{PLUS}</span></button>'
        f'<div class="ans"><div><p>{a}</p></div></div></div>'
        for n, (q, a) in enumerate(items)
    ) + "</div>"


def collab_faqs(lang: str) -> list[tuple[str, str]]:
    if lang == "ru":
        faqs = [
            ("Кто такой Design Engineer?", "Я не останавливаюсь на макете: проектирую сценарии, описываю состояния и токены и довожу решение до кода. Тогда у дизайна, разработки и coding-агента один источник правды, а не три разные трактовки."),
            ("Чем вы занимаетесь сейчас?", "Веду компоненты, токены и документацию дизайн-системы Яндекс HR Tech. Параллельно развиваю открытые инструменты вокруг AI-агентов: упаковку контекста системы, статические проверки и бенчмарк ds-eval."),
            ("Зачем свои инструменты вокруг дизайн-системы?", "Без явного контекста и автоматической проверки агент рисует свой Button и хардкодит цвета. Утилиты закрывают три шага: компактно упаковать правила системы, проверить импорты и токены в коде и измерить дифф между промптами."),
            ("Где проходит граница между вашей работой и агентом?", "Агент собирает черновик по спецификации и прогоняет проверки. Постановка задачи, продуктовые компромиссы, архитектура системы и приёмка того, что уходит в продакшен, остаются за мной."),
        ]
    else:
        faqs = [
            ("What is a Design Engineer?", "I don't stop at the mockup: I map the flows, specify states and tokens, and carry the work into code. That gives design, engineering, and coding agents one shared source of truth instead of three competing interpretations."),
            ("What are you working on now?", "I lead components, tokens, and documentation for the Yandex HR Tech design system. Alongside it, I build open-source tools around coding agents: context packing, static token/import checks, and the ds-eval benchmark."),
            ("Why build custom tools around the design system?", "Without explicit context and automated checks, an agent invents its own Button and hardcodes colors. The tools cover three steps: pack system rules under a token budget, lint imports and tokens in code, and diff prompt runs."),
            ("Where is the boundary between your work and the agent?", "The agent drafts against the spec and runs the checks. Problem framing, product tradeoffs, system architecture, and sign-off on what ships to production stay with me."),
        ]
    return faqs


# ── Pages ───────────────────────────────────────────────────────────────────

def home(lang: str) -> str:
    ru = lang == "ru"
    if ru:
        h1a, h1b = "Андрей Антошкин,", "Design Engineer."
        sub = "Дизайн-системы, интерфейсы для агентов и инструменты проверки. Собираю продукты и правила, по которым разработчики и coding-агенты пишут чистый UI."
        b1, b2 = "Смотреть проекты", "Написать"
        s_proj, s_how, s_art, s_exp, s_faq, s_all = "Проекты", "Практика", "Статьи", "Опыт", "Частые вопросы", "Все"
        steps = [
            ("Дизайн-системы", "Проектирую компоненты, токены и правила так, чтобы макет в Figma и код в репозитории не расходились."),
            ("Инструменты", "Делаю утилиты вокруг дизайн-системы: собрать контекст для агента, починить сырой код, проверить результат."),
            ("AI и код", "Пишу спецификации и правила, по которым интерфейс собирает не только разработчик, но и агент."),
            ("Проверка", "Проверяю результат кодом: разбор AST и токенов на исходниках, а при полном прогоне в браузере — сборка, axe и Playwright."),
        ]
        voices = [
            ("/assets/logos/yandex.svg", "Яндекс HR Tech", "Product Designer — Design Systems · Сейчас", "Веду компоненты, токены и документацию системы; связываю макеты в Figma с кодом и правилами для агентов."),
            ("/assets/logos/sber-icon.svg", "Сбер", "Design System Lead · 2021 — 2025", "Отвечал за архитектуру дизайн-систем, библиотеку компонентов и процесс внедрения в продуктовых командах."),
            ("/assets/logos/otkritie-icon.svg", "Открытие Брокер", "Senior Product Designer · 2020 — 2021", "Проектировал торговые сценарии, портфель и онбординг в веб- и мобильном приложении для частных инвесторов."),
            ("/assets/logos/mts-icon.svg", "МТС", "Product Designer · 2019 — 2020", "Проектировал пользовательские сценарии и паттерны интерфейса для цифровых сервисов экосистемы."),
        ]
    else:
        h1a, h1b = "Andrew Antoshkin,", "Design Engineer."
        sub = "Design systems, agentic UI, and verification tools. I build interfaces and the guardrails that help engineers and coding agents ship them cleanly."
        b1, b2 = "See projects", "Say hello"
        s_proj, s_how, s_art, s_exp, s_faq, s_all = "Projects", "Practice", "Writing", "Experience", "Most asked questions", "See all"
        steps = [
            ("Design systems", "I design components, tokens, and rules so the Figma file and the codebase stay in sync."),
            ("Tools", "I build utilities around the design system: pack context for an agent, repair raw code, and check the output."),
            ("AI and code", "I write specifications and rules that both engineers and coding agents can build from."),
            ("Verification", "I verify output with code: AST and token checks on source files, plus build, axe, and Playwright on full browser runs."),
        ]
        voices = [
            ("/assets/logos/yandex.svg", "Yandex HR Tech", "Product Designer — Design Systems · Now", "Own components, tokens, and documentation; connect Figma libraries with code and agent rules."),
            ("/assets/logos/sber-icon.svg", "Sber", "Design System Lead · 2021 — 2025", "Led design system architecture, component libraries, and adoption across product teams."),
            ("/assets/logos/otkritie-icon.svg", "Otkritie Broker", "Senior Product Designer · 2020 — 2021", "Designed trading flows, portfolio views, and onboarding across web and mobile for retail investors."),
            ("/assets/logos/mts-icon.svg", "MTS", "Product Designer · 2019 — 2020", "Designed user flows and shared interface patterns across consumer digital services."),
        ]
    svc = "".join(
        f'<div class="svc" data-r style="--d:{n * 0.06}s"><div class="svc-in"><div class="svc-top"><span class="svc-n">0{n + 1}.</span><span class="ico">{SVC_ICONS[n]}</span></div>'
        f'<div><h3>{h}</h3><p>{p}</p></div></div></div>'
        for n, (h, p) in enumerate(steps)
    )
    tools = ["Figma", "Cursor", "Claude", "GitHub", "MCP", "DESIGN.md", "Playwright", "Design tokens"]
    tk = "".join(f"<span>{t}</span>" for t in tools * 2)

    def vcard(v):
        src, name, role, text = v
        return f'<div class="vcard"><div class="vhead"><span class="vava"><img src="{src}" alt=""></span><div><div class="vname">{name}</div><div class="vhandle">{role}</div></div></div><p>{text}</p></div>'

    vgrid = "".join(f'<div data-r style="--d:{n * 0.07}s">{vcard(v)}</div>' for n, v in enumerate(voices))
    faqs = collab_faqs(lang)
    top_projects = projects_by(["pulse-ui", "intent-os", "ds-eval"])
    return f'''
<svg width="0" height="0" aria-hidden="true" style="position:absolute"><filter id="hero-key" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="1.15" intercept="-0.064"/><feFuncG type="linear" slope="1.15" intercept="-0.064"/><feFuncB type="linear" slope="1.15" intercept="-0.064"/></feComponentTransfer></filter></svg>
<main><div class="col">
  <header class="hero">
    <h1 data-split><span class="dim">{h1a}</span><br>{h1b}</h1>
    <p class="sub" data-r style="--d:.35s">{sub}</p>
    <div class="actions" data-r style="--d:.45s"><a class="btn mint" href="{name_for("projects", lang)}">{b1}</a><a class="btn dark" href="{TG}" target="_blank" rel="noopener">{b2}</a></div>
    <div class="hero-art" data-r style="--d:.6s"><div class="hero-frame" data-parallax><img src="/img/portrait.jpg" alt="{h1a.rstrip(',')}"></div></div>
  </header>
  <section class="stack">{sec_head(s_proj, len(PROJECTS), (name_for("projects", lang), s_all))}{project_cards(lang, top_projects)}</section>
  <section class="stack">{sec_head(s_how, len(steps))}<div class="cards2">{svc}</div></section>
  <div class="ticker" data-r aria-hidden="true"><div class="ticker-track">{tk}</div></div>
  <section class="stack">{sec_head(s_art, len(ORDER), (name_for("writing", lang), s_all))}{journal(lang, ORDER[:4])}</section>
  <section class="stack">{sec_head(s_exp, len(voices))}<div class="voices">{vgrid}</div></section>
  <section class="stack">{sec_head(s_faq, len(faqs))}{faq_block(faqs)}</section>
</div></main>
'''


def page_head(title: str, sub: str = "", back: str = "") -> str:
    s = f'<p class="sub" data-r style="--d:.3s">{sub}</p>' if sub else ""
    return f'<header class="page-head"><h1 data-split>{title}</h1>{s}</header>'


def projects_page(lang: str) -> str:
    ru = lang == "ru"
    if ru:
        title, sub = "Проекты", "Кейсы, инструменты, утилиты и скиллы: всё, что я проектирую и собираю на стыке дизайна, кода и AI."
        h_case, h_work, h_util, h_skills = "Кейсы", "Инструменты", "Утилиты", "Скиллы"
        note = "Компоненты с правилами для Cursor и три CLI-пакета в npm: спека из Figma, проверка токенов и покрытие импортов."
        util_note = "Локальные утилиты: собрать контекст для агента, починить код по правилам системы и сравнить прогоны после смены промпта. И проверка живой страницы по ссылке."
        skills_note = ""
    else:
        title, sub = "Projects", "Case studies, tools, utilities, and skills: what I design and build where design, code, and AI meet."
        h_case, h_work, h_util, h_skills = "Cases", "Tools", "Utilities", "Skills"
        note = "Components with Cursor rules and three npm CLIs: Figma-to-markdown specs, token linting, and import coverage."
        util_note = "Local utilities: pack context for an agent, repair code against system rules, and compare runs after a prompt change. Plus a check of a live page from its URL."
        skills_note = ""
    tabs = [
        ("cases", h_case, len(FEATURED), "", project_cards(lang, projects_by(FEATURED))),
        ("tools", h_work, len(WORKFLOW), note, project_cards(lang, projects_by(WORKFLOW), "workflow")),
        ("utilities", h_util, len(UTILITIES), util_note, utility_rows(lang, UTILITIES)),
        ("skills", h_skills, len(ALL_SKILLS), skills_note, skill_rows(lang)),
    ]
    buttons = "".join(
        f'<button type="button" role="tab" id="tab-{k}" aria-controls="panel-{k}" aria-selected="{"true" if n == 0 else "false"}" data-tab="{k}">{t}<sup>{c}</sup></button>'
        for n, (k, t, c, _, _) in enumerate(tabs)
    )
    panels = "".join(
        f'<section class="tab-panel" role="tabpanel" id="panel-{k}" aria-labelledby="tab-{k}"{"" if n == 0 else " hidden"}>'
        + body + "</section>"
        for n, (k, _, _, nt, body) in enumerate(tabs)
    )
    script = (
        "<script>(function(){var tabs=[].slice.call(document.querySelectorAll('[data-tab]'));"
        "function show(k,push){var ok=tabs.some(function(t){return t.dataset.tab===k});if(!ok)k=tabs[0].dataset.tab;"
        "tabs.forEach(function(t){var on=t.dataset.tab===k;t.setAttribute('aria-selected',on);"
        "var p=document.getElementById('panel-'+t.dataset.tab);if(p)p.hidden=!on});"
        "if(push)history.replaceState(null,'','#'+k)}"
        "tabs.forEach(function(t){t.addEventListener('click',function(){show(t.dataset.tab,true)})});"
        "tabs.forEach(function(t,i){t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;"
        "if(!d)return;var n=tabs[(i+d+tabs.length)%tabs.length];n.focus();show(n.dataset.tab,true);e.preventDefault()})});"
        "show(location.hash.slice(1),false)})();</script>"
    )
    return (
        f'<main><div class="col">{page_head(title, sub)}'
        f'<div class="tabs-wrap"><div class="tabs" role="tablist" data-r>{buttons}</div>'
        f'<div class="tab-panels stack">{panels}</div></div>{script}'
        f'</div></main>'
    )


def writing_page(lang: str) -> str:
    ru = lang == "ru"
    sub = "Эссе и практические разборы о дизайн-системах, процессах и работе с AI-агентами." if ru else "Essays and field notes on design systems, engineering workflows, and AI coding agents."
    core = ["apres-prompt", "ai-changes-processes", "halo-working-memory"]
    guides = ["cursor-figma", "design-md", "dev-for-designers"]
    return (
        f'<main><div class="col">{page_head("Статьи" if ru else "Writing", sub)}'
        f'<section class="stack">{sec_head("Свежее" if ru else "Latest", 2)}{article_cards(lang, ORDER[:2])}</section>'
        f'<section class="stack">{sec_head("Главные эссе" if ru else "Core essays", len(core))}{journal(lang, core, show_desc=True)}</section>'
        f'<section class="stack">{sec_head("Практика и разборы" if ru else "Field notes & guides", len(guides))}{journal(lang, guides, show_desc=True)}</section></div></main>'
    )


def approach_page(lang: str) -> str:
    ru = lang == "ru"
    essay = name_for("ai-changes-processes", lang)
    if ru:
        title = "От неопределённости к работающему продукту."
        sub = "Беру задачу до того, как её можно отдать в разработку: разбираюсь в сценариях, собираю прототип в Figma или коде, описываю состояния и токены и довожу до продакшена."
        where = "Сейчас применяю этот контур в дизайн-системе <b>Яндекс HR Tech</b> (ранее — в дизайн-системах <b>Сбера</b>)."
        cta_t = "Обсудить задачу"
        steps_t = "Как идёт работа"
        steps = [
            ("Контекст", "Проблема, сценарии, ограничения и критерии, по которым поймём, что решение работает. Без этого макет только прячет неопределённость."),
            ("Прототип", "Не весь продукт целиком, а те сценарии, где решение может сломаться. Собираю в Figma или сразу в коде — смотря что быстрее покажет узкие места."),
            ("Правила", "Состояния, компоненты, токены. Одна спецификация для дизайнера, разработчика и агента, чтобы каждый не собирал свою версию."),
            ("Реализация", "Макет — не конец работы. Остаюсь на вёрстке, проверках в браузере и настройке правил, чтобы система не расползалась дальше."),
        ]
        agent_t = "С агентом"
        agent = [
            "Агент делает черновую работу по шагам: ищет, что уже есть в системе, собирает первый вариант и прогоняет проверки. Я ставлю задачу, задаю ограничения и принимаю результат на каждом шаге.",
            "Один длинный промпт на всю задачу не работает: в нём модель сама пишет код и сама себя хвалит. Поэтому сборка, линтер и проверки отделены от генерации.",
            "Продуктовое решение, компромиссы по срокам и всё, что уходит в продакшен от моего имени, остаются за мной.",
        ]
        hold = "<b>Хороший процесс не обещает, что модель не ошибётся.</b> Он делает ошибку заметной до того, как она попадёт в код."
        more = f'Подробнее — в статье <a href="{essay}">про то, как AI меняет процессы</a>.'
    else:
        title = "From ambiguity to production."
        sub = "I join before a task is ready for engineering: map the scenarios, build a prototype in Figma or code, write down the states and tokens, and see it through to production."
        where = "I currently run this loop on the design system at <b>Yandex HR Tech</b> (previously across design systems at <b>Sber</b>)."
        cta_t = "Discuss a task"
        steps_t = "How the work goes"
        steps = [
            ("Context", "The problem, scenarios, constraints, and how we will know it works. Without that, a mockup only hides the ambiguity."),
            ("Prototype", "Not the whole product — just the scenarios where the design might break. Built in Figma or directly in code, whichever exposes the edge cases faster."),
            ("Rules", "States, components, tokens. One specification for design, engineering, and coding agents so nobody invents a parallel version."),
            ("In production", "A mockup is not the finish line. I stay through implementation, browser checks, and linting rules so the system holds together over time."),
        ]
        agent_t = "With an agent"
        agent = [
            "The agent handles the draft work step by step: checks what already exists in the system, assembles a first pass, and runs the checks. I scope the task, set the constraints, and review each step.",
            "One giant prompt for the whole job doesn't work: the model writes the code and grades its own homework. Generation and verification have to be separate steps.",
            "The product decision, the scope tradeoffs, and anything that ships under my name stay with me.",
        ]
        hold = "<b>A good process does not promise the model will never fail.</b> It catches the failure before it quietly ships."
        more = f'More on this in the essay <a href="{essay}">on how AI changes processes</a>.'
    steps_html = "".join(
        f'<div class="layer" data-r style="--d:{n * 0.05:.2f}s"><span class="layer-n">0{n + 1}</span><h3>{h}</h3><p>{p}</p></div>'
        for n, (h, p) in enumerate(steps)
    )
    paras = "".join(f"<p>{p}</p>" for p in agent)
    return f'''<main class="approach"><div class="col">
  <header class="page-head approach-top">
    <h1 data-split>{title}</h1>
    <p class="sub" data-r style="--d:.3s">{sub}</p>
    <p class="where" data-r style="--d:.4s">{where}</p>
    <div class="actions" data-r style="--d:.48s"><a class="btn mint" href="{TG}" target="_blank" rel="noopener">{cta_t}</a></div>
  </header>
  <section class="stack">{sec_head(steps_t, len(steps))}<div class="layers">{steps_html}</div></section>
  <section class="stack">{sec_head(agent_t)}<div class="prose essay" data-r>{paras}<p class="hold">{hold}</p><p class="more">{more}</p></div></section>
</div></main>'''


def collab_page(lang: str) -> str:
    ru = lang == "ru"
    if ru:
        h1 = "Есть вопрос?<br>Напишите."
        n1, k1 = "01.", "Контакты"
        n2, k2 = "02.", "Локация"
        place = "Москва"
        card_t = "Расскажите о задаче."
        card_p = "Продукт, команда и что сейчас не сходится. Отвечу и предложу следующий шаг."
        fields = ("Имя", "Почта", "О задаче", "Отправить", "Сотрудничество")
        tg = "t.me/andrewaitken"
    else:
        h1 = "Any questions?<br>Write to me."
        n1, k1 = "01.", "Contact"
        n2, k2 = "02.", "Location"
        place = "Moscow"
        card_t = "Tell me about the task."
        card_p = "The product, the team, and what isn’t working. I’ll reply with a next step."
        fields = ("Your name", "Your email", "About the task", "Send", "Collaboration")
        tg = "t.me/andrewaitken"
    mail = svg('<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>', 22)
    pin = svg('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>', 22)
    return f'''<main class="contact"><div class="col">
  <header class="page-head contact-head"><h1 data-split>{h1}</h1></header>
  <div class="contact-grid">
    <div class="contact-side">
      <div class="contact-shell"><div class="contact-in">
        <div class="contact-top"><p class="contact-n">{n1}</p><span class="info-ico" aria-hidden="true">{mail}</span></div>
        <div class="contact-body">
          <p class="contact-k">{k1}</p>
          <a href="mailto:andrew.antoshkin@gmail.com">andrew.antoshkin@gmail.com</a>
          <a href="https://github.com/AndrewAntoshkin" target="_blank" rel="noopener">github.com/AndrewAntoshkin</a>
          <a href="{TG}" target="_blank" rel="noopener">{tg}</a>
          <a href="https://setka.ru/users/84b42bc4-44b4-4b1e-ba76-06d249242bc4" target="_blank" rel="noopener">setka.ru</a>
        </div>
      </div></div>
      <div class="contact-shell"><div class="contact-in">
        <div class="contact-top"><p class="contact-n">{n2}</p><span class="info-ico" aria-hidden="true">{pin}</span></div>
        <div class="contact-body"><p class="contact-k">{k2}</p><p class="contact-place">{place}</p></div>
      </div></div>
    </div>
    <div class="contact-shell contact-form-shell">
      <form class="contact-in contact-card cta-form" data-subject="{fields[4]}">
        <h2>{card_t}</h2>
        <p class="contact-lead">{card_p}</p>
        <div class="contact-fields">
          <input name="name" required placeholder="{fields[0]}" aria-label="{fields[0]}" autocomplete="name">
          <input name="email" type="email" required placeholder="{fields[1]}" aria-label="{fields[1]}" autocomplete="email">
          <textarea name="question" required placeholder="{fields[2]}" aria-label="{fields[2]}"></textarea>
        </div>
        <button type="submit">{fields[3]}</button>
      </form>
    </div>
  </div>
</div></main>'''


def project_page(project: dict, lang: str) -> str:
    ru = lang == "ru"
    i = 0 if ru else 1
    idx = PROJECTS.index(project)
    doc = load_doc(project["slug"], lang)
    lead = doc["lead"] or project["desc"][i]
    raw_gh = project.get("github") or ""
    gh = raw_gh[i] if isinstance(raw_gh, tuple) else raw_gh
    ext = ' target="_blank" rel="noopener"' if gh.startswith("http") else ""
    link = f'<a class="btn mint" href="{gh}"{ext}>{project["github_label"][i]}</a>' if gh else ""
    badge = project.get("badge", ("open source", "open source"))[i]
    return f'''<main><div class="col"><article class="art">
  <header class="art-top">
    <a class="back" href="{name_for("projects", lang)}" data-r>‹ {"Назад" if ru else "Back"}</a>
    <h1 data-split>{project["name"]}</h1>
    <div class="tags" data-r style="--d:.25s"><span class="tag">{project["kicker"][i]}</span><span class="tag">{badge}</span></div>
  </header>
  <div class="art-intro" data-r style="--d:.3s"><p>{lead}</p><div class="actions" style="justify-content:flex-start">{link}</div></div>
  <div class="prose">{cover(project["slug"], project["name"])}{doc["body"]}</div>
</article></div></main>'''


def article_page(stem: str, lang: str) -> str:
    ru = lang == "ru"
    a = article(stem, lang)
    c = a.get("cover")
    if c:
        img = f'<img src="/{c["src"]}" alt="{c.get("alt", "")}">'
    else:
        img = cover(stem, re.sub(r"&nbsp;|&#8209;", " ", a["title"]).split(":")[0].split(" — ")[0][:34])
    tag_html = "".join(f'<span class="tag">{t}</span>' for t in a["tag_list"])
    return f'''<main><div class="col"><article class="art">
  <header class="art-top">
    <a class="back" href="{name_for("writing", lang)}" data-r>‹ {"Назад" if ru else "Back"}</a>
    <h1 data-split{' class="long"' if len(plain(a["h1"])) > 48 else ""}>{a["h1"]}</h1>
    <div class="tags" data-r style="--d:.3s">{tag_html}</div>
  </header>
  <div class="art-intro" data-r style="--d:.35s"><p>{a["tldr"]}</p><div class="art-meta"><span>{fmt_date(a["date"], lang)}</span><i></i><span>{a["min"]} {"мин" if ru else "min"}</span></div></div>
  <div class="prose">{img}{a["body"]}</div>
</article></div></main>'''

def skill_body_html(body: str) -> str:
    """Small Markdown renderer for the deliberately narrow SKILL.md format."""
    output: list[str] = []
    list_tag = ""
    in_code = False

    def inline(text: str) -> str:
        return re.sub(r"`([^`]+)`", r"<code>\1</code>", html.escape(text))

    for raw in body.strip().splitlines():
        line = raw.strip()
        if line.startswith("```"):
            if list_tag:
                output.append(f"</{list_tag}>")
                list_tag = ""
            output.append("</code></pre>" if in_code else "<pre><code>")
            in_code = not in_code
            continue
        if in_code:
            output.append(html.escape(raw) + "\n")
            continue
        if not line:
            if list_tag:
                output.append(f"</{list_tag}>")
                list_tag = ""
            continue
        if line.startswith("## "):
            if list_tag:
                output.append(f"</{list_tag}>")
                list_tag = ""
            output.append(f"<h2>{inline(line[3:])}</h2>")
        elif line.startswith("### "):
            if list_tag:
                output.append(f"</{list_tag}>")
                list_tag = ""
            output.append(f"<h3>{inline(line[4:])}</h3>")
        elif re.match(r"^\d+\. ", line):
            if list_tag != "ol":
                if list_tag:
                    output.append(f"</{list_tag}>")
                start = int(re.match(r"^(\d+)\. ", line).group(1))
                output.append("<ol>" if start == 1 else f'<ol start="{start}">')
                list_tag = "ol"
            output.append(f"<li>{inline(re.sub(r'^\d+\. ', '', line))}</li>")
        elif line.startswith("- "):
            if list_tag != "ul":
                if list_tag:
                    output.append(f"</{list_tag}>")
                output.append("<ul>")
                list_tag = "ul"
            output.append(f"<li>{inline(line[2:])}</li>")
        else:
            if list_tag:
                output.append(f"</{list_tag}>")
                list_tag = ""
            output.append(f"<p>{inline(line)}</p>")
    if list_tag:
        output.append(f"</{list_tag}>")
    if in_code:
        output.append("</code></pre>")
    return "".join(output)


def split_frontmatter(doc: str) -> tuple[str, str]:
    _, fm, body = doc.split("---\n", 2)
    return fm.strip(), re.sub(r"^# .+\n+", "", body.lstrip())


def write_skills() -> None:
    """Write installable English SKILL.md files and localized presentation pages."""
    skills_dir = OUT / "skills"
    if skills_dir.exists():
        shutil.rmtree(skills_dir)
    en_skills = OUT / "en" / "skills"
    if en_skills.exists():
        shutil.rmtree(en_skills)
    for slug, en, ru, en_desc, ru_desc, body in ALL_SKILLS:
        target = skills_dir / slug
        target.mkdir(parents=True)
        doc = body
        target.joinpath("SKILL.md").write_text(doc, encoding="utf-8")
        frontmatter, body_markdown = split_frontmatter(doc)
        body_html = f'<h1>{html.escape(en)}</h1>' + skill_body_html(body_markdown)
        raw_skill = html.escape(doc)
        for lang in ("ru", "en"):
            is_ru = lang == "ru"
            title = ru if is_ru else en
            desc = ru_desc if is_ru else en_desc
            t = {
                "crumb_a": "Проекты" if is_ru else "Projects",
                "crumb_b": "Скиллы" if is_ru else "Skills",
                "kind": "Скилл для агента" if is_ru else "Agent skill",
                "copy": "Копировать" if is_ru else "Copy",
                "copied": "Скопировано" if is_ru else "Copied",
                "save": "Сохранить .md" if is_ru else "Save .md",
                "raw": "Исходник" if is_ru else "Source",
                "close": "Закрыть" if is_ru else "Close",
            }
            page = shell(
                lang,
                f"{title} — {'Андрей Антошкин' if is_ru else 'Andrew Antoshkin'}",
                "projects",
                f"skills/{slug}",
                f'''<main><div class="col"><article class="art skill-page">
  <header class="art-top">
    <nav class="crumbs" data-r aria-label="breadcrumb"><a href="{name_for("projects", lang)}">{t["crumb_a"]}</a><span>›</span><a href="{name_for("projects", lang)}#skills">{t["crumb_b"]}</a><span>›</span><span>{slug}</span></nav>
    <h1 data-split>{title}</h1>
    <div class="tags" data-r style="--d:.25s"><span class="tag">{t["kind"]}</span><span class="tag">SKILL.md</span></div>
  </header>
  <div class="art-intro" data-r style="--d:.3s"><p>{desc}</p></div>
  <section class="skill-card" data-r>
    <div class="skill-card-bar"><span>SKILL.md</span><div><button type="button" class="cmd-copy" data-copy-target="skill-raw">{t["copy"]}</button><button type="button" class="cmd-copy skill-open">{t["raw"]}</button><a class="cmd-copy" href="/skills/{slug}/SKILL.md" download="{slug}-SKILL.md">{t["save"]}</a></div></div>
    <pre class="skill-fm"><code>---\n{html.escape(frontmatter)}\n---</code></pre>
    <div class="skill-doc">{body_html}</div>
  </section>
</article></div></main>
<textarea id="skill-raw" hidden>{raw_skill}</textarea>
<dialog class="skill-modal" id="skill-source" aria-label="{slug}">
  <div class="skill-modal-in">
    <div class="skill-modal-top"><strong>{slug}/SKILL.md</strong><button class="skill-close" type="button" data-skill-close>{t["close"]}</button></div>
    <pre><code>{raw_skill}</code></pre>
    <div class="skill-modal-actions"><a class="btn mint" href="/skills/{slug}/SKILL.md" download="{slug}-SKILL.md">{t["save"]}</a></div>
  </div>
</dialog>
<script>(function(){{var d=document.getElementById("skill-source");document.querySelector(".skill-open").addEventListener("click",function(){{d.showModal()}});document.querySelector("[data-skill-close]").addEventListener("click",function(){{d.close()}});d.addEventListener("click",function(e){{if(e.target===d)d.close()}});document.querySelectorAll("[data-copy-target]").forEach(function(b){{b.addEventListener("click",function(){{var el=document.getElementById(b.dataset.copyTarget);var txt=el.value!==undefined?el.value:el.textContent;navigator.clipboard.writeText(txt).then(function(){{var o=b.textContent;b.textContent="{t["copied"]}";setTimeout(function(){{b.textContent=o}},1400)}})}})}})}})();</script>''',
                cta=False,
                desc=desc,
            )
            if is_ru:
                target.joinpath("index.html").write_text(page, encoding="utf-8")
            else:
                en_target = en_skills / slug
                en_target.mkdir(parents=True, exist_ok=True)
                en_target.joinpath("index.html").write_text(page, encoding="utf-8")
    catalog = "\n".join(
        f"- [{en}]({slug}/SKILL.md) — {desc}"
        for slug, en, _, desc, _, _ in ALL_SKILLS
    )
    skills_dir.joinpath("README.md").write_text(
        "# Agent skills\n\n"
        "Portable instructions for design-engineering and AI-native design-system work. "
        "Copy an individual `SKILL.md` into an agent's skills directory.\n\n"
        + catalog + "\n",
        encoding="utf-8",
    )


def main() -> None:
    OUT.mkdir(exist_ok=True)
    (OUT / "en").mkdir(exist_ok=True)
    for lang in ("ru", "en"):
        ru = lang == "ru"
        who = "Андрей Антошкин" if ru else "Andrew Antoshkin"
        i = 0 if ru else 1

        def write(stem: str, title: str, active: str, inner: str, cta: bool = True, desc: str = "") -> None:
            page_html = shell(lang, title, active, stem, inner, cta, desc)
            (OUT / legacy_file_for(stem, lang)).write_text(page_html, encoding="utf-8")
            if not ru:
                en_name = "index.html" if stem == "home" else f"{stem}.html"
                (OUT / "en" / en_name).write_text(page_html, encoding="utf-8")

        write("home", f"{who} — Design Engineer", "home", home(lang))
        write("projects", f"{'Проекты' if ru else 'Projects'} — {who}", "projects", projects_page(lang), desc="Кейсы, инструменты, утилиты и скиллы на стыке дизайна, кода и AI." if ru else "Case studies, tools, utilities, and skills where design, code, and AI meet.")
        write("writing", f"{'Статьи' if ru else 'Writing'} — {who}", "writing", writing_page(lang), desc="Заметки о дизайне, системах и AI." if ru else "Notes on design, systems, and AI.")
        write("approach", f"{'Подход' if ru else 'Approach'} — {who}", "approach", approach_page(lang), desc="От неопределённости к работающему продукту: сценарии, прототипы, токены и код." if ru else "From ambiguity to shipping software: flows, prototypes, tokens, and production code.")
        write("collab", f"{'Сотрудничество' if ru else 'Collaboration'} — {who}", "collab", collab_page(lang), cta=False, desc="Контакты для связи: почта, GitHub, Telegram." if ru else "Contact details: email, GitHub, Telegram.")
        for p in PROJECTS:
            doc = load_doc(p["slug"], lang)
            write(p["slug"], f'{p["name"]} — {who}', "projects", project_page(p, lang), desc=doc["lead"] or p["desc"][i])
        for s in ORDER:
            a = article(s, lang)
            write(s, a["title"], "writing", article_page(s, lang), desc=a["tldr"])
    write_skills()
    publish_root()
    print("done")


def publish_root() -> None:
    """Copy the preview onto the repo root so the domain serves it."""
    for src in OUT.iterdir():
        if src.suffix in {".html", ".css", ".js"}:
            text = src.read_text(encoding="utf-8").replace("../assets/", "/assets/")
            (ROOT / src.name).write_text(text, encoding="utf-8")
        elif src.name == "en" and src.is_dir():
            dest = ROOT / "en"
            dest.mkdir(exist_ok=True)
            for en_file in src.glob("*.html"):
                (dest / en_file.name).write_text(en_file.read_text(encoding="utf-8"), encoding="utf-8")
            en_skills = src / "skills"
            if en_skills.exists():
                dest_skills = dest / "skills"
                if dest_skills.exists():
                    shutil.rmtree(dest_skills)
                shutil.copytree(en_skills, dest_skills)
        elif src.name == "img" and src.is_dir():
            dest = ROOT / "img"
            if dest.exists():
                shutil.rmtree(dest)
            shutil.copytree(src, dest)
        elif src.name == "skills" and src.is_dir():
            dest = ROOT / "skills"
            if dest.exists():
                shutil.rmtree(dest)
            shutil.copytree(src, dest)


if __name__ == "__main__":
    main()
