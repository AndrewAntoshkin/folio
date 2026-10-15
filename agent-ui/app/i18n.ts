export type Lang = "ru" | "en"

export const lang: Lang = document.documentElement.lang === "ru" ? "ru" : "en"

export const t = <T,>(ru: T, en: T): T => (lang === "ru" ? ru : en)

export const promptLabels = t(
  {
    placeholder: "Спросите агента",
    attachLabel: "Прикрепить файл",
    sendLabel: "Отправить",
    stopLabel: "Остановить",
    removeLabel: (name: string) => `Убрать ${name}`,
  },
  {
    placeholder: "Ask the agent",
    attachLabel: "Attach file",
    sendLabel: "Send",
    stopLabel: "Stop generating",
    removeLabel: (name: string) => `Remove ${name}`,
  },
)

export const toolCallLabels = t(
  {
    pending: "В очереди",
    running: "Выполняется",
    success: "Готово",
    error: "Ошибка",
    inputTitle: "Аргументы",
    outputTitle: "Результат",
    errorTitle: "Ошибка",
  },
  {
    pending: "Queued",
    running: "Running",
    success: "Done",
    error: "Failed",
    inputTitle: "Input",
    outputTitle: "Output",
    errorTitle: "Error",
  },
)

export const agentDockLabels = t(
  {
    idle: "Ждёт задачу",
    running: "Работает",
    waiting: "Ждёт вашего решения",
    done: "Готово",
    error: "Остановлен с ошибкой",
    stop: "Остановить агента",
  },
  {
    idle: "Idle",
    running: "Working",
    waiting: "Needs your input",
    done: "Finished",
    error: "Stopped with an error",
    stop: "Stop agent",
  },
)

export const approvalLabels = t(
  {
    approveLabel: "Разрешить",
    denyLabel: "Отклонить",
    approvedLabel: "Разрешено",
    deniedLabel: "Отклонено",
    alwaysLabel: "Больше не спрашивать для этого действия",
  },
  {
    approveLabel: "Allow",
    denyLabel: "Deny",
    approvedLabel: "Allowed",
    deniedLabel: "Denied",
    alwaysLabel: "Don't ask again for this action",
  },
)

export const thinkingLabels = t(
  { label: "Думает", doneLabel: (s: number) => `Думал ${s} с` },
  { label: "Thinking", doneLabel: (s: number) => `Thought for ${s}s` },
)

export const accents = {
  Neutral: t("Нейтральный", "Neutral"),
  Violet: t("Фиолетовый", "Violet"),
  Green: t("Зелёный", "Green"),
  Orange: t("Оранжевый", "Orange"),
} as const

