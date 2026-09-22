"""In-site project pages. Generated into the main site shell."""
from __future__ import annotations


def href(slug: str, lang: str) -> str:
    return f"{slug}.html" if lang == "ru" else f"{slug}-en.html"


PROJECTS = [
    {
        "slug": "ds-eval",
        "icon": "ev",
        "name": "ds-eval",
        "kicker": ("Бенчмарк", "Benchmark"),
        "desc": (
            "Прогоняет одни и&nbsp;те&nbsp;же UI&#8209;задачи через разные ответы модели и&nbsp;показывает, следует&nbsp;ли агент уже существующей дизайн&#8209;системе.",
            "Runs the same UI tasks through model outputs and measures whether a coding agent follows a design system it did not invent.",
        ),
        "meta": (
            "Harness, который измеряет, следует ли AI-агент существующей дизайн-системе.",
            "A harness that measures whether an AI coding agent follows an existing design system.",
        ),
        "lead": (
            "Может&nbsp;ли агент пользоваться дизайн&#8209;системой, которую он&nbsp;не&nbsp;придумал сам? ds&#8209;eval задаёт одни и&nbsp;те&nbsp;же задачи, собирает интерфейс и&nbsp;считает, где модель взяла компонент системы, а&nbsp;где нарисовала свой.",
            "Can a coding agent use a design system it did not invent? ds&#8209;eval gives models the same tasks, builds the UI, and scores whether the result uses the system or invents its own.",
        ),
        "github": "https://github.com/AndrewAntoshkin/ds-eval",
        "github_label": ("Репозиторий на&nbsp;GitHub", "Repository on GitHub"),
        "legacy": "ds-eval/index.html",
        "body": {
            "ru": """
<h2>Что измеряется</h2>
<p>Каждый кейс&nbsp;— продуктовая задача: страница настроек, селект, пустое состояние, подтверждение удаления. Модель получает документацию демо&#8209;системы и&nbsp;должна собрать экран из&nbsp;её&nbsp;компонентов.</p>
<p>Оценка складывается из&nbsp;разных проверок, а&nbsp;не&nbsp;из&nbsp;одного мнения модели:</p>
<ul>
<li>импорты из&nbsp;<code>@ds</code>, запрет сырого цвета и&nbsp;нативных контролов</li>
<li>сборка, скриншот и&nbsp;клики в&nbsp;Playwright</li>
<li>доступность через axe</li>
<li>отдельные судьи визуала и&nbsp;UX&nbsp;— только на&nbsp;живом прогоне</li>
</ul>
<h2>Что показал офлайн-прогон</h2>
<p>Опубликованный результат&nbsp;— smoke&#8209;набор из&nbsp;10&nbsp;кейсов. Это заготовленные ответы, не&nbsp;вызов Claude или Codex.</p>
<dl class="fact-list">
<div class="fact-row"><dt>Fixture</dt><dd>87.8 общий · DS&nbsp;87 · доступность&nbsp;100</dd></div>
<div class="fact-row"><dt>Naive</dt><dd>59.3 общий · DS&nbsp;5.7 · доступность&nbsp;78</dd></div>
<div class="fact-row"><dt>Разница</dt><dd>DS падает на&nbsp;81&nbsp;пункт, когда ответ игнорирует систему. Функциональность при этом та&nbsp;же, 70.</dd></div>
</dl>
<p>Наивный ответ рисует свой <code>button</code> и&nbsp;хардкодит цвет. Ответ, который знает систему, берёт <code>Button</code>, <code>Input</code> и&nbsp;токены. Harness это различает. Он&nbsp;не&nbsp;показывает, какая продакшен-модель сильнее.</p>
<h2>Как запустить</h2>
<pre><code>cd ds-eval
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
ds-eval run --model fixture --suite smoke
ds-eval run --model fixture-naive --suite smoke
ds-eval compare RUN_FIXTURE RUN_NAIVE</code></pre>
<p>Живые модели читают <code>ANTHROPIC_API_KEY</code> и&nbsp;<code>OPENAI_API_KEY</code> из&nbsp;окружения. Ключи не&nbsp;лежат в&nbsp;конфиге.</p>
<h2>Предел</h2>
<p>Высокий балл значит, что ответ следовал этой системе на&nbsp;этом наборе. Он&nbsp;не&nbsp;значит, что экран готов в&nbsp;продакшен. Судьи на&nbsp;LLM&nbsp;— сигнал, не&nbsp;истина. Надёжное ядро&nbsp;— импорты, токены, axe и&nbsp;Playwright.</p>
""",
            "en": """
<h2>What it measures</h2>
<p>Each case is a product task: a settings page, a select, an empty state, a destructive confirm. The model receives the demo design system and has to build the screen from its components.</p>
<p>The score is a set of checks, not one model’s opinion:</p>
<ul>
<li>imports from <code>@ds</code>, and a ban on raw colors and native controls</li>
<li>build, screenshot, and Playwright clicks</li>
<li>accessibility through axe</li>
<li>visual and UX judges, only on a live model run</li>
</ul>
<h2>What the offline run shows</h2>
<p>The published result is a 10-case smoke suite. The answers are fixtures, not a call to Claude or Codex.</p>
<dl class="fact-list">
<div class="fact-row"><dt>Fixture</dt><dd>87.8 overall · DS 87 · accessibility 100</dd></div>
<div class="fact-row"><dt>Naive</dt><dd>59.3 overall · DS 5.7 · accessibility 78</dd></div>
<div class="fact-row"><dt>Gap</dt><dd>DS drops 81 points when the answer ignores the system. Functional score stays at 70.</dd></div>
</dl>
<p>The naive answer draws its own <code>button</code> and hardcodes a color. The system-aware answer uses <code>Button</code>, <code>Input</code>, and tokens. The harness can tell those apart. It does not say which production model is stronger.</p>
<h2>Run it</h2>
<pre><code>cd ds-eval
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
ds-eval run --model fixture --suite smoke
ds-eval run --model fixture-naive --suite smoke
ds-eval compare RUN_FIXTURE RUN_NAIVE</code></pre>
<p>Live models read <code>ANTHROPIC_API_KEY</code> and <code>OPENAI_API_KEY</code> from the environment. Keys are not stored in config.</p>
<h2>Limit</h2>
<p>A high score means the answer followed this design system on this suite. It does not mean the screen is ready for production. LLM judges are a signal. The reliable core is imports, tokens, axe, and Playwright.</p>
""",
        },
    },
    {
        "slug": "ds-context",
        "icon": "cx",
        "name": "ds-context",
        "kicker": ("Контекст", "Context"),
        "desc": (
            "Собирает из токенов, компонентов и спеки короткий пакет для модели и считает, сколько токенов стоит каждая упаковка.",
            "Builds a short model pack from tokens, components, and a spec, and prices each packing strategy in tokens.",
        ),
        "meta": (
            "Компилятор контекста дизайн-системы для coding-агента.",
            "A design-system context compiler for a coding agent.",
        ),
        "lead": ("", ""),
        "github": "https://github.com/AndrewAntoshkin/ds-context",
        "github_label": ("Репозиторий на GitHub", "Repository on GitHub"),
        "legacy": "",
    },
    {
        "slug": "ui-repair",
        "icon": "fx",
        "name": "ui-repair",
        "kicker": ("Починка", "Repair"),
        "desc": (
            "Заменяет сырые контролы, hex и самодельный modal на компоненты системы и показывает, какие проверки перевернулись.",
            "Replaces raw controls, hex, and a homemade modal with system components, and shows which checks flipped.",
        ),
        "meta": (
            "Правила починки интерфейса под дизайн-систему.",
            "Rule-based repair of an interface onto a design system.",
        ),
        "lead": ("", ""),
        "github": "https://github.com/AndrewAntoshkin/ui-repair",
        "github_label": ("Репозиторий на GitHub", "Repository on GitHub"),
        "legacy": "",
    },
    {
        "slug": "prompt-regress",
        "icon": "rg",
        "name": "prompt-regress",
        "kicker": ("Регрессия", "Regression"),
        "desc": (
            "Сравнивает две версии промпта на одном наборе UI-кейсов: что выросло, что сломалось, а не средний балл.",
            "Compares two prompt versions on one UI suite: what improved, what broke, instead of an average score.",
        ),
        "meta": (
            "Дифф записанных прогонов между версиями промпта.",
            "A diff of recorded runs between prompt versions.",
        ),
        "lead": ("", ""),
        "github": "https://github.com/AndrewAntoshkin/prompt-regress",
        "github_label": ("Репозиторий на GitHub", "Repository on GitHub"),
        "legacy": "",
    },
    {
        "slug": "figma-to-design-md",
        "icon": "md",
        "name": "figma-to-design-md",
        "kicker": ("CLI", "CLI"),
        "desc": (
            "Вытаскивает переменные, стили и&nbsp;компоненты из&nbsp;Figma и&nbsp;собирает markdown&#8209;спеку, которую может прочитать агент.",
            "Extracts variables, styles, and components from Figma into a markdown spec an agent can read.",
        ),
        "meta": (
            "CLI: Figma-файл становится markdown-спекой для AI-агентов.",
            "A CLI that turns a Figma file into a markdown spec for AI agents.",
        ),
        "lead": (
            "Агенту нужна спецификация рядом с&nbsp;кодом, а&nbsp;не&nbsp;ссылка на&nbsp;файл, который он&nbsp;не&nbsp;откроет. CLI читает Figma и&nbsp;кладёт токены, компоненты и&nbsp;пробелы системы в&nbsp;markdown.",
            "An agent needs a spec next to the code, not a link to a file it cannot open. The CLI reads Figma and writes tokens, components, and system gaps into markdown.",
        ),
        "github": "https://github.com/AndrewAntoshkin/figma-to-design-md",
        "github_label": ("Репозиторий на&nbsp;GitHub", "Repository on GitHub"),
        "legacy": "figma-to-design-md/index.html",
        "body": {
            "ru": """
<h2>Что попадает в спеку</h2>
<p>Переменные и&nbsp;стили, список компонентов и&nbsp;отдельный файл пробелов: то, что в&nbsp;макете есть, а&nbsp;в&nbsp;спеке ещё не&nbsp;описано. Это общий источник для дизайна, кода и&nbsp;агента.</p>
<h2>Как запустить</h2>
<p>Нужен personal access token Figma с&nbsp;правом читать содержимое файла и&nbsp;ключ файла из&nbsp;URL, кусок между <code>/design/</code> и&nbsp;названием.</p>
<pre><code>npx figma-to-design-md extract --file ABC123xyz --token figd_xxx</code></pre>
<p>Либо глобально: <code>npm i -g figma-to-design-md</code>.</p>
""",
            "en": """
<h2>What lands in the spec</h2>
<p>Variables and styles, the component list, and a gaps file for things that exist in the file but are not described yet. Design, code, and the agent then share one source.</p>
<h2>Run it</h2>
<p>You need a Figma personal access token that can read file content, and the file key from the URL: the segment between <code>/design/</code> and the file name.</p>
<pre><code>npx figma-to-design-md extract --file ABC123xyz --token figd_xxx</code></pre>
<p>Or install it: <code>npm i -g figma-to-design-md</code>.</p>
""",
        },
    },
    {
        "slug": "ds-lint",
        "icon": "ln",
        "name": "ds-lint",
        "kicker": ("Сканер", "Scanner"),
        "desc": (
            "Находит захардкоженные цвета, отступы и&nbsp;шрифты в&nbsp;коде и&nbsp;предлагает замену на&nbsp;токены.",
            "Finds hardcoded colors, spacing, and fonts in code and suggests a token instead.",
        ),
        "meta": (
            "Сканер захардкоженных цветов, отступов и шрифтов.",
            "A scanner for hardcoded colors, spacing, and fonts.",
        ),
        "lead": (
            "Токены бесполезны, если рядом с&nbsp;ними в&nbsp;коде остаётся <code>#FF4D4F</code> и&nbsp;<code>16px</code>. ds&#8209;lint находит такие значения и, если рядом есть файл токенов, предлагает имя из&nbsp;системы.",
            "Tokens do nothing if the code next to them still says <code>#FF4D4F</code> and <code>16px</code>. ds&#8209;lint finds those values and, when a token file is nearby, suggests the system name.",
        ),
        "github": "https://github.com/AndrewAntoshkin/ds-lint",
        "github_label": ("Репозиторий на&nbsp;GitHub", "Repository on GitHub"),
        "legacy": "ds-lint/index.html",
        "body": {
            "ru": """
<h2>Что ловит</h2>
<p>Цвета, отступы и&nbsp;типографику, записанные числом или hex прямо в&nbsp;компоненте. Рядом можно положить <code>tokens.css</code>, и&nbsp;тогда в&nbsp;отчёте будет не&nbsp;только нарушение, но&nbsp;и&nbsp;кандидат на&nbsp;замену.</p>
<h2>Как запустить</h2>
<pre><code>npx ds-lint src/
ds-lint src/ --tokens tokens.css
ds-lint src/ --format markdown --out report.md
ds-lint src/ --tokens tokens.css --strict</code></pre>
<p><code>--strict</code> подходит для CI: сборка падает, если в&nbsp;диффе остались сырые значения.</p>
""",
            "en": """
<h2>What it catches</h2>
<p>Colors, spacing, and type written as a raw number or hex inside a component. Point it at <code>tokens.css</code> and the report includes a replacement candidate, not only the violation.</p>
<h2>Run it</h2>
<pre><code>npx ds-lint src/
ds-lint src/ --tokens tokens.css
ds-lint src/ --format markdown --out report.md
ds-lint src/ --tokens tokens.css --strict</code></pre>
<p><code>--strict</code> is the CI mode: the check fails when raw values remain in the diff.</p>
""",
        },
    },
    {
        "slug": "ds-coverage",
        "icon": "cv",
        "name": "ds-coverage",
        "kicker": ("Сканер", "Scanner"),
        "desc": (
            "Считает, какая часть кода реально импортирует дизайн&#8209;систему, и&nbsp;где компоненты написаны заново.",
            "Measures how much of the codebase actually imports the design system, and where components were rebuilt locally.",
        ),
        "meta": (
            "Отчёт о том, насколько код пользуется дизайн-системой.",
            "A report on how much of the code actually uses the design system.",
        ),
        "lead": (
            "Библиотека может быть большой, а&nbsp;продукт&nbsp;— написанным мимо неё. ds&#8209;coverage считает импорты: какие компоненты берутся из&nbsp;системы, какие не&nbsp;используются и&nbsp;что собрано рядом своим кодом.",
            "A library can be large while the product is built beside it. ds&#8209;coverage counts imports: which components come from the system, which are unused, and what was rebuilt next to them.",
        ),
        "github": "https://github.com/AndrewAntoshkin/ds-coverage",
        "github_label": ("Репозиторий на&nbsp;GitHub", "Repository on GitHub"),
        "legacy": "ds-coverage/index.html",
        "body": {
            "ru": """
<h2>Что видно в отчёте</h2>
<ul>
<li>какие компоненты системы импортируются и&nbsp;как часто</li>
<li>что есть в&nbsp;инвентаре и&nbsp;нигде не&nbsp;используется</li>
<li>где рядом с&nbsp;системой появляется местная копия</li>
</ul>
<h2>Как запустить</h2>
<pre><code>npx ds-coverage src/ --ds @acme/ui
ds-coverage src/ --ds @acme/ui --inventory components.json
ds-coverage src/ --ds @acme/ui --inventory components.json --min 70</code></pre>
<p><code>--min</code> задаёт порог для CI. Ниже него команда завершается с&nbsp;ошибкой.</p>
""",
            "en": """
<h2>What the report shows</h2>
<ul>
<li>which system components are imported, and how often</li>
<li>what is in the inventory and used nowhere</li>
<li>where a local copy appears next to the system</li>
</ul>
<h2>Run it</h2>
<pre><code>npx ds-coverage src/ --ds @acme/ui
ds-coverage src/ --ds @acme/ui --inventory components.json
ds-coverage src/ --ds @acme/ui --inventory components.json --min 70</code></pre>
<p><code>--min</code> is the CI threshold. Below it, the command exits with an error.</p>
""",
        },
    },
    {
        "slug": "ds-health",
        "icon": "ds",
        "name": "ds-health",
        "kicker": ("Веб-тул", "Web tool"),
        "desc": (
            "Вставляешь URL живого сайта и&nbsp;получаешь отчёт: сколько на&nbsp;странице цветов, шрифтов, отступов и&nbsp;радиусов.",
            "Paste a live URL and get a report on how many colors, type styles, spacings, and radii the page actually uses.",
        ),
        "meta": (
            "Отчёт о здоровье дизайн-системы на живом сайте.",
            "A design-system health report for a live website.",
        ),
        "lead": (
            "Дизайн&#8209;система в&nbsp;Figma и&nbsp;система на&nbsp;проде часто расходятся. ds&#8209;health открывает страницу в&nbsp;настоящем браузере и&nbsp;считает, насколько вёрстка держится на&nbsp;небольшом наборе значений.",
            "The system in Figma and the system in production often drift apart. ds&#8209;health opens a page in a real browser and measures whether the UI stays on a small set of values.",
        ),
        "github": "https://github.com/AndrewAntoshkin/ds-health",
        "github_label": ("Репозиторий на&nbsp;GitHub", "Repository on GitHub"),
        "legacy": "ds-health/index.html",
        "body": {
            "ru": """
<h2>Что считает</h2>
<ul>
<li>цвета текста и&nbsp;фона, в&nbsp;том числе использование CSS&#8209;переменных</li>
<li>семейства, размеры и&nbsp;начертания видимого текста</li>
<li>разные значения padding и&nbsp;gap</li>
<li>ненулевые радиусы скругления</li>
</ul>
<p>Меньше уникальных значений&nbsp;— выше оценка. Отчёт показывает счёт, сигналы и&nbsp;что править в&nbsp;первую очередь.</p>
<h2>Как устроен</h2>
<p>Инструмент загружает страницу в&nbsp;Chromium через Playwright, снимает видимые элементы и&nbsp;читает их&nbsp;computed styles. Это не&nbsp;разбор исходников и&nbsp;не&nbsp;скриншот «на&nbsp;глаз».</p>
<h2>Как запустить</h2>
<pre><code>git clone https://github.com/AndrewAntoshkin/ds-health.git
cd ds-health
npm install
npm start</code></pre>
<p>Дальше открывается <code>http://localhost:3000</code>. Если порт занят: <code>PORT=3002 npm start</code>.</p>
""",
            "en": """
<h2>What it counts</h2>
<ul>
<li>text and background colors, including CSS variables</li>
<li>families, sizes, and weights in visible text</li>
<li>distinct padding and gap values</li>
<li>non-zero corner radii</li>
</ul>
<p>Fewer unique values means a higher score. The report shows the score, the signals, and what to fix first.</p>
<h2>How it works</h2>
<p>The tool loads the page in Chromium through Playwright, samples visible elements, and reads their computed styles. It does not lint source files, and it does not judge a screenshot by eye.</p>
<h2>Run it</h2>
<pre><code>git clone https://github.com/AndrewAntoshkin/ds-health.git
cd ds-health
npm install
npm start</code></pre>
<p>Then open <code>http://localhost:3000</code>. If the port is busy: <code>PORT=3002 npm start</code>.</p>
""",
        },
    },
]


