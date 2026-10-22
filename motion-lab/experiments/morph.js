import { SPRING, el, pick, spring, springStep } from "../runtime.js";

const ITEMS = [
  { ru: "Профиль", en: "Profile", icon: "M12 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-6 7.2a6 6 0 0 1 12 0" },
  { ru: "Настройки", en: "Settings", icon: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z M12 3.5v2M12 18.5v2M4.8 6.2l1.5 1.5M17.7 16.3l1.5 1.5M3.5 12h2M18.5 12h2M4.8 17.8l1.5-1.5M17.7 7.7l1.5-1.5" },
  { ru: "Тишина", en: "Silence", icon: "M6 10h2l4-3v10l-4-3H6V10Zm8 1.2a3 3 0 0 1 0 3.6" },
];

const PERIOD = 6.4;

const css = `
.x-mo { position: absolute; inset: 0; background:
  radial-gradient(180px 140px at 50% 80%, rgba(202,232,189,0.14), transparent 70%),
  radial-gradient(160px 100px at 50% 20%, rgba(140,160,255,0.12), transparent 70%),
  #0c0e0c; }
.x-cap {
  position: absolute; left: 46px; top: 176px; width: 300px; height: 384px;
  border-radius: 999px; overflow: hidden; transform-origin: 50% 100%;
  background: linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06));
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 24px 48px -28px rgba(0,0,0,0.65);
  will-change: transform;
}
.x-cap ul { list-style: none; margin: 0; padding: 72px 28px 80px; display: flex; flex-direction: column; gap: 8px; }
.x-cap button {
  height: 64px; width: 100%; display: flex; align-items: center; gap: 16px;
  padding: 0 8px; border-radius: 16px; font-size: 20px; line-height: 28px; font-weight: 500; text-align: left;
}
.x-cap button:hover { background: rgba(255,255,255,0.06); }
.x-cap svg { flex: none; }
.x-word {
  position: absolute; left: 0; right: 0; top: 516px; height: 32px;
  display: grid; place-items: center; font-size: 16px; font-weight: 500; pointer-events: none;
}
.x-mo-note {
  position: absolute; left: 32px; right: 32px; top: 88px;
  font-size: 32px; line-height: 40px; font-weight: 400; letter-spacing: var(--track-h);
}
`;

function poseAt(t) {
  const u = t % PERIOD;
  if (u < 1.1) return "closed";
  if (u < 4.4) return "open";
  return "closed";
}

export default {
  id: "morph",
  kicker: { ru: "Меню", en: "Menu" },
  title: { ru: "Кнопка становится меню", en: "A button becomes a menu" },
  line: {
    ru: "Одна стеклянная капсула раскрывается из кнопки.",
    en: "One glass capsule opens out of the button.",
  },
  idea: {
    ru: "Кнопка и меню — одна стеклянная капсула. Она раскрывается из кнопки масштабом, без смены ширины. Пункты появляются, когда форма уже почти на месте.",
    en: "The button and the menu are one glass capsule. It opens out of the button by scale alone, with no change of width. The items appear once the shape has nearly arrived.",
  },
  tokens: ["spring.soft", "spring.snappy", "opacity.stagger"],
  hero: 2200,
  css,
  mount(root, ctx) {
    const wrap = el("div", "x-mo");
    wrap.append(el("p", "x-mo-note", pick(ctx.lang, "Одно движение.", "One motion.")));
    const cap = el("div", "x-cap");
    const list = el("ul");
    const itemNodes = ITEMS.map((item, i) => {
      const btn = el("button", "", `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${item.icon}"/></svg><span>${pick(ctx.lang, item.ru, item.en)}</span>`);
      btn.type = "button";
      btn.tabIndex = ctx.detail ? 0 : -1;
      list.append(btn);
      return { el: btn, op: spring(), y: spring(), i };
    });
    cap.append(list);
    const word = el("div", "x-word", pick(ctx.lang, "Меню", "Menu"));
    wrap.append(cap, word);
    root.append(wrap);
    wrap.addEventListener("click", () => {
      const open = manual ? manual === "open" : poseAt(elapsed) === "open";
      manual = open ? "closed" : "open";
    });
    word.style.pointerEvents = "none";

    const shape = { sx: spring(), sy: spring(), label: spring() };
    let elapsed = 0;
    let manual = null;

    function openNow() {
      if (manual) return manual === "open";
      return poseAt(elapsed) === "open";
    }

    function apply(dt, snap) {
      const open = openNow();
      springStep(shape.sx, open ? 1 : 0.56, dt, SPRING.soft, snap);
      springStep(shape.sy, open ? 1 : 0.15, dt, SPRING.soft, snap);
      springStep(shape.label, open ? 0 : 1, dt, SPRING.snappy, snap);
      cap.style.transform = `scale(${shape.sx.x}, ${shape.sy.x})`;
      word.style.opacity = String(Math.max(0, shape.label.x));
      const reveal = open && shape.sy.x > 0.72;
      itemNodes.forEach((item) => {
        springStep(item.op, reveal ? 1 : 0, dt, SPRING.snappy, snap);
        springStep(item.y, reveal ? 0 : 8, dt, SPRING.snappy, snap);
        const delay = snap ? 1 : 1;
        item.el.style.opacity = String(Math.max(0, item.op.x));
        item.el.style.transform = `translate3d(0, ${item.y.x + (reveal ? 0 : item.i * delay)}px, 0)`;
      });
    }

    return {
      tick(dt) {
        if (manual == null && !ctx.reduced) elapsed += dt;
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
