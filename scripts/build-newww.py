#!/usr/bin/env python3
"""Whole-site preview in the Refined (Framer) layout, generated into /newww."""
from __future__ import annotations

import json
import re
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
GH = "https://github.com/AndrewAntoshkin"

HEAD = """<!DOCTYPE html>
<html lang="{lang}" class="nojs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <script>document.documentElement.classList.remove('nojs')</script>
  <link rel="stylesheet" href="style.css">
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
CHECK = svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 18)
SVC_ICONS = [
    svg('<circle cx="12" cy="12" r="8"/><path d="M12 4v8l6 4M4.5 9 12 12 4.5 15"/>', 20),
    svg('<path d="M12 3 4 8v8l8 5 8-5V8l-8-5Z"/><path d="m4 8 8 5 8-5M12 13v8"/>', 20),
    svg('<rect x="3.5" y="5" width="17" height="11" rx="1.5"/><path d="M9 20h6M12 16v4"/>', 20),
    svg('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13"/>', 20),
]


def name_for(stem: str, lang: str) -> str:
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
        f'<div class="pcover {extra}"><div class="bg" style="background-image:url(img/gen/{key}.jpg)"></div>'
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
    ru_cur = ' aria-current="page"' if ru else ""
    en_cur = "" if ru else ' aria-current="page"'
    return (
        f'\n<div class="dock"><nav aria-label="{"Навигация" if ru else "Navigation"}"><i aria-hidden="true"></i>{links}</nav></div>\n'
        f'<nav class="langs" aria-label="Language"><a href="{name_for(stem, "ru")}"{ru_cur}>Ru</a><a href="{name_for(stem, "en")}"{en_cur}>En</a></nav>\n'
        f'<a class="float" href="{TG}" target="_blank" rel="noopener">{"Написать" if ru else "Say hello"}'
        f'{svg("<path d=\"M7 17 17 7M8 7h9v9\"/>", 16)}</a>\n'
    )


def sec_head(title: str, count: int | None = None, link: tuple[str, str] | None = None) -> str:
    c = f"<sup>({count})</sup>" if count is not None else ""
    a = f'<a href="{link[0]}">{link[1]}</a>' if link else ""
    return f'<div class="sec-head"><h2>{title}</h2>{c}<span class="rule"></span>{a}</div>'


def reveal(inner_tag: str, delay: float = 0) -> str:
    return f'{inner_tag[:-1]} data-r style="--d:{delay}s">' if delay else f'{inner_tag[:-1]} data-r>'


SOCIAL = (
    f'<a href="{TG}" target="_blank" rel="noopener" aria-label="Telegram">{svg("<path d=\"M21 4 3 11l5.5 2L10 19l3-4 4.5 3.5L21 4Z\"/><path d=\"m8.5 13 8-5\"/>", 20)}</a>'
    f'<a href="{GH}" target="_blank" rel="noopener" aria-label="GitHub">{svg("<path d=\"M9 19c-4 1.2-4-2-5.5-2.5M15 21v-3.5c0-1 .1-1.500-.5-2.200 2.800-.3 5.500-1.400 5.500-6a4.700 4.700 0 0 0-1.300-3.300 4.400 4.400 0 0 0-.1-3.300s-1-.3-3.400 1.300a11.700 11.700 0 0 0-6.200 0C6.600 2.900 5.600 3.200 5.600 3.200a4.400 4.400 0 0 0-.1 3.300A4.700 4.700 0 0 0 4.200 9.800c0 4.600 2.700 5.700 5.500 6-.6.700-.6 1.300-.6 2.200V21\"/>", 20)}</a>'
    f'<a href="mailto:andrew.antoshkin@gmail.com" aria-label="Email">{ICONS["mail"][:0]}{svg("<path d=\"M4 7.5h16v10H4v-10Z\"/><path d=\"m5 8 7 6 7-6\"/>", 20)}</a>'
)


def cta_and_footer(lang: str) -> str:
    ru = lang == "ru"
    if ru:
        badge, title, text = "Вместе", "Готовы сделать следующий шаг?", "Есть задача, которую хочется довести до работающего состояния? Напишите, и разберём, с чего начать."
        fields = ("Ваше имя", "Ваша почта", "Чем могу помочь?", "Отправить", "Сотрудничество")
        foot = ("Давайте сделаем", "что-нибудь настоящее.")
        copy, built = "© Андрей Антошкин, 2026", "Сделано вручную, без шаблонов"
        pages_t, projects_t, writing_t = "Страницы", "Проекты", "Статьи"
    else:
        badge, title, text = "Work together", "Are you ready to take the next step?", "Have a problem you want to ship? Write me and we will shape the next step together."
        fields = ("Your name", "Your email", "How can I help?", "Send a message", "Collaboration")
        foot = ("Let’s create something", "that actually ships.")
        copy, built = "© Andrew Antoshkin, 2026", "Built by hand, no templates"
        pages_t, projects_t, writing_t = "Pages", "Projects", "Writing"
    pages = [
        (name_for("home", lang), "Главная" if ru else "Home"),
        (name_for("projects", lang), projects_t),
        (name_for("writing", lang), writing_t),
        (name_for("approach", lang), "Подход" if ru else "Approach"),
        (name_for("collab", lang), "Сотрудничество" if ru else "Collaboration"),
    ]
    proj = [(name_for(p["slug"], lang), p["name"]) for p in PROJECTS[:5]]
    arts = [(name_for(s, lang), re.sub(r"&nbsp;|&#8209;", " ", article(s, lang)["title"]).split(":")[0]) for s in ORDER[:5]]

    def col(t, rows):
        return f"<div><p>{t}</p>{''.join(f'<a href=\"{h}\">{n}</a>' for h, n in rows)}</div>"

    return f'''
  <section class="cta" data-r>
    <div class="cta-grid">
      <div class="cta-card">
        <div class="shader" aria-hidden="true"><i></i><i></i><i></i></div>
        <span class="tag top">{badge}</span>
        <div class="mid"><h2>{title}</h2></div>
        <div class="bot"><p>{text}</p></div>
      </div>
      <form class="cta-form" data-subject="{fields[4]}">
        <input name="name" required placeholder="{fields[0]}" autocomplete="name">
        <input name="email" type="email" required placeholder="{fields[1]}" autocomplete="email">
        <textarea name="question" required placeholder="{fields[2]}"></textarea>
        <button type="submit">{fields[3]}</button>
      </form>
    </div>
  </section>
  <footer class="foot">
    <div class="foot-art" aria-hidden="true"><img src="img/gen/footer.jpg" alt=""></div>
    <div class="foot-in">
      <h2 data-r><span>{foot[0]}</span><br>{foot[1]}</h2>
      <div class="social" data-r style="--d:.1s">{SOCIAL}</div>
      <div class="cols">{col(pages_t, pages)}{col(projects_t, proj)}{col(writing_t, arts)}</div>
      <div class="legal"><span>{copy}</span><span>{built}</span></div>
    </div>
  </footer>
  <script src="motion.js"></script>
</body></html>
'''


def shell(lang: str, title: str, active: str, stem: str, inner: str) -> str:
    return HEAD.format(lang=lang, title=title) + chrome(lang, active, stem) + inner + cta_and_footer(lang)


# ── Shared blocks ───────────────────────────────────────────────────────────

def project_cards(lang: str, items: list[tuple[int, dict]]) -> str:
    i = 0 if lang == "ru" else 1
    out = []
    for n, (idx, p) in enumerate(items):
        out.append(
            f'<a class="pcard" href="{name_for(p["slug"], lang)}" data-r>'
            f'{cover(p["slug"], p["name"], p["kicker"][i])}'
            f'<div class="meta-row"><div><h3>{p["name"]}</h3><p>{p["desc"][i]}</p></div><span class="arrow-btn">{ARROW}</span></div></a>'
        )
    return f'<div class="plist">{"".join(out)}</div>'


def journal(lang: str, stems: list[str]) -> str:
    ru = lang == "ru"
    rows = []
    for n, s in enumerate(stems):
        a = article(s, lang)
        dot = '<span class="dot"></span>' if n == 0 else ""
        rows.append(
            f'<a class="jrow" href="{name_for(s, lang)}" data-r style="--d:{n * 0.05}s"><div class="jleft">'
            f'<div class="jtitle">{dot}{a["h1"]}</div>'
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
            img = f'<img src="../{c["src"]}" alt="{c.get("alt", "")}">'
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


def price_cards(lang: str, cards: list[dict]) -> str:
    ru = lang == "ru"
    out = []
    for n, c in enumerate(cards):
        lis = "".join(f"<li>{CHECK}<span>{x}</span></li>" for x in c["list"])
        out.append(
            f'<div class="price" data-r style="--d:{n * 0.08}s"><div class="price-in">'
            f'<div class="price-top"><span class="tag">{c["tag"]}</span><p>{c["text"]}</p></div>'
            f'<div class="price-num"><small>{"Стоимость" if ru else "Pricing"}</small><b>{"По запросу" if ru else "On request"}</b></div>'
            f'<a class="btn mint" href="{TG}" target="_blank" rel="noopener">{"Обсудить" if ru else "Start a conversation"}</a>'
            f'<ul class="checks">{lis}</ul></div></div>'
        )
    return f'<div class="cards2">{"".join(out)}</div>'


def collab_data(lang: str) -> tuple[list[dict], list[tuple[str, str]]]:
    if lang == "ru":
        cards = [
            {"tag": "Команды", "text": "Для команд, которые хотят встроить AI в дизайн-процесс и не потерять качество.",
             "list": ["Воркшопы по AI в дизайне", "Настройка design-to-code флоу с Cursor и Figma", "Аудит дизайн-системы и roadmap улучшений"]},
            {"tag": "Дизайнеры", "text": "Для дизайнеров и руководителей дизайн-систем, которые растут в сторону Design Engineering.",
             "list": ["Менторство для дизайнеров", "Менторство для design system leads", "Разбор процессов и инструментов вашей команды"]},
        ]
        faqs = [
            ("С чего начать?", "Напишите на почту или в Telegram с кратким описанием задачи: продукт, размер команды, что болит. Я предложу формат и следующий шаг."),
            ("Работаете удалённо?", "Да. Воркшопы и менторство — онлайн или очно в Москве, если нужно очно."),
            ("Только дизайн-системы?", "Фокус на системной работе: DS, токены, tooling, AI-процессы. Разовые макеты без системного контекста — не мой формат."),
            ("Кто такой Design Engineer?", "Это специалист, который работает со всем процессом: от идеи и интерфейса до спецификации, реализации и инструментов команды."),
        ]
    else:
        cards = [
            {"tag": "Teams", "text": "For teams that want to bring AI into the design process without losing quality.",
             "list": ["AI workshops for design teams", "Design-to-code workflows with Cursor and Figma", "Design system audits and improvement roadmaps"]},
            {"tag": "Designers", "text": "For designers and design system leads growing toward Design Engineering.",
             "list": ["Mentoring for designers", "Mentoring for design system leads", "A review of your team’s processes and tooling"]},
        ]
        faqs = [
            ("Where do we start?", "Email me or message me on Telegram with a short description of the product, team, and challenge. I will suggest a format and next step."),
            ("Do you work remotely?", "Yes. Workshops and mentoring can be remote or in person in Moscow."),
            ("Only design systems?", "My focus is systemic work: design systems, tokens, tooling, and AI workflows. One-off mockups without a system context are not my format."),
            ("What is a Design Engineer?", "Someone who works across the whole process: from an idea and an interface to specification, implementation, and team tooling."),
        ]
    return cards, faqs


# ── Pages ───────────────────────────────────────────────────────────────────

def home(lang: str) -> str:
    ru = lang == "ru"
    if ru:
        tags = ["Дизайн-системы", "Figma", "Cursor", "AI-агенты"]
        h1a, h1b = "Андрей Антошкин,", "Design Engineer."
        sub = "Соединяю дизайн и разработку: создаю дизайн-системы, инструменты и код, с которыми команда работает из одной спецификации."
        b1, b2 = "Смотреть проекты", "Написать"
        s_proj, s_how, s_art, s_exp, s_collab, s_faq, s_all = "Проекты", "Как я работаю", "Статьи", "Опыт", "Сотрудничество", "Частые вопросы", "Все"
        steps = [
            ("Системы", "Развиваю дизайн-систему Яндекс HR Tech: компоненты, токены, документацию и код."),
            ("Инструменты", "Собираю инфраструктуру для AI-native дизайн-систем: контекст для агента, починка интерфейса, измерение качества."),
            ("AI и код", "Проектирую в Figma, пишу код и строю инструменты, которые помогают агентам читать дизайн-систему."),
            ("Процесс", "Работаю со всем процессом: от идеи и интерфейса до спецификации, реализации и инструментов команды."),
        ]
        voices = [
            ("../assets/logos/yandex.svg", "Яндекс HR Tech", "Product Designer — Design Systems · Сейчас", "Развиваю дизайн-систему: компоненты, токены, документацию и код."),
            ("../assets/logos/sber-icon.svg", "Сбер", "Design System Lead · 2021 — 2025", "Вёл работу над дизайн-системами: от компонентов до правил их использования."),
            ("../assets/logos/otkritie-icon.svg", "Открытие Брокер", "Senior Product Designer · 2020 — 2021", "Проектировал продукты брокера для частных инвесторов."),
            ("../assets/logos/mts-icon.svg", "МТС", "Product Designer · 2019 — 2020", "Проектировал продукты и интерфейсы в МТС."),
        ]
    else:
        tags = ["Design systems", "Figma", "Cursor", "AI agents"]
        h1a, h1b = "Andrew Antoshkin,", "Design Engineer."
        sub = "I connect design and engineering by building design systems, tools, and code that let teams work from a shared specification."
        b1, b2 = "See projects", "Say hello"
        s_proj, s_how, s_art, s_exp, s_collab, s_faq, s_all = "Projects", "How I work", "Writing", "Experience", "Collaboration", "Most asked questions", "See all"
        steps = [
            ("Systems", "I develop the Yandex HR Tech design system: components, tokens, documentation, and code."),
            ("Tools", "I build infrastructure for AI-native design systems: agent context, interface repair, and quality measurement."),
            ("AI and code", "I design in Figma, write code, and build tools that help agents read a design system."),
            ("Process", "I work across the whole process: from an idea and an interface to specification, implementation, and team tooling."),
        ]
        voices = [
            ("../assets/logos/yandex.svg", "Yandex HR Tech", "Product Designer — Design Systems · Now", "Developing the design system: components, tokens, documentation, and code."),
            ("../assets/logos/sber-icon.svg", "Sber", "Design System Lead · 2021 — 2025", "Led work on design systems, from components to the rules for using them."),
            ("../assets/logos/otkritie-icon.svg", "Otkritie Broker", "Senior Product Designer · 2020 — 2021", "Designed brokerage products for private investors."),
            ("../assets/logos/mts-icon.svg", "MTS", "Product Designer · 2019 — 2020", "Designed products and interfaces at MTS."),
        ]
    tag_html = "".join(f'<span class="tag w-tag">{t}</span>' for t in tags)
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
    cards, faqs = collab_data(lang)
    top_projects = list(enumerate(PROJECTS))[:2]
    return f'''
<main><div class="col">
  <header class="hero">
    <div class="tags" style="justify-content:center">{tag_html}</div>
    <h1 data-split><span class="dim">{h1a}</span><br>{h1b}</h1>
    <p class="sub" data-r style="--d:.35s">{sub}</p>
    <div class="actions" data-r style="--d:.45s"><a class="btn mint" href="{name_for("projects", lang)}">{b1}</a><a class="btn dark" href="{TG}" target="_blank" rel="noopener">{b2}</a></div>
    <div class="hero-art" data-r style="--d:.6s"><img src="img/gen/hero.jpg" alt="" data-parallax></div>
  </header>
  <section class="stack">{sec_head(s_proj, len(PROJECTS), (name_for("projects", lang), s_all))}{project_cards(lang, top_projects)}</section>
  <section class="stack">{sec_head(s_how, len(steps))}<div class="cards2">{svc}</div></section>
  <div class="ticker" data-r aria-hidden="true"><div class="ticker-track">{tk}</div></div>
  <section class="stack">{sec_head(s_art, len(ORDER), (name_for("writing", lang), s_all))}{journal(lang, ORDER[:4])}</section>
  <section class="stack">{sec_head(s_exp, len(voices))}<div class="voices">{vgrid}</div></section>
  <section class="stack">{sec_head(s_collab, len(cards), (name_for("collab", lang), s_all))}{price_cards(lang, cards)}</section>
  <section class="stack">{sec_head(s_faq, len(faqs))}{faq_block(faqs)}</section>
</div></main>
'''


def page_head(title: str, sub: str = "", back: str = "") -> str:
    s = f'<p class="sub" data-r style="--d:.3s">{sub}</p>' if sub else ""
    return f'<header class="page-head"><h1 data-split>{title}</h1>{s}</header>'


def projects_page(lang: str) -> str:
    ru = lang == "ru"
    sub = ("Open-source инструменты для AI-native дизайн-систем: контекст, починка, измерение и сравнение промптов." if ru
           else "Open-source tools for AI-native design systems: context, repair, measurement, and prompt comparison.")
    return f'<main><div class="col">{page_head("Проекты" if ru else "Projects", sub)}<section class="stack">{sec_head("Все проекты" if ru else "All projects", len(PROJECTS))}{project_cards(lang, list(enumerate(PROJECTS)))}</section></div></main>'


def writing_page(lang: str) -> str:
    ru = lang == "ru"
    sub = "Заметки о дизайне, системах и AI." if ru else "Notes on design, systems, and AI."
    return (
        f'<main><div class="col">{page_head("Статьи" if ru else "Writing", sub)}'
        f'<section class="stack">{sec_head("Свежее" if ru else "Latest", 2)}{article_cards(lang, ORDER[:2])}</section>'
        f'<section class="stack">{sec_head("Все статьи" if ru else "All articles", len(ORDER))}{journal(lang, ORDER)}</section></div></main>'
    )


def approach_page(lang: str) -> str:
    if lang == "ru":
        title = "От неопределённости к работающему продукту."
        sub = "Подключаюсь там, где сложную продуктовую задачу нужно превратить в работающую систему: разбираюсь в контексте, формулирую принципы, собираю прототип и связываю дизайн, разработку и AI в единый процесс."
        quote = "Я не заканчиваю работу на макете. Мне важно, чтобы решение дошло до пользователя и стало частью устойчивого процесса команды."
        rows = [
            ("Модель продукта", "Проблема, сценарии, ограничения и критерии результата — до того, как команда начнёт рисовать и разрабатывать."),
            ("Рабочий прототип", "Ключевые сценарии в Figma или коде, на которых можно быстро проверить решение и снять риски."),
            ("Единая спецификация", "Состояния, компоненты, токены и правила, одинаково понятные дизайнерам, разработчикам и AI-агентам."),
            ("Система в продакшене", "Код, автоматизация, QA и метрики, которые помогают решению доехать до пользователя и масштабироваться."),
        ]
        label = "Главные артефакты"
        cta_t = "Обсудить задачу"
    else:
        title = "From ambiguity to production."
        sub = "I join when a complex product problem needs to become a working system: I study the context, define principles, build a prototype, and connect design, engineering, and AI into one process."
        quote = "My work does not end with a mockup. I want the solution to reach users and become part of a sustainable team process."
        rows = [
            ("Product model", "The problem, scenarios, constraints, and success criteria — before the team starts designing and building."),
            ("Working prototype", "Key scenarios in Figma or code that help validate the solution quickly and reduce risk."),
            ("Shared specification", "States, components, tokens, and rules understood by designers, developers, and AI agents alike."),
            ("Production system", "Code, automation, QA, and metrics that help the solution reach users and scale."),
        ]
        label = "Core artifacts"
        cta_t = "Discuss a task"
    svc = "".join(
        f'<div class="svc" data-r style="--d:{n * 0.06}s"><div class="svc-in"><div class="svc-top"><span class="svc-n">0{n + 1}.</span><span class="ico">{SVC_ICONS[n]}</span></div>'
        f'<div><h3>{h}</h3><p>{p}</p></div></div></div>'
        for n, (h, p) in enumerate(rows)
    )
    return (
        f'<main><div class="col">{page_head(title, sub)}'
        f'<div class="art-intro" data-r><p>{quote}</p><div class="actions" style="justify-content:flex-start"><a class="btn mint" href="{TG}" target="_blank" rel="noopener">{cta_t}</a></div></div>'
        f'<section class="stack">{sec_head(label, len(rows))}<div class="cards2">{svc}</div></section></div></main>'
    )


def collab_page(lang: str) -> str:
    ru = lang == "ru"
    title = "Менторство, воркшопы и консалтинг." if ru else "Mentoring, workshops and consulting."
    sub = ("Помогаю командам выстроить дизайн-системы, внедрить AI в дизайн-процесс и сократить разрыв между Figma и кодом." if ru
           else "I help teams build design systems, introduce AI into design workflows, and close the gap between Figma and code.")
    cards, faqs = collab_data(lang)
    return (
        f'<main><div class="col">{page_head(title, sub)}'
        f'<section class="stack">{sec_head("Форматы" if ru else "Formats", len(cards))}{price_cards(lang, cards)}</section>'
        f'<section class="stack">{sec_head("Частые вопросы" if ru else "Most asked questions", len(faqs))}{faq_block(faqs)}</section></div></main>'
    )


def project_page(project: dict, lang: str) -> str:
    ru = lang == "ru"
    i = 0 if ru else 1
    idx = PROJECTS.index(project)
    doc = load_doc(project["slug"], lang)
    lead = doc["lead"] or project["desc"][i]
    gh = project.get("github") or ""
    link = f'<a class="btn mint" href="{gh}" target="_blank" rel="noopener">{project["github_label"][i]}</a>' if gh else ""
    return f'''<main><div class="col"><article class="art">
  <header class="art-top">
    <a class="back" href="{name_for("projects", lang)}" data-r>‹ {"Назад" if ru else "Back"}</a>
    <h1 data-split>{project["name"]}</h1>
    <div class="tags" data-r style="--d:.25s"><span class="tag">{project["kicker"][i]}</span><span class="tag">open source</span></div>
  </header>
  <div class="art-intro" data-r style="--d:.3s"><p>{lead}</p><div class="actions" style="justify-content:flex-start">{link}</div></div>
  <div class="prose">{cover(project["slug"], project["name"])}{doc["body"]}</div>
</article></div></main>'''


def article_page(stem: str, lang: str) -> str:
    ru = lang == "ru"
    a = article(stem, lang)
    c = a.get("cover")
    if c:
        img = f'<img src="../{c["src"]}" alt="{c.get("alt", "")}">'
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


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for lang in ("ru", "en"):
        ru = lang == "ru"
        who = "Андрей Антошкин" if ru else "Andrew Antoshkin"

        def write(stem: str, title: str, active: str, inner: str) -> None:
            (OUT / name_for(stem, lang)).write_text(shell(lang, title, active, stem, inner), encoding="utf-8")

        write("home", f"{who} — Design Engineer", "home", home(lang))
        write("projects", f"{'Проекты' if ru else 'Projects'} — {who}", "projects", projects_page(lang))
        write("writing", f"{'Статьи' if ru else 'Writing'} — {who}", "writing", writing_page(lang))
        write("approach", f"{'Подход' if ru else 'Approach'} — {who}", "approach", approach_page(lang))
        write("collab", f"{'Сотрудничество' if ru else 'Collaboration'} — {who}", "collab", collab_page(lang))
        for p in PROJECTS:
            write(p["slug"], f'{p["name"]} — {who}', "projects", project_page(p, lang))
        for s in ORDER:
            write(s, article(s, lang)["title"], "writing", article_page(s, lang))
    print("done")


if __name__ == "__main__":
    main()
