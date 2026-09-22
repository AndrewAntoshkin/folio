#!/usr/bin/env python3
"""Generate wireframe-style static pages for antoshkin.tech."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES_DIR = ROOT / "content" / "articles"
ARTICLE_ORDER = ["ai-changes-processes", "halo-working-memory", "cursor-figma", "design-md", "dev-for-designers"]

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
    back_html = ""
    if back:
        back_html = f'''
                <a class="back-link back-link--inline fold wf-target" data-fold="60" href="{back["href"]}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    {back["label"]}
                </a>'''

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
    <div class="page">
        <div class="border-strip border-strip--left" aria-hidden="true"></div>
        <div class="border-strip border-strip--right" aria-hidden="true"></div>
        <div class="grid-line grid-line--nav" aria-hidden="true"></div>
        <div class="grid-line grid-line--content-l" aria-hidden="true"></div>
        <div class="grid-line grid-line--content-r" aria-hidden="true"></div>
        <div class="grid-line grid-line--shell-r" aria-hidden="true"></div>

        <nav class="top-nav fold" data-fold="50">
            <a href="{home_href}" aria-label="{home_label}">{LOGO}</a>
            <div class="nav-links">
                {nav_links(active, lang)}
            </div>
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
            <div class="mobile-menu" hidden>
                <a href="{home_href}">{'Главная' if is_ru else 'Home'}</a>
                {mobile_links(lang)}
                <hr>
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
                            <p>Создаю open&#8209;source инструменты для общей спецификации дизайна и&nbsp;кода: <a class="about-link tool" href="/ds-eval/" target="_blank" rel="noopener">ds&#8209;eval</a>, <a class="about-link tool" href="https://antoshkin.tech/ds-health/" target="_blank" rel="noopener">ds&#8209;health</a>, <a class="about-link tool" href="https://antoshkin.tech/figma-to-design-md/" target="_blank" rel="noopener">figma&#8209;to&#8209;design&#8209;md</a>, <a class="about-link tool" href="https://antoshkin.tech/design-system-ai-starter/" target="_blank" rel="noopener">design&#8209;system&#8209;ai&#8209;starter</a>, <a class="about-link tool" href="https://antoshkin.tech/spektr/" target="_blank" rel="noopener">spektr</a>, <a class="about-link tool" href="https://antoshkin.tech/ds-lint/" target="_blank" rel="noopener">ds&#8209;lint</a> и&nbsp;<a class="about-link tool" href="https://antoshkin.tech/ds-coverage/" target="_blank" rel="noopener">ds&#8209;coverage</a>.</p>
                        </article>
                        <article class="positioning-block">
                            <span class="positioning-kicker">AI и&nbsp;код</span>
                            <p>Проектирую в&nbsp;Figma, пишу код и&nbsp;собираю продукты с&nbsp;<span class="brand-inline"><img src="assets/claude-mark.svg" alt="" width="16" height="16">Claude</span> и&nbsp;<span class="brand-inline"><img src="assets/cursor-mark.svg" alt="" width="16" height="16">Cursor</span>. AI помогает быстрее проверять идеи.</p>
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

                <hr class="divider">

                <section class="guide-section fold" data-fold="160">
                    <div class="testi-card">
                        <span class="testi-frame" aria-hidden="true"></span>
                        <span class="annot annot--testi-size" id="testiSize" aria-hidden="true">&mdash;</span>
                        <span class="annot annot--testi-label" aria-hidden="true">quote block<i class="tick tick--right" style="--len: 28px"></i></span>
                        <span class="testi-inset" aria-hidden="true"><b>32 px</b></span>
                        <div class="testi-bg" aria-hidden="true"></div>
                        <div class="testi-shade" aria-hidden="true"></div>
                        <p class="testi-quote">&laquo;Мне интересно не&nbsp;просто проектировать интерфейсы, а&nbsp;влиять на&nbsp;то, как они создаются&nbsp;— через дизайн&#8209;системы, инструменты, код и&nbsp;автоматизацию.&raquo;</p>
                        <div class="testi-divider" aria-hidden="true"></div>
                        <div class="testi-footer"><span class="testi-logo">antoshkin.tech</span><span class="testi-author">Андрей Антошкин</span></div>
                    </div>
                </section>
'''


def about_content() -> str:
    tools = (
        '<a class="about-link tool" href="/ds-eval/" target="_blank" rel="noopener">'
        'ds&#8209;eval</a>, '
        '<a class="about-link tool" href="https://antoshkin.tech/ds-health/" target="_blank" rel="noopener">'
        'ds&#8209;health</a>, '
        '<a class="about-link tool" href="https://antoshkin.tech/figma-to-design-md/" target="_blank" rel="noopener">'
        'figma&#8209;to&#8209;design&#8209;md</a>, '
        '<a class="about-link tool" href="https://antoshkin.tech/design-system-ai-starter/" target="_blank" rel="noopener">'
        'design&#8209;system&#8209;ai&#8209;starter</a>, '
        '<a class="about-link tool" href="https://antoshkin.tech/spektr/" target="_blank" rel="noopener">'
        'spektr</a>, '
        '<a class="about-link tool" href="https://antoshkin.tech/ds-lint/" target="_blank" rel="noopener">'
        'ds&#8209;lint</a> и&nbsp;'
        '<a class="about-link tool" href="https://antoshkin.tech/ds-coverage/" target="_blank" rel="noopener">'
        'ds&#8209;coverage</a>'
    )
    return f'''
                <h1 class="title fold" data-fold="100">Обо мне</h1>
                <div class="about-prose fold" data-fold="120">
                    <p class="about-text about-lead">Привет.<br>Я&nbsp;&mdash; Андрей Антошкин, дизайнер. Создаю продукты, дизайн&#8209;системы и&nbsp;инструменты, которые связывают дизайн и&nbsp;код.</p>
                    <p class="about-text">Мне интересно не&nbsp;просто проектировать интерфейсы, а&nbsp;влиять на&nbsp;то, как они создаются: через дизайн&#8209;системы, инструменты, код и&nbsp;автоматизацию. Особенно сейчас, когда AI меняет не&nbsp;только отдельные задачи, но&nbsp;и&nbsp;сам процесс работы над продуктом.</p>
                    <p class="about-text">Параллельно создаю собственные проекты и&nbsp;open&#8209;source инструменты для дизайнеров и&nbsp;разработчиков. Меня особенно вдохновляют инструменты, с&nbsp;которыми дизайнеры и&nbsp;разработчики работают из&nbsp;одной спецификации. Среди них&nbsp;&mdash; {tools}.</p>
                    <p class="about-text">Большую часть карьеры я&nbsp;решаю системные задачи в&nbsp;продуктовых командах. Мне интересно не&nbsp;только проектировать интерфейсы, но&nbsp;и&nbsp;улучшать процесс их&nbsp;создания&nbsp;&mdash; с&nbsp;помощью дизайн&#8209;систем, кода, AI и&nbsp;автоматизации.</p>
                    <p class="about-text">Сейчас развиваю дизайн&#8209;систему в&nbsp;<a class="about-link" href="https://yandex.ru" target="_blank" rel="noopener">Яндекс HR&nbsp;Tech</a>&nbsp;&mdash; от&nbsp;библиотек компонентов и&nbsp;токенов до&nbsp;документации, кода и&nbsp;AI&#8209;подходов в&nbsp;работе команды. До&nbsp;этого занимался дизайн&#8209;системами в&nbsp;<a class="about-link" href="https://www.sber.ru" target="_blank" rel="noopener">Сбере</a> и&nbsp;проектировал продукты в&nbsp;&laquo;Открытии Брокер&raquo; и&nbsp;МТС.</p>
                    <p class="about-text">AI стал для меня частью этого процесса. Я&nbsp;проектирую в&nbsp;Figma, пишу код и&nbsp;собираю свои продукты с&nbsp;<span class="brand-inline"><img src="assets/claude-mark.svg" alt="" width="16" height="16">Claude</span>, <span class="brand-inline"><img src="assets/cursor-mark.svg" alt="" width="16" height="16">Cursor</span> и&nbsp;другими инструментами&nbsp;&mdash; не&nbsp;ради эксперимента, а&nbsp;чтобы быстрее проверять идеи и&nbsp;доводить их&nbsp;до&nbsp;рабочего состояния.</p>
                    <p class="about-text">Буду рад познакомиться. Помимо работы люблю горные лыжи&nbsp;&#9975;&#65039;, путешествия&nbsp;&#9992;&#65039; и&nbsp;проводить время с&nbsp;семьёй&nbsp;&#128106;&#8205;&#128105;&#8205;&#128103;.</p>
                    <p class="about-text">Открыт к&nbsp;общению, особенно если вам интересны AI, дизайн&#8209;системы или продуктовая разработка. Напишите мне в&nbsp;<a class="about-link" href="https://t.me/andrewaitken" target="_blank" rel="noopener">Telegram</a> или на&nbsp;<a class="about-link" href="mailto:andrew.antoshkin@gmail.com">почту</a>.</p>
                </div>
'''


def project_visual(kind: str) -> str:
    visuals = {
        "ds": '''
            <div class="pv-browser">
                <div class="pv-browser-bar"><i></i><i></i><i></i><span>system.health/report</span></div>
                <div class="pv-health-layout">
                    <div class="pv-health-score"><span>86</span><small>health</small></div>
                    <div class="pv-health-metrics">
                        <div><span>Tokens</span><i style="--value:92%"></i><b>92</b></div>
                        <div><span>Components</span><i style="--value:78%"></i><b>78</b></div>
                        <div><span>Consistency</span><i style="--value:88%"></i><b>88</b></div>
                    </div>
                </div>
                <div class="pv-health-map"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
            </div>''',
        "md": '''
            <div class="pv-flow">
                <div class="pv-figma-tree">
                    <span class="pv-node pv-node--root">◆</span>
                    <span class="pv-node">Button</span>
                    <span class="pv-node">Input</span>
                    <span class="pv-node">Card</span>
                </div>
                <div class="pv-flow-lines"><i></i><i></i><i></i><b>→</b></div>
                <div class="pv-markdown">
                    <span class="pv-md-title"># Design system</span>
                    <i style="--w:82%"></i><i style="--w:64%"></i>
                    <span class="pv-md-sub">## Components</span>
                    <i style="--w:74%"></i><i style="--w:88%"></i><i style="--w:55%"></i>
                </div>
            </div>''',
        "sp": '''
            <div class="pv-inspector">
                <div class="pv-inspector-ui">
                    <div class="pv-inspector-nav"></div>
                    <div class="pv-inspector-copy"><i></i><i></i><i></i></div>
                    <div class="pv-inspector-card"></div>
                </div>
                <div class="pv-measure pv-measure--x"><span>24</span></div>
                <div class="pv-measure pv-measure--y"><span>16</span></div>
                <div class="pv-inspector-target"><i></i><i></i><i></i><i></i></div>
                <div class="pv-cursor">↖</div>
                <div class="pv-inspector-popover"><b>Card</b><span>240 × 144</span><span>gap · 16</span><span>radius · 12</span></div>
            </div>''',
        "ln": '''
            <div class="pv-lint">
                <div class="pv-code">
                    <div><em>12</em><span>color:</span><b>#FF4D4F</b><small>hardcoded</small></div>
                    <div><em>13</em><span>padding:</span><b>16px</b><small>hardcoded</small></div>
                    <div><em>14</em><span>radius:</span><b>8px</b><small>hardcoded</small></div>
                </div>
                <div class="pv-lint-route"><i></i><i></i><i></i><b>→</b></div>
                <div class="pv-tokens">
                    <span><i class="pv-token-color"></i>color.error</span>
                    <span><i></i>space.4</span>
                    <span><i></i>radius.2</span>
                </div>
            </div>''',
        "ev": '''
            <div class="pv-browser">
                <div class="pv-browser-bar"><i></i><i></i><i></i><span>ds.eval/benchmark</span></div>
                <div class="pv-eval">
                    <div class="pv-eval-models">
                        <div class="pv-eval-model"><span>Claude</span><b>87.4</b></div>
                        <div class="pv-eval-model"><span>Codex</span><b>84.1</b></div>
                    </div>
                    <div class="pv-eval-rows">
                        <div><span>DS</span><i style="--value:94%"></i><em>94</em><em>88</em></div>
                        <div><span>UX</span><i style="--value:88%"></i><em>88</em><em>86</em></div>
                        <div><span>Visual</span><i style="--value:86%"></i><em>86</em><em>85</em></div>
                        <div><span>A11y</span><i style="--value:79%"></i><em>79</em><em>82</em></div>
                    </div>
                    <div class="pv-eval-foot"><b>+2.7</b><span>7 improved</span><span class="pv-eval-down">3 regressions</span></div>
                </div>
            </div>''',
    }
    return visuals[kind]


def project_block(icon: str, name: str, url: str, desc: str, delay: int, open_label: str = "Открыть") -> str:
    return f'''
                <article class="project-item fold wf-target" data-fold="{delay}">
                    <hr class="divider">
                    <div class="project-row">
                        <div class="project-left"><div class="project-icon">{icon}</div><div class="career-company">{name}</div></div>
                        <a class="project-link" href="{url}" target="_blank" rel="noopener">{open_label} →</a>
                    </div>
                    <div class="project-preview project-preview--{icon} wf-target">{project_visual(icon)}</div>
                    <p class="work-desc">{desc}</p>
                </article>'''


def projects_content() -> str:
    blocks = [
        ("ev", "ds-eval", "/ds-eval/", "Бенчмарк: прогоняет одни и те же UI&#8209;задачи через разные модели и показывает, насколько агент следует дизайн&#8209;системе.", 120),
        ("ds", "ds-health", "https://antoshkin.tech/ds-health/", "Веб&#8209;тул: вставляешь URL живого сайта и&nbsp;получаешь визуальный отчёт о&nbsp;«здоровье» дизайн&#8209;системы.", 150),
        ("md", "figma-to-design-md", "https://antoshkin.tech/figma-to-design-md/", "CLI: вытаскивает переменные, стили и&nbsp;компоненты из&nbsp;Figma и&nbsp;генерирует markdown&#8209;спеки для AI&#8209;агентов.", 180),
        ("sp", "spektr", "https://antoshkin.tech/spektr/", "Alt+hover по&nbsp;любому элементу: spacing, типографика и&nbsp;цвета прямо в&nbsp;браузере, как Figma Inspect.", 210),
        ("ln", "ds-lint", "https://antoshkin.tech/ds-lint/", "Сканер: находит захардкоженные цвета, отступы и&nbsp;шрифты в&nbsp;коде и&nbsp;предлагает замену на&nbsp;токены.", 240),
    ]
    return '''
                <p class="section-label fold" data-fold="80">Свои проекты</p>
                <h1 class="title fold wf-target" data-fold="100" data-wf-tag="display · h1">Проекты вне работы.</h1>
                <p class="body-text fold wf-target" data-fold="130">Инструменты, которые я&nbsp;собираю для дизайнеров и&nbsp;разработчиков&nbsp;— чтобы работать из&nbsp;одной спецификации.</p>
                ''' + "".join(project_block(*b) for b in blocks)


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
        rows.append(
            f'<a class="article-row wf-target fold" data-fold="{delay}" href="{href}">'
            f'<span class="article-main">'
            f'<span class="article-title">{title}</span>'
            f'<span class="article-tags">{tag_html}</span>'
            f'</span>'
            f'<span class="article-arrow" aria-hidden="true">'
            f'<svg width="16" height="16" viewBox="0 0 16 16" fill="none">'
            f'<path d="M6 4.5 10.5 8 6 11.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>'
            f'</svg></span></a>'
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
                            <p>I build open&#8209;source tools for a shared design and code specification: <a class="about-link tool" href="/ds-eval/" target="_blank" rel="noopener">ds&#8209;eval</a>, <a class="about-link tool" href="https://antoshkin.tech/ds-health/" target="_blank" rel="noopener">ds&#8209;health</a>, <a class="about-link tool" href="https://antoshkin.tech/figma-to-design-md/" target="_blank" rel="noopener">figma&#8209;to&#8209;design&#8209;md</a>, <a class="about-link tool" href="https://antoshkin.tech/design-system-ai-starter/" target="_blank" rel="noopener">design&#8209;system&#8209;ai&#8209;starter</a>, <a class="about-link tool" href="https://antoshkin.tech/spektr/" target="_blank" rel="noopener">spektr</a>, <a class="about-link tool" href="https://antoshkin.tech/ds-lint/" target="_blank" rel="noopener">ds&#8209;lint</a>, and <a class="about-link tool" href="https://antoshkin.tech/ds-coverage/" target="_blank" rel="noopener">ds&#8209;coverage</a>.</p>
                        </article>
                        <article class="positioning-block">
                            <span class="positioning-kicker">AI and code</span>
                            <p>I design in Figma, write code, and build products with <span class="brand-inline"><img src="assets/claude-mark.svg" alt="" width="16" height="16">Claude</span> and <span class="brand-inline"><img src="assets/cursor-mark.svg" alt="" width="16" height="16">Cursor</span>. AI helps me test ideas faster.</p>
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

                <hr class="divider">

                <section class="guide-section fold" data-fold="160">
                    <div class="testi-card">
                        <span class="testi-frame" aria-hidden="true"></span>
                        <span class="annot annot--testi-size" id="testiSize" aria-hidden="true">&mdash;</span>
                        <span class="annot annot--testi-label" aria-hidden="true">quote block<i class="tick tick--right" style="--len: 28px"></i></span>
                        <span class="testi-inset" aria-hidden="true"><b>32 px</b></span>
                        <div class="testi-bg" aria-hidden="true"></div>
                        <div class="testi-shade" aria-hidden="true"></div>
                        <p class="testi-quote">&ldquo;I am interested not only in designing interfaces, but in shaping how they are built&nbsp;— through design systems, tools, code, and automation.&rdquo;</p>
                        <div class="testi-divider" aria-hidden="true"></div>
                        <div class="testi-footer"><span class="testi-logo">antoshkin.tech</span><span class="testi-author">Andrew Antoshkin</span></div>
                    </div>
                </section>
'''


def about_content_en() -> str:
    tools = (
        '<a class="about-link tool" href="/ds-eval/" target="_blank" rel="noopener">ds&#8209;eval</a>, '
        '<a class="about-link tool" href="https://antoshkin.tech/ds-health/" target="_blank" rel="noopener">ds&#8209;health</a>, '
        '<a class="about-link tool" href="https://antoshkin.tech/figma-to-design-md/" target="_blank" rel="noopener">figma&#8209;to&#8209;design&#8209;md</a>, '
        '<a class="about-link tool" href="https://antoshkin.tech/design-system-ai-starter/" target="_blank" rel="noopener">design&#8209;system&#8209;ai&#8209;starter</a>, '
        '<a class="about-link tool" href="https://antoshkin.tech/spektr/" target="_blank" rel="noopener">spektr</a>, '
        '<a class="about-link tool" href="https://antoshkin.tech/ds-lint/" target="_blank" rel="noopener">ds&#8209;lint</a>, and '
        '<a class="about-link tool" href="https://antoshkin.tech/ds-coverage/" target="_blank" rel="noopener">ds&#8209;coverage</a>'
    )
    return f'''
                <h1 class="title fold" data-fold="100">About me</h1>
                <div class="about-prose fold" data-fold="120">
                    <p class="about-text about-lead">Hello.<br>I&rsquo;m Andrew Antoshkin, a designer. I build products, design systems, and tools that connect design and code.</p>
                    <p class="about-text">I am interested not only in designing interfaces, but in shaping how they are built through design systems, tools, code, and automation&nbsp;— especially as AI changes the product development process itself.</p>
                    <p class="about-text">Alongside my main work, I build open&#8209;source tools for designers and developers. I am especially interested in tools that let both disciplines work from a shared specification. These include {tools}.</p>
                    <p class="about-text">Most of my career has focused on systemic challenges within product teams: improving not just interfaces, but the way teams create them.</p>
                    <p class="about-text">I currently develop the design system at <a class="about-link" href="https://yandex.ru" target="_blank" rel="noopener">Yandex HR Tech</a>&nbsp;— from component libraries and tokens to documentation, code, and AI workflows. Before that, I worked on design systems at <a class="about-link" href="https://www.sber.ru" target="_blank" rel="noopener">Sber</a> and designed products at Otkritie Broker and MTS.</p>
                    <p class="about-text">I design in Figma, write code, and build products with <span class="brand-inline"><img src="assets/claude-mark.svg" alt="" width="16" height="16">Claude</span>, <span class="brand-inline"><img src="assets/cursor-mark.svg" alt="" width="16" height="16">Cursor</span>, and other tools to test ideas faster and bring them to a working state.</p>
                    <p class="about-text">Outside work, I enjoy skiing&nbsp;&#9975;&#65039;, travel&nbsp;&#9992;&#65039;, and spending time with my family&nbsp;&#128106;&#8205;&#128105;&#8205;&#128103;.</p>
                    <p class="about-text">If you are interested in AI, design systems, or product development, reach me on <a class="about-link" href="https://t.me/andrewaitken" target="_blank" rel="noopener">Telegram</a> or by <a class="about-link" href="mailto:andrew.antoshkin@gmail.com">email</a>.</p>
                </div>
'''


def projects_content_en() -> str:
    blocks = [
        ("ev", "ds-eval", "/ds-eval/", "A benchmark that runs the same UI tasks through different models and measures how well coding agents follow your design system.", 120, "Open"),
        ("ds", "ds-health", "https://antoshkin.tech/ds-health/", "A web tool that analyzes a live site and produces a visual report on design system health.", 150, "Open"),
        ("md", "figma-to-design-md", "https://antoshkin.tech/figma-to-design-md/", "A CLI that extracts variables, styles, and components from Figma and generates markdown specifications for AI agents.", 180, "Open"),
        ("sp", "spektr", "https://antoshkin.tech/spektr/", "Alt+hover any element to inspect spacing, typography, and colors in the browser, like Figma Inspect.", 210, "Open"),
        ("ln", "ds-lint", "https://antoshkin.tech/ds-lint/", "A scanner that finds hardcoded colors, spacing, and fonts in code and suggests token replacements.", 240, "Open"),
    ]
    return '''
                <p class="section-label fold" data-fold="80">Side projects</p>
                <h1 class="title fold wf-target" data-fold="100" data-wf-tag="display · h1">Built after hours.</h1>
                <p class="body-text fold wf-target" data-fold="130">Tools I build for designers and developers to work from a shared specification.</p>
                ''' + "".join(project_block(*b) for b in blocks)


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


def load_article_source(stem: str, lang: str) -> tuple[str, str, str, str, str, str, str]:
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
    return meta["title"], meta["h1"], meta["tags"], cover_html, tldr, body, article_nav(stem, lang)


def article_page(stem: str, lang: str) -> None:
    title, h1, tags, cover, tldr, body, nav = load_article_source(stem, lang)
    output_name = f"{stem}.html" if lang == "ru" else f"{stem}-en.html"
    counterpart = f"{stem}-en.html" if lang == "ru" else f"{stem}.html"
    content = f'''
                {cover}
                <div class="article-head fold wf-target" data-fold="100">
                    <h1 class="title">{h1}</h1>
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


def main() -> None:
    pages = [
        ("index.html", "en.html", "ru", "home", "Андрей Антошкин — Design Engineer", "Design Engineer. Дизайн-системы, AI-инструменты и инфраструктура.", home_content()),
        ("projects.html", "projects-en.html", "ru", "projects", "Проекты — Андрей Антошкин", "Опенсорс-инструменты для дизайн-систем и design-to-code.", projects_content()),
        ("writing.html", "writing-en.html", "ru", "writing", "Статьи — Андрей Антошкин", "Статьи про Figma, Cursor, design systems и AI.", writing_content("ru")),
        ("approach.html", "approach-en.html", "ru", "approach", "Подход — Андрей Антошкин", "Как превращаю сложные продуктовые задачи в работающие системы — от модели и прототипа до продакшена.", approach_content()),
        ("collab.html", "collab-en.html", "ru", "collab", "Сотрудничество — Андрей Антошкин", "Менторство, воркшопы и консалтинг по дизайн-системам.", collab_content()),
        ("en.html", "index.html", "en", "home", "Andrew Antoshkin — Design Engineer", "Design Engineer building design systems, AI tools, and product infrastructure.", home_content_en()),
        ("projects-en.html", "projects.html", "en", "projects", "Projects — Andrew Antoshkin", "Open-source tools for design systems and design-to-code workflows.", projects_content_en()),
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


if __name__ == "__main__":
    main()
