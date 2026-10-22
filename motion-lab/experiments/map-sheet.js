import { SPRING, el, pick, spring, springStep, snapSpring } from "../runtime.js";

const PLACES = [
  {
    x: 112,
    y: 208,
    ru: { name: "Тихая набережная", kind: "Прогулка", note: "12 мин пешком", open: "Открыто до 22:00", extra: "Без очереди" },
    en: { name: "Quiet embankment", kind: "Walk", note: "12 min on foot", open: "Open until 22:00", extra: "No queue" },
  },
  {
    x: 264,
    y: 160,
    ru: { name: "Зимний сад", kind: "Место", note: "6 мин пешком", open: "Открыто до 21:00", extra: "Тихий зал" },
    en: { name: "Winter garden", kind: "Place", note: "6 min on foot", open: "Open until 21:00", extra: "Quiet hall" },
  },
  {
    x: 184,
    y: 312,
    ru: { name: "Северный двор", kind: "Двор", note: "4 мин пешком", open: "Всегда открыт", extra: "Сквозной проход" },
    en: { name: "North courtyard", kind: "Court", note: "4 min on foot", open: "Always open", extra: "A way through" },
  },
];

const PERIOD = 8.8;

const css = `
.x-map { position: absolute; inset: 0; }
.x-map-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(140px 96px at 28% 34%, rgba(202, 232, 189, 0.32), transparent 70%),
    radial-gradient(180px 120px at 74% 24%, rgba(140, 160, 255, 0.22), transparent 72%),
    radial-gradient(220px 140px at 58% 78%, rgba(202, 232, 189, 0.12), transparent 70%),
    linear-gradient(180deg, #141816 0%, #0a0c0b 62%, #101412 100%);
}
.x-map svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.x-pin {
  position: absolute; width: 40px; height: 40px; margin: -20px 0 0 -20px;
  display: grid; place-items: center;
}
.x-pin b {
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--mint); box-shadow: 0 0 0 6px rgba(202, 232, 189, 0.18);
}
.x-pin span {
  position: absolute; top: 40px; left: 50%; transform: translateX(-50%);
  font-size: 12px; line-height: 16px; font-weight: 500; white-space: nowrap; color: rgba(255,255,255,0.72);
}
.x-card, .x-sheet { position: absolute; will-change: transform; }
.x-card {
  left: 24px; top: 216px; width: 344px; height: 112px;
  padding: 24px; border-radius: 24px;
  background: linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06));
  border: 1px solid rgba(255,255,255,0.16);
  box-shadow: 0 24px 48px -28px rgba(0,0,0,0.7);
  transform-origin: center center;
  display: flex; flex-direction: column; justify-content: center; gap: 8px;
  text-align: left;
}
.x-card small, .x-sheet small { font-size: 12px; line-height: 16px; font-weight: 500; color: rgba(255,255,255,0.72); }
.x-card strong { font-size: 24px; line-height: 32px; font-weight: 400; letter-spacing: var(--track-h); }
.x-dim { position: absolute; inset: 0; background: #000; pointer-events: none; }
.x-sheet {
  left: 16px; right: 16px; top: 0; height: 640px;
  padding: 16px 24px 48px; border-radius: 32px 32px 24px 24px;
  background: linear-gradient(180deg, rgba(28,32,30,0.96), rgba(12,14,13,0.98));
  border: 1px solid rgba(255,255,255,0.12);
  display: flex; flex-direction: column; align-items: flex-start; gap: 16px;
}
.x-grab { width: 40px; height: 4px; border-radius: 999px; background: rgba(255,255,255,0.28); align-self: center; }
.x-sheet h3 { margin: 0; font-size: 32px; line-height: 40px; font-weight: 400; letter-spacing: var(--track-h); }
.x-facts { display: flex; gap: 8px; }
.x-facts span {
  height: 32px; display: inline-flex; align-items: center; padding: 0 12px;
  border-radius: 999px; background: rgba(255,255,255,0.08); font-size: 12px; line-height: 16px; font-weight: 500;
}
.x-go {
  height: 48px; padding: 0 24px; border-radius: 999px; background: var(--mint); color: #000;
  font-size: 16px; font-weight: 500;
}
`;

function poseAt(t) {
  const u = t % PERIOD;
  const place = Math.floor(t / PERIOD) % PLACES.length;
  let pose = "pins";
  if (u >= 1) pose = "card";
  if (u >= 2.5) pose = "peek";
  if (u >= 4) pose = "open";
  if (u >= 6.3) pose = "card";
  if (u >= 7.4) pose = "pins";
  return { place, pose };
}

