/**
 * Motion Lab
 * Original experiments. Each id is a component in islands/original/experiments.jsx.
 */
import { el, pick, reduced } from "./runtime.js";

const EXPERIMENTS = [
  {
    id: "stack",
    title: { ru: "Стопка", en: "Stack" },
    kicker: { ru: "Скролл", en: "Scroll" },
    line: { ru: "Карточки YaOS уходят в глубину", en: "YaOS cards recede into depth" },
    hint: { ru: "Крутите колесо внутри плитки.", en: "Scroll inside the tile." },
    idea: {
      ru: "Четыре стеклянные карточки стоят стопкой: масштаб, сдвиг и размытие. Колесо снимает верхнюю.",
      en: "Four glass cards sit in a stack: scale, offset, and blur. The wheel peels the front one away.",
    },
    tokens: ["scroll", "scale", "sticky"],
  },
  {
    id: "intent",
    title: { ru: "Намерение", en: "Intent" },
    kicker: { ru: "YaOS", en: "YaOS" },
    line: { ru: "Фраза вместо меню", en: "A sentence instead of a menu" },
    hint: { ru: "Выберите чип или напишите своё.", en: "Pick a chip or type your own." },
    idea: {
      ru: "Поле намерения YaOS. Чип или свободный текст возвращает спокойный ответ на пружине.",
      en: "A YaOS intent field. A chip or a free sentence returns a quiet reply on a spring.",
    },
    tokens: ["spring", "input", "chips"],
  },
  {
    id: "gather",
    hero: 0.82,
    title: { ru: "Сборка", en: "Gather" },
    kicker: { ru: "Текст", en: "Type" },
    line: { ru: "Буквы сходятся в слово", en: "Letters settle into a word" },
    hint: { ru: "Крутите колесо — слово собирается.", en: "Scroll and the word gathers." },
    idea: {
      ru: "Буквы «спокойно» разъехались и сходятся к центру по прогрессу скролла.",
      en: "The letters of “quietly” start apart and meet as you scroll.",
    },
    tokens: ["scroll", "type", "reveal"],
  },
  {
    id: "dock",
    title: { ru: "Док", en: "Dock" },
    kicker: { ru: "YaOS", en: "YaOS" },
    line: { ru: "Дом, вещи, город, работа", en: "Home, devices, city, work" },
    hint: { ru: "Наведите на пункт или нажмите его.", en: "Hover a label or press it." },
    idea: {
      ru: "Док YaOS. Наведение открывает стеклянный список устройств, городских дел или кейсов.",
      en: "A YaOS dock. Hover opens a glass list of devices, city tasks, or cases.",
    },
    tokens: ["hover", "spring", "menu"],
  },
  {
    id: "melt",
    title: { ru: "Сплав", en: "Melt" },
    kicker: { ru: "Жест", en: "Gesture" },
    line: { ru: "Свет и климат сливаются", en: "Light and climate fuse" },
    hint: { ru: "Потяните синюю каплю.", en: "Drag the blue blob." },
    idea: {
      ru: "Свет и климат. Перетащите синюю каплю: goo-фильтр вытягивает между ними мост.",
      en: "Light and climate. Drag the blue blob and a goo filter pulls a bridge between them.",
    },
    tokens: ["drag", "spring", "goo"],
  },
  {
    id: "passage",
    title: { ru: "Переход", en: "Passage" },
    kicker: { ru: "Кейс", en: "Case" },
    line: { ru: "Список становится разворотом", en: "A list becomes a spread" },
    hint: { ru: "Откройте кейс, затем вернитесь.", en: "Open a case, then go back." },
    idea: {
      ru: "Строка растёт в полный разворот кейса. Контейнер меняет размер, текст проявляется отдельно и не тянется.",
      en: "A row grows into a full case spread. The container resizes, and the text fades in on its own so it never stretches.",
    },
    tokens: ["layout", "spring", "shared"],
  },
  {
    id: "sheet",
    title: { ru: "Шторка", en: "Sheet" },
    kicker: { ru: "Москва", en: "Moscow" },
    line: { ru: "Оплата парковки во дворе", en: "Pay for the courtyard bay" },
    hint: { ru: "Потяните шторку вниз или подтвердите.", en: "Drag the sheet down, or confirm." },
    idea: {
      ru: "Шторка оплаты закрывает двор. Потяните её вниз — остаётся карта двора и место 14.",
      en: "The payment sheet covers the courtyard. Drag it down and the yard map with bay 14 stays.",
    },
    tokens: ["drag", "spring", "sheet"],
  },
  {
    id: "island",
    title: { ru: "Остров", en: "Island" },
    kicker: { ru: "Дом", en: "Home" },
    line: { ru: "Часы, звонок, открытая дверь", en: "Clock, bell, open door" },
    hint: { ru: "Нажмите остров — три состояния.", en: "Tap the island through three states." },
    idea: {
      ru: "Остров дома: время, домофон и живая активность с действиями. Ширина и высота пружинят, текст не масштабируется.",
      en: "A home island: the clock, the doorbell, and a live activity with actions. Width and height spring, the text does not scale.",
    },
    tokens: ["spring", "width", "tap"],
  },
  {
    id: "toast",
    title: { ru: "Заметки", en: "Notes" },
    kicker: { ru: "Система", en: "System" },
    line: { ru: "Стопка раскрывается под рукой", en: "The stack opens under the hand" },
    hint: { ru: "Наведите, чтобы раскрыть. Нажмите, чтобы убрать.", en: "Hover to expand. Tap a note to dismiss it." },
    idea: {
      ru: "Заметки лежат стопкой поверх документа. Наведение раскрывает их, новая заметка приезжает сверху.",
      en: "Notes rest in a stack over a document. Hover opens them; a new note arrives from the top.",
    },
    tokens: ["spring", "stack", "dismiss"],
  },
  {
    id: "command",
    title: { ru: "Команды", en: "Commands" },
    kicker: { ru: "Поиск", en: "Search" },
    line: { ru: "Одна строка на весь день", en: "One line for the whole day" },
    hint: { ru: "Фильтруйте и ходите стрелками.", en: "Filter, then move with the arrow keys." },
    idea: {
      ru: "Меню команд: YaOS, новый кейс, парковка, баланс, запись. Стрелки и Enter запускают пункт.",
      en: "A command menu: YaOS, a new case, parking, balance, a visit. Arrows and Enter run an item.",
    },
    tokens: ["keyboard", "filter", "menu"],
  },
  {
    id: "order",
    title: { ru: "Порядок", en: "Order" },
    kicker: { ru: "Портфель", en: "Portfolio" },
    line: { ru: "Перетащите холдинг", en: "Drag a holding" },
    hint: { ru: "Потяните строку выше или ниже.", en: "Drag a row above or below another." },
    idea: {
      ru: "Список холдингов меняет порядок от указателя. Соседние строки пружинят на новое место.",
      en: "A holdings list reorders from the pointer. Neighbors spring into the new place.",
    },
    tokens: ["drag", "layout", "spring"],
  },
  {
    id: "yield",
    title: { ru: "Баланс", en: "Balance" },
    kicker: { ru: "Портфель", en: "Portfolio" },
    line: { ru: "Цифры перетекают", en: "Digits roll into place" },
    hint: { ru: "Выберите другую сумму.", en: "Pick another amount." },
    idea: {
      ru: "Баланс портфеля. Каждая цифра — колонка, которая пружинит к новому значению.",
      en: "A portfolio balance. Each digit is a column that springs to the next value.",
    },
    tokens: ["spring", "digits", "tabular"],
  },
  {
    id: "glass",
    title: { ru: "Стекло", en: "Glass" },
    kicker: { ru: "Свет", en: "Light" },
    line: { ru: "Карточка держит блик", en: "The card holds a sheen" },
    hint: { ru: "Ведите курсор по стеклу.", en: "Move the pointer across the glass." },
    idea: {
      ru: "Жидкое стекло YaOS. Наклон и блик следуют за указателем и возвращаются на пружине.",
      en: "Liquid glass for YaOS. Tilt and sheen follow the pointer, then spring back.",
    },
    tokens: ["pointer", "spring", "tilt"],
  },
  {
    id: "spotlight",
    title: { ru: "Пятно", en: "Spotlight" },
    kicker: { ru: "Курсор", en: "Cursor" },
    line: { ru: "Мята проявляется под рукой", en: "Mint appears under the hand" },
    hint: { ru: "Ведите курсор по строке.", en: "Move the pointer across the line." },
    idea: {
      ru: "Тихая строка. Радиальная маска открывает мятную копию там, где находится указатель.",
      en: "A quiet line. A radial mask reveals the mint copy where the pointer rests.",
    },
    tokens: ["pointer", "mask", "type"],
  },
  {
    id: "rise",
    hero: 0.42,
    title: { ru: "Подъём", en: "Rise" },
    kicker: { ru: "Скролл", en: "Scroll" },
    line: { ru: "Заголовок встаёт в плоскость", en: "The headline stands up" },
    hint: { ru: "Крутите колесо внутри плитки.", en: "Scroll inside the tile." },
    idea: {
      ru: "Заголовок о городе лежит в перспективе и выпрямляется по скроллу.",
      en: "A city headline lies in perspective and stands up as you scroll.",
    },
    tokens: ["scroll", "3d", "type"],
  },
  {
    id: "magnet",
    title: { ru: "Магнит", en: "Magnet" },
    kicker: { ru: "Кнопка", en: "Button" },
    line: { ru: "Кластер кнопок тянется к руке", en: "A cluster of buttons leans in" },
    hint: { ru: "Ведите курсор сквозь кнопки.", en: "Move the pointer through the buttons." },
    idea: {
      ru: "Магнитное меню: «Написать» и четыре соседние кнопки тянутся к указателю и возвращаются.",
      en: "A magnetic menu: “Write” and four neighbors lean toward the pointer, then return.",
    },
    tokens: ["pointer", "spring", "magnet"],
  },
  {
    id: "tickets",
    title: { ru: "Талоны", en: "Tickets" },
    kicker: { ru: "Москва", en: "Moscow" },
    line: { ru: "Городские карточки в ряд", en: "City cards in a row" },
    hint: { ru: "Потяните ряд влево.", en: "Drag the row to the left." },
    idea: {
      ru: "Парковка, запись, пропуск и свет. Ряд едет за пальцем, края растворяются маской.",
      en: "Parking, a visit, a pass, and the lights. The row follows the finger, and the edges fade.",
    },
    tokens: ["drag", "spring", "row"],
  },
  {
    wide: true,
    id: "field",
    title: { ru: "Поле", en: "Field" },
    kicker: { ru: "Курсор", en: "Cursor" },
    line: { ru: "Чипы YaOS отступают от руки", en: "YaOS chips spring away from the hand" },
    hint: { ru: "Ведите курсор сквозь поле.", en: "Move the pointer through the field." },
    idea: {
      ru: "Поле дома. Чипы лампы, замка, парковки и климата пружинят в сторону от указателя.",
      en: "The field of the home. Chips for the lamp, the lock, parking, and climate spring away from the pointer.",
    },
    tokens: ["pointer", "spring", "field"],
  },
];

