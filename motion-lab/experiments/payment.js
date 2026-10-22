import { SPRING, clamp, createDigits, easeInOut, el, pick, quad, spring, springStep } from "../runtime.js";

const PERIOD = 9.2;
const FROM = { x: 196, y: 204 };
const TO = { x: 88, y: 388 };
const ARC = { x: 300, y: 112 };

const css = `
.x-pay { position: absolute; inset: 0; background:
  radial-gradient(180px 120px at 50% 18%, rgba(202,232,189,0.16), transparent 70%),
  linear-gradient(180deg, #101210, #070808); }
.x-pay-layer { position: absolute; inset: 0; }
.x-pay-label { position: absolute; left: 32px; top: 96px; font-size: 12px; line-height: 16px; font-weight: 500; color: rgba(255,255,255,0.72); }
.x-pay-amount { position: absolute; left: 32px; top: 128px; display: flex; align-items: flex-end; gap: 8px; }
.x-pay-cur { font-size: 20px; line-height: 32px; color: rgba(255,255,255,0.72); }
.x-keys { position: absolute; left: 32px; right: 32px; top: 280px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.x-key {
  height: 56px; border-radius: 16px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  font-size: 20px; line-height: 28px; font-weight: 500;
}
.x-key-zero { grid-column: 2; }
.x-key-send { grid-column: 1 / -1; background: var(--mint); color: #000; border-color: transparent; }
.x-from, .x-to {
  position: absolute; left: 32px; width: 328px; height: 88px; border-radius: 24px;
  display: flex; align-items: center; gap: 16px; padding: 0 24px;
  background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05));
  border: 1px solid rgba(255,255,255,0.16);
}
.x-from { top: 160px; }
.x-to { top: 344px; }
.x-ava {
  width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
  background: var(--mint); color: #000; font-size: 16px; font-weight: 500; flex: none;
}
.x-from p, .x-to p { margin: 0; display: flex; flex-direction: column; gap: 4px; }
.x-from small, .x-to small { font-size: 12px; line-height: 16px; color: rgba(255,255,255,0.72); }
.x-from b, .x-to b { font-size: 20px; line-height: 28px; font-weight: 500; }
.x-chip {
  position: absolute; width: 128px; height: 48px; margin: -24px 0 0 -64px;
  display: grid; place-items: center; border-radius: 999px;
  background: var(--mint); color: #000; font-size: 16px; font-weight: 500;
  will-change: transform;
}
.x-success { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
.x-check {
  width: 80px; height: 80px; border-radius: 50%; display: grid; place-items: center;
  background: var(--mint); color: #000;
}
.x-success strong { font-size: 32px; line-height: 40px; font-weight: 400; letter-spacing: var(--track-h); }
.x-success span { font-size: 20px; line-height: 28px; color: rgba(255,255,255,0.72); }
`;

function scripted(t) {
  const u = t % PERIOD;
  let amount = 0;
  let view = "entry";
  let fly = 0;
  let press = -1;
  if (u >= 0.4 && u < 8.2) amount = 4;
  if (u >= 0.85 && u < 8.2) amount = 48;
  if (u >= 1.3 && u < 8.2) amount = 480;
  if (u >= 1.7 && u < 8.2) amount = 4800;
  if (u >= 0.4 && u < 0.7) press = 4;
  if (u >= 0.85 && u < 1.15) press = 8;
  if (u >= 1.3 && u < 1.55) press = 0;
  if (u >= 1.7 && u < 1.95) press = 0;
  if (u >= 2.15 && u < 2.4) press = "send";
  if (u >= 2.5) view = "confirm";
  if (u >= 3.6 && u < 5.1) {
    view = "fly";
    fly = (u - 3.6) / 1.5;
  }
  if (u >= 5.1) view = "done";
  if (u >= 8.2) view = "entry";
  return { amount, view, fly, press };
}

