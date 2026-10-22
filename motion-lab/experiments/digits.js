import { createDigits, el, pick, spring, springStep, SPRING } from "../runtime.js";

const VALUES = [12800, 24600, 18450, 36920];
const HOLD = 1.7;

const css = `
.x-dg {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px;
  background:
    radial-gradient(220px 140px at 50% 42%, rgba(202,232,189,0.18), transparent 70%),
    radial-gradient(180px 120px at 70% 60%, rgba(140,160,255,0.12), transparent 70%),
    #0c0e0c;
}
.x-dg p { margin: 0; font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
.x-dg-row { display: flex; align-items: flex-end; gap: 8px; }
.x-dg-cur { font-size: 24px; line-height: 40px; color: rgba(255,255,255,0.72); }
.x-dg-delta { height: 32px; display: inline-flex; align-items: center; padding: 0 12px; border-radius: 999px; background: rgba(202,232,189,0.16); color: var(--mint); font-size: 16px; font-weight: 500; font-variant-numeric: tabular-nums; }
`;

export default {
  id: "digits",
  kicker: { ru: "Число", en: "Number" },
  title: { ru: "Пружинные цифры", en: "Spring digits" },
  line: {
    ru: "Каждая цифра доезжает отдельно и чуть проскакивает.",
    en: "Each digit travels on its own and overshoots a little.",
  },
  idea: {
    ru: "Каждая цифра — отдельная лента на пружине. Разряд не прыгает: новое число доезжает и слегка проскакивает мимо, потом оседает. Разряды стоят на месте, поэтому сумма не дёргает вёрстку.",
    en: "Each digit is its own sprung reel. A place value never pops: the next figure travels in, passes the mark a little, and settles. The columns stay put, so the amount does not shift the layout.",
  },
  tokens: ["spring.digit", "opacity.reveal"],
  hero: 1800,
  css,
  mount(root, ctx) {
    const wrap = el("div", "x-dg");
    const label = el("p", "", pick(ctx.lang, "Баланс", "Balance"));
    const row = el("div", "x-dg-row");
    const host = el("div");
    const cur = el("span", "x-dg-cur", "₽");
    row.append(host, cur);
    const delta = el("div", "x-dg-delta");
    wrap.append(label, row, delta);
    wrap.addEventListener("click", () => nudge());
    root.append(wrap);
    const digits = createDigits(host, { size: 64, places: 5 });
    const fade = spring();
    let elapsed = 0;
    let manualIndex = null;
    let last = -1;

    function indexAt(t) {
      if (manualIndex != null) return manualIndex;
      return Math.floor(t / HOLD) % VALUES.length;
    }
    function nudge() {
      const i = indexAt(elapsed);
      manualIndex = (i + 1) % VALUES.length;
    }
    function formatDelta(n) {
      const sign = n > 0 ? "+" : "−";
      const body = new Intl.NumberFormat(ctx.lang === "en" ? "en-US" : "ru-RU").format(Math.abs(n));
      return `${sign}${body}`;
    }
    function apply(dt, snap) {
      const i = indexAt(elapsed);
      const value = VALUES[i];
      const prev = VALUES[(i + VALUES.length - 1) % VALUES.length];
      if (value !== last) {
        digits.set(value);
        last = value;
      }
      digits.tick(dt, snap);
      const since = manualIndex == null ? elapsed % HOLD : 0.4;
      springStep(fade, since > 0.25 ? 1 : 0, dt, SPRING.snappy, snap);
      delta.style.opacity = String(Math.max(0, fade.x));
      delta.style.transform = `translate3d(0, ${(1 - fade.x) * 8}px, 0)`;
      delta.textContent = formatDelta(value - prev);
    }

    return {
      tick(dt) {
        if (manualIndex == null && !ctx.reduced) elapsed += dt;
        apply(dt, ctx.reduced);
      },
      seek(ms) {
        manualIndex = null;
        elapsed = ms / 1000;
        last = -1;
        digits.jump(VALUES[indexAt(elapsed)]);
        last = VALUES[indexAt(elapsed)];
        apply(0, true);
      },
      replay() {
        manualIndex = null;
        elapsed = 0;
        last = -1;
        digits.jump(VALUES[0]);
        last = VALUES[0];
        apply(0, true);
      },
      destroy() {
        root.replaceChildren();
      },
    };
  },
};