const lang = document.documentElement.lang === "en" ? "en" : "ru";
const grid = document.getElementById("lab-grid");
const dialog = document.getElementById("lab-dialog");
const main = document.querySelector("main");

const EXPAND = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4"/></svg>`;
const CLOSE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`;

const frames = new Map();
let dialogFrame = null;
let dialogId = null;
let returnFocus = null;

const STAGE_W = 1440;
const STAGE_H = 900;

// Tile posters. w/h is the iframe stage; z crops empty margin around a centered subject.
const PRESENTATION = {
  stack: { w: 900, h: 560, z: 1.06 },
  intent: { w: 720, h: 450, z: 1.12 },
  gather: { w: 720, h: 450, z: 1.28 },
  dock: { w: 680, h: 425, z: 1.16 },
  melt: { w: 980, h: 640, z: 1 },
  passage: { w: 900, h: 560, z: 1 },
  sheet: { w: 760, h: 860, z: 1.04 },
  island: { w: 1100, h: 700, z: 1 },
  toast: { w: 980, h: 640, z: 1 },
  command: { w: 640, h: 400, z: 1.16 },
  order: { w: 640, h: 400, z: 1.05 },
  yield: { w: 860, h: 520, z: 1.15 },
  glass: { w: 680, h: 425, z: 1.22 },
  spotlight: { w: 900, h: 560, z: 1 },
  rise: { w: 800, h: 500, z: 1.36 },
  magnet: { w: 980, h: 620, z: 1 },
  tickets: { w: 980, h: 560, z: 1 },
  field: { w: 1200, h: 640, z: 1 },
};

function presentationOf(mod) {
  return PRESENTATION[mod.id] || { w: STAGE_W, h: STAGE_H, z: 1 };
}

function srcFor(mod, { full } = {}) {
  const q = new URLSearchParams({
    id: mod.id,
    autoplay: "0",
    bar: full ? "1" : "0",
    lang,
  });
  if (!full && mod.hero) q.set("hero", String(mod.hero));
  return `/motion-lab/preview.html?${q}`;
}

function post(frame, data) {
  frame?.contentWindow?.postMessage(data, location.origin);
}

function sendWhenReady(iframe, data) {
  if (!iframe) return;
  let tries = 0;
  const kick = () => {
    const ready = iframe.contentWindow?.__preview && iframe.contentDocument?.readyState === "complete";
    if (ready) post(iframe, data);
    else if (tries < 40) {
      tries += 1;
      window.setTimeout(kick, 40);
    }
  };
  if (iframe.src && iframe.contentDocument?.readyState === "complete") kick();
  else iframe.addEventListener("load", kick, { once: true });
}

function fit(frame) {
  if (frame.__full) return;
  const stage = frame.__stage || presentationOf(frame.__mod);
  const box = frame.getBoundingClientRect();
  const scale = Math.min(box.width / stage.w, box.height / stage.h);
  const fitScale = scale > 0 ? scale : 1;
  frame.__scale = fitScale * (stage.z || 1);
  frame.style.setProperty("--sw", `${stage.w}px`);
  frame.style.setProperty("--sh", `${stage.h}px`);
  frame.style.setProperty("--z", String(stage.z || 1));
  frame.style.setProperty("--s", String(fitScale));
}

function bindWheel(frame) {
  frame.addEventListener("wheel", (event) => {
    if (frame.__full) return;
    const win = frame.__iframe?.contentWindow;
    if (!win) return;
    const max = win.document.documentElement.scrollHeight - win.innerHeight;
    if (max <= 8) return;
    event.preventDefault();
    const dy = event.deltaY / (frame.__scale || 1);
    if (win.__lenis) win.__lenis.scrollTo(win.scrollY + dy, { immediate: true });
    else win.scrollBy(0, dy);
  }, { passive: false });
}

function makeFrame(mod, { full } = {}) {
  const frame = el("div", full ? "lab-stage" : "lab-frame");
  const iframe = el("iframe");
  iframe.title = pick(lang, mod.title.ru, mod.title.en);
  iframe.tabIndex = full ? 0 : -1;
  iframe.setAttribute("loading", "lazy");
  frame.append(iframe);
  frame.__iframe = iframe;
  frame.__mod = mod;
  frame.__full = !!full;
  frame.__stage = presentationOf(mod);
  frame.__scale = 1;
  if (!full) {
    frame.style.setProperty("--sw", `${frame.__stage.w}px`);
    frame.style.setProperty("--sh", `${frame.__stage.h}px`);
    frame.style.setProperty("--z", String(frame.__stage.z || 1));
  }
  if (!full) {
    bindWheel(frame);
    const observer = new ResizeObserver(() => fit(frame));
    observer.observe(frame);
    frame.__observer = observer;
  }
  return frame;
}

function wake(frame) {
  const iframe = frame.__iframe;
  if (!iframe.src) iframe.src = srcFor(frame.__mod, { full: frame.__full });
  if (!frame.__full) requestAnimationFrame(() => fit(frame));
}

function replay(frame) {
  frame.__iframe.src = srcFor(frame.__mod, { full: frame.__full });
}

EXPERIMENTS.forEach((mod, index) => {
  const article = el("article", "lab-tile");
  if (index === 0 || mod.wide) article.classList.add("is-feature");
  article.dataset.exp = mod.id;
  const frame = makeFrame(mod);
  const expand = el("button", "lab-expand", EXPAND);
  expand.type = "button";
  expand.setAttribute("aria-label", pick(lang, `Открыть «${mod.title.ru}»`, `Open “${mod.title.en}”`));
  expand.addEventListener("click", () => open(mod.id, expand));
  frame.append(expand);

  const foot = el("div", "lab-foot");
  const openBtn = el("button", "lab-open");
  openBtn.type = "button";
  openBtn.append(
    el("span", "lab-kicker", `${String(index + 1).padStart(2, "0")} · ${pick(lang, mod.kicker.ru, mod.kicker.en)}`),
    el("span", "lab-name", pick(lang, mod.title.ru, mod.title.en)),
    el("span", "lab-line", pick(lang, mod.line.ru, mod.line.en)),
    el("span", "lab-hint", pick(lang, mod.hint.ru, mod.hint.en)),
  );
  openBtn.addEventListener("click", () => open(mod.id, openBtn));
  const replayBtn = el("button", "lab-replay", pick(lang, "Ещё раз", "Replay"));
  replayBtn.type = "button";
  replayBtn.addEventListener("click", () => replay(frame));
  foot.append(openBtn, replayBtn);
  article.append(frame, foot);
  grid.append(article);
  frames.set(mod.id, frame);

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) wake(frame);
  }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
  io.observe(frame);
});

let generation = 0;
let closeTimer = 0;
const chrome = [document.querySelector(".dock"), document.querySelector(".float"), document.querySelector(".cta")];

function setChrome(locked) {
  chrome.forEach((node) => {
    if (!node) return;
    if (locked) node.setAttribute("inert", "");
    else node.removeAttribute("inert");
  });
}

function finishClose() {
  dialog.hidden = true;
  dialog.classList.remove("is-open", "is-expanded");
  dialog.replaceChildren();
  dialogFrame = null;
  dialogId = null;
  main?.removeAttribute("inert");
  setChrome(false);
  document.body.style.overflow = "";
  history.replaceState(null, "", location.pathname + location.search);
  returnFocus?.focus();
  returnFocus = null;
}

function close() {
  if (!dialogId && !dialogFrame) return;
  const gen = ++generation;
  dialog.classList.remove("is-open", "is-expanded");
  window.clearTimeout(closeTimer);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    finishClose();
    return;
  }
  closeTimer = window.setTimeout(() => {
    if (gen !== generation) return;
    finishClose();
  }, 340);
}

function open(id, trigger) {
  const mod = EXPERIMENTS.find((item) => item.id === id);
  if (!mod || !dialog) return;
  generation += 1;
  window.clearTimeout(closeTimer);
  if (dialogId && frames.has(dialogId)) post(frames.get(dialogId).__iframe, { type: "pause" });
  if (frames.has(id)) post(frames.get(id).__iframe, { type: "pause" });
  returnFocus = trigger || document.activeElement;
  dialogId = id;
  dialog.hidden = false;
  dialog.classList.remove("is-open", "is-expanded");
  dialog.replaceChildren();
  dialog.setAttribute("aria-labelledby", "lab-dialog-title");

  const closeBtn = el("button", "lab-x", CLOSE);
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", pick(lang, "Закрыть", "Close"));
  closeBtn.addEventListener("click", close);

  const frame = makeFrame(mod, { full: true });
  wake(frame);
  dialogFrame = frame;

  const panel = el("aside", "lab-panel");
  const index = EXPERIMENTS.indexOf(mod);
  const peek = el("button", "lab-peek");
  peek.type = "button";
  peek.setAttribute("aria-expanded", "false");
  const title = el("span", "lab-dialog-title", pick(lang, mod.title.ru, mod.title.en));
  title.id = "lab-dialog-title";
  const grab = el("span", "lab-grab");
  grab.setAttribute("aria-hidden", "true");
  peek.append(
    grab,
    el("span", "lab-kicker", `${String(index + 1).padStart(2, "0")} · ${pick(lang, mod.kicker.ru, mod.kicker.en)}`),
    title,
  );
  peek.addEventListener("click", () => {
    if (!window.matchMedia("(max-width: 809px)").matches) return;
    const expanded = dialog.classList.toggle("is-expanded");
    peek.setAttribute("aria-expanded", expanded ? "true" : "false");
  });
  const tokens = el("ul", "lab-tokens");
  mod.tokens.forEach((token) => tokens.append(el("li", "", token)));
  const replayBtn = el("button", "lab-replay", pick(lang, "Ещё раз", "Replay"));
  replayBtn.type = "button";
  replayBtn.addEventListener("click", () => replay(frame));
  const rest = el("div", "lab-sheet-rest");
  rest.append(
    el("p", "lab-idea", pick(lang, mod.idea.ru, mod.idea.en)),
    el("p", "lab-label", pick(lang, "Как взаимодействовать", "How to interact")),
    el("p", "lab-hint", pick(lang, mod.hint.ru, mod.hint.en)),
    tokens,
    replayBtn,
  );
  panel.append(peek, rest);
  dialog.append(frame, panel, closeBtn);

  main?.setAttribute("inert", "");
  setChrome(true);
  document.body.style.overflow = "hidden";
  history.replaceState(null, "", `#${id}`);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => dialog.classList.add("is-open"));
  });
  closeBtn.focus();
}