export default {
  id: "payment",
  kicker: { ru: "Перевод", en: "Transfer" },
  title: { ru: "Сумма, полёт, успех", en: "Amount, flight, success" },
  line: {
    ru: "Сумма набирается, карточка перелетает, экран успокаивается.",
    en: "The amount settles, the chip flies, the screen comes to rest.",
  },
  idea: {
    ru: "Сумма набирается по цифрам, карточка перевода перелетает к получателю и оседаёт в состоянии «отправлено». Каждое состояние объясняет, на каком шаге перевод.",
    en: "The amount settles digit by digit, the transfer chip flies to the recipient, and the screen rests on sent. Each state shows which step the transfer is on.",
  },
  tokens: ["spring.snappy", "spring.pop", "spring.digit", "opacity.crossfade"],
  hero: 5600,
  css,
  mount(root, ctx) {
    const wrap = el("div", "x-pay");
    const entry = el("div", "x-pay-layer");
    entry.append(el("p", "x-pay-label", pick(ctx.lang, "Сумма", "Amount")));
    const amountWrap = el("div", "x-pay-amount");
    const digitsHost = el("div");
    const cur = el("span", "x-pay-cur", "₽");
    amountWrap.append(digitsHost, cur);
    const keys = el("div", "x-keys");
    const keyNodes = [];
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((n) => {
      const b = el("button", "x-key", String(n));
      b.type = "button";
      b.tabIndex = ctx.detail ? 0 : -1;
      b.addEventListener("click", () => typeDigit(n));
      keys.append(b);
      keyNodes.push({ n, el: b, sc: spring() });
      b._sc = keyNodes[keyNodes.length - 1];
    });
    const zero = el("button", "x-key x-key-zero", "0");
    zero.type = "button";
    zero.tabIndex = ctx.detail ? 0 : -1;
    zero.addEventListener("click", () => typeDigit(0));
    const send = el("button", "x-key x-key-send", pick(ctx.lang, "Отправить", "Send"));
    send.type = "button";
    send.tabIndex = ctx.detail ? 0 : -1;
    send.addEventListener("click", () => beginSend());
    keys.append(zero, send);
    const zeroSpring = spring();
    zero._sc = { n: 0, el: zero, sc: zeroSpring };
    keyNodes.push(zero._sc);
    const sendSpring = spring();
    entry.append(amountWrap, keys);

    const confirm = el("div", "x-pay-layer");
    const from = el("div", "x-from");
    from.append(
      el("span", "x-ava", pick(ctx.lang, "А", "A")),
      el("p", "", `<small>${pick(ctx.lang, "Откуда", "From")}</small><b>${pick(ctx.lang, "Личная · 4821", "Personal · 4821")}</b>`),
    );
    const to = el("div", "x-to");
    to.append(
      el("span", "x-ava", pick(ctx.lang, "М", "M")),
      el("p", "", `<small>${pick(ctx.lang, "Кому", "To")}</small><b>${pick(ctx.lang, "Маше", "Masha")}</b>`),
    );
    const chip = el("div", "x-chip");
    confirm.append(from, to, chip);

    const success = el("div", "x-success");
    const check = el("div", "x-check", `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>`);
    const doneWord = el("strong", "", pick(ctx.lang, "Отправлено", "Sent"));
    const doneSum = el("span");
    success.append(check, doneWord, doneSum);

    wrap.append(entry, confirm, success);
    root.append(wrap);
    const digits = createDigits(digitsHost, { size: 48, places: 4 });

    const fade = { entry: spring(), confirm: spring(), success: spring() };
    const pop = spring();
    const fromSc = spring();
    const toSc = spring();
    let elapsed = 0;
    let manual = null;
    let flyT = 0;
    let shown = -1;

    function typeDigit(n) {
      if (!manual) manual = { amount: 0, view: "entry", fly: 0 };
      if (manual.view !== "entry") return;
      if (manual.amount >= 1000) return;
      manual.amount = manual.amount * 10 + n;
    }
    function beginSend() {
      const amount = manual ? manual.amount : 4800;
      if (amount <= 0) return;
      manual = { amount, view: "fly", fly: 0 };
      flyT = 0;
    }

    function state() {
      if (!manual) return scripted(elapsed);
      return manual;
    }

    function apply(dt, snap) {
      const st = state();
      if (manual && manual.view === "fly") {
        flyT += dt;
        manual.fly = clamp(flyT / 1.1, 0, 1);
        if (manual.fly >= 1) manual.view = "done";
      }
      if (st.amount !== shown) {
        digits.set(st.amount);
        shown = st.amount;
      }
      digits.tick(dt, snap);
      const view = st.view === "fly" ? "confirm" : st.view === "done" ? "done" : st.view;
      springStep(fade.entry, view === "entry" ? 1 : 0, dt, SPRING.soft, snap);
      springStep(fade.confirm, view === "confirm" || st.view === "fly" ? 1 : 0, dt, SPRING.soft, snap);
      springStep(fade.success, st.view === "done" ? 1 : 0, dt, SPRING.soft, snap);
      springStep(pop, st.view === "done" ? 1 : 0.86, dt, SPRING.pop, snap);
      springStep(fromSc, st.view === "fly" ? 0.96 : 1, dt, SPRING.soft, snap);
      springStep(toSc, st.view === "done" ? 1.04 : 1, dt, SPRING.pop, snap);
      entry.style.opacity = String(Math.max(0, fade.entry.x));
      entry.style.pointerEvents = fade.entry.x > 0.5 ? "auto" : "none";
      confirm.style.opacity = String(Math.max(0, fade.confirm.x));
      success.style.opacity = String(Math.max(0, fade.success.x));
      success.style.pointerEvents = "none";
      check.style.transform = `scale(${pop.x})`;
      from.style.transform = `scale(${fromSc.x})`;
      to.style.transform = `scale(${toSc.x})`;
      const p = easeInOut(st.view === "fly" ? st.fly : st.view === "done" ? 1 : 0);
      const pt = quad(FROM, ARC, TO, p);
      const showChip = st.view === "fly" || (st.view === "confirm" && fade.confirm.x > 0.8);
      chip.style.opacity = showChip ? String(1 - Math.max(0, p - 0.92) / 0.08) : "0";
      chip.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) scale(${1 + Math.sin(p * Math.PI) * 0.06})`;
      const formatted = new Intl.NumberFormat(ctx.lang === "en" ? "en-US" : "ru-RU").format(st.amount || 4800);
      chip.textContent = `${formatted}\u00A0₽`;
      doneSum.textContent = `${formatted}\u00A0₽`;
      keyNodes.forEach((key) => {
        const down = !manual && st.press === key.n && st.view === "entry";
        springStep(key.sc, down ? 0.94 : 1, dt, SPRING.snappy, snap);
        key.el.style.transform = `scale(${key.sc.x})`;
      });
      springStep(sendSpring, !manual && st.press === "send" ? 0.96 : 1, dt, SPRING.snappy, snap);
      send.style.transform = `scale(${sendSpring.x})`;
    }

    return {
      tick(dt) {
        if (!manual && !ctx.reduced) elapsed += dt;
        if (!manual && elapsed > PERIOD) {
          /* keep looping; scripted() wraps */
        }
        apply(dt, ctx.reduced);
      },
      seek(ms) {
        manual = null;
        elapsed = ms / 1000;
        shown = -1;
        digits.jump(scripted(elapsed).amount);
        apply(0, true);
      },
      replay() {
        manual = null;
        elapsed = 0;
        shown = -1;
        flyT = 0;
        digits.jump(0);
        apply(0, true);
      },
      destroy() {
        root.replaceChildren();
      },
    };
  },
};
