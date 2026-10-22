import { SPRING, el, pick, spring, springStep } from "../runtime.js";

const ITEMS = [
  {
    ru: { k: "Сводка", t: "Неделя без шума", d: "Четыре решения. Ни одного лишнего экрана." },
    en: { k: "Brief", t: "A quiet week", d: "Four decisions. Not one extra screen." },
  },
  {
    ru: { k: "Маршрут", t: "Домой короче", d: "Срезать двор и выйти к воде." },
    en: { k: "Route", t: "A shorter way home", d: "Cut through the courtyard, come out by the water." },
  },
  {
    ru: { k: "Фокус", t: "Тихий час", d: "Уведомления подождут до четырёх." },
    en: { k: "Focus", t: "A quiet hour", d: "Notifications can wait until four." },
  },
];

const ROWS = [
  { x: 24, y: 112, w: 344, h: 152 },
  { x: 24, y: 280, w: 344, h: 152 },
  { x: 24, y: 448, w: 344, h: 152 },
];
const FULL = { x: 16, y: 72, w: 360, h: 520 };
const PERIOD = 7.2;

const css = `
.x-sh { position: absolute; inset: 0; background:
  radial-gradient(200px 140px at 20% 0%, rgba(202,232,189,0.14), transparent 70%),
  #0c0e0c; }
.x-sh-h { position: absolute; left: 24px; top: 64px; font-size: 12px; line-height: 16px; font-weight: 500; color: rgba(255,255,255,0.55); }
.x-row, .x-glass {
  position: absolute; border-radius: 24px; text-align: left;
  background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05));
  border: 1px solid rgba(255,255,255,0.16);
}
.x-row { padding: 24px; display: flex; flex-direction: column; justify-content: flex-end; gap: 8px; }
.x-row small, .x-glass small { font-size: 12px; line-height: 16px; font-weight: 500; color: rgba(255,255,255,0.72); }
.x-row strong { font-size: 24px; line-height: 32px; font-weight: 400; letter-spacing: var(--track-h); }
.x-glass {
  overflow: hidden; transform-origin: 0 0; will-change: transform;
  box-shadow: 0 24px 48px -28px rgba(0,0,0,0.65);
}
.x-detail { position: absolute; inset: 0; padding: 32px 24px; display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.x-detail h3 { margin: 8px 0 0; font-size: 40px; line-height: 48px; font-weight: 400; letter-spacing: var(--track-h); }
.x-detail p { margin: 0; font-size: 16px; line-height: 24px; color: rgba(255,255,255,0.72); max-width: 18em; }
.x-back {
  margin-top: auto; height: 48px; padding: 0 24px; border-radius: 999px;
  background: rgba(255,255,255,0.08); font-size: 16px; font-weight: 500;
}
`;

