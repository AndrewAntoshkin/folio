import { SPRING, el, pick, spring, springStep, stagePoint } from "../runtime.js";

const CARDS = [
  {
    tone: "mint",
    ru: { k: "Утро", t: "Свет на столе", d: "Начать с одного дела." },
    en: { k: "Morning", t: "Light on the desk", d: "Begin with one thing." },
  },
  {
    tone: "blue",
    ru: { k: "Путь", t: "Два квартала", d: "Пешком, без спешки." },
    en: { k: "Way", t: "Two blocks", d: "On foot, without hurry." },
  },
  {
    tone: "warm",
    ru: { k: "Письмо", t: "Короткий ответ", d: "Три строки, и хватит." },
    en: { k: "Note", t: "A short reply", d: "Three lines are enough." },
  },
  {
    tone: "ink",
    ru: { k: "Вечер", t: "Закрыть день", d: "Оставить завтра на завтра." },
    en: { k: "Evening", t: "Close the day", d: "Leave tomorrow for tomorrow." },
  },
];

const css = `
.x-st { position: absolute; inset: 0; background:
  radial-gradient(200px 160px at 50% 30%, rgba(202,232,189,0.12), transparent 70%),
  #0c0e0c; }
.x-card {
  position: absolute; left: 32px; top: 0; width: 328px; height: 360px;
  padding: 32px 24px; border-radius: 32px; text-align: left;
  border: 1px solid rgba(255,255,255,0.16);
  box-shadow: 0 24px 40px -28px rgba(0,0,0,0.7);
  display: flex; flex-direction: column; justify-content: flex-end; gap: 8px;
  transform-origin: center center; will-change: transform; touch-action: none; cursor: grab;
}
.x-card[data-tone="mint"] { background: linear-gradient(180deg, rgba(202,232,189,0.78) 0%, rgba(32,44,36,0.97) 48%, rgba(12,16,14,0.98) 100%); }
.x-card[data-tone="blue"] { background: linear-gradient(180deg, rgba(150,170,255,0.72) 0%, rgba(28,32,52,0.97) 48%, rgba(12,14,20,0.98) 100%); }
.x-card[data-tone="warm"] { background: linear-gradient(180deg, rgba(255,206,160,0.7) 0%, rgba(52,36,24,0.97) 48%, rgba(18,14,12,0.98) 100%); }
.x-card[data-tone="ink"] { background: linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(22,24,26,0.97) 48%, rgba(10,12,12,0.98) 100%); }
.x-card small { font-size: 12px; line-height: 16px; font-weight: 500; color: rgba(255,255,255,0.72); }
.x-card strong { font-size: 40px; line-height: 48px; font-weight: 400; letter-spacing: var(--track-h); }
.x-card em { font-style: normal; font-size: 16px; line-height: 24px; color: rgba(255,255,255,0.78); }
.x-hint {
  position: absolute; left: 0; right: 0; bottom: 40px; text-align: center;
  font-size: 12px; line-height: 16px; font-weight: 500; color: rgba(255,255,255,0.55);
}
`;