export default {
  id: "map-sheet",
  kicker: { ru: "Карта", en: "Map" },
  title: { ru: "Пин, карточка, лист", en: "Pin, card, sheet" },
  line: {
    ru: "Пин вырастает в карточку, затем в нижний лист.",
    en: "A pin grows into a card, then into a bottom sheet.",
  },
  idea: {
    ru: "Пин — это свёрнутая карточка места. Он доезжает пружиной до карточки, затем нижний лист открывает путь. Так видно, откуда взялся экран.",
    en: "The pin is a place card, folded small. It springs open into the card, then a bottom sheet reveals the route. The motion shows where the screen came from.",
  },
  tokens: ["spring.soft", "spring.sheet", "opacity.reveal"],
  hero: 3200,
  css,
  mount(root, ctx) {
    const copy = (place) => place[ctx.lang === "en" ? "en" : "ru"];
    const wrap = el("div", "x-map");
    wrap.append(el("div", "x-map-bg"));
    const roads = el("div");
    roads.innerHTML = `<svg viewBox="0 0 392 640" fill="none" aria-hidden="true">
      <path d="M-8 460C70 420 130 500 210 468s120-40 190 8" stroke="rgba(150,180,255,0.35)" stroke-width="22" stroke-linecap="round"/>
      <path d="M32 64c48 72 24 150 88 214s40 150 16 250" stroke="rgba(255,255,255,0.14)" stroke-width="10" stroke-linecap="round"/>
      <path d="M300 40c-28 88 36 130-8 210s8 160 48 250" stroke="rgba(255,255,255,0.12)" stroke-width="8" stroke-linecap="round"/>
      <path d="M16 304h360" stroke="rgba(255,255,255,0.08)" stroke-width="6" stroke-linecap="round"/>
    </svg>`;
    wrap.append(roads);
    const dim = el("div", "x-dim");
    const pins = PLACES.map((place, i) => {
      const btn = el("button", "x-pin");
      btn.type = "button";
      btn.style.left = `${place.x}px`;
      btn.style.top = `${place.y}px`;
      btn.tabIndex = ctx.detail ? 0 : -1;
      btn.append(el("b"));
      btn.append(el("span", "", copy(place).name));
      btn.setAttribute("aria-label", copy(place).name);
      btn.addEventListener("click", () => select(i));
      return btn;
    });
    const card = el("button", "x-card");
    card.type = "button";
    card.tabIndex = ctx.detail ? 0 : -1;
    const cardKind = el("small");
    const cardName = el("strong");
    const cardNote = el("small");
    card.append(cardKind, cardName, cardNote);
    const sheet = el("div", "x-sheet");
    const sheetTitle = el("h3");
    const facts = el("div", "x-facts");
    const factA = el("span");
    const factB = el("span");
    facts.append(factA, factB);
    const go = el("button", "x-go", pick(ctx.lang, "Маршрут", "Route"));
    go.type = "button";
    go.tabIndex = ctx.detail ? 0 : -1;
    sheet.append(el("i", "x-grab"), sheetTitle, facts, go);
    wrap.append(dim, ...pins, card, sheet);
    root.append(wrap);

    const s = {
      x: spring(), y: spring(), sc: spring(), cardOp: spring(),
      sheet: spring(), dim: spring(), sheetOp: spring(),
    };
    let elapsed = 0;
    let manual = null;
    let lastPlace = 0;

    function current() {
      if (manual) return manual;
      return poseAt(elapsed);
    }

    function targets() {
      const { place, pose } = current();
      const p = PLACES[place];
      const closedX = p.x - 196;
      const closedY = p.y - 272;
      const openSheet = pose === "open";
      const showCard = pose !== "pins";
      const showSheet = pose === "peek" || pose === "open";
      return {
        place,
        x: showCard ? (openSheet ? 0 : 0) : closedX,
        y: showCard ? (openSheet ? -72 : 0) : closedY,
        sc: showCard ? (openSheet ? 0.96 : 1) : 0.08,
        cardOp: pose === "card" || pose === "peek" ? 1 : pose === "open" ? 0 : 0,
        sheet: pose === "open" ? 152 : pose === "peek" ? 392 : 640,
        dim: showSheet ? (openSheet ? 0.45 : 0.28) : 0,
        sheetOp: showSheet ? 1 : 0,
        pinOp: showCard ? 0.35 : 1,
      };
    }

    function select(i) {
      manual = { place: i, pose: "peek" };
    }
    card.addEventListener("click", () => {
      if (!manual) manual = { place: current().place, pose: "peek" };
      manual = { place: manual.place, pose: manual.pose === "open" ? "peek" : "open" };
    });
    go.addEventListener("click", () => {
      manual = { place: (manual || current()).place, pose: "open" };
    });
    dim.addEventListener("click", () => {
      manual = null;
    });

    function apply(dt, snap) {
      const t = targets();
      if (t.place !== lastPlace && t.sc < 0.2) {
        const p = PLACES[t.place];
        snapSpring(s.x, p.x - 196);
        snapSpring(s.y, p.y - 272);
        lastPlace = t.place;
      } else lastPlace = t.place;
      springStep(s.x, t.x, dt, SPRING.soft, snap);
      springStep(s.y, t.y, dt, SPRING.soft, snap);
      springStep(s.sc, t.sc, dt, SPRING.soft, snap);
      springStep(s.cardOp, t.cardOp, dt, SPRING.soft, snap);
      springStep(s.sheet, t.sheet, dt, SPRING.sheet, snap);
      springStep(s.dim, t.dim, dt, SPRING.sheet, snap);
      springStep(s.sheetOp, t.sheetOp, dt, SPRING.soft, snap);
      card.style.transform = `translate3d(${s.x.x}px, ${s.y.x}px, 0) scale(${s.sc.x})`;
      card.style.opacity = String(Math.max(0, s.cardOp.x));
      card.style.pointerEvents = s.cardOp.x > 0.45 ? "auto" : "none";
      sheet.style.transform = `translate3d(0, ${s.sheet.x}px, 0)`;
      sheet.style.opacity = String(Math.max(0, s.sheetOp.x));
      sheet.style.pointerEvents = s.sheetOp.x > 0.5 ? "auto" : "none";
      dim.style.opacity = String(Math.max(0, s.dim.x));
      dim.style.pointerEvents = s.dim.x > 0.05 ? "auto" : "none";
      const text = copy(PLACES[t.place]);
      cardKind.textContent = text.kind;
      cardName.textContent = text.name;
      cardNote.textContent = text.note;
      sheetTitle.textContent = text.name;
      factA.textContent = text.open;
      factB.textContent = text.extra;
      pins.forEach((pin, i) => {
        const on = i === t.place && t.sc > 0.3;
        pin.style.opacity = on ? "0" : String(t.pinOp);
        pin.querySelector("span").style.opacity = on || t.sc > 0.4 ? "0" : "1";
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
