#!/usr/bin/env python3
"""Generate wireframe-style static pages for antoshkin.tech."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from project_docs import load_doc
from project_pages import PROJECTS, href as project_href, list_blocks, project_nav

ROOT = Path(__file__).resolve().parents[1]
ARTICLES_DIR = ROOT / "content" / "articles"
ARTICLE_ORDER = ["apres-prompt", "ai-changes-processes", "halo-working-memory", "cursor-figma", "design-md", "dev-for-designers"]

_RU_SHORT = "янв фев мар апр май июн июл авг сен окт ноя дек".split()
_RU_GEN = "января февраля марта апреля мая июня июля августа сентября октября ноября декабря".split()
_RU_NOM = "январь февраль март апрель май июнь июль август сентябрь октябрь ноябрь декабрь".split()
_EN_SHORT = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
_EN_FULL = "January February March April May June July August September October November December".split()


def format_article_date(iso: str, lang: str, *, full: bool = False) -> str:
    year, month, *rest = iso.split("-")
    index = int(month) - 1
    day = int(rest[0]) if rest else None
    if lang == "ru":
        if day and full:
            return f"{day}&nbsp;{_RU_GEN[index]} {year}"
        if day:
            return f"{day} {_RU_SHORT[index]} {year}"
        return f"{_RU_NOM[index]} {year}" if full else f"{_RU_SHORT[index]} {year}"
    if day and full:
        return f"{_EN_FULL[index]}&nbsp;{day}, {year}"
    if day:
        return f"{_EN_SHORT[index]} {day}, {year}"
    return f"{_EN_FULL[index]} {year}" if full else f"{_EN_SHORT[index]} {year}"


def article_date_html(iso: str, lang: str, *, full: bool = False) -> str:
    if not iso:
        return ""
    label = format_article_date(iso, lang, full=full)
    return f'<time class="article-date" datetime="{iso}">{label}</time>'

NAV_RU = [
    ("index.html", "home", "Главная"),
    ("projects.html", "projects", "Проекты"),
    ("writing.html", "writing", "Статьи"),
    ("approach.html", "approach", "Подход"),
    ("collab.html", "collab", "Сотрудничество"),
]
NAV_EN = [
    ("en.html", "home", "Home"),
    ("projects-en.html", "projects", "Projects"),
    ("writing-en.html", "writing", "Writing"),
    ("approach-en.html", "approach", "Approach"),
    ("collab-en.html", "collab", "Work together"),
]

LOGO = '''<img class="logo logo-photo wf-target" src="assets/avatar.png" alt="Andrew Antoshkin" width="32" height="32">'''

CAREER = [
    ("yandex.svg", "yandex", "Яндекс", "Product Designer — Design Systems", "Сейчас", 120),
    ("sber-icon.svg", "sber", "Сбер", "Design System Lead", "2021 — 2025", 150),
    ("otkritie-icon.svg", "otkritie", "Открытие Брокер", "Senior Product Designer", "2020 — 2021", 180),
    ("mts-icon.svg", "mts", "МТС", "Product Designer", "2019 — 2020", 210),
]


def career_list_html(*, timeline: bool = False, lang: str = "ru") -> str:
    rows = []
    for i, (logo, slug, company, role, date, fold) in enumerate(CAREER):
        if lang == "en":
            company = {"Яндекс": "Yandex", "Сбер": "Sber", "Открытие Брокер": "Otkritie Broker", "МТС": "MTS"}[company]
            date = "Present" if date == "Сейчас" else date
        rhythm = ''
        if timeline and i > 0:
            rhythm = '<span class="rhythm" aria-hidden="true"><b>24 px</b></span>'
        logo_annot = ''
        if timeline and i == 0:
            logo_annot = (
                '<span class="annot annot--logo" aria-hidden="true">'
                '48 × 48<i class="tick tick--left" style="--len: 14px"></i></span>'
            )
        rows.append(
            f'<div class="career-row fold" data-fold="{fold}">'
            f'{rhythm}'
            f'<div class="career-left">'
            f'<div class="career-logo career-logo--{slug}">'
            f'{logo_annot}'
            f'<img class="career-logo__mark" src="assets/logos/{logo}" alt="" width="48" height="48" loading="lazy">'
            f'</div>'
            f'<div><div class="career-company">{company}</div><div class="career-role">{role}</div></div>'
            f'</div><div class="career-date">{date}</div></div>'
        )
    if timeline:
        rows.append(
            '<span class="annot annot--span" id="careerSpan" aria-hidden="true">'
            '<b>&mdash;</b><i class="tick tick--right" style="--len: 14px"></i></span>'
        )
    return "\n                    ".join(rows)


def nav_links(active: str, lang: str) -> str:
    nav = NAV_RU if lang == "ru" else NAV_EN
    items = []
    for href, key, label in nav:
        cls = "nav-link active" if key == active else "nav-link"
        items.append(f'<a class="{cls}" href="{href}">{label}</a>')
    return "\n                ".join(items)


def mobile_links(lang: str) -> str:
    nav = NAV_RU if lang == "ru" else NAV_EN
    home = "index.html" if lang == "ru" else "en.html"
    return "\n                ".join(
        f'<a href="{href}">{label}</a>' for href, _, label in nav if href != home
    )


def shell(
    *,
    active: str,
    title: str,
    description: str,
    content: str,
    back: str | None = None,
    content_class: str = "",
    og_type: str = "website",
    lang: str = "ru",
    counterpart: str | None = None,
    project_menu: dict | None = None,
) -> str:
    is_ru = lang == "ru"
    home_href = "index.html" if is_ru else "en.html"
    home_label = "На главную" if is_ru else "Home"
    contact_label = "Для связи:" if is_ru else "Contact:"
    copied_label = "Скопировано" if is_ru else "Copied"
    menu_label = "Меню" if is_ru else "Menu"
    language_label = "Язык" if is_ru else "Language"
    theme_label = "Тема" if is_ru else "Theme"
    theme_aria = "Переключить тему" if is_ru else "Toggle theme"
    channel_label = "Канал в" if is_ru else "Channel"
    setka_label = "Сетка" if is_ru else "Setka"
    language_switch = ""
    if counterpart:
        if is_ru:
            language_switch = f'<nav class="language-switch" aria-label="Language"><span aria-current="page">Ru</span><a href="{counterpart}">En</a></nav>'
        else:
            language_switch = f'<nav class="language-switch" aria-label="Language"><a href="{counterpart}">Ru</a><span aria-current="page">En</span></nav>'
    arrow = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    back_html = ""
    if back and not project_menu:
        back_html = f'''
                <a class="back-link back-link--inline fold wf-target" data-fold="60" href="{back["href"]}">
                    {arrow}
                    {back["label"]}
                </a>'''
    menu_block = ""
    mobile_project = ""
    nav_class = "top-nav fold"
    if project_menu:
        nav_class = "top-nav top-nav--project fold"
        groups = []
        mobile_groups = []
        for group in project_menu["groups"]:
            links = []
            for item in group["items"]:
                external = item["href"].startswith("http")
                attrs = ' target="_blank" rel="noopener noreferrer"' if external else ""
                links.append(f'<a class="nav-link" href="{item["href"]}"{attrs}>{item["label"]}</a>')
            block = f'<p class="project-nav-label">{group["label"]}</p>' + "".join(links)
            groups.append(block)
            mobile_groups.append(block)
        menu_block = f'''
            <a class="project-back" href="{project_menu["back_href"]}">{arrow}{project_menu["back_label"]}</a>
            <p class="project-nav-name">{project_menu["name"]}</p>
            {"".join(groups)}'''
        mobile_project = f'''
                <a class="project-back" href="{project_menu["back_href"]}">{arrow}{project_menu["back_label"]}</a>
                <p class="project-nav-name">{project_menu["name"]}</p>
                {"".join(mobile_groups)}
                <hr>'''

    cc = "content"
    if content_class:
        cc += f" {content_class}"

    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <meta name="theme-color" content="#FDFDFC" id="themeColorMeta">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:type" content="{og_type}">
    <link rel="icon" type="image/svg+xml" href="assets/antoshkin-tech-logo.svg">
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
    <link rel="stylesheet" href="assets/wireframe.css">
    <link rel="stylesheet" href="assets/guides.css">
    <script>
        try {{
            if (localStorage.getItem('theme') === 'dark') document.documentElement.dataset.theme = 'dark';
        }} catch (e) {{}}
    </script>
</head>
<body data-guides="false">
    <div class="page{' page--project' if project_menu else ''}">
        <div class="border-strip border-strip--left" aria-hidden="true"></div>
        <div class="border-strip border-strip--right" aria-hidden="true"></div>
        <div class="grid-line grid-line--nav" aria-hidden="true"></div>
        <div class="grid-line grid-line--content-l" aria-hidden="true"></div>
        <div class="grid-line grid-line--content-r" aria-hidden="true"></div>
        <div class="grid-line grid-line--shell-r" aria-hidden="true"></div>

        <nav class="{nav_class}" data-fold="50" {"aria-label='" + project_menu["name"] + "'" if project_menu else ""}>
            {menu_block if project_menu else f'<a href="{home_href}" aria-label="{home_label}">{LOGO}</a><div class="nav-links">{nav_links(active, lang)}</div>'}
        </nav>

        <div class="nav-contact fold" data-fold="80">
            <p class="nav-contact-label">{contact_label}</p>
            <span>
                <a href="mailto:andrew.antoshkin@gmail.com" class="nav-contact-email wf-target" data-copy="andrew.antoshkin@gmail.com">
                    andrew.antoshkin@gmail.com
                    <span class="copied" hidden>{copied_label}</span>
                </a>
            </span>
        </div>

        <div class="mobile-wrap">
            <button class="mobile-pill" type="button" aria-expanded="false" aria-label="{menu_label}">
                <span class="pill-icon"><span class="pill-bar"></span><span class="pill-bar"></span></span>
                <span>{menu_label}</span>
            </button>
            <div class="mobile-menu{' mobile-menu--project' if project_menu else ''}" hidden>
                {mobile_project if project_menu else f'<a href="{home_href}">{"Главная" if is_ru else "Home"}</a>{mobile_links(lang)}<hr>'}
                <div class="compact-controls">
                    <button class="theme-icon-button wf-target" type="button" data-theme-toggle aria-pressed="false" aria-label="{theme_aria}">
                        <span class="theme-symbol theme-symbol--sun" aria-hidden="true"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.4 1.4M11.55 11.55l1.4 1.4M12.95 3.05l-1.4 1.4M4.45 11.55l-1.4 1.4"/></svg></span>
                        <span class="theme-symbol theme-symbol--moon" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M12.8 10.3A5.5 5.5 0 0 1 5.7 3.2 5.5 5.5 0 1 0 12.8 10.3Z"/></svg></span>
                    </button>
                    {language_switch}
                </div>
                <a href="mailto:andrew.antoshkin@gmail.com">andrew.antoshkin@gmail.com</a>
            </div>
        </div>

        <main class="main">
            <div class="main-toggles">
                <button class="theme-icon-button wf-target" type="button" data-theme-toggle aria-pressed="false" aria-label="{theme_aria}">
                    <span class="theme-symbol theme-symbol--sun" aria-hidden="true"><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.4 1.4M11.55 11.55l1.4 1.4M12.95 3.05l-1.4 1.4M4.45 11.55l-1.4 1.4"/></svg></span>
                    <span class="theme-symbol theme-symbol--moon" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M12.8 10.3A5.5 5.5 0 0 1 5.7 3.2 5.5 5.5 0 1 0 12.8 10.3Z"/></svg></span>
                </button>
                {language_switch}
            </div>
            <div class="follow-right fold" data-fold="120">
                <div class="nav-divider"></div>
                <div class="social-links">
                    <a class="nav-link follow-link wf-target" href="https://t.me/aiantoshkin" target="_blank" rel="noopener noreferrer">
                        Telegram
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m13.7 2.8-2 9.5c-.15.67-.55.83-1.1.52L7.55 10.6l-1.47 1.42c-.16.16-.3.3-.62.3l.22-3.1 5.64-5.1c.25-.21-.05-.33-.38-.12L3.97 8.4l-3-.94c-.65-.2-.66-.65.14-.96l11.72-4.52c.54-.2 1.02.13.87.82Z" fill="currentColor"/></svg>
                    </a>
                    <a class="nav-link follow-link wf-target" href="https://github.com/AndrewAntoshkin" target="_blank" rel="noopener noreferrer">
                        GitHub
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path fill="currentColor" d="M8 1.35a6.65 6.65 0 0 0-2.1 12.96c.33.06.45-.14.45-.32v-1.16c-1.84.4-2.23-.78-2.23-.78-.3-.76-.74-.96-.74-.96-.6-.42.05-.41.05-.41.67.05 1.02.69 1.02.69.6 1.02 1.56.72 1.94.55.06-.43.23-.72.42-.89-1.47-.17-3.02-.74-3.02-3.29 0-.73.26-1.32.69-1.78-.07-.17-.3-.85.07-1.76 0 0 .56-.18 1.83.68A6.36 6.36 0 0 1 8 4.8c.56 0 1.12.08 1.64.22 1.27-.86 1.83-.68 1.83-.68.37.91.14 1.59.07 1.76.43.46.69 1.05.69 1.78 0 2.56-1.56 3.12-3.03 3.29.24.2.45.61.45 1.24V14c0 .18.12.39.45.32A6.65 6.65 0 0 0 8 1.35Z"/></svg>
                    </a>
                    <a class="nav-link follow-link wf-target" href="https://setka.ru/users/84b42bc4-44b4-4b1e-ba76-06d249242bc4" target="_blank" rel="noopener noreferrer">
                        {setka_label}
                        <img class="social-icon" src="https://cdn-assets.setka.ru/setka-web/static/favicon/favicon-32x32.a8036291d4eac4cc9ab8cbc378cb6d17.png" alt="" width="16" height="16">
                    </a>
                </div>
            </div>

            <div class="{cc}">
                {back_html}
                {content}
            </div>
        </main>

        <div class="crosshair" aria-hidden="true">
            <div class="crosshair-h"></div>
            <div class="crosshair-v"></div>
            <div class="crosshair-coords">0 · 0</div>
        </div>
        <div class="bottom-fade" aria-hidden="true"></div>
    </div>
    <script src="assets/wireframe.js"></script>
</body>
</html>
'''


def write(name: str, html: str) -> None:
    path = ROOT / name
    path.write_text(html, encoding="utf-8")
    print("wrote", path)


def write_redirect(name: str, target: str, lang: str) -> None:
    label = "Перейти на главную" if lang == "ru" else "Go to homepage"
    write(name, f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url={target}">
    <link rel="canonical" href="{target}">
    <title>{label}</title>
</head>
<body><a href="{target}">{label}</a></body>
</html>
''')


def home_content() -> str:
    return f'''
                <div class="col-measure" aria-hidden="true"><span id="colWidth">—</span></div>

                <div class="hero">
                    <h1 class="hero-title">
                        <span class="t-line enter" style="--i: 1">Андрей&nbsp;Антошкин<span class="annot annot--x" aria-hidden="true">x-height<i class="tick tick--end" style="--len: 28px"></i></span></span>
                        <span class="serif enter" style="--i: 2"><span class="ink">Design <span class="sel">Engineer<i class="handle h-tl"></i><i class="handle h-tr"></i><i class="handle h-bl"></i><i class="handle h-br"></i><span class="annot annot--size" id="selSize" aria-hidden="true">&mdash;</span></span><span class="annot annot--color" id="selColor" aria-hidden="true"><i class="swatch" style="background: var(--text-secondary)"></i>&mdash;<i class="tick tick--left" style="--len: 16px"></i></span></span><span class="annot annot--font" aria-hidden="true">old-standard-italic<i class="tick tick--right" style="--len: 16px"></i></span></span>
                    </h1>

                    <div class="hero-intro">
                        <p class="enter" style="--i: 3">Соединяю дизайн и&nbsp;разработку: создаю дизайн&#8209;системы, инструменты и&nbsp;код, с&nbsp;которыми команда работает из&nbsp;одной спецификации.</p>
                        <p class="enter" style="--i: 4">Сейчас развиваю дизайн&#8209;систему Яндекс HR&nbsp;Tech и&nbsp;создаю open&#8209;source инструменты для дизайнеров и&nbsp;разработчиков.</p>
                    </div>

                    <div class="cta-row enter" style="--i: 5">
                        <a class="btn btn--primary" href="#positioning">Как я работаю</a>
                        <a class="btn btn--ghost" href="https://t.me/andrewaitken" target="_blank" rel="noopener">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                            Написать
                        </a>
                        <span class="annot annot--cta" aria-hidden="true">call to action<i class="tick tick--right" style="--len: 33px"></i></span>
                        <span class="cta-frame" aria-hidden="true"></span>
                        <span class="cta-gap" aria-hidden="true"><b>32 px</b></span>
                    </div>
                </div>

                <hr class="divider">

                <section class="guide-section positioning-section fold" id="positioning" data-fold="100">
                    <div class="section-head">
                        <h2 class="section-label">Что для меня значит Design Engineer</h2>
                        <span class="annot annot--gutter" aria-hidden="true">positioning/01</span>
                        <span class="annot annot--right" aria-hidden="true">design × engineering</span>
                    </div>
                    <p class="positioning-lead">Проектирую не&nbsp;только интерфейсы, но&nbsp;и&nbsp;то, как команда их&nbsp;создаёт&nbsp;— через дизайн&#8209;системы, код и&nbsp;автоматизацию.</p>
                    <div class="positioning-grid">
                        <article class="positioning-block">
                            <span class="positioning-kicker">Системы</span>
                            <p>Развиваю дизайн&#8209;систему <a class="about-link" href="https://yandex.ru" target="_blank" rel="noopener">Яндекс HR&nbsp;Tech</a>: компоненты, токены, документацию и&nbsp;код. Ранее занимался системами в&nbsp;<a class="about-link" href="https://www.sber.ru" target="_blank" rel="noopener">Сбере</a> и&nbsp;продуктами в&nbsp;«Открытии Брокер» и&nbsp;МТС.</p>
                        </article>
                        <article class="positioning-block">
                            <span class="positioning-kicker">Инструменты</span>
                            <p>Собираю инфраструктуру для AI&#8209;native дизайн&#8209;систем: {chain_sentence("ru")}.</p>
                        </article>
                        <article class="positioning-block">
                            <span class="positioning-kicker">AI и&nbsp;код</span>
                            <p>Проектирую в&nbsp;Figma, пишу код и&nbsp;строю инструменты, которые помогают агентам читать дизайн&#8209;систему, собирать по&nbsp;ней интерфейс и&nbsp;проверять, что они не&nbsp;выдумали своё.</p>
                        </article>
                        <article class="positioning-block">
                            <span class="positioning-kicker">Процесс</span>
                            <p>Design Engineer для меня&nbsp;— работа со&nbsp;всем процессом: от&nbsp;идеи и&nbsp;интерфейса до&nbsp;спецификации, реализации и&nbsp;инструментов команды.</p>
                        </article>
                    </div>
                    <p class="positioning-outro">Интересны AI, дизайн&#8209;системы или продуктовая разработка? Напишите мне в&nbsp;<a class="about-link" href="https://t.me/andrewaitken" target="_blank" rel="noopener">Telegram</a> или на&nbsp;<a class="about-link" href="mailto:andrew.antoshkin@gmail.com">почту</a>.</p>
                </section>

                <hr class="divider">

                <section class="guide-section career-section fold" data-fold="100">
                    <div class="section-head">
                        <h2 class="section-label">Опыт</h2>
                        <span class="annot annot--gutter" aria-hidden="true">section/02</span>
                        <span class="annot annot--right" aria-hidden="true">timeline</span>
                    </div>
                    <div class="career-list career-list--timeline">
                        {career_list_html(timeline=True)}
                    </div>
                </section>
'''


def about_content() -> str:
    return f'''
                <h1 class="title fold" data-fold="100">Обо мне</h1>
                <div class="about-prose fold" data-fold="120">
                    <p class="about-text about-lead">Привет.<br>Я&nbsp;&mdash; Андрей Антошкин, дизайнер. Создаю продукты, дизайн&#8209;системы и&nbsp;инструменты, которые связывают дизайн и&nbsp;код.</p>
                    <p class="about-text">Мне интересно не&nbsp;просто проектировать интерфейсы, а&nbsp;влиять на&nbsp;то, как они создаются: через дизайн&#8209;системы, инструменты, код и&nbsp;автоматизацию. Особенно сейчас, когда AI меняет не&nbsp;только отдельные задачи, но&nbsp;и&nbsp;сам процесс работы над продуктом.</p>
                    <p class="about-text">Параллельно собираю инфраструктуру для AI&#8209;native дизайн&#8209;систем: {chain_sentence("ru")}. Рядом остаются инструменты спецификации и&nbsp;контроля на&nbsp;проде.</p>
                    <p class="about-text">Большую часть карьеры я&nbsp;решаю системные задачи в&nbsp;продуктовых командах. Мне интересно не&nbsp;только проектировать интерфейсы, но&nbsp;и&nbsp;улучшать процесс их&nbsp;создания&nbsp;&mdash; с&nbsp;помощью дизайн&#8209;систем, кода, AI и&nbsp;автоматизации.</p>
                    <p class="about-text">Сейчас развиваю дизайн&#8209;систему в&nbsp;<a class="about-link" href="https://yandex.ru" target="_blank" rel="noopener">Яндекс HR&nbsp;Tech</a>&nbsp;&mdash; от&nbsp;библиотек компонентов и&nbsp;токенов до&nbsp;документации, кода и&nbsp;AI&#8209;подходов в&nbsp;работе команды. До&nbsp;этого занимался дизайн&#8209;системами в&nbsp;<a class="about-link" href="https://www.sber.ru" target="_blank" rel="noopener">Сбере</a> и&nbsp;проектировал продукты в&nbsp;&laquo;Открытии Брокер&raquo; и&nbsp;МТС.</p>
                    <p class="about-text">AI стал для меня частью этого процесса. Я&nbsp;проектирую в&nbsp;Figma, пишу код и&nbsp;собираю свои продукты с&nbsp;<span class="brand-inline"><img src="assets/claude-mark.svg" alt="" width="16" height="16">Claude</span>, <span class="brand-inline"><img src="assets/cursor-mark.svg" alt="" width="16" height="16">Cursor</span> и&nbsp;другими инструментами&nbsp;&mdash; не&nbsp;ради эксперимента, а&nbsp;чтобы быстрее проверять идеи и&nbsp;доводить их&nbsp;до&nbsp;рабочего состояния.</p>
                    <p class="about-text">Буду рад познакомиться. Помимо работы люблю горные лыжи&nbsp;&#9975;&#65039;, путешествия&nbsp;&#9992;&#65039; и&nbsp;проводить время с&nbsp;семьёй&nbsp;&#128106;&#8205;&#128105;&#8205;&#128103;.</p>
                    <p class="about-text">Открыт к&nbsp;общению, особенно если вам интересны AI, дизайн&#8209;системы или продуктовая разработка. Напишите мне в&nbsp;<a class="about-link" href="https://t.me/andrewaitken" target="_blank" rel="noopener">Telegram</a> или на&nbsp;<a class="about-link" href="mailto:andrew.antoshkin@gmail.com">почту</a>.</p>
                </div>
'''


def project_visual(kind: str) -> str:
    visuals = {
        "ev": """
            <div class="pv-cover pv-pair">
                <div><span>Naive</span><b>59.3</b></div>
                <i aria-hidden="true"></i>
                <div><span>Fixture</span><b>87.8</b></div>
            </div>""",
        "cx": """
            <div class="pv-cover pv-table">
                <div><span>full</span><b>~665</b></div>
                <div class="on"><span>compact</span><b>~375</b></div>
                <div><span>components</span><b>~180</b></div>
            </div>""",
        "fx": """
            <div class="pv-cover pv-stage">
                <span class="pv-guides"><i></i><i></i><i></i><i></i><span class="pv-btn">Button</span></span>
                <code>&lt;Button variant="primary" /&gt;</code>
            </div>""",
        "rg": """
            <div class="pv-cover pv-marquee">
                <div class="pv-row"><div class="pv-track" style="--d:52s"><div class="pv-set"><span class="chip">select <s>38</s><span class="to">→</span><b>91</b></span><span class="chip">settings <s>44</s><span class="to">→</span><b>93</b></span><span class="chip">dialog <s>41</s><span class="to">→</span><b>90</b></span><span class="chip chip--bad">delete <s>84</s><span class="to">→</span><b>61</b></span><span class="chip">empty <s>86</s><span class="to">→</span><b>87</b></span></div><div class="pv-set" aria-hidden="true"><span class="chip">select <s>38</s><span class="to">→</span><b>91</b></span><span class="chip">settings <s>44</s><span class="to">→</span><b>93</b></span><span class="chip">dialog <s>41</s><span class="to">→</span><b>90</b></span><span class="chip chip--bad">delete <s>84</s><span class="to">→</span><b>61</b></span><span class="chip">empty <s>86</s><span class="to">→</span><b>87</b></span></div></div></div>
                <div class="pv-row"><div class="pv-track" style="--d:64s"><div class="pv-set"><span class="chip">dialog <s>41</s><span class="to">→</span><b>90</b></span><span class="chip">empty <s>86</s><span class="to">→</span><b>87</b></span><span class="chip chip--bad">delete <s>84</s><span class="to">→</span><b>61</b></span><span class="chip">select <s>38</s><span class="to">→</span><b>91</b></span><span class="chip">settings <s>44</s><span class="to">→</span><b>93</b></span></div><div class="pv-set" aria-hidden="true"><span class="chip">dialog <s>41</s><span class="to">→</span><b>90</b></span><span class="chip">empty <s>86</s><span class="to">→</span><b>87</b></span><span class="chip chip--bad">delete <s>84</s><span class="to">→</span><b>61</b></span><span class="chip">select <s>38</s><span class="to">→</span><b>91</b></span><span class="chip">settings <s>44</s><span class="to">→</span><b>93</b></span></div></div></div>
                <div class="pv-row"><div class="pv-track" style="--d:46s"><div class="pv-set"><span class="chip">settings <s>44</s><span class="to">→</span><b>93</b></span><span class="chip chip--bad">delete <s>84</s><span class="to">→</span><b>61</b></span><span class="chip">empty <s>86</s><span class="to">→</span><b>87</b></span><span class="chip">select <s>38</s><span class="to">→</span><b>91</b></span><span class="chip">dialog <s>41</s><span class="to">→</span><b>90</b></span></div><div class="pv-set" aria-hidden="true"><span class="chip">settings <s>44</s><span class="to">→</span><b>93</b></span><span class="chip chip--bad">delete <s>84</s><span class="to">→</span><b>61</b></span><span class="chip">empty <s>86</s><span class="to">→</span><b>87</b></span><span class="chip">select <s>38</s><span class="to">→</span><b>91</b></span><span class="chip">dialog <s>41</s><span class="to">→</span><b>90</b></span></div></div></div>
                <div class="pv-row"><div class="pv-track" style="--d:58s"><div class="pv-set"><span class="chip">empty <s>86</s><span class="to">→</span><b>87</b></span><span class="chip">select <s>38</s><span class="to">→</span><b>91</b></span><span class="chip">settings <s>44</s><span class="to">→</span><b>93</b></span><span class="chip">dialog <s>41</s><span class="to">→</span><b>90</b></span><span class="chip chip--bad">delete <s>84</s><span class="to">→</span><b>61</b></span></div><div class="pv-set" aria-hidden="true"><span class="chip">empty <s>86</s><span class="to">→</span><b>87</b></span><span class="chip">select <s>38</s><span class="to">→</span><b>91</b></span><span class="chip">settings <s>44</s><span class="to">→</span><b>93</b></span><span class="chip">dialog <s>41</s><span class="to">→</span><b>90</b></span><span class="chip chip--bad">delete <s>84</s><span class="to">→</span><b>61</b></span></div></div></div>
            </div>""",
        "md": """
            <div class="pv-cover pv-fan">
                <div class="pv-card pv-card--a">
                    <span>File</span>
                    <span>Variables</span>
                    <span>Styles</span>
                    <span>Button</span>
                </div>
                <div class="pv-card pv-card--b">
                    <span>design-system.md</span>
                    <span>colors.md</span>
                    <span>typography.md</span>
                    <span>button.md</span>
                    <span>gaps.md</span>
                </div>
            </div>""",
        "ln": """
            <div class="pv-cover pv-dock">
                <div class="pv-window pv-code">
                    <div class="pv-chrome"><i></i><i></i><i></i><span>Button.tsx</span></div>
                    <div><em>12</em><s>color: #FF4D4F</s><b>color.error</b></div>
                    <div><em>13</em><s>padding: 16px</s><b>space.4</b></div>
                    <div><em>14</em><s>radius: 8px</s><b>radius.2</b></div>
                    <div><em>15</em><s>gap: 8px</s><b>space.2</b></div>
                    <div><em>16</em><s>font: 14px</s><b>type.body</b></div>
                    <div><em>17</em><s>background: #fff</s><b>color.bg</b></div>
                    <div><em>18</em><s>border: 1px</s><b>space.px</b></div>
                    <div><em>19</em><s>shadow: 0 4px 12px</s><b>shadow.md</b></div>
                </div>
            </div>""",
        "cv": """
            <div class="pv-cover pv-table">
                <div class="on"><span>imported</span><b>64</b></div>
                <div><span>unused</span><b>22</b></div>
                <div><span>local</span><b>18</b></div>
            </div>""",
        "ds": """
            <div class="pv-cover pv-dock">
                <div class="pv-window pv-report">
                    <div class="pv-chrome"><i></i><i></i><i></i><span>acme.app</span></div>
                    <b class="pv-score">86</b>
                    <div class="pv-rows">
                        <div><span>Color</span><i style="--w:92%"></i><em>92</em></div>
                        <div><span>Type</span><i style="--w:78%"></i><em>78</em></div>
                        <div><span>Spacing</span><i style="--w:88%"></i><em>88</em></div>
                        <div><span>Radius</span><i style="--w:86%"></i><em>86</em></div>
                        <div><span>Variables</span><i style="--w:80%"></i><em>80</em></div>
                        <div><span>Contrast</span><i style="--w:94%"></i><em>94</em></div>
                    </div>
                </div>
            </div>""",
    }
    return visuals[kind]


def project_block(icon: str, name: str, url: str, desc: str, delay: int, open_label: str = "Открыть") -> str:
    return f'''
                <article class="project-item fold wf-target" data-fold="{delay}">
                    <div class="project-row">
                        <a class="project-left" href="{url}"><div class="career-company">{name}</div></a>
                        <a class="project-link" href="{url}" aria-label="{open_label}"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M6.5 4.5h5v5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                    </div>
                    <a class="project-preview project-preview--{icon} wf-target" href="{url}" aria-label="{name}">{project_visual(icon)}</a>
                    <p class="work-desc">{desc}</p>
                </article>'''


def projects_content() -> str:
    return f'''
                <p class="section-label fold" data-fold="80">Open source</p>
                <h1 class="title fold wf-target" data-fold="100" data-wf-tag="display · h1">Open-source инструменты.</h1>
                <p class="body-text fold wf-target" data-fold="130">Один контур для AI&#8209;native дизайн&#8209;систем: {chain_sentence("ru")}. Дальше в&nbsp;списке&nbsp;— спецификация и&nbsp;контроль на&nbsp;проде.</p>
                ''' + "".join(project_block(*b) for b in list_blocks("ru"))


def writing_content(lang: str = "ru") -> str:
    rows = []
    for index, stem in enumerate(ARTICLE_ORDER):
        suffix = "" if lang == "ru" else ".en"
        meta = json.loads((ARTICLES_DIR / f"{stem}{suffix}.json").read_text(encoding="utf-8"))
        href = f"{stem}.html" if lang == "ru" else f"{stem}-en.html"
        title = meta["h1"]
        tag_html = meta["tags"].replace('class="article-meta"', 'class="article-tags"')
        tag_html = re.sub(r'^<div class="article-tags">|</div>$', "", tag_html.strip())
        delay = 120 + index * 30
        date_html = article_date_html(meta.get("date", ""), lang)
        rows.append(
            f'<a class="article-row wf-target fold" data-fold="{delay}" href="{href}">'
            f'<span class="article-main">'
            f'<span class="article-title">{title}</span>'
            f'<span class="article-tags">{tag_html}</span>'
            f'</span>'
            f'<span class="article-side">{date_html}'
            f'<span class="article-arrow" aria-hidden="true">'
            f'<svg width="16" height="16" viewBox="0 0 16 16" fill="none">'
            f'<path d="M6 4.5 10.5 8 6 11.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'
            f'</svg></span></span></a>'
        )
    if lang == "en":
        return '''
                <p class="section-label fold" data-fold="80">Writing</p>
                <h1 class="title fold wf-target" data-fold="100" data-wf-tag="display · h1">Notes on design,<br>systems &amp; AI.</h1>
                <p class="body-text fold wf-target" data-fold="130">Practical notes on Figma, Cursor, design&#8209;to&#8209;code, and design systems.</p>
                <div class="articles" style="margin-top:40px">''' + "".join(rows) + "</div>"
    return '''
                <p class="section-label fold" data-fold="80">Статьи</p>
                <h1 class="title fold wf-target" data-fold="100" data-wf-tag="display · h1">Заметки о&nbsp;дизайне,<br>системах и&nbsp;AI.</h1>
                <p class="body-text fold wf-target" data-fold="130">Практические тексты про Figma, Cursor, design&#8209;to&#8209;code и&nbsp;дизайн&#8209;системы.</p>
                <div class="articles" style="margin-top:40px">''' + "".join(rows) + "</div>"


def approach_content() -> str:
    return '''
                <h1 class="approach-title fold wf-target" data-fold="100">От&nbsp;неопределённости<br>к&nbsp;работающему продукту.</h1>
                <div class="approach-intro fold wf-target" data-fold="140">
                    <p class="body-text">Подключаюсь там, где сложную продуктовую задачу нужно превратить в&nbsp;работающую систему. Разбираюсь в&nbsp;контексте, формулирую принципы, собираю прототип и&nbsp;связываю дизайн, разработку и&nbsp;AI в&nbsp;единый процесс.</p>
                    <p class="body-text">Моя цель&nbsp;— не&nbsp;макет, а&nbsp;решение, которое доходит до&nbsp;продакшена и&nbsp;которое команда может развивать без потери качества.</p>
                </div>
                <blockquote class="approach-quote fold wf-target" data-fold="170">«Я&nbsp;не&nbsp;заканчиваю работу на&nbsp;макете. Мне важно, чтобы решение дошло до&nbsp;пользователя и&nbsp;стало частью устойчивого процесса команды».</blockquote>
                <hr class="divider">

                <section class="artifacts fold wf-target" data-fold="120">
                    <h2 class="section-label">Главные артефакты</h2>
                    <div class="artifact-list">
                        <article class="artifact-row">
                            <h3>Модель продукта</h3>
                            <p>Проблема, сценарии, ограничения и&nbsp;критерии результата&nbsp;— до&nbsp;того, как команда начнёт рисовать и&nbsp;разрабатывать.</p>
                        </article>
                        <article class="artifact-row">
                            <h3>Рабочий прототип</h3>
                            <p>Ключевые сценарии в&nbsp;Figma или коде, на&nbsp;которых можно быстро проверить решение и&nbsp;снять риски.</p>
                        </article>
                        <article class="artifact-row">
                            <h3>Единая спецификация</h3>
                            <p>Состояния, компоненты, токены и&nbsp;правила, одинаково понятные дизайнерам, разработчикам и&nbsp;AI&#8209;агентам.</p>
                        </article>
                        <article class="artifact-row">
                            <h3>Система в&nbsp;продакшене</h3>
                            <p>Код, автоматизация, QA и&nbsp;метрики, которые помогают решению доехать до&nbsp;пользователя и&nbsp;масштабироваться.</p>
                        </article>
                    </div>
                </section>

                <a class="process-link fold wf-target" data-fold="180" href="collab.html">Обсудить задачу →</a>
'''


def collab_content() -> str:
    return '''
                <h1 class="title fold wf-target" data-fold="100" data-wf-tag="display · h1">Менторство,<br>воркшопы &amp; консалтинг.</h1>
                <p class="body-text fold wf-target" data-fold="140">Помогаю командам выстроить дизайн&#8209;системы, внедрить AI в&nbsp;дизайн&#8209;процесс и&nbsp;сократить разрыв между Figma и&nbsp;кодом.</p>
                <div class="card-wrap fold wf-target" data-fold="180">
                    <div class="price-card wf-target">
                        <div class="price-row"><span>✓</span><span>Воркшопы по AI в&nbsp;дизайне (Яндекс и&nbsp;другие команды)</span></div>
                        <div class="price-row"><span>✓</span><span>Аудит дизайн&#8209;системы и&nbsp;roadmap улучшений</span></div>
                        <div class="price-row"><span>✓</span><span>Настройка design&#8209;to&#8209;code флоу с&nbsp;Cursor + Figma</span></div>
                        <div class="price-divider"></div>
                        <div class="price-row"><span>✓</span><span>Менторство для дизайнеров и&nbsp;design system leads</span></div>
                    </div>
                </div>
                <div class="dark-card wf-target fold" data-fold="220">
                    <div class="dark-card-inner">
                        <div class="dark-card-title">Спринт по&nbsp;дизайн&#8209;системе</div>
                        <div class="dark-card-row"><span>→</span><span>Токены, компоненты, документация</span></div>
                        <div class="dark-card-row"><span>→</span><span>AI&#8209;readable спеки и&nbsp;инструменты</span></div>
                        <div class="dark-card-row"><span>→</span><span>Передача процессов команде</span></div>
                    </div>
                    <div class="dark-card-footer">
                        <div>
                            <div class="dark-card-label">Формат</div>
                            <div class="dark-card-price">по запросу</div>
                        </div>
                        <a class="btn-light wf-target" href="mailto:andrew.antoshkin@gmail.com?subject=Сотрудничество"><span>Написать</span></a>
                    </div>
                </div>
                <h2 class="section-label fold" data-fold="100" style="margin-top:48px">Вопросы</h2>
                <div class="faq-section">
                    <div class="faq-item fold wf-target" data-fold="120"><button class="faq-q" type="button">С чего начать?<svg class="faq-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></button><div class="faq-a-wrap"><p class="faq-a">Напишите на почту или в Telegram с&nbsp;кратким описанием задачи: продукт, размер команды, что болит. Я&nbsp;предложу формат и&nbsp;следующий шаг.</p></div></div>
                    <div class="faq-item fold wf-target" data-fold="150"><button class="faq-q" type="button">Работаете удалённо?<svg class="faq-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></button><div class="faq-a-wrap"><p class="faq-a">Да. Воркшопы и&nbsp;менторство&nbsp;— онлайн или очно в&nbsp;Москве, если нужно очно.</p></div></div>
                    <div class="faq-item fold wf-target" data-fold="180"><button class="faq-q" type="button">Только дизайн&#8209;системы?<svg class="faq-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></button><div class="faq-a-wrap"><p class="faq-a">Фокус на&nbsp;системной работе: DS, токены, tooling, AI&#8209;процессы. Разовые макеты без системного контекста&nbsp;— не&nbsp;мой формат.</p></div></div>
                </div>
                <a class="process-link fold wf-target" data-fold="210" href="approach.html">← К подходу</a>
'''


def home_content_en() -> str:
    return f'''
                <div class="col-measure" aria-hidden="true"><span id="colWidth">—</span></div>

                <div class="hero">
                    <h1 class="hero-title">
                        <span class="t-line enter" style="--i: 1">Andrew&nbsp;Antoshkin<span class="annot annot--x" aria-hidden="true">x-height<i class="tick tick--end" style="--len: 28px"></i></span></span>
                        <span class="serif enter" style="--i: 2"><span class="ink">Design <span class="sel">Engineer<i class="handle h-tl"></i><i class="handle h-tr"></i><i class="handle h-bl"></i><i class="handle h-br"></i><span class="annot annot--size" id="selSize" aria-hidden="true">&mdash;</span></span><span class="annot annot--color" id="selColor" aria-hidden="true"><i class="swatch" style="background: var(--text-secondary)"></i>&mdash;<i class="tick tick--left" style="--len: 16px"></i></span></span><span class="annot annot--font" aria-hidden="true">old-standard-italic<i class="tick tick--right" style="--len: 16px"></i></span></span>
                    </h1>

                    <div class="hero-intro">
                        <p class="enter" style="--i: 3">I connect design and engineering by building design systems, tools, and code that let teams work from a shared specification.</p>
                        <p class="enter" style="--i: 4">I currently lead the design system at Yandex HR Tech and build open&#8209;source tools for designers and developers.</p>
                    </div>

                    <div class="cta-row enter" style="--i: 5">
                        <a class="btn btn--primary" href="#positioning">How I work</a>
                        <a class="btn btn--ghost" href="https://t.me/andrewaitken" target="_blank" rel="noopener">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                            Contact me
                        </a>
                        <span class="annot annot--cta" aria-hidden="true">call to action<i class="tick tick--right" style="--len: 33px"></i></span>
                        <span class="cta-frame" aria-hidden="true"></span>
                        <span class="cta-gap" aria-hidden="true"><b>32 px</b></span>
                    </div>
                </div>

                <hr class="divider">

                <section class="guide-section positioning-section fold" id="positioning" data-fold="100">
                    <div class="section-head">
                        <h2 class="section-label">What Design Engineer means to me</h2>
                        <span class="annot annot--gutter" aria-hidden="true">positioning/01</span>
                        <span class="annot annot--right" aria-hidden="true">design × engineering</span>
                    </div>
                    <p class="positioning-lead">I design not only interfaces, but also how teams build them&nbsp;— through design systems, code, and automation.</p>
                    <div class="positioning-grid">
                        <article class="positioning-block">
                            <span class="positioning-kicker">Systems</span>
                            <p>I develop the <a class="about-link" href="https://yandex.ru" target="_blank" rel="noopener">Yandex HR Tech</a> design system: components, tokens, documentation, and code. Previously I worked on design systems at <a class="about-link" href="https://www.sber.ru" target="_blank" rel="noopener">Sber</a> and products at Otkritie Broker and MTS.</p>
                        </article>
                        <article class="positioning-block">
                            <span class="positioning-kicker">Tools</span>
                            <p>I build infrastructure for AI&#8209;native design systems: {chain_sentence("en")}.</p>
                        </article>
                        <article class="positioning-block">
                            <span class="positioning-kicker">AI and code</span>
                            <p>I design in Figma, write code, and build tools that help agents read a design system, assemble an interface from it, and check that they did not invent their own.</p>
                        </article>
                        <article class="positioning-block">
                            <span class="positioning-kicker">Process</span>
                            <p>For me, Design Engineering means working across the full process: from an idea and interface to specification, implementation, and team tooling.</p>
                        </article>
                    </div>
                    <p class="positioning-outro">Interested in AI, design systems, or product development? Reach me on <a class="about-link" href="https://t.me/andrewaitken" target="_blank" rel="noopener">Telegram</a> or by <a class="about-link" href="mailto:andrew.antoshkin@gmail.com">email</a>.</p>
                </section>

                <hr class="divider">

                <section class="guide-section career-section fold" data-fold="100">
                    <div class="section-head">
                        <h2 class="section-label">Career</h2>
                        <span class="annot annot--gutter" aria-hidden="true">section/02</span>
                        <span class="annot annot--right" aria-hidden="true">timeline</span>
                    </div>
                    <div class="career-list career-list--timeline">
                        {career_list_html(timeline=True, lang="en")}
                    </div>
                </section>
'''


def about_content_en() -> str:
    return f'''
                <h1 class="title fold" data-fold="100">About me</h1>
                <div class="about-prose fold" data-fold="120">
                    <p class="about-text about-lead">Hello.<br>I&rsquo;m Andrew Antoshkin, a designer. I build products, design systems, and tools that connect design and code.</p>
                    <p class="about-text">I am interested not only in designing interfaces, but in shaping how they are built through design systems, tools, code, and automation&nbsp;— especially as AI changes the product development process itself.</p>
                    <p class="about-text">Alongside that work I build infrastructure for AI&#8209;native design systems: {chain_sentence("en")}. Specification and production checks sit next to that loop.</p>
                    <p class="about-text">Most of my career has focused on systemic challenges within product teams: improving not just interfaces, but the way teams create them.</p>
                    <p class="about-text">I currently develop the design system at <a class="about-link" href="https://yandex.ru" target="_blank" rel="noopener">Yandex HR Tech</a>&nbsp;— from component libraries and tokens to documentation, code, and AI workflows. Before that, I worked on design systems at <a class="about-link" href="https://www.sber.ru" target="_blank" rel="noopener">Sber</a> and designed products at Otkritie Broker and MTS.</p>
                    <p class="about-text">I design in Figma, write code, and build products with <span class="brand-inline"><img src="assets/claude-mark.svg" alt="" width="16" height="16">Claude</span>, <span class="brand-inline"><img src="assets/cursor-mark.svg" alt="" width="16" height="16">Cursor</span>, and other tools to test ideas faster and bring them to a working state.</p>
                    <p class="about-text">Outside work, I enjoy skiing&nbsp;&#9975;&#65039;, travel&nbsp;&#9992;&#65039;, and spending time with my family&nbsp;&#128106;&#8205;&#128105;&#8205;&#128103;.</p>
                    <p class="about-text">If you are interested in AI, design systems, or product development, reach me on <a class="about-link" href="https://t.me/andrewaitken" target="_blank" rel="noopener">Telegram</a> or by <a class="about-link" href="mailto:andrew.antoshkin@gmail.com">email</a>.</p>
                </div>
'''


def chain_sentence(lang: str) -> str:
    def link(slug: str) -> str:
        label = slug.replace("-", "&#8209;")
        return f'<a class="about-link tool" href="{project_href(slug, lang)}">{label}</a>'

    context, repair, eval_, regress = (
        link("ds-context"),
        link("ui-repair"),
        link("ds-eval"),
        link("prompt-regress"),
    )
    if lang == "ru":
        return (
            f"{context} готовит контекст, {repair} чинит код, "
            f"{eval_} измеряет следование системе, {regress} сравнивает версии промпта"
        )
    return (
        f"{context} prepares context, {repair} repairs code, "
        f"{eval_} measures whether the agent follows the system, {regress} compares prompt versions"
    )


def tool_links(lang: str) -> str:
    parts = [
        f'<a class="about-link tool" href="{project_href(project["slug"], lang)}">{project["name"].replace("-", "&#8209;")}</a>'
        for project in PROJECTS
    ]
    if lang == "ru":
        return ", ".join(parts[:-1]) + " и&nbsp;" + parts[-1]
    return ", ".join(parts[:-1]) + ", and " + parts[-1]


def projects_content_en() -> str:
    return f'''
                <p class="section-label fold" data-fold="80">Open source</p>
                <h1 class="title fold wf-target" data-fold="100" data-wf-tag="display · h1">Open-source tools.</h1>
                <p class="body-text fold wf-target" data-fold="130">One loop for AI&#8209;native design systems: {chain_sentence("en")}. Specification and production checks follow.</p>
                ''' + "".join(project_block(*b) for b in list_blocks("en"))


def approach_content_en() -> str:
    return '''
                <h1 class="approach-title fold wf-target" data-fold="100">From ambiguity<br>to production.</h1>
                <div class="approach-intro fold wf-target" data-fold="140">
                    <p class="body-text">I join when a complex product problem needs to become a working system. I study the context, define principles, build a prototype, and connect design, engineering, and AI into one process.</p>
                    <p class="body-text">My goal is not a mockup, but a solution that reaches production and can evolve without losing quality.</p>
                </div>
                <blockquote class="approach-quote fold wf-target" data-fold="170">&ldquo;My work does not end with a mockup. I want the solution to reach users and become part of a sustainable team process.&rdquo;</blockquote>
                <hr class="divider">
                <section class="artifacts fold wf-target" data-fold="120">
                    <h2 class="section-label">Core artifacts</h2>
                    <div class="artifact-list">
                        <article class="artifact-row"><h3>Product model</h3><p>The problem, scenarios, constraints, and success criteria&nbsp;— before the team starts designing and building.</p></article>
                        <article class="artifact-row"><h3>Working prototype</h3><p>Key scenarios in Figma or code that help validate the solution quickly and reduce risk.</p></article>
                        <article class="artifact-row"><h3>Shared specification</h3><p>States, components, tokens, and rules understood by designers, developers, and AI agents alike.</p></article>
                        <article class="artifact-row"><h3>Production system</h3><p>Code, automation, QA, and metrics that help the solution reach users and scale.</p></article>
                    </div>
                </section>
                <a class="process-link fold wf-target" data-fold="180" href="collab-en.html">Discuss a project →</a>
'''


def collab_content_en() -> str:
    return '''
                <h1 class="title fold wf-target" data-fold="100" data-wf-tag="display · h1">Mentoring,<br>workshops &amp; consulting.</h1>
                <p class="body-text fold wf-target" data-fold="140">I help teams build design systems, introduce AI into design workflows, and close the gap between Figma and code.</p>
                <div class="card-wrap fold wf-target" data-fold="180">
                    <div class="price-card wf-target">
                        <div class="price-row"><span>✓</span><span>AI workshops for design teams</span></div>
                        <div class="price-row"><span>✓</span><span>Design system audits and improvement roadmaps</span></div>
                        <div class="price-row"><span>✓</span><span>Design&#8209;to&#8209;code workflows with Cursor + Figma</span></div>
                        <div class="price-divider"></div>
                        <div class="price-row"><span>✓</span><span>Mentoring for designers and design system leads</span></div>
                    </div>
                </div>
                <div class="dark-card wf-target fold" data-fold="220">
                    <div class="dark-card-inner">
                        <div class="dark-card-title">Design system sprint</div>
                        <div class="dark-card-row"><span>→</span><span>Tokens, components, and documentation</span></div>
                        <div class="dark-card-row"><span>→</span><span>AI&#8209;readable specifications and tools</span></div>
                        <div class="dark-card-row"><span>→</span><span>Process handoff to the team</span></div>
                    </div>
                    <div class="dark-card-footer">
                        <div><div class="dark-card-label">Format</div><div class="dark-card-price">on request</div></div>
                        <a class="btn-light wf-target" href="mailto:andrew.antoshkin@gmail.com?subject=Collaboration"><span>Contact me</span></a>
                    </div>
                </div>
                <h2 class="section-label fold" data-fold="100" style="margin-top:48px">FAQ</h2>
                <div class="faq-section">
                    <div class="faq-item fold wf-target" data-fold="120"><button class="faq-q" type="button">Where do we start?<svg class="faq-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></button><div class="faq-a-wrap"><p class="faq-a">Email me or message me on Telegram with a short description of the product, team, and challenge. I will suggest a format and next step.</p></div></div>
                    <div class="faq-item fold wf-target" data-fold="150"><button class="faq-q" type="button">Do you work remotely?<svg class="faq-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></button><div class="faq-a-wrap"><p class="faq-a">Yes. Workshops and mentoring can be remote or in person in Moscow.</p></div></div>
                    <div class="faq-item fold wf-target" data-fold="180"><button class="faq-q" type="button">Only design systems?<svg class="faq-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></button><div class="faq-a-wrap"><p class="faq-a">My focus is systemic work: design systems, tokens, tooling, and AI workflows. One&#8209;off mockups without a system context are not my format.</p></div></div>
                </div>
                <a class="process-link fold wf-target" data-fold="210" href="approach-en.html">← Back to approach</a>
'''


def prepare_prose(body: str) -> tuple[str, str]:
    headings: list[tuple[str, str]] = []
    counter = 0

    def add_id(match: re.Match[str]) -> str:
        nonlocal counter
        counter += 1
        inner = match.group(1)
        slug = f"section-{counter}"
        headings.append((slug, inner))
        return f'<h2 id="{slug}">{inner}</h2>'

    body = re.sub(r"<h2>([\s\S]*?)</h2>", add_id, body)
    if len(headings) < 2:
        return "", body

    items = []
    for slug, inner in headings:
        label = re.sub(r"<[^>]+>", "", inner)
        label = re.sub(r"\s+", " ", label).strip()
        items.append(f'<li><a href="#{slug}">{label}</a></li>')
    toc = (
        '<nav class="article-toc fold" data-fold="120" aria-label="Содержание">'
        '<p class="article-toc-label">Содержание</p>'
        f'<ol>{"".join(items)}</ol></nav>'
    )
    return toc, body


def article_nav(stem: str, lang: str) -> str:
    index = ARTICLE_ORDER.index(stem)
    suffix = "" if lang == "ru" else ".en"
    href_suffix = ".html" if lang == "ru" else "-en.html"
    prev_label = "Предыдущая" if lang == "ru" else "Previous"
    next_label = "Следующая" if lang == "ru" else "Next"
    links = []
    if index > 0:
        prev_stem = ARTICLE_ORDER[index - 1]
        prev_meta = json.loads((ARTICLES_DIR / f"{prev_stem}{suffix}.json").read_text(encoding="utf-8"))
        links.append(
            f'<a href="{prev_stem}{href_suffix}">'
            f'<span class="article-nav-label">{prev_label}</span>'
            f'<span class="article-nav-title">{prev_meta["h1"]}</span></a>'
        )
    else:
        links.append("<span></span>")

    if index < len(ARTICLE_ORDER) - 1:
        next_stem = ARTICLE_ORDER[index + 1]
        next_meta = json.loads((ARTICLES_DIR / f"{next_stem}{suffix}.json").read_text(encoding="utf-8"))
        links.append(
            f'<a href="{next_stem}{href_suffix}" class="next">'
            f'<span class="article-nav-label">{next_label}</span>'
            f'<span class="article-nav-title">{next_meta["h1"]}</span></a>'
        )

    return f'<nav class="article-nav">{"".join(links)}</nav>'


def load_article_source(stem: str, lang: str) -> tuple[str, str, str, str, str, str, str, str]:
    suffix = "" if lang == "ru" else ".en"
    meta_path = ARTICLES_DIR / f"{stem}{suffix}.json"
    body_path = ARTICLES_DIR / f"{stem}{suffix}.body.html"
    if not meta_path.exists() or not body_path.exists():
        raise FileNotFoundError(f"Missing article source for {stem}")

    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    body = body_path.read_text(encoding="utf-8").strip()
    _, body = prepare_prose(body)
    tldr = (
        '<aside class="article-tldr fold" data-fold="120">'
        '<p class="article-tldr-label">TL;DR</p>'
        f'<p>{meta["tldr"]}</p>'
        '</aside>'
    )
    cover = meta.get("cover")
    cover_html = ""
    if cover:
        cover_html = (
            '<figure class="article-cover fold wf-target" data-fold="80">'
            f'<img src="{cover["src"]}" alt="{cover["alt"]}">'
            '</figure>'
        )
    date_html = article_date_html(meta.get("date", ""), lang, full=True)
    return meta["title"], meta["h1"], date_html, meta["tags"], cover_html, tldr, body, article_nav(stem, lang)


def article_page(stem: str, lang: str) -> None:
    title, h1, date_html, tags, cover, tldr, body, nav = load_article_source(stem, lang)
    output_name = f"{stem}.html" if lang == "ru" else f"{stem}-en.html"
    counterpart = f"{stem}-en.html" if lang == "ru" else f"{stem}.html"
    content = f'''
                {cover}
                <div class="article-head fold wf-target" data-fold="100">
                    <h1 class="title">{h1}</h1>
                    {date_html}
                    {tags}
                </div>
                {tldr}
                <div class="prose fold wf-target" data-fold="140">{body}</div>
                {nav}
    '''
    out = shell(
        active="writing",
        title=title,
        description=title,
        content=content,
        back={"href": "writing.html" if lang == "ru" else "writing-en.html", "label": "Статьи" if lang == "ru" else "Writing"},
        content_class="content--article",
        og_type="article",
        lang=lang,
        counterpart=counterpart,
    )
    write(output_name, out)


def write_project_pages() -> None:
    for index, project in enumerate(PROJECTS):
        for lang in ("ru", "en"):
            other = "en" if lang == "ru" else "ru"
            back_href = "projects.html" if lang == "ru" else "projects-en.html"
            back_label = "Проекты" if lang == "ru" else "Projects"
            who = "Андрей Антошкин" if lang == "ru" else "Andrew Antoshkin"
            doc = load_doc(project["slug"], lang)
            kicker = project["kicker"][0 if lang == "ru" else 1]
            content = f'''
                <p class="section-label">{kicker}</p>
                <h1 class="title">{project["name"]}</h1>
                <p class="body-text">{doc["lead"]}</p>
                <div class="prose prose--docs">{doc["body"]}</div>
                {project_nav(index, lang)}
            '''
            write(
                project_href(project["slug"], lang),
                shell(
                    active="projects",
                    title=f'{project["name"]} — {who}',
                    description=project["meta"][_lang_bit(lang)],
                    content=content,
                    content_class="content--article",
                    lang=lang,
                    counterpart=project_href(project["slug"], other),
                    project_menu={
                        "name": project["name"],
                        "back_href": back_href,
                        "back_label": back_label,
                        "groups": doc["groups"],
                    },
                ),
            )
        if project["legacy"]:
            target = "/" + project_href(project["slug"], "en")
            write(
                project["legacy"],
                f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url={target}">
    <link rel="canonical" href="{target}">
    <title>{project["name"]}</title>
</head>
<body><a href="{target}">{project["name"]}</a></body>
</html>
''',
            )


def _lang_bit(lang: str) -> int:
    return 0 if lang == "ru" else 1


def main() -> None:
    pages = [
        ("index.html", "en.html", "ru", "home", "Андрей Антошкин — Design Engineer", "Design Engineer. Дизайн-системы, AI-инструменты и инфраструктура.", home_content()),
        ("projects.html", "projects-en.html", "ru", "projects", "Проекты — Андрей Антошкин", "Инфраструктура для AI-native дизайн-систем: контекст, починка, измерение и регрессия промпта.", projects_content()),
        ("writing.html", "writing-en.html", "ru", "writing", "Статьи — Андрей Антошкин", "Статьи про Figma, Cursor, design systems и AI.", writing_content("ru")),
        ("approach.html", "approach-en.html", "ru", "approach", "Подход — Андрей Антошкин", "Как превращаю сложные продуктовые задачи в работающие системы — от модели и прототипа до продакшена.", approach_content()),
        ("collab.html", "collab-en.html", "ru", "collab", "Сотрудничество — Андрей Антошкин", "Менторство, воркшопы и консалтинг по дизайн-системам.", collab_content()),
        ("en.html", "index.html", "en", "home", "Andrew Antoshkin — Design Engineer", "Design Engineer building design systems, AI tools, and product infrastructure.", home_content_en()),
        ("projects-en.html", "projects.html", "en", "projects", "Projects — Andrew Antoshkin", "Infrastructure for AI-native design systems: context, repair, measurement, and prompt regression.", projects_content_en()),
        ("writing-en.html", "writing.html", "en", "writing", "Writing — Andrew Antoshkin", "Articles about Figma, Cursor, design systems, and AI.", writing_content("en")),
        ("approach-en.html", "approach.html", "en", "approach", "Approach — Andrew Antoshkin", "How I turn complex product problems into working systems, from model and prototype to production.", approach_content_en()),
        ("collab-en.html", "collab.html", "en", "collab", "Work together — Andrew Antoshkin", "Mentoring, workshops, and consulting on design systems and AI workflows.", collab_content_en()),
    ]
    for name, counterpart, lang, active, title, desc, content in pages:
        cc = "content--home" if active == "home" else ""
        write(name, shell(active=active, title=title, description=desc, content=content, content_class=cc, lang=lang, counterpart=counterpart))

    write_redirect("about.html", "index.html", "ru")
    write_redirect("about-en.html", "en.html", "en")

    for stem in ARTICLE_ORDER:
        article_page(stem, "ru")
        article_page(stem, "en")

    write_project_pages()


if __name__ == "__main__":
    main()