export const copy = {
  brand: "agent-ui",
  nav: {
    components: t("Компоненты", "Components"),
    agents: t("Для агентов", "For agents"),
    why: t("Зачем я делаю это сам", "Why I built it"),
    projects: t("Другие проекты", "Other projects"),
    light: t("Светлая тема", "Light theme"),
    dark: t("Тёмная тема", "Dark theme"),
    lang: t("EN", "RU"),
    langHref: t("/agent-ui/en", "/agent-ui/"),
    whyHref: t("/agent-ui", "/en/agent-ui"),
    projectsHref: t("/projects", "/en/projects"),
    homeHref: t("/", "/en"),
  },
  hero: {
    title: t(
      "Компоненты для AI-интерфейсов, которые агент умеет брать",
      "Components for AI interfaces that agents know how to use",
    ),
    lead: t(
      "Пятнадцать React-компонентов для чатов и агентов. Каждый ставится вместе с правилом для Cursor: когда его брать, когда нет и какие пропсы важны. Цвета только из токенов темы — агенту нечего захардкодить.",
      "Fifteen React components for chat and agent UIs. Each one installs together with a Cursor rule that says when to use it, when not to, and which props matter. They use only theme tokens, so a coding agent can't drift into hardcoded colors.",
    ),
    pointLint: t(
      "Сборка падает на hex, палитре и произвольных значениях. Поменяли токены — все компоненты следуют:",
      "The build fails on hex colors, palette classes and arbitrary values. Change the tokens and every component follows:",
    ),
    openSource: t("Open source", "Open source"),
    install: t("Поставить всё", "Install all"),
    copied: t("Скопировано", "Copied"),
    browse: t("Смотреть компоненты", "Browse components"),
    note: t(
      "Одна команда ставит компоненты и правила для Cursor.",
      "One command installs the components and the Cursor rules.",
    ),
    frame: "antoshkin.tech/agent-ui",
  },
  tabs: {
    preview: t("Превью", "Preview"),
    code: t("Код", "Code"),
    rule: t("Правило агента", "Agent rule"),
  },
  ruleHint: t(
    "Ставится в",
    "Installed to",
  ),
  ruleHintRest: t(
    ". По description агент решает, поднимать ли правило.",
    ". The description line is what the agent reads to decide whether to load it.",
  ),
  copy: t("Копировать", "Copy"),
  accentsLabel: t("Основной токен", "Primary token"),
  agents: {
    title: t("Для агентов", "For agents"),
    lead: t(
      "Библиотека компонентов полезна агенту только если он берёт нужный компонент и пропсы. agent-ui даёт ему три вещи для чтения.",
      "A component library is only useful to a coding agent if the agent picks the right component and passes the right props. agent-ui gives it three things to read.",
    ),
    r1t: t("Правило рядом с кодом.", "Rules next to the code."),
    r1Before: t("Каждая установка кладёт ", "Each install drops a "),
    r1After: t(
      ". Description совпадает с задачей («агент спрашивает разрешение перед рискованным действием»), поэтому Cursor поднимает его только когда нужно.",
      '. Its description matches the task ("an agent asks permission before a risky action"), so Cursor loads it only when relevant.',
    ),
    r2t: t("Отрицательное пространство.", "Negative space."),
    r2: t(
      "В каждом правиле сказано, для чего компонент не подходит и какой примитив проекта взять вместо. Здесь агенты обычно ошибаются.",
      "Every rule says what the component is not for and which project primitive to use instead. That is where agents usually go wrong.",
    ),
    r3t: t("Индекс до установки.", "An index before install."),
    r3a: t("перечисляет компоненты, а", "lists the components and"),
    r3b: t("держит все правила в одном файле.", "has every rule in one file."),
    sampleAsk: t(
      "> Спроси перед тем, как агент удалит папку build",
      "> Ask before the agent deletes the build folder",
    ),
    sampleLoad: t(
      "Агент поднимает agent-ui-approval.mdc",
      "Agent loads agent-ui-approval.mdc",
    ),
    sampleTitle: t("Выполнить команду в shell", "Run a shell command"),
  },
  footer: {
    by: t("от", "by"),
    why: t("Зачем я делаю это сам", "Why I built it"),
  },
  demo: {
    title: t("Живое демо: агент убирает захардкоженные цвета", "Live demo: an agent fixing hardcoded colors"),
    reset: t("Сбросить", "Reset"),
    ask: t("Что должен сделать агент?", "What should the agent do?"),
    placeholder: t("Спросите агента", "Ask the agent"),
    s1: t("Убрать захардкоженные цвета", "Fix hardcoded colors"),
    s2: t("Заменить отступы на токены", "Swap spacing for tokens"),
    s3: t("Проверить использование кнопок", "Audit the button usage"),
    s1Short: t("Цвета", "Colors"),
    s2Short: t("Отступы", "Spacing"),
    s3Short: t("Кнопки", "Buttons"),
    prompt: t(
      "Найди захардкоженные цвета на странице настроек и замени их токенами",
      "Find hardcoded colors on the settings page and replace them with tokens",
    ),
    prompt2: t(
      "Замени сырые пиксельные отступы на странице настроек токенами spacing",
      "Replace raw pixel spacing on the settings page with spacing tokens",
    ),
    prompt3: t(
      "Проверь, где на странице настроек используются сырые <button> вместо компонента Button",
      "Check where the settings page uses raw <button> elements instead of the Button component",
    ),
    thinking: t(
      "Пользователь хочет замену на токены, а не редизайн. Сначала найти литеральные цвета, потом прочитать файл и сопоставить каждый с ближайшим семантическим токеном.",
      "The user wants token replacements, not a redesign. Find literal colors first, then read the file to map each one to the closest semantic token.",
    ),
    thinking2: t(
      "Ищу произвольные классы вроде p-[18px] и gap-[14px], чтобы заменить их на стандартную шкалу отступов темы.",
      "Scanning for arbitrary spacing classes like p-[18px] and gap-[14px] to map them onto the theme spacing scale.",
    ),
    thinking3: t(
      "Проверю JSX в SettingsPage.tsx на нативные <button> и сверю их пропсы с API компонента Button из системы.",
      "Checking JSX in SettingsPage.tsx for native <button> elements and mapping their props to the design system Button API.",
    ),
    step1: t("Ищу hex-цвета", "Searching for hex colors"),
    step1Spacing: t("Ищу произвольные отступы", "Searching for arbitrary spacing"),
    step1Buttons: t("Ищу нативные <button>", "Searching for raw <button> tags"),
    step2: t("Читаю SettingsPage.tsx", "Reading SettingsPage.tsx"),
    step3: t("Прошу разрешить правку файла", "Asking to edit the file"),
    step4: t("Меняю 6 значений на токены", "Replacing 6 values with tokens"),
    step4Spacing: t("Меняю 4 отступа на шкалу", "Replacing 4 spacing values"),
    step4Buttons: t("Меняю 2 кнопки на <Button>", "Replacing 2 buttons with <Button>"),
    step5: t("Кратко рассказываю, что изменилось", "Summarizing the change"),
    approvalTitle: t("Изменить файл", "Edit a file"),
    approvalDesc: t(
      "Заменить литеральные цвета на text-muted-foreground, border-border и bg-primary.",
      "Replace literal colors with text-muted-foreground, border-border and bg-primary.",
    ),
    approvalDesc2: t(
      "Заменить p-[18px], gap-[14px] и mt-[22px] на p-4, gap-3.5 и mt-6.",
      "Replace p-[18px], gap-[14px], and mt-[22px] with p-4, gap-3.5, and mt-6.",
    ),
    approvalDesc3: t(
      "Заменить 2 нативных <button> на компонент <Button> из дизайн-системы.",
      "Replace 2 native <button> elements with the design system <Button> component.",
    ),
    answerOk: t(
      "Заменил 6 захардкоженных значений в SettingsPage.tsx на токены темы: 4 цвета текста теперь text-muted-foreground, разделитель — border-border, кнопка сохранения — bg-primary. ds-lint по файлу: 0 нарушений.",
      "Replaced 6 hardcoded values in SettingsPage.tsx with theme tokens: 4 text colors now use text-muted-foreground, the divider uses border-border, and the save button uses bg-primary. ds-lint reports 0 violations for the file.",
    ),
    answerOk2: t(
      "Заменил 4 произвольных отступа в SettingsPage.tsx на токены шкалы: p-4, gap-3.5 и mt-6. Сетка страницы теперь выровнена по шагу 4px, ds-lint: 0 нарушений.",
      "Replaced 4 arbitrary spacing classes in SettingsPage.tsx with scale tokens: p-4, gap-3.5, and mt-6. The layout now aligns to the 4px grid with 0 ds-lint violations.",
    ),
    answerOk3: t(
      "Заменил 2 сырых <button> в SettingsPage.tsx на <Button variant=\"secondary\"> и <Button variant=\"destructive\">. Фокус-кольца и состояния disabled теперь идут из системы.",
      "Replaced 2 raw <button> elements in SettingsPage.tsx with <Button variant=\"secondary\"> and <Button variant=\"destructive\">. Focus rings and disabled states now come from the system.",
    ),
    answerNo: t(
      "Ок, SettingsPage.tsx не трогал. Совпадения перечислены в результате grep выше.",
      "Okay, I left SettingsPage.tsx unchanged. The matches are listed in the grep result above.",
    ),
    dockDone: t("Страница настроек на токенах", "Settings page uses tokens"),
    dockRun: t("Убрать захардкоженные цвета", "Fix hardcoded colors"),
    stopped: t("Остановлено пользователем", "Stopped by user"),
    matches: t("SettingsPage.tsx: 6 совпадений", "SettingsPage.tsx: 6 matches"),
    matches2: t("SettingsPage.tsx: 4 совпадения", "SettingsPage.tsx: 4 matches"),
    matches3: t("SettingsPage.tsx: 2 совпадения", "SettingsPage.tsx: 2 matches"),
  },
  demos: {
    msgUser: t("Какой токен взять для разделителя?", "Which token should the divider use?"),
    msgAsst: t(
      "Берите border-border. Он следует теме в светлой и тёмной схеме, отдельный dark-вариант разделителю не нужен. Наведите, чтобы увидеть действия.",
      "Use border-border. It follows the theme in light and dark mode, so the divider never needs its own dark variant. Hover to see actions.",
    ),
    msgStream: t("Смотрю остальную страницу", "Checking the rest of the page"),
    copy: t("Копировать", "Copy"),
    retry: t("Повторить", "Retry"),
    good: t("Хороший ответ", "Good answer"),
    thinkingBody: t(
      "Разделитель на карточке, ему нужен цвет границы из темы, а не серый из палитры. border-border уже адаптируется к тёмной теме.",
      "The divider sits on a card, so it needs the theme border color, not a gray from the palette. border-border already adapts to dark mode.",
    ),
    runAgain: t("Ещё раз", "Run again"),
    reset: t("Сбросить", "Reset"),
    approvalTitle: t("Выполнить команду в shell", "Run a shell command"),
    approvalDesc: t("Перепишет захардкоженные значения в 3 файлах.", "Rewrites hardcoded values in 3 files."),
    pickOne: t("Выберите", "Pick one"),
    wouldSend: t("Отправит:", "Would send:"),
    replay: t("Ещё раз", "Replay"),
    suggestions: [
      t("Кратко про этот репозиторий", "Summarize this repo"),
      t("Найти неиспользуемые токены", "Find unused tokens"),
      t("Объяснить сборку", "Explain the build"),
      t("Написать changelog", "Write a changelog"),
    ] as string[],
    dockTitle: t("Мигрировать кнопки на новый API", "Migrate buttons to the new API"),
    dockOpen: t("Открыть прогон", "Open run"),
    dockHint: t("Наведите или сфокусируйте dock, чтобы открыть шаги", "Hover or focus the dock to open the steps"),
    dockSteps: [
      t("Ищу использования <Button>", "Finding <Button> usages"),
      t("Читаю 14 файлов", "Reading 14 files"),
      t("Переписываю variant-пропсы", "Rewriting variant props"),
      t("Запускаю проверку типов", "Running type check"),
    ] as string[],
    askAnything: t("Спросите что угодно", "Ask anything"),
    planTitle: t("Заменить захардкоженные цвета", "Replace hardcoded colors"),
    planSteps: [
      t("Найти hex-цвета", "Find hex colors"),
      t("Сопоставить каждый с токеном", "Map each one to a token"),
      t("Править SettingsPage.tsx", "Edit SettingsPage.tsx"),
      t("Прогнать ds-lint", "Run ds-lint"),
    ] as string[],
    planDetail: t("6 совпадений в одном файле", "6 matches in one file"),
    planLabels: {
      pending: t("Ещё нет", "Pending"),
      running: t("Делается", "In progress"),
      done: t("Готово", "Done"),
      error: t("Ошибка", "Failed"),
    },
    choiceQuestion: t("Какой токен взять для разделителя?", "Which token should the divider use?"),
    choiceBorder: t("Следует теме в светлой и тёмной схеме", "Follows the theme in light and dark"),
    choiceMuted: t("Мягче и легче потерять", "Softer, and easier to miss"),
    tableCaption: t("Замены в SettingsPage.tsx", "Replacements in SettingsPage.tsx"),
    tableEmpty: t("Замен нет", "No replacements"),
    tableFile: t("Файл", "File"),
    tableWas: t("Было", "Was"),
    tableNow: t("Стало", "Now"),
    tableCount: t("Раз", "Count"),
    chartCaption: t("Нарушения по файлам", "Violations per file"),
    chartEmpty: t("Нечего показать", "Nothing to chart"),
    chartBar: t("Столбцы", "Bars"),
    chartLine: t("Линия", "Line"),
    sourcesLabel: t("Источники", "Sources"),
    sourceToken: t("Токены цвета", "Color tokens"),
    sourceTokenExcerpt: t("Семантические токены вместо литеральных цветов.", "Semantic tokens instead of literal colors."),
    sourceLint: t("Что ловит ds-lint", "What ds-lint catches"),
    sourceLintExcerpt: t("Hex, классы палитры и произвольные значения.", "Hex, palette classes and arbitrary values."),
    artifactOpen: t("Открыть", "Open"),
    artifactClose: t("Закрыть", "Close"),
    artifactMeta: t("src/settings/SettingsPage.tsx", "src/settings/SettingsPage.tsx"),
  },
}
