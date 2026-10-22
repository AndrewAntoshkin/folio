/**
 * Motion Lab
 * To add an experiment, create experiments/<id>.js and append it to EXPERIMENTS.
 * Tokens and the file contract live in DESIGN.md.
 */
import { STAGE, el, injectStyle, pick, reduced } from "./runtime.js";
import mapSheet from "./experiments/map-sheet.js";
import payment from "./experiments/payment.js";
import shared from "./experiments/shared.js";
import digits from "./experiments/digits.js";
import stack from "./experiments/stack.js";
import morph from "./experiments/morph.js";

const EXPERIMENTS = [mapSheet, payment, shared, digits, stack, morph];

const lang = document.documentElement.lang === "en" ? "en" : "ru";
const grid = document.getElementById("lab-grid");
const dialog = document.getElementById("lab-dialog");
const main = document.querySelector("main");

const live = new Set();
let raf = 0;
let last = 0;

function loop(t) {
  const dt = Math.min(0.032, last ? (t - last) / 1000 : 0.016);
  last = t;
  live.forEach((inst) => inst.tick(dt));
  if (live.size && !document.hidden) raf = requestAnimationFrame(loop);
  else raf = 0;
}

function wake(inst) {
  live.add(inst);
  if (!raf && !document.hidden) {
    last = 0;
    raf = requestAnimationFrame(loop);
  }
}

function sleep(inst) {
  live.delete(inst);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(raf);
    raf = 0;
    return;
  }
  if (live.size) {
    last = 0;
    raf = requestAnimationFrame(loop);
  }
});

function fit(phone) {
  const scale = phone.clientWidth / STAGE.w;
  const node = phone.querySelector(".lab-scale");
  if (node && scale > 0) node.style.transform = `scale(${scale})`;
}

function shell() {
  const phone = el("div", "lab-phone");
  const scale = el("div", "lab-scale");
  const stage = el("div", "lab-stage");
  const island = el("div", "lab-island");
  const status = el("div", "lab-status");
  status.append(el("span", "", "9:41"), el("i"));
  const home = el("div", "lab-home");
  const mountPoint = el("div", "lab-root");
  stage.append(island, status, mountPoint, home);
  scale.append(stage);
  phone.append(scale);
  return { phone, stage, mountPoint };
}

const EXPAND = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4"/></svg>`;
const CLOSE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`;

const tiles = new Map();
let dialogInst = null;
let dialogId = null;
let returnFocus = null;

function mountExperiment(mod, mountPoint, detail) {
  injectStyle(mod.id, mod.css);
  return mod.mount(mountPoint, { lang, reduced, detail });
}

EXPERIMENTS.forEach((mod, index) => {
  const article = el("article", "lab-tile");
  article.dataset.exp = mod.id;
  const { phone, mountPoint } = shell();
  const expand = el("button", "lab-expand", EXPAND);
  expand.type = "button";
  expand.setAttribute("aria-label", pick(lang, `Открыть «${mod.title.ru}»`, `Open “${mod.title.en}”`));
  expand.addEventListener("click", () => open(mod.id, expand));
  phone.append(expand);

  const foot = el("div", "lab-foot");
  const openBtn = el("button", "lab-open");
  openBtn.type = "button";
  openBtn.append(
    el("span", "lab-kicker", `${String(index + 1).padStart(2, "0")} · ${pick(lang, mod.kicker.ru, mod.kicker.en)}`),
    el("span", "lab-name", pick(lang, mod.title.ru, mod.title.en)),
    el("span", "lab-line", pick(lang, mod.line.ru, mod.line.en)),
  );
  openBtn.addEventListener("click", () => open(mod.id, openBtn));
  const replay = el("button", "lab-replay", pick(lang, "Ещё раз", "Replay"));
  replay.type = "button";
  replay.addEventListener("click", () => tiles.get(mod.id).replay());
  foot.append(openBtn, replay);
  article.append(phone, foot);
  grid.append(article);

  const inst = mountExperiment(mod, mountPoint, false);
  inst.seek(reduced ? mod.hero : index * 1400);
  tiles.set(mod.id, inst);
  fit(phone);
  article.__phone = phone;

  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && dialogId !== mod.id) wake(inst);
      else sleep(inst);
    },
    { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
  );
  io.observe(phone);
});

const ro = new ResizeObserver((entries) => {
  entries.forEach((entry) => fit(entry.target));
});
document.querySelectorAll(".lab-phone").forEach((phone) => ro.observe(phone));

function close() {
  if (!dialogInst) return;
  sleep(dialogInst);
  dialogInst.destroy();
  dialogInst = null;
  const id = dialogId;
  dialogId = null;
  dialog.hidden = true;
  dialog.replaceChildren();
  main.removeAttribute("inert");
  document.body.style.overflow = "";
  if (id && tiles.has(id)) {
    const phone = document.querySelector(`[data-exp="${id}"] .lab-phone`);
    if (phone && phone.getBoundingClientRect().bottom > 0) wake(tiles.get(id));
  }
  history.replaceState(null, "", location.pathname + location.search);
  returnFocus?.focus();
  returnFocus = null;
}

function open(id, trigger) {
  const mod = EXPERIMENTS.find((item) => item.id === id);
  if (!mod || !dialog) return;
  if (dialogInst) {
    sleep(dialogInst);
    dialogInst.destroy();
    dialogInst = null;
  }
  if (tiles.has(id)) sleep(tiles.get(id));
  returnFocus = trigger || document.activeElement;
  dialogId = id;
  dialog.hidden = false;
  dialog.replaceChildren();
  dialog.setAttribute("aria-labelledby", "lab-dialog-title");

  const closeBtn = el("button", "lab-x", CLOSE);
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", pick(lang, "Закрыть", "Close"));
  closeBtn.addEventListener("click", close);

  const gridEl = el("div", "lab-dialog-grid");
  const { phone, mountPoint } = shell();
  const note = el("div", "lab-note");
  const index = EXPERIMENTS.indexOf(mod);
  note.append(
    el("p", "lab-kicker", `${String(index + 1).padStart(2, "0")} · ${pick(lang, mod.kicker.ru, mod.kicker.en)}`),
    el("h2", "", pick(lang, mod.title.ru, mod.title.en)),
  );
  note.querySelector("h2").id = "lab-dialog-title";
  note.append(el("p", "lab-idea", pick(lang, mod.idea.ru, mod.idea.en)));
  const tokens = el("ul", "lab-tokens");
  mod.tokens.forEach((token) => tokens.append(el("li", "", token)));
  const replay = el("button", "lab-replay", pick(lang, "Ещё раз", "Replay"));
  replay.type = "button";
  replay.addEventListener("click", () => dialogInst?.replay());
  note.append(tokens, replay);
  gridEl.append(phone, note);
  dialog.append(closeBtn, gridEl);

  dialogInst = mountExperiment(mod, mountPoint, true);
  if (reduced) dialogInst.seek(mod.hero);
  else dialogInst.replay();
  wake(dialogInst);
  fit(phone);
  ro.observe(phone);

  main.setAttribute("inert", "");
  document.body.style.overflow = "hidden";
  history.replaceState(null, "", `#${id}`);
  closeBtn.focus();
}

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) close();
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
  seek(id, ms) {
    tiles.get(id)?.seek(ms);
  },
  open(id) {
    open(id);
  },
  close,
  seekOpen(id, ms) {
    open(id);
    dialogInst?.seek(ms);
  },
};
