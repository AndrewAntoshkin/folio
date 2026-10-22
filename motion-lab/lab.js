/**
 * Motion Lab
 * Free Skiper UI and Chamaac components, one island per experiment.
 * The registry below is the only edit required to add one:
 * drop a component in islands/components, export it from islands/entry.jsx, rebuild.
 */
import { el, pick, reduced } from "./runtime.js";

const EXPERIMENTS = [
  {
    id: "skiper16",
    scroll: true,
    hero: 0.09,
    source: "https://skiper-ui.com/v1/skiper16",
    kicker: { ru: "Скролл", en: "Scroll" },
    title: { ru: "Стопка карточек", en: "Card stack" },
    line: { ru: "Карточки сжимаются, пока идёт скролл", en: "Cards scale down as the page scrolls" },
    hint: { ru: "Прокрутите внутри кадра", en: "Scroll inside the frame" },
    idea: {
      ru: "Свободный компонент Skiper UI. Липкие карточки уменьшаются по мере скролла: каждая следующая чуть меньше предыдущей.",
      en: "A free Skiper UI component. Sticky cards scale down as you scroll, each one a little smaller than the last.",
    },
    tokens: ["useScroll", "scale 1 → 0.5", "sticky"],
  },
  {
    id: "chamaac-arrow",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/buttons/hover-arrow-button",
    kicker: { ru: "Кнопка", en: "Button" },
    title: { ru: "Стрелка", en: "Hover arrow" },
    line: { ru: "Стрелка выезжает слева", en: "The arrow slides in from the left" },
    hint: { ru: "Наведите на кнопку", en: "Hover the button" },
    idea: {
      ru: "Свободная кнопка Chamaac, MIT. Под курсором слева выезжает стрелка, подпись остаётся на месте.",
      en: "A free Chamaac button, MIT. On hover an arrow slides in from the left and the label stays put.",
    },
    tokens: ["width 0 → auto", "0.3s", "whileHover"],
  },
  {
    id: "chamaac-input",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/inputs/ai-input",
    kicker: { ru: "Ввод", en: "Input" },
    title: { ru: "Поле для ИИ", en: "AI input" },
    line: { ru: "Текст, меню модели и вложения", en: "Text, a model menu, and attachments" },
    hint: { ru: "Напишите и откройте меню", en: "Type, then open a menu" },
    idea: {
      ru: "Свободный компонент Chamaac, MIT. Поле принимает текст, открывает меню модели и инструментов и показывает ответ.",
      en: "A free Chamaac component, MIT. The field takes text, opens the model and tools menus, and shows a reply.",
    },
    tokens: ["textarea", "dropdown", "spring"],
  },
  {
    id: "skiper30",
    scroll: true,
    hero: 0.6,
    source: "https://skiper-ui.com/v1/skiper30",
    kicker: { ru: "Параллакс", en: "Parallax" },
    title: { ru: "Четыре колонны", en: "Four columns" },
    line: { ru: "Колонны едут с разной скоростью", en: "Columns travel at different speeds" },
    hint: { ru: "Прокрутите колонны", en: "Scroll the columns" },
    idea: {
      ru: "Свободный компонент Skiper UI, по мотивам siena.film. Четыре колонны фотографий смещаются на разную долю скролла.",
      en: "A free Skiper UI component, adapted from siena.film. Four photo columns shift by different amounts of the scroll.",
    },
    tokens: ["useTransform y", "height × 2 / 3.3 / 1.25 / 3", "175vh"],
  },
  {
    id: "chamaac-cards",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/sections/stats-cards",
    kicker: { ru: "Карточки", en: "Cards" },
    title: { ru: "Наклон", en: "Tilted stats" },
    line: { ru: "Карточка выпрямляется под курсором", en: "A card straightens under the pointer" },
    hint: { ru: "Наведите на карточку", en: "Hover a card" },
    idea: {
      ru: "Свободный компонент Chamaac, MIT. Четыре карточки стоят под углом и выравниваются, когда на них наводят.",
      en: "A free Chamaac component, MIT. Four cards sit at an angle and straighten when hovered.",
    },
    tokens: ["rotate → 0", "scale 1.05", "0.3s"],
  },
  {
    id: "chamaac-shimmer",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/buttons/shimmer-button",
    kicker: { ru: "Кнопка", en: "Button" },
    title: { ru: "Блик", en: "Shimmer" },
    line: { ru: "Блик сам идёт по подписи", en: "A highlight runs across the label" },
    hint: { ru: "Блик идёт сам, наведите для масштаба", en: "The shimmer runs; hover to scale" },
    idea: {
      ru: "Свободная кнопка Chamaac, MIT. Градиент подписи едет сам. Наведение чуть увеличивает кнопку, нажатие уменьшает.",
      en: "A free Chamaac button, MIT. The label gradient travels on its own. Hover scales the button up, press scales it down.",
    },
    tokens: ["backgroundPosition", "1.2s linear", "scale 1.02"],
  },
  {
    id: "skiper31",
    scroll: true,
    hero: 0.17,
    source: "https://skiper-ui.com/v1/skiper31",
    kicker: { ru: "Тип", en: "Type" },
    title: { ru: "Буквы собираются", en: "Letters gather" },
    line: { ru: "Строка и иконки съезжаются к центру", en: "A line and a row of icons meet in the center" },
    hint: { ru: "Прокрутите, чтобы собрать буквы", en: "Scroll to gather the letters" },
    idea: {
      ru: "Свободный компонент Skiper UI. Буквы и иконки разъезжаются от центра и собираются обратно по прогрессу скролла.",
      en: "A free Skiper UI component. Letters and icons spread from the center and gather back as scroll progresses.",
    },
    tokens: ["useScroll", "x = distance × 50", "rotateX"],
  },
  {
    id: "chamaac-letters",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/text-animations/dancing-letters",
    kicker: { ru: "Текст", en: "Type" },
    title: { ru: "Живые буквы", en: "Dancing letters" },
    line: { ru: "Буква играет свою физику", en: "Each letter plays its own physics" },
    hint: { ru: "Наведите на букву", en: "Hover a letter" },
    idea: {
      ru: "Свободный компонент Chamaac, MIT. У каждой буквы свой ход: резина, петля, прыжок, падение. Наведение запускает именно её.",
      en: "A free Chamaac component, MIT. Each letter has its own move: rubber, hinge, jump, fall. Hovering plays that letter.",
    },
    tokens: ["onHoverStart", "spring 300 / 20", "Outfit"],
  },
  {
    id: "chamaac-slide",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/buttons/slideup-button",
    kicker: { ru: "Кнопка", en: "Button" },
    title: { ru: "Слайд подписи", en: "Slide up" },
    line: { ru: "Подпись уезжает вверх, снизу приходит новая", en: "The label leaves upward, a new one arrives" },
    hint: { ru: "Наведите на кнопку", en: "Hover the button" },
    idea: {
      ru: "Свободная кнопка Chamaac, MIT. Наведение уводит подпись вверх и приводит её копию снизу, с небольшим поворотом.",
      en: "A free Chamaac button, MIT. Hover sends the label up and brings a copy in from below, with a short rotate.",
    },
    tokens: ["y 0 → -200%", "rotate 20° → 0", "0.5s"],
  },
  {
    id: "skiper34",
    scroll: true,
    hero: 0.35,
    source: "https://skiper-ui.com/v1/skiper34",
    kicker: { ru: "Скролл", en: "Scroll" },
    title: { ru: "Кадр с поворотом", en: "Rotating frame" },
    line: { ru: "Карточка липнет, потом поворачивается", en: "A card sticks, then rotates away" },
    hint: { ru: "Прокрутите, кадр повернётся", en: "Scroll, then the frame rotates" },
    idea: {
      ru: "Свободный компонент Skiper UI. Кадр прилипает к экрану и, уходя, одновременно масштабируется и вращается.",
      en: "A free Skiper UI component. The frame sticks, then scales and rotates as it leaves.",
    },
    tokens: ["sticky", "scale", "rotate"],
  },
  {
    id: "chamaac-steps",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/sections/feature-steps",
    kicker: { ru: "Переход", en: "Transition" },
    title: { ru: "Шаги", en: "Feature steps" },
    line: { ru: "Кадр сменяется вместе с шагом", en: "The frame changes with the step" },
    hint: { ru: "Нажмите шаг или дождитесь смены", en: "Click a step, or let it advance" },
    idea: {
      ru: "Свободный компонент Chamaac, MIT. Шаг сам переключается, полоска прогресса доходит до края, кадр выезжает снизу. Клик выбирает шаг сразу.",
      en: "A free Chamaac component, MIT. The step advances on its own, a progress rule runs to the edge, and the frame slides up. A click picks a step now.",
    },
    tokens: ["interval 6s", "y 100% → 0", "click"],
  },
  {
    id: "chamaac-focus",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/buttons/focus-button",
    kicker: { ru: "Кнопка", en: "Button" },
    title: { ru: "Рамка фокуса", en: "Focus frame" },
    line: { ru: "Углы рамки съезжаются к кнопке", en: "Corner marks draw in toward the button" },
    hint: { ru: "Наведите на кнопку", en: "Hover the button" },
    idea: {
      ru: "Свободная кнопка Chamaac, MIT. Тонкая рамка и уголки. Наведение собирает уголки к краям кнопки.",
      en: "A free Chamaac button, MIT. A thin frame and corner marks. Hover draws the marks in to the button edges.",
    },
    tokens: ["group-hover", "corner translate", "border"],
  },
  {
    id: "skiper39",
    scroll: false,
    hero: 0,
    source: "https://skiper-ui.com/v1/skiper39",
    kicker: { ru: "Canvas", en: "Canvas" },
    title: { ru: "Толпа", en: "Crowd" },
    line: { ru: "Фигурки идут через весь кадр", en: "Figures walk the width of the frame" },
    hint: { ru: "Толпа идёт сама", en: "The crowd walks on its own" },
    idea: {
      ru: "Свободный компонент Skiper UI. Спрайт Open Peeps, логика прогулки с CodePen. Фигурки идут в обе стороны без остановки.",
      en: "A free Skiper UI component. Open Peeps sprite, walk cycle from a CodePen. Figures cross in both directions.",
    },
    tokens: ["gsap.timeline", "canvas", "yoyo 10px"],
  },
  {
    id: "chamaac-glow",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/buttons/glowing-border-button",
    kicker: { ru: "Кнопка", en: "Button" },
    title: { ru: "Светящаяся рамка", en: "Glowing border" },
    line: { ru: "Зелёный луч обходит кнопку", en: "A green beam travels the border" },
    hint: { ru: "Луч идёт сам", en: "The beam travels on its own" },
    idea: {
      ru: "Свободная кнопка Chamaac, MIT. Узкий зелёный градиент крутится по контуру без остановки.",
      en: "A free Chamaac button, MIT. A narrow green gradient spins around the border on its own.",
    },
    tokens: ["spin 3s", "#50C878", "blur 2px"],
  },
  {
    id: "skiper47",
    scroll: false,
    hero: 0,
    source: "https://skiper-ui.com/v1/skiper47",
    kicker: { ru: "Карусель", en: "Carousel" },
    title: { ru: "Перспектива", en: "Perspective" },
    line: { ru: "Обложка уходит в глубину", en: "Covers recede in perspective" },
    hint: { ru: "Потяните обложки", en: "Drag the covers" },
    idea: {
      ru: "Свободный компонент Skiper UI. Карусель с эффектом coverflow: боковые слайды меньше, центральный ближе. Иллюстрации AarzooAly.",
      en: "A free Skiper UI component. A coverflow carousel: side slides shrink, the center one comes forward. Illustrations by AarzooAly.",
    },
    tokens: ["swiper coverflow", "rotate 50°", "depth 100"],
  },
  {
    id: "chamaac-neo",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/buttons/neo-brutalist-button",
    kicker: { ru: "Кнопка", en: "Button" },
    title: { ru: "Нео-брутализм", en: "Neo-brutalist" },
    line: { ru: "Тень растёт, блик проходит по кнопке", en: "The shadow grows and a shine crosses" },
    hint: { ru: "Наведите на кнопку", en: "Hover the button" },
    idea: {
      ru: "Свободная кнопка Chamaac, MIT. Жёсткая тень 4px становится 8px, и белый блик проходит по розовой плашке.",
      en: "A free Chamaac button, MIT. The hard shadow grows from 4px to 8px, and a white shine crosses the pink face.",
    },
    tokens: ["shadow 4 → 8", "skew -10°", "shimmer 0.2s"],
  },
  {
    id: "skiper52",
    scroll: false,
    hero: 0,
    source: "https://skiper-ui.com/v1/skiper52",
    kicker: { ru: "Наведение", en: "Hover" },
    title: { ru: "Раскрытие", en: "Expand on hover" },
    line: { ru: "Полоска вырастает в кадр", en: "A strip grows into the frame" },
    hint: { ru: "Наведите на полоску", en: "Hover a strip" },
    idea: {
      ru: "Свободный компонент Skiper UI. Под курсором узкая полоска раскрывается в широкий кадр. Иллюстрации AarzooAly.",
      en: "A free Skiper UI component. Under the pointer a narrow strip opens into a wide frame. Illustrations by AarzooAly.",
    },
    tokens: ["width 5rem → 24rem", "easeInOut 0.3s"],
  },
  {
    id: "chamaac-premium",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/buttons/premium-button",
    kicker: { ru: "Кнопка", en: "Button" },
    title: { ru: "Бегущая стрелка", en: "Running arrow" },
    line: { ru: "Пиксельная стрелка идёт по красному квадрату", en: "A pixel arrow crosses the red square" },
    hint: { ru: "Стрелка идёт сама, кнопку можно нажать", en: "The arrow runs; the button can be pressed" },
    idea: {
      ru: "Свободная кнопка Chamaac, MIT. Стрелка из точек сама проходит слева направо. Нажатие чуть уменьшает кнопку.",
      en: "A free Chamaac button, MIT. A dot arrow walks itself from left to right. Press scales the button down.",
    },
    tokens: ["interval 100ms", "14 steps", "active scale 0.98"],
  },
  {
    id: "chamaac-dock",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/navigation/dock",
    kicker: { ru: "Меню", en: "Menu" },
    title: { ru: "Док", en: "Dock" },
    line: { ru: "Пункт раскрывает список и фото", en: "A label opens a list and a photo" },
    hint: { ru: "Наведите на пункт или нажмите Menu", en: "Hover a label, or tap Menu" },
    idea: {
      ru: "Свободный компонент Chamaac, MIT. На широком кадре пункт раскрывается по наведению. На узком — кнопка Menu открывает список.",
      en: "A free Chamaac component, MIT. On a wide frame a label opens on hover. On a narrow one, Menu opens the list.",
    },
    tokens: ["hover height", "easeInOut 0.3s", "image"],
  },
  {
    id: "skiper19",
    scroll: true,
    hero: 0,
    source: "https://skiper-ui.com/v1/skiper19",
    kicker: { ru: "Скролл", en: "Scroll" },
    title: { ru: "Линия за скроллом", en: "Stroke that follows" },
    line: { ru: "Обводка дорисовывается по прогрессу", en: "The stroke draws itself with the scroll" },
    hint: { ru: "Прокрутите, линия дорисуется", en: "Scroll to draw the stroke" },
    idea: {
      ru: "Свободный компонент Skiper UI. Длина SVG-обводки привязана к прогрессу скролла, от половины контура до целого.",
      en: "A free Skiper UI component. The SVG stroke length is tied to scroll progress, from half the path to the full path.",
    },
    tokens: ["pathLength 0.5 → 1", "350vh"],
  },
  {
    id: "skiper28",
    scroll: true,
    hero: 0.72,
    source: "https://skiper-ui.com/v1/skiper28",
    kicker: { ru: "3D", en: "3D" },
    title: { ru: "Текст в перспективе", en: "Perspective text" },
    line: { ru: "Плоскость текста поднимается к зрителю", en: "The text plane rises toward the reader" },
    hint: { ru: "Прокрутите, текст поднимется", en: "Scroll to lift the text" },
    idea: {
      ru: "Свободный компонент Skiper UI. Блок текста повёрнут на 30° и подъезжает по оси Y, пока идёт скролл.",
      en: "A free Skiper UI component. The text block sits at 30° and travels up the Y axis as you scroll.",
    },
    tokens: ["rotateX 30°", "translateY 487 → 0", "perspective 200"],
  },
  {
    id: "skiper4",
    scroll: false,
    hero: 0,
    source: "https://skiper-ui.com/v1/skiper4",
    kicker: { ru: "Кнопки", en: "Buttons" },
    title: { ru: "Переключатели темы", en: "Theme toggles" },
    line: { ru: "Пять кнопок с разным ходом", en: "Five buttons, five different motions" },
    hint: { ru: "Нажмите переключатель", en: "Click a toggle" },
    idea: {
      ru: "Свободный компонент Skiper UI. Каждый клик играет свою анимацию иконки и переключает сцену между светлой и тёмной.",
      en: "A free Skiper UI component. Each click plays its own icon motion and switches the stage between light and dark.",
    },
    tokens: ["layout", "spring", "icon rotate"],
  },
  {
    id: "chamaac-loop",
    scroll: false,
    hero: 0,
    source: "https://www.chamaac.com/components/text-animations/text-loop",
    kicker: { ru: "Текст", en: "Type" },
    title: { ru: "Смена слова", en: "Text loop" },
    line: { ru: "Фраза ширится и сменяется", en: "A phrase widens, then swaps" },
    hint: { ru: "Слово меняется само", en: "The word changes on its own" },
    idea: {
      ru: "Свободный компонент Chamaac, MIT. Слово само сменяется каждые три секунды: ширина и прозрачность, курсор мигает.",
      en: "A free Chamaac component, MIT. The word swaps itself every three seconds: width and opacity, with a blinking caret.",
    },
    tokens: ["interval 3s", "width 0 → auto", "caret"],
  },
  {
    id: "skiper64",
    scroll: false,
    hero: 0,
    source: "https://skiper-ui.com/v1/skiper64",
    kicker: { ru: "Фильтр", en: "Filter" },
    title: { ru: "Липкий контур", en: "Gooey" },
    line: { ru: "Две формы сливаются через SVG-фильтр", en: "Two shapes melt together through an SVG filter" },
    hint: { ru: "Потяните каплю", en: "Drag the blob" },
    idea: {
      ru: "Свободный компонент Skiper UI. Размытие и цветовая матрица склеивают формы. Верхнюю каплю можно перетащить.",
      en: "A free Skiper UI component. Blur and a color matrix fuse the shapes. The top blob can be dragged.",
    },
    tokens: ["feGaussianBlur 4.4", "spring 300 / 30", "drag"],
  },
  {
    id: "skiper61",
    scroll: false,
    hero: 0,
    source: "https://skiper-ui.com/v1/skiper61",
    kicker: { ru: "Курсор", en: "Pointer" },
    title: { ru: "Курсор на пружине", en: "Mouse follow" },
    line: { ru: "Точка догоняет курсор сразу или с пружиной", en: "A dot follows the pointer, plain or on a spring" },
    hint: { ru: "Двигайте курсор", en: "Move the pointer" },
    idea: {
      ru: "Свободный компонент Skiper UI. Два поля: точка сидит на курсоре сразу, и точка на пружине mass 0.1, damping 10, stiffness 131.",
      en: "A free Skiper UI component. Two fields: one dot sits on the pointer, one follows on a spring (mass 0.1, damping 10, stiffness 131).",
    },
    tokens: ["useSpring", "mass 0.1", "stiffness 131"],
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
  "chamaac-arrow": { w: 360, h: 225, z: 1.32 },
  "chamaac-input": { w: 440, h: 275, z: 1 },
  "chamaac-shimmer": { w: 420, h: 262, z: 1.28 },
  "chamaac-slide": { w: 360, h: 225, z: 1.32 },
  "chamaac-focus": { w: 400, h: 250, z: 1.3 },
  "chamaac-glow": { w: 420, h: 262, z: 1.35 },
  "chamaac-neo": { w: 360, h: 225, z: 1.32 },
  "chamaac-premium": { w: 420, h: 262, z: 1.3 },
  "chamaac-dock": { w: 800, h: 500, z: 1.22 },
  "chamaac-loop": { w: 980, h: 612, z: 1 },
  skiper4: { w: 520, h: 325, z: 1.08 },
  skiper19: { w: 1440, h: 900, z: 0.9 },
  skiper61: { w: 1080, h: 675, z: 1 },
};

function presentationOf(mod) {
  return PRESENTATION[mod.id] || { w: STAGE_W, h: STAGE_H, z: 1 };
}

function srcFor(mod, { full } = {}) {
  const q = new URLSearchParams({
    id: mod.id,
    autoplay: "0",
    bar: full ? "1" : "0",
  });
  if (!full && mod.hero) q.set("hero", String(mod.hero));
  return `/motion-lab/preview.html?${q}`;
}

function post(frame, data) {
  frame?.contentWindow?.postMessage(data, location.origin);
}

function hostOf(url) {
  return new URL(url).host.replace(/^www\./, "");
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

function licenseOf(mod) {
  if (mod.id.startsWith("chamaac")) {
    return pick(
      lang,
      "MIT, © 2026 Amarnath. Использование требует уведомления об авторском праве и разрешении.",
      "MIT, © 2026 Amarnath. Use requires the copyright and permission notice.",
    );
  }
  return pick(
    lang,
    "Свободный компонент Skiper UI. Использование в проекте требует указания Skiper UI.",
    "Free Skiper UI component. Use in a project requires attribution to Skiper UI.",
  );
}

function replay(frame) {
  frame.__iframe.src = srcFor(frame.__mod, { full: frame.__full });
}

EXPERIMENTS.forEach((mod, index) => {
  const article = el("article", "lab-tile");
  if (index === 0) article.classList.add("is-feature");
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
  const source = el("a", "lab-source", hostOf(mod.source));
  source.href = mod.source;
  source.target = "_blank";
  source.rel = "noopener";
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
    source,
    el("p", "lab-license", licenseOf(mod)),
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

window.__lab = {
  ids: EXPERIMENTS.map((mod) => mod.id),
  reduced,
  seek(id, p) {
    const frame = frames.get(id);
    if (!frame) return;
    wake(frame);
    const send = () => post(frame.__iframe, { type: "seek", p });
    if (frame.__iframe.contentDocument?.readyState === "complete" && frame.__iframe.src) send();
    else frame.__iframe.addEventListener("load", send, { once: true });
  },
  open(id) {
    open(id);
  },
  close,
  seekOpen(id, p) {
    open(id);
    const send = () => post(dialogFrame?.__iframe, { type: "seek", p });
    const iframe = dialogFrame?.__iframe;
    if (!iframe) return;
    if (iframe.contentDocument?.readyState === "complete") iframe.addEventListener("load", send, { once: true });
    iframe.addEventListener("load", send, { once: true });
  },
};