export default {
  id: "stack",
  kicker: { ru: "Жест", en: "Gesture" },
  title: { ru: "Стопка карточек", en: "A card stack" },
  line: {
    ru: "Карточка следует за пальцем и уступает следующую.",
    en: "The card follows the finger, then gives way.",
  },
  idea: {
    ru: "Верхняя карточка следует за пальцем один к одному. Отпускание либо возвращает её пружиной, либо уносит и открывает следующую. В покое стопка сама перекладывает верхнюю карточку.",
    en: "The top card follows the finger one to one. Release either springs it back or carries it off to reveal the next. At rest, the stack throws the top card on its own.",
  },
  tokens: ["spring.gentle", "spring.soft", "direct.drag"],
  hero: 400,
  css,
  mount(root, ctx) {
    const copy = (card) => card[ctx.lang === "en" ? "en" : "ru"];
    const wrap = el("div", "x-st");
    const hint = el("p", "x-hint", pick(ctx.lang, "Потяните карточку", "Drag a card"));
    const nodes = CARDS.map((card) => {
      const node = el("button", "x-card");
      node.type = "button";
      node.dataset.tone = card.tone;
      node.tabIndex = ctx.detail ? 0 : -1;
      node.append(el("small", "", copy(card).k), el("strong", "", copy(card).t), el("em", "", copy(card).d));
      return node;
    });
    wrap.append(...nodes, hint);
    root.append(wrap);

    const state = nodes.map(() => ({
      x: spring(), y: spring(), rot: spring(), sc: spring(), op: spring(), lab: spring(),
    }));
    let order = [0, 1, 2, 3];
    let elapsed = 0;
    let nextThrow = 2.2;
    let auto = !ctx.reduced;
    let throwing = null;
    let throwDir = 1;
    let drag = null;
    const stage = root.closest(".lab-stage");

    function depth(i) {
      return order.indexOf(i);
    }
    function onDown(event) {
      const top = order[0];
      if (throwing != null) return;
      if (event.currentTarget !== nodes[top]) return;
      const pt = stagePoint(stage, event);
      drag = { id: top, origin: pt.x, x: 0, last: pt.x, v: 0 };
      auto = false;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    function onMove(event) {
      if (!drag) return;
      const pt = stagePoint(stage, event);
      const x = pt.x - drag.origin;
      const prev = drag.x;
      drag.x = x;
      drag.v = (x - prev) / Math.max(0.016, 1 / 60);
      state[drag.id].x.x = x;
      state[drag.id].x.v = drag.v * 0.016;
    }
    function onUp() {
      if (!drag) return;
      const { id, x, v } = drag;
      drag = null;
      if (Math.abs(x) > 96 || Math.abs(v) > 900) {
        throwing = id;
        throwDir = x + v * 0.05 >= 0 ? 1 : -1;
        state[id].x.v = (throwDir * Math.max(900, Math.abs(v))) * 0.02;
      }
    }
    nodes.forEach((node) => node.addEventListener("pointerdown", onDown));
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);

    function recycle(id) {
      order = order.filter((n) => n !== id).concat(id);
      snapBack(id);
      state[id].op.x = 0;
      state[id].op.v = 0;
      state[id].lab.x = 0;
      state[id].lab.v = 0;
      throwing = null;
    }
    function snapBack(id) {
      state[id].x.x = 0;
      state[id].x.v = 0;
      state[id].rot.x = 0;
      state[id].rot.v = 0;
    }

    function apply(dt, snap) {
      if (auto && throwing == null && !drag && elapsed >= nextThrow) {
        throwing = order[0];
        throwDir = 1;
        state[throwing].x.v = 1600;
        nextThrow = elapsed + 2.6;
      }
      nodes.forEach((node, i) => {
        const d = depth(i);
        const baseY = 128 + d * 16;
        const baseR = [0, -3, 2.4, -1.5][d];
        const baseS = 1 - d * 0.045;
        let tx = 0;
        let rot = baseR;
        let op = d > 2 ? 0 : 1;
        if (drag && drag.id === i) {
          tx = drag.x;
          rot = drag.x / 20;
        } else if (throwing === i) {
          tx = throwDir * 560;
          rot = throwDir * 14;
          op = Math.abs(state[i].x.x) > 320 ? 0 : 1;
        }
        const cfg = drag && drag.id === i ? null : SPRING.gentle;
        if (cfg) springStep(state[i].x, tx, dt, cfg, snap);
        springStep(state[i].y, baseY, dt, SPRING.gentle, snap);
        springStep(state[i].rot, rot, dt, SPRING.soft, snap);
        springStep(state[i].sc, baseS, dt, SPRING.gentle, snap);
        springStep(state[i].op, op, dt, SPRING.soft, snap);
        const lead = throwing != null ? Math.abs(state[throwing].x.x) : drag ? Math.abs(drag.x) : 0;
        const showLabel = d === 0 || (d === 1 && lead > 280);
        springStep(state[i].lab, showLabel ? 1 : 0, dt, SPRING.snappy, snap);
        node.style.transform = `translate3d(${state[i].x.x}px, ${state[i].y.x}px, 0) rotate(${state[i].rot.x}deg) scale(${state[i].sc.x})`;
        node.style.opacity = String(Math.max(0, state[i].op.x));
        node.style.zIndex = String(10 - d);
        node.style.pointerEvents = d === 0 ? "auto" : "none";
        const label = String(Math.max(0, state[i].lab.x));
        node.querySelectorAll("small, strong, em").forEach((child) => {
          child.style.opacity = label;
        });
      });
      if (throwing != null && Math.abs(state[throwing].x.x) > 420) recycle(throwing);
      const hintOn = !drag && throwing == null;
      hint.style.opacity = hintOn ? "1" : "0";
    }

    return {
      tick(dt) {
        if (auto && !ctx.reduced) elapsed += dt;
        apply(dt, ctx.reduced);
      },
      seek(ms) {
        auto = !ctx.reduced;
        elapsed = ms / 1000;
        order = [0, 1, 2, 3];
        throwing = null;
        drag = null;
        nextThrow = 2.2;
        state.forEach((s) => {
          s.x.x = 0; s.x.v = 0; s.op.x = 1;
        });
        apply(0, true);
      },
      replay() {
        auto = !ctx.reduced;
        elapsed = 0;
        order = [0, 1, 2, 3];
        throwing = null;
        drag = null;
        nextThrow = 2.2;
        state.forEach((s) => {
          s.x.x = 0; s.x.v = 0; s.op.x = 1;
        });
        apply(0, true);
      },
      destroy() {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerup", onUp);
        stage.removeEventListener("pointercancel", onUp);
        root.replaceChildren();
      },
    };
  },
};