window.addEventListener("message", (event) => {
  if (event.origin !== location.origin || event.data?.type !== "close" || !dialogId) return;
  close();
});

dialog?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
    return;
  }
  if (event.key !== "Tab") return;
  const nodes = [...dialog.querySelectorAll("button, a")];
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    last.focus();
    event.preventDefault();
  } else if (!event.shiftKey && document.activeElement === last) {
    first.focus();
    event.preventDefault();
  }
});

window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (!id) return;
  if (EXPERIMENTS.some((mod) => mod.id === id)) open(id);
});

if (location.hash) {
  const id = location.hash.slice(1);
  if (EXPERIMENTS.some((mod) => mod.id === id)) open(id);
}

function parkChrome() {
  const narrow = window.matchMedia("(max-width: 809px)").matches;
  const box = grid?.getBoundingClientRect();
  const away = Boolean(narrow && box && box.top < window.innerHeight * 0.72 && box.bottom > 80);
  document.querySelectorAll(".dock, .float").forEach((node) => node.classList.toggle("lab-chrome-away", away));
}
window.addEventListener("scroll", parkChrome, { passive: true });
window.addEventListener("resize", parkChrome);
parkChrome();

window.__lab = {
  ids: EXPERIMENTS.map((mod) => mod.id),
  reduced,
  seek(id, p) {
    const frame = frames.get(id);
    if (!frame) return;
    wake(frame);
    sendWhenReady(frame.__iframe, { type: "seek", p });
  },
  open(id) {
    open(id);
  },
  close,
  seekOpen(id, p) {
    open(id);
    sendWhenReady(dialogFrame?.__iframe, { type: "seek", p });
  },
};