export default {
  id: "shared",
  kicker: { ru: "Список", en: "List" },
  title: { ru: "Строка становится экраном", en: "The row becomes the screen" },
  line: {
    ru: "Одна стеклянная поверхность вырастает из строки.",
    en: "One glass surface grows out of the row.",
  },
  idea: {
    ru: "Строка списка и экран детали — одна стеклянная поверхность. Она расширяется из строки, соседние строки уходят в сторону. Текст появляется, когда форма уже почти на месте.",
    en: "The list row and the detail screen are one glass surface. It expands out of the row while the neighbours step aside. The text arrives once the shape has nearly settled.",
  },
  tokens: ["spring.soft", "spring.gentle", "opacity.reveal"],
  hero: 2800,
  css,
  mount(root, ctx) {
    const text = (item) => item[ctx.lang === "en" ? "en" : "ru"];
    const wrap = el("div", "x-sh");
    wrap.append(el("p", "x-sh-h", pick(ctx.lang, "Сегодня", "Today")));
    const rows = ITEMS.map((item, i) => {
      const btn = el("button", "x-row");
      btn.type = "button";
      btn.tabIndex = ctx.detail ? 0 : -1;
      const r = ROWS[i];
      btn.style.left = `${r.x}px`;
      btn.style.top = `${r.y}px`;
      btn.style.width = `${r.w}px`;
      btn.style.height = `${r.h}px`;
      btn.append(el("small", "", text(item).k), el("strong", "", text(item).t));
      btn.addEventListener("click", () => open(i));
      return btn;
    });
    const glass = el("div", "x-glass");
    glass.style.left = `${FULL.x}px`;
    glass.style.top = `${FULL.y}px`;
    glass.style.width = `${FULL.w}px`;
    glass.style.height = `${FULL.h}px`;
    const detail = el("div", "x-detail");
    const kicker = el("small");
    const title = el("h3");
    const body = el("p");
    const back = el("button", "x-back", pick(ctx.lang, "Свернуть", "Close"));
    back.type = "button";
    back.tabIndex = ctx.detail ? 0 : -1;
    back.addEventListener("click", () => { manual = null; });
    detail.append(kicker, title, body, back);
    glass.append(detail);
    wrap.append(...rows, glass);
    root.append(wrap);

    const motion = rows.map(() => ({ y: spring(), op: spring() }));
    const g = { x: spring(), y: spring(), sx: spring(), sy: spring(), op: spring(), text: spring() };
    let elapsed = 0;
    let manual = null;

    function scene() {
      if (manual) return manual;
      const index = Math.floor(elapsed / PERIOD) % ITEMS.length;
      const u = elapsed % PERIOD;
      const open = u >= 1 && u < 5.6;
      return { index, open };
    }
    function open(i) {
      manual = { index: i, open: true };
    }

    function apply(dt, snap) {
      const { index, open } = scene();
      const row = ROWS[index];
      const sx = open ? 1 : row.w / FULL.w;
      const sy = open ? 1 : row.h / FULL.h;
      const tx = open ? 0 : row.x - FULL.x;
      const ty = open ? 0 : row.y - FULL.y;
      springStep(g.x, tx, dt, SPRING.soft, snap);
      springStep(g.y, ty, dt, SPRING.soft, snap);
      springStep(g.sx, sx, dt, SPRING.soft, snap);
      springStep(g.sy, sy, dt, SPRING.soft, snap);
      springStep(g.op, open ? 1 : 0, dt, SPRING.soft, snap);
      const textTarget = open && g.sy.x > 0.72 ? 1 : 0;
      springStep(g.text, textTarget, dt, SPRING.gentle, snap);
      glass.style.transform = `translate3d(${g.x.x}px, ${g.y.x}px, 0) scale(${g.sx.x}, ${g.sy.x})`;
      glass.style.opacity = String(Math.max(0, g.op.x));
      glass.style.pointerEvents = g.op.x > 0.5 ? "auto" : "none";
      detail.style.opacity = String(Math.max(0, g.text.x));
      const copy = text(ITEMS[index]);
      kicker.textContent = copy.k;
      title.textContent = copy.t;
      body.textContent = copy.d;
      rows.forEach((node, i) => {
        const away = open && i !== index;
        const dir = i < index ? -1 : 1;
        springStep(motion[i].y, away ? dir * 24 : 0, dt, SPRING.gentle, snap);
        springStep(motion[i].op, open && i === index ? 0 : away ? 0.28 : 1, dt, SPRING.soft, snap);
        node.style.transform = `translate3d(0, ${motion[i].y.x}px, 0)`;
        node.style.opacity = String(Math.max(0, motion[i].op.x));
      });
    }

    return {
      tick(dt) {
        if (!manual && !ctx.reduced) elapsed += dt;
        apply(dt, ctx.reduced);
      },
      seek(ms) {
        manual = null;
        elapsed = ms / 1000;
        apply(0, true);
      },
      replay() {
        manual = null;
        elapsed = 0;
        apply(0, true);
      },
      destroy() {
        root.replaceChildren();
      },
    };
  },
};