def _lang_index(lang: str) -> int:
    return 0 if lang == "ru" else 1


def project_nav(index: int, lang: str) -> str:
    prev_label = "Предыдущий" if lang == "ru" else "Previous"
    next_label = "Следующий" if lang == "ru" else "Next"
    links = ["<span></span>"]
    if index > 0:
        prev = PROJECTS[index - 1]
        links[0] = (
            f'<a href="{href(prev["slug"], lang)}">'
            f'<span class="article-nav-label">{prev_label}</span>'
            f'<span class="article-nav-title">{prev["name"]}</span></a>'
        )
    if index < len(PROJECTS) - 1:
        nxt = PROJECTS[index + 1]
        links.append(
            f'<a href="{href(nxt["slug"], lang)}" class="next">'
            f'<span class="article-nav-label">{next_label}</span>'
            f'<span class="article-nav-title">{nxt["name"]}</span></a>'
        )
    return f'<nav class="article-nav" aria-label="Projects">{"".join(links)}</nav>'


def page_content(project: dict, index: int, lang: str, visual: str) -> str:
    i = _lang_index(lang)
    github = ""
    if project["github"]:
        github = (
            f'<p><a href="{project["github"]}" target="_blank" rel="noopener noreferrer">'
            f'{project["github_label"][i]}</a></p>'
        )
    preview = ""
    if visual:
        preview = (
            f'<div class="project-preview project-preview--page project-preview--{project["icon"]}" aria-hidden="true">'
            f'{visual}</div>'
        )
    return f'''
                <p class="section-label fold" data-fold="80">{project["kicker"][i]}</p>
                <h1 class="title fold wf-target" data-fold="100">{project["name"]}</h1>
                <p class="body-text fold" data-fold="120">{project["lead"][i]}</p>
                {preview}
                <div class="prose fold" data-fold="140">{project["body"][lang]}{github}</div>
                {project_nav(index, lang)}
'''


def list_blocks(lang: str) -> list[tuple]:
    i = _lang_index(lang)
    open_label = "Открыть" if lang == "ru" else "Open"
    blocks = []
    for index, project in enumerate(PROJECTS):
        blocks.append(
            (
                project["icon"],
                project["name"],
                href(project["slug"], lang),
                project["desc"][i],
                120 + index * 30,
                open_label,
            )
        )
    return blocks
