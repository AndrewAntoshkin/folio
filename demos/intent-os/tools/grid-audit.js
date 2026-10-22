// Layout-grid audit for Intent OS.
// usage: node grid-audit.js <outdir> [--shots] [--langs en,ru] [--only <regex>] [--dev desktop|phone] [--base /demos/intent-os/]
// Opens every surface fresh at 1440x900 (desktop) and 390x844 (phone), measures computed styles and rects,
// and flags anything off the grid. Writes <outdir>/report.json, <outdir>/report.txt and, with --shots, one PNG per surface.
// needs playwright-core (npm i playwright-core, or PLAYWRIGHT_CORE=/path/to/playwright-core) and Chrome (CHROME=/path/to/chrome)
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "playwright-core");
const CHROME = process.env.CHROME || "/usr/bin/google-chrome";
const ORIGIN = process.env.ORIGIN || "http://127.0.0.1:8765";
const fs = require("fs");
const args = process.argv.slice(2);
const OUT = args[0] || "/tmp/grid/out";
const SHOTS = args.includes("--shots");
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null };
const LANGS = (opt("--langs") || "en,ru").split(",");
const ONLY = opt("--only") ? new RegExp(opt("--only")) : null;
const BASE = opt("--base") || "/demos/intent-os/";
const DEVS = opt("--dev") ? [opt("--dev")] : ["desktop", "phone"];
fs.mkdirSync(OUT, { recursive: true });

const KINDS = ["alarm", "calendar", "chart", "chat", "checklist", "compose", "doc", "invite", "list", "listings", "map", "message", "options", "plan", "player", "product", "receipt", "remind", "result", "results", "suggest", "summary", "weather"];
// Kinds no blueprint ships with are created the way the app creates them at runtime, inside the Lisbon space.
const intentCard = (en, ru, ctx = "[]", title = "\"x\"") => `const m=M("result",${title},"intent");defineModule(m,T(${JSON.stringify(en)},${JSON.stringify(ru)}),${ctx});insertAfter(allModules().at(-1),m,false);return m`;
const MAKE = {
  result: intentCard("book a table for two at Time Out Market", "забронируй столик на двоих в Time Out Market"),
  results: intentCard("find running sneakers", "найди кроссовки для бега"),
  remind: intentCard("remind me to call Leo at 18:00", "напомни позвонить Лео в 18:00"),
  summary: intentCard("summarize this", "кратко это", "[textOf(allModules().find(x=>x.kind===\"doc\")).join(\" \")]", "allModules().find(x=>x.kind===\"doc\").item"),
  product: `${intentCard("find running sneakers", "найди кроссовки для бега").replace(/return m$/, "")}DO.addAll(m);return allModules().find(x=>x.kind==="product")`,
  plan: `return proposal(T("Move the museum to Saturday","Перенести музей на субботу"),[T("Friday → Leo’s workshop, indoors","Пятница → мастерская Лео, в помещении"),T("Saturday → Gulbenkian museum","Суббота → музей Гульбенкяна")],T("Nothing changes until you confirm.","Ничего не изменится, пока вы не подтвердите."),()=>{})`,
  receipt: `allowShift();return allModules().find(x=>x.kind==="receipt")`,
  suggest: `pushAuto(S.auto.make());return allModules().find(x=>x.kind==="suggest")`,
};
const cardSetup = k => MAKE[k]
  ? `(()=>{enterSpace("trip");setTimeout(()=>{const m=(()=>{${MAKE[k]}})();setTimeout(()=>{document.querySelectorAll("#toasts .toast").forEach(n=>n.remove());openFull(m)},300)},800)})()`
  : `(()=>{const sp=Object.keys(BP).find(id=>BP[id]().flows.some(f=>f.modules.some(m=>m.kind==="${k}")));enterSpace(sp);setTimeout(()=>openFull(allModules().find(m=>m.kind==="${k}")),800)})()`;
const SPACES = ["inbox", "trip", "flat", "gym", "report"];
const SECTIONS = ["general", "permissions", "computer", "devices"];

// scope: what the surface is (only these subtrees are measured); frame: the edge its outer margin is measured from
function surfaces(dev) {
  const D = dev === "desktop", M = D ? [24, 32] : [16];
  const page = D ? "#app" : "#app";
  const list = [];
  list.push({ id: "home", setup: "", scope: ["#os", "#ffSwitch"], frames: [{ sel: "body", m: M }] });
  for (const sp of SPACES) list.push({ id: `space-${sp}`, setup: `enterSpace("${sp}")`, scope: ["#os"], frames: [{ sel: "body", m: M }] });
  list.push({ id: "space-trip-overview", setup: `enterSpace("trip");setTimeout(()=>toggleOverview(true),700)`, wait: 2200, scope: ["#overview", ".statusbar"], frames: [{ sel: "body", m: M }] });
  for (const k of KINDS) list.push({ id: `card-${k}`, kind: k, setup: cardSetup(k), wait: MAKE[k] ? 2800 : 2400, scope: [`.module.active.k-${k}`], frames: [{ sel: `.module.active.k-${k}`, m: D ? [24] : [16] }], card: true });
  for (const s of SECTIONS) list.push({ id: `settings-${s}`, setup: `openSettings({section:"${s}"})`, scope: [".sys-win"], frames: [{ sel: ".sys-win", m: D ? [24] : [16] }] });
  list.push({ id: "settings-space", setup: `enterSpace("trip");setTimeout(()=>openSettings({section:"general",scope:"space"}),800)`, wait: 2200, scope: [".sys-win"], frames: [{ sel: ".sys-win", m: D ? [24] : [16] }] });
  list.push({ id: "settings-lang", setup: `openSettings({section:"general",sub:"lang"})`, scope: [".sys-win"], frames: [{ sel: ".sys-win", m: D ? [24] : [16] }] });
  list.push({ id: "profile", setup: `openProfile()`, scope: [".sys-win"], frames: [{ sel: ".sys-win", m: D ? [24] : [16] }] });
  list.push({ id: "account-menu", setup: `setMenu(true)`, scope: ["#meWrap .umenu"], frames: [{ sel: "#meWrap .umenu", m: [8, 16] }] });
  list.push({ id: "control-centre", setup: `setWx(true)`, scope: ["#cc"], frames: [{ sel: "#cc", m: [16] }] });
  list.push({ id: "control-centre-space", setup: `enterSpace("trip");setTimeout(()=>setWx(true),800)`, wait: 2200, scope: ["#cc"], frames: [{ sel: "#cc", m: [16] }] });
  list.push({ id: "control-centre-music", setup: `enterSpace("gym");setTimeout(()=>{setWx(true);setTimeout(()=>{CC.expand="lights";renderCC()},300)},800)`, wait: 2400, scope: ["#cc"], frames: [{ sel: "#cc", m: [16] }] });
  list.push({ id: "control-centre-forecast", setup: `setWx(true);setTimeout(()=>toggleTile("weather"),400)`, wait: 1900, scope: ["#cc.show-wx"], frames: [{ sel: "#cc", m: [16] }] });
  list.push({ id: "notifications", setup: `showNotifs(true)`, scope: [".notif-head", ".notif-list"], frames: [{ sel: "#notifPanel", m: M }] });
  list.push({ id: "switcher", setup: `enterSpace("trip");setTimeout(()=>openSwitcher(),800)`, wait: 2200, scope: ["#switcher"], frames: [{ sel: "body", m: M }] });
  return list;
}

// ---------------------------------------------------------------- in-page measurement
const AUDIT = () => {
  window.__gridAudit = (cfg) => {
    const SCALE = [11, 13, 15, 17, 20, 26, 34, 48, 72];
    const ART = ".map svg, .map .tiles, .map-tiles, .leaflet-pane, .bars i, .bar, .spark, .wave, .art, .album, .scene, .illus, .clock-hands, .ph, [data-art], .ff-ghost, .sw-screen, .hm-grid, .hm-months, .ps-bar, .mp-bars, .mp-leg, .bars";
    const V = [];
    const near = (a, b, t = 0.51) => Math.abs(a - b) < t;
    const on8 = v => { const a = Math.abs(v); return a < 0.01 || near(a, 4, 0.01) || near(a % 8, 0, 0.01) || near(a % 8, 8, 0.01) };
    const px = v => Math.round(v * 100) / 100;
    const sig = el => {
      const one = e => e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + [...e.classList].filter(c => !/^(on|in|open|active|sel|pin|hl|is-|ff-)/.test(c)).slice(0, 2).map(c => "." + c).join("");
      const p = el.parentElement && el.parentElement !== document.body ? one(el.parentElement) + " > " : "";
      return p + one(el);
    };
    const add = (rule, el, msg) => V.push({ rule, el: sig(el), msg });
    const clipOK = el => {
      const r = el.getBoundingClientRect();
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.overflowX !== "visible" || cs.overflowY !== "visible") {
          const q = p.getBoundingClientRect();
          if (r.right <= q.left + 1 || r.left >= q.right - 1 || r.bottom <= q.top + 1 || r.top >= q.bottom - 1) return false;
        }
      }
      return true;
    };
    const vis = el => {
      if (!(el instanceof HTMLElement || el instanceof SVGSVGElement)) return false;
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5 || r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) return false;
      return clipOK(el);
    };
    const scaled = el => {
      for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.transform !== "none") { const m = new DOMMatrix(cs.transform); if (!near(m.a, 1, 0.005) || !near(m.d, 1, 0.005)) return true }
        if (cs.scale !== "none" && cs.scale !== "1") return true;
      }
      return false;
    };
    const roots = cfg.scope.flatMap(s => [...document.querySelectorAll(s)]).filter(vis);
    const set = new Set();
    for (const r of roots) { set.add(r); r.querySelectorAll("*").forEach(e => { if (!(e instanceof SVGElement) || e instanceof SVGSVGElement) set.add(e) }) }
    const els = [...set].filter(e => !e.closest(ART) && vis(e));
    const R = new Map(els.map(e => [e, e.getBoundingClientRect()]));
    const CS = new Map(els.map(e => [e, getComputedStyle(e)]));
    const content = c => { const r = R.get(c), cs = CS.get(c); return { left: r.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft), right: r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight), mid: (r.left + r.right) / 2 } };
    const hasText = e => [...e.childNodes].some(n => n.nodeType === 3 && /\S/.test(n.textContent));
    const isCtl = e => e.matches("button, input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=switch], [role=option], [role=menuitem], a[href]") || (e instanceof HTMLElement && getComputedStyle(e).cursor === "pointer" && getComputedStyle(e.parentElement || e).cursor !== "pointer");
    const painted = (e, cs = CS.get(e)) => {
      const bg = cs.backgroundColor, img = cs.backgroundImage;
      return (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) || img !== "none" || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0 || /^(IMG|VIDEO|CANVAS)$/.test(e.tagName) || cs.boxShadow !== "none";
    };
    const isIcon = e => (e instanceof SVGSVGElement) || e.matches(".ic, .um-ic, i.ico");
    // a transparent control's hit area may reach into the margin; what you see is its glyph and text
    const inkRect = (e, any) => {
      const r = R.get(e); if ((!any && !isCtl(e)) || painted(e)) return r;
      if (e.matches("input, textarea, select")) { const c = content(e); return { left: c.left, right: c.right, top: r.top, bottom: r.bottom, width: c.right - c.left, height: r.height } }
      let L = Infinity, T = Infinity, Rt = -Infinity, B = -Infinity;
      const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      for (let n = w.currentNode; n; n = w.nextNode()) {
        let q = null;
        if (n.nodeType === 3) { if (!/\S/.test(n.textContent) || !R.has(n.parentElement)) continue; const rg = document.createRange(); rg.selectNodeContents(n); q = rg.getBoundingClientRect() }
        else if (n !== e && R.has(n) && (isIcon(n) || n.tagName === "IMG" || painted(n))) q = R.get(n);
        if (q && q.width > 0) { L = Math.min(L, q.left); T = Math.min(T, q.top); Rt = Math.max(Rt, q.right); B = Math.max(B, q.bottom) }
      }
      return L === Infinity ? r : { left: L, top: T, right: Rt, bottom: B, width: Rt - L, height: B - T };
    };
    const indicatorEl = e => { const cs = CS.get(e); return !hasText(e) && /absolute/.test(cs.position) && cs.pointerEvents === "none" && !e.children.length };

    // 1. spacing: padding, margin, gap on the 8 grid (4 allowed)
    const SIDES = ["top", "right", "bottom", "left"];
    for (const e of els) {
      if (e instanceof SVGSVGElement) continue;
      const cs = CS.get(e); let map; try { map = e.computedStyleMap() } catch { }
      for (const s of SIDES) {
        const p = parseFloat(cs["padding" + s[0].toUpperCase() + s.slice(1)]);
        if (!on8(p)) add("spacing", e, `padding-${s} ${px(p)}`);
        const mv = map?.get("margin-" + s);
        if (mv && mv instanceof CSSKeywordValue) continue;
        const m = parseFloat(cs["margin" + s[0].toUpperCase() + s.slice(1)]);
        if (!on8(m)) add("spacing", e, `margin-${s} ${px(m)}`);
      }
      if (/flex|grid/.test(cs.display)) {
        const kids = [...e.children].filter(k => R.has(k) && !/absolute|fixed/.test(CS.get(k).position));
        if (kids.length >= 2) for (const g of ["rowGap", "columnGap"]) { if (cs[g] === "normal") continue; const v = parseFloat(cs[g]); if (!on8(v)) add("spacing", e, `${g === "rowGap" ? "row-gap" : "column-gap"} ${px(v)}`) }
      }
    }
    // 2. type scale
    for (const e of els) {
      if (!(hasText(e) || e.matches("input, textarea"))) continue;
      const f = parseFloat(CS.get(e).fontSize);
      if (!SCALE.some(s => near(s, f, 0.01))) add("type", e, `font-size ${px(f)}`);
    }
    // 3. control heights: painted controls are 8k tall (24..64); icon-only controls are 8k square
    for (const e of els) {
      if (!isCtl(e) || e.matches("input[type=checkbox], input[type=radio], input[type=range]")) continue;
      const r = R.get(e), cs = CS.get(e);
      if (Math.min(r.width, r.height) <= 8) continue;
      if (!painted(e) && !e.matches("input, select, textarea")) continue;
      if (r.height > 64.5 || scaled(e)) continue;
      if (!near(r.height % 8, 0, 0.26) && !near(r.height % 8, 8, 0.26)) add("control", e, `height ${px(r.height)}`);
      const textless = ![...e.querySelectorAll("*")].concat(e).some(hasText) && !e.matches("input, select, textarea");
      if (textless && !e.matches("[role=switch], .sys-switch, .switch") && !near(r.width, r.height, 0.26)) add("control", e, `icon control not square ${px(r.width)}x${px(r.height)}`);
    }
    // 4. icons: glyphs 16/20/24, icon boxes 8k, glyph centred in its box
    for (const e of els) {
      if (!isIcon(e) || scaled(e)) continue;
      const r = R.get(e); if (r.width > 48.5 && r.height > 48.5) continue;
      const w = px(r.width), h = px(r.height);
      if (w > 24.5 && near(w, h, 0.26) && near(w % 8, 0, 0.26)) continue;
      const p = e.parentElement, pr = p && p.getBoundingClientRect(), inTile = p && pr.width <= 16.5 && near(pr.width, pr.height, 0.6) && (getComputedStyle(p).backgroundColor !== "rgba(0, 0, 0, 0)" || getComputedStyle(p).backgroundImage !== "none" || parseFloat(getComputedStyle(p).borderTopWidth) > 0);
      if (!near(w, h, 0.26) || ![16, 20, 24].concat(inTile ? [12] : []).some(s => near(s, w, 0.26))) add("icon", e, `glyph ${w}x${h}${inTile ? "" : " (12 only inside a 16 tile)"}`);
    }
    for (const e of els) {
      if (isIcon(e) || isCtl(e) || scaled(e) || !painted(e)) continue;
      const r = R.get(e); if (r.width > 64.5 || Math.min(r.width, r.height) < 12) continue;
      const kids = [...e.children].filter(k => R.has(k));
      if (e.tagName === "IMG" && e.parentElement && R.has(e.parentElement) && Math.abs(R.get(e.parentElement).width - r.width) <= 4) continue;
      const glyph = kids.length === 1 && (isIcon(kids[0]) || kids[0].tagName === "IMG") ? kids[0] : (kids.length === 0 && e.tagName === "IMG" ? e : null);
      const square = near(r.width, r.height, 0.26);
      if (!glyph && !(square && e.matches(".avatar, .av, .tile, .app, .svc"))) continue;
      if (!square || !near(r.width % 8, 0, 0.26) && !near(r.width % 8, 8, 0.26)) add("icon", e, `icon box ${px(r.width)}x${px(r.height)}`);
      if (glyph && glyph !== e) { const g = R.get(glyph); if (Math.abs((g.left + g.right) / 2 - (r.left + r.right) / 2) > 0.51 || Math.abs((g.top + g.bottom) / 2 - (r.top + r.bottom) / 2) > 0.51) add("icon", e, "glyph not centred in box") }
    }
    // 5. radii per level: surfaces 24 / groups 16 / inner 8; controls 8 or pill; small pieces 4 or 8; pills and circles anywhere
    const rad = (e, cs) => {
      const r = R.get(e), half = Math.min(r.width, r.height) / 2;
      return ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"].map(k => {
        const v = cs[k].split(" ")[0]; const n = v.endsWith("%") ? parseFloat(v) / 100 * Math.min(r.width, r.height) : parseFloat(v);
        return Math.min(n, half);
      });
    };
    const pill = (e, c) => { const r = R.get(e), half = Math.min(r.width, r.height) / 2; return c.every(v => v >= half - 0.6) };
    const roundSurf = new Map();
    for (const e of els) {
      const cs = CS.get(e); if (e instanceof SVGSVGElement) continue;
      const c = rad(e, cs); if (c.every(v => v < 0.5)) continue;
      if (!painted(e) && cs.overflow === "visible") continue;
      if (pill(e, c)) continue;
      roundSurf.set(e, Math.max(...c));
    }
    // a painted track holding only controls (a segmented row) is one control
    const ctlGroup = e => { const k = [...e.children].filter(x => R.has(x) && !indicatorEl(x)); return k.length >= 2 && k.every(isCtl) };
    for (const [e, max] of roundSurf) {
      const r = R.get(e), cs = CS.get(e), c = rad(e, cs);
      let lvl = 0, parentR = null;
      for (let p = e.parentElement; p; p = p.parentElement) { if (roundSurf.has(p)) { if (parentR === null) parentR = roundSurf.get(p); lvl++ } }
      if (Math.min(r.width, r.height) <= 8.5) continue;
      const indicator = !hasText(e) && /absolute/.test(cs.position) && cs.pointerEvents === "none" && !e.children.length;
      const small = Math.min(r.width, r.height) <= 24.5, compact = ((isCtl(e) || indicator || e.matches("[role=radiogroup], [role=tablist], .sys-seg, .seg") || ctlGroup(e)) && r.height <= 40.5) || e.matches("small, .tag, .chip");
      const tile = r.width <= 64.5 && near(r.width, r.height, 0.6) && ([...e.children].filter(k => R.has(k)).length <= 1);
      const ok = small || tile ? [4, 8] : compact ? [8] : [[24], [16], [8]][Math.min(lvl, 2)];
      // a corner flush with its container's corner follows the container, not the level
      let nzc = c;
      const par = (() => { for (let p = e.parentElement; p; p = p.parentElement) if (roundSurf.has(p)) return p; return null })();
      if (par) { const q = R.get(par) || par.getBoundingClientRect(), t = 2.5;
        const flush = [near(r.left, q.left, t) && near(r.top, q.top, t), near(r.right, q.right, t) && near(r.top, q.top, t), near(r.right, q.right, t) && near(r.bottom, q.bottom, t), near(r.left, q.left, t) && near(r.bottom, q.bottom, t)];
        nzc = c.map((v, i) => flush[i] ? 0 : v); }
      const nz = nzc.filter(v => v >= 0.5);
      const tails = nz.filter(v => near(v, 4, 0.1)).length;
      const bad = nz.filter(v => !ok.some(o => near(o, v, 0.1)) && !(tails === 1 && near(v, 4, 0.1) && nz.length === 4));
      if (!nz.length) { if (parentR !== null && max > parentR + 0.1) add("radius", e, `flush radius ${px(max)} larger than its container ${px(parentR)}`); continue }
      if (bad.length) add("radius", e, `radius ${c.map(px).join("/")} at level ${lvl} (want ${ok.join("|")})`);
      if (parentR !== null && max > parentR + 0.1) add("radius", e, `radius ${px(max)} larger than its container ${px(parentR)}`);
    }
    // 6. outer margins: every top-level item that starts (or ends) a row near a frame edge sits on the margin,
    //    or one step in (margin + 16, the text column of the cards). A centred column (desktop home) has no edge margin.
    // content centred in one of several equal-width columns (hourly strips, weekday headers) aligns to its column, not an edge
    const colCentred = e => { for (let p = e; p && p.parentElement; p = p.parentElement) { if (!R.has(p)) continue; const cs = CS.get(p);
      if (!(cs.textAlign === "center" || (/flex/.test(cs.display) && cs.flexDirection === "column" && cs.alignItems === "center"))) continue;
      const sib = [...p.parentElement.children].filter(k => R.has(k)); const w = R.get(p).width;
      if (sib.length >= 3 && sib.every(k => Math.abs(R.get(k).width - w) <= 1 && Math.abs(R.get(k).top - R.get(p).top) <= 1)) return true } return false };
    const isCardBox = e => roundSurf.has(e) && painted(e) && R.get(e).width >= 120 && R.get(e).height >= 40 && !isCtl(e);
    for (const f of cfg.frames) {
      const fr = document.querySelector(f.sel); if (!fr) continue;
      const B = fr.getBoundingClientRect(), bl = parseFloat(getComputedStyle(fr).borderLeftWidth) || 0, br = parseFloat(getComputedStyle(fr).borderRightWidth) || 0;
      const F = fr === document.body ? { left: 0, right: innerWidth, top: 0, bottom: innerHeight } : { left: B.left + bl, right: B.right - br, top: B.top, bottom: B.bottom };
      const FW = F.right - F.left, FM = (F.left + F.right) / 2;
      const allowed = [...new Set(f.m.flatMap(m => [m, m + 16]))];
      const bandCentred = e => { const p = e.parentElement; if (!p || !R.has(p)) return false; const r = R.get(e), pc = content(p);
        const band = [...p.children].filter(k => R.has(k) && Math.min(R.get(k).bottom, r.bottom) - Math.max(R.get(k).top, r.top) > 0);
        const L = Math.min(...band.map(k => R.get(k).left)), Rt = Math.max(...band.map(k => R.get(k).right));
        return Math.abs((L + Rt) / 2 - (pc.left + pc.right) / 2) <= 1.5 && /center/.test(CS.get(p).justifyContent + CS.get(p).textAlign) };
      const centred = e => { for (let p = e; p && p !== fr; p = p.parentElement) { const q = R.get(p) || p.getBoundingClientRect(); if ((q.width < FW - 128 && Math.abs((q.left + q.right) / 2 - FM) <= 1.5) || (R.has(p) && bandCentred(p))) return true } return false };
      const inCard = e => { for (let p = e.parentElement; p && p !== fr; p = p.parentElement) if (R.has(p) && (isCardBox(p) || (painted(p) && R.get(p).width >= 120 && !CS.get(p).backgroundImage.includes("gradient")))) return true; return false };
      const items = els.filter(e => fr.contains(e) && e !== fr && (hasText(e) || isCtl(e) || isIcon(e) || (painted(e) && !e.matches(".scrim, .veil"))) && !scaled(e) && !indicatorEl(e) && !inCard(e))
        .filter(e => !els.some(b => b !== e && b.contains(e) && (isCtl(b) || hasText(b) || (painted(b) && R.get(b).width <= 64))))
        .map(e => [e, inkRect(e)])
        .filter(([e, r]) => !(r.left <= F.left + 0.5 && r.right >= F.right - 0.5) && r.left >= F.left - 0.5 && r.right <= F.right + 0.5 && r.width < FW - 1)
        .filter(([e, r]) => !(CS.get(e).position === "absolute" && !hasText(e) && !isCtl(e) && r.height <= 6) && r.width >= 4);
      const ov = (p, q) => Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > Math.min(p.height, q.height) / 2;
      for (const [e, r] of items) {
        if (centred(e) || colCentred(e)) continue;
        const L = r.left - F.left, Rr = F.right - r.right;
        const first = !items.some(([b, q]) => b !== e && q.right <= r.left + 1 && ov(q, r));
        // only a right-anchored item has a right margin: the end of a left-aligned run of chips or buttons does not
        const lefts = items.filter(([b, q]) => b !== e && q.right <= r.left + 1 && ov(q, r)).map(([b]) => R.get(b).right);
        const last = !items.some(([b, q]) => b !== e && q.left >= r.right - 1 && ov(q, r)) && (!lefts.length || R.get(e).left - Math.max(...lefts) > 16.5) && !(lefts.length === 0 && L <= 64) && (e.parentElement && R.has(e.parentElement) ? near(R.get(e).right, content(e.parentElement).right, 1.01) : true)
          && !(hasText(e) && !isCtl(e) && !/right|end/.test(CS.get(e).textAlign) && !/end|right|space-between/.test(CS.get(e.parentElement).justifyContent));
        if (first && L <= 64 && !allowed.some(m => near(m, L))) add("margin", e, `left margin ${px(L)} from ${f.sel} (want ${allowed.join("|")})`);
        if (last && Rr <= 64 && !allowed.some(m => near(m, Rr))) add("margin", e, `right margin ${px(Rr)} from ${f.sel} (want ${allowed.join("|")})`);
      }
    }
    // 7. card grids: equal column widths, equal gutters on the grid, shared baselines
    const isCard = e => { const r = R.get(e); return roundSurf.has(e) && painted(e) && r.width >= 80 && r.height >= 40 && !isCtl(e) && !scaled(e) };
    const firstLines = e => {
      const out = []; const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, { acceptNode: n => /\S/.test(n.textContent) && R.has(n.parentElement) ? 1 : 2 });
      let n; while ((n = w.nextNode()) && out.length < 2) { const rg = document.createRange(); rg.selectNodeContents(n); const rr = rg.getClientRects()[0]; if (rr) out.push(rr.bottom) }
      return out;
    };
    for (const e of els) {
      const cards = [...e.children].filter(k => R.has(k) && isCard(k) && CS.get(k).position !== "absolute");
      if (cards.length < 2) continue;
      const rows = [];
      for (const c of cards) { const r = R.get(c); let row = rows.find(x => near(x.top, r.top, 1.01)); if (!row) rows.push(row = { top: r.top, cards: [] }); row.cards.push(c) }
      const widths = cards.map(c => R.get(c).width), gutX = [], gutY = [];
      const multi = rows.some(r => r.cards.length > 1);
      if (Math.max(...widths) - Math.min(...widths) > 0.6 && (multi || rows.length > 1)) {
        // a full-width card above a row of columns is a spanning row, not a column mismatch
        const cols = multi ? rows.filter(r => r.cards.length > 1).flatMap(r => r.cards.map(c => R.get(c).width)) : widths;
        if (Math.max(...cols) - Math.min(...cols) > 0.6) add("grid", e, `column widths differ: ${[...new Set(cols.map(px))].join(", ")}`);
      }
      for (const row of rows) {
        row.cards.sort((a, b) => R.get(a).left - R.get(b).left);
        for (let i = 1; i < row.cards.length; i++) gutX.push(R.get(row.cards[i]).left - R.get(row.cards[i - 1]).right);
        if (row.cards.length > 1) {
          const bl = row.cards.map(firstLines).map((l, i) => l.map(y => y - R.get(row.cards[i]).top));
          for (let k = 0; k < 2; k++) { const ys = bl.map(l => l[k]).filter(v => v !== undefined); if (ys.length > 1 && Math.max(...ys) - Math.min(...ys) > 1.01) { add("grid", e, `baseline ${k + 1} differs across a row: ${ys.map(px).join(", ")}`); break } }
        }
      }
      rows.sort((a, b) => a.top - b.top);
      // only between neighbours: a heading between two cards is a section break, not a gutter
      const adj = (a, b) => { let n = a.nextElementSibling; while (n && !R.has(n)) n = n.nextElementSibling; return n === b };
      for (let i = 1; i < rows.length; i++) if (adj(rows[i - 1].cards.at(-1), rows[i].cards[0])) gutY.push(Math.min(...rows[i].cards.map(c => R.get(c).top)) - Math.max(...rows[i - 1].cards.map(c => R.get(c).bottom)));
      const chk = (g, n) => { if (!g.length) return; if (Math.max(...g) - Math.min(...g) > 0.6) add("grid", e, `${n} gutters differ: ${[...new Set(g.map(px))].join(", ")}`); else if (!on8(g[0]) && g[0] > 0) add("grid", e, `${n} gutter ${px(g[0])} off grid`) };
      chk(gutX, "column"); chk(gutY.filter(g => g > -0.5), "row");
    }
    // 8. label-left / control-right rows share one control column and one label column
    const ctlIn = k => isCtl(k) || k.matches(".seg, .tog, .switch, [role=radiogroup], [role=tablist]") || (k.children.length && [...k.children].every(c => R.has(c) && (isCtl(c) || c.matches(".seg, .tog"))));
    const rowsets = new Map();
    for (const e of els) {
      const cs = CS.get(e); if (!/flex|grid/.test(cs.display) || scaled(e)) continue;
      const kids = [...e.children].filter(k => R.has(k) && !/absolute|fixed/.test(CS.get(k).position));
      if (kids.length < 2) continue;
      const last = kids.at(-1), first = kids[0], r = R.get(e);
      if (r.width < 200 || !ctlIn(last) || ctlIn(first) || !(hasText(first) || first.querySelector("*") && [...first.querySelectorAll("*")].some(hasText))) continue;
      const lr = R.get(last), fr0 = R.get(first); if ((lr.left + lr.right) / 2 < r.left + r.width / 2) continue;
      if (Math.min(lr.bottom, fr0.bottom) - Math.max(lr.top, fr0.top) < Math.min(lr.height, fr0.height) / 2) continue;
      // a control that just follows its label inline is not a label-left / control-right row
      const rc = content(e), gapX = parseFloat(cs.columnGap) || 0;
      if (!(near(lr.right, rc.right, 1.01) || lr.left - fr0.right > gapX + 1.01)) continue;
      const lab = [first, ...first.querySelectorAll("*")].find(x => R.has(x) && hasText(x)) || first;
      const key = `${Math.round(r.left)}:${Math.round(r.right)}:${e.parentElement?.closest(".sys-win, .module, .cc, #cc, .sheet, .card, .umenu, .notif, .overview, .statusbar, .switcher, .home")?.className || ""}`;
      if (!rowsets.has(key)) rowsets.set(key, []);
      rowsets.get(key).push({ e, ctl: inkRect(last, true), lab: inkRect(first, true), labText: R.get(lab), row: r });
      if (r.height <= 72 && !/baseline/.test(cs.alignItems) && Math.abs((lr.top + lr.bottom) / 2 - (r.top + r.bottom) / 2) > 1.01 && lr.height < r.height - 2) add("rows", last, `control not vertically centred in its row (${px((lr.top + lr.bottom) / 2 - (r.top + r.bottom) / 2)})`);
    }
    for (const [, rs] of rowsets) {
      if (rs.length < 2) continue;
      const rights = rs.map(x => x.ctl.right), lefts = rs.map(x => x.lab.left);
      if (Math.max(...rights) - Math.min(...rights) > 0.6) add("rows", rs[0].e, `control right edges differ: ${[...new Set(rights.map(v => px(v - rs[0].row.left)))].join(", ")} (${rs.map(x => sig(x.e).split(" > ").pop()).join(", ")})`);
      if (Math.max(...lefts) - Math.min(...lefts) > 0.6) add("rows", rs[0].e, `label left edges differ: ${[...new Set(lefts.map(v => px(v - rs[0].row.left)))].join(", ")}`);
    }
    // 9. orphan alignments: every item that starts a row lines up with something else in its container
    //    (a left edge, the shared right column, or a centred band); nested groups count as alignment targets
    const absIn = (e, c) => { for (let p = e; p && p !== c; p = p.parentElement) if (/absolute|fixed/.test((CS.get(p) || getComputedStyle(p)).position)) return true; return false };
    const iconBox = e => { if (isCtl(e) || !painted(e)) return false; const r = R.get(e); if (r.width > 64.5 || Math.min(r.width, r.height) < 12) return false; const k = [...e.children].filter(x => R.has(x)); return (k.length === 1 && (isIcon(k[0]) || k[0].tagName === "IMG")) || e.matches(".avatar") };
    const mark = e => painted(e) && !/absolute|fixed/.test(CS.get(e).position) && Math.min(R.get(e).width, R.get(e).height) >= 4 && R.get(e).width <= 24;
    const leaves = els.filter(e => !scaled(e) && (hasText(e) || isCtl(e) || isIcon(e) || isCard(e) || iconBox(e) || mark(e)) && R.get(e).width > 2)
      .filter(a => !els.some(b => b !== a && b.contains(a) && R.has(b) && (isCtl(b) || hasText(b) || iconBox(b))));
    const isBox = p => roots.includes(p) || (isCard(p) && R.get(p).width >= 120);
    const box = e => { for (let p = e.parentElement; p; p = p.parentElement) if (R.has(p) && isBox(p)) return p; return null };
    const overlapY = (p, q) => Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > Math.min(p.height, q.height) / 2;
    const byBox = new Map();
    for (const a of leaves) { const c = box(a); if (!c || absIn(a, c)) continue; if (!byBox.has(c)) byBox.set(c, []); byBox.get(c).push(a) }
    // a control whose label is centred in it (segments, round buttons) aligns by its box
    const IR = new Map(leaves.map(e => { const cs = CS.get(e); const ctr = cs.textAlign === "center" || /center/.test(cs.justifyContent) || /center/.test(cs.justifyItems); return [e, ctr ? R.get(e) : inkRect(e)] }));
    for (const [c, list] of byBox) {
      const C = content(c), mid = c === document.body ? innerWidth / 2 : C.mid;
      const targets = leaves.filter(b => c.contains(b) && !absIn(b, c)).concat([...byBox.keys()].filter(b => b !== c && c.contains(b)));
      const ir = e => IR.get(e) || R.get(e);
      for (const a of list) {
        const ra = ir(a);
        if (colCentred(a)) continue;
        const band = list.filter(b => overlapY(ir(b), ra));
        if (band.some(b => b !== a && ir(b).right <= ra.left + 1)) continue;
        const L = Math.min(...band.map(b => ir(b).left)), Rt = Math.max(...band.map(b => ir(b).right));
        if (Math.abs((L + Rt) / 2 - mid) <= 1.5 || Math.abs((ra.left + ra.right) / 2 - mid) <= 1.5) continue;
        if (targets.some(b => b !== a && !b.contains(a) && !a.contains(b) && near(ir(b).left, ra.left, 0.6))) continue;
        if (near(ra.left, C.left, 0.6) || near(ra.right, C.right, 0.6)) continue;
        if (targets.some(b => b !== a && !b.contains(a) && !a.contains(b) && near(ir(b).right, ra.right, 0.6) && ir(b).left < ra.left - 1)) continue;
        add("orphan", a, `left edge ${px(ra.left - R.get(c).left)} in ${sig(c).split(" > ").pop()} lines up with nothing (others: ${[...new Set(targets.filter(b => b !== a).map(b => px(ir(b).left - R.get(c).left)))].sort((x, y) => x - y).slice(0, 8).join(", ")})`);
      }
    }
    // 10. collisions: text never runs into other text or under a floating panel it does not belong to
    const clipInk = (e, q) => { const cs = CS.get(e), c = content(e), r = R.get(e);
      const L = cs.overflowX === "visible" ? q.left : Math.max(q.left, c.left), Rt = cs.overflowX === "visible" ? q.right : Math.min(q.right, c.right);
      const T = cs.overflowY === "visible" ? q.top : Math.max(q.top, r.top), B = cs.overflowY === "visible" ? q.bottom : Math.min(q.bottom, r.bottom);
      return { left: L, right: Rt, top: T, bottom: B, width: Rt - L, height: B - T } };
    const texts = els.filter(e => hasText(e) && !scaled(e) && CS.get(e).opacity !== "0").map(e => [e, clipInk(e, inkRect(e, true))]).filter(([, r]) => r.width > 2 && r.height > 2);
    const floats = els.filter(e => isCard(e) && !indicatorEl(e) && /absolute|fixed|sticky/.test(CS.get(e).position) && R.get(e).width >= 120);
    const hit = (p, q) => Math.min(p.right, q.right) - Math.max(p.left, q.left) > 2 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 2;
    for (let i = 0; i < texts.length; i++) {
      const [a, ra] = texts[i];
      for (let j = i + 1; j < texts.length; j++) { const [b, rb] = texts[j]; if (!a.contains(b) && !b.contains(a) && hit(ra, rb)) add("overlap", a, `text overlaps ${sig(b).split(" > ").pop()}`) }
      for (const f of floats) if (!f.contains(a) && !a.contains(f) && hit(ra, R.get(f))) add("overlap", a, `text runs under ${sig(f).split(" > ").pop()}`);
    }
    return { count: V.length, measured: els.length, violations: V };
  };
};

// ---------------------------------------------------------------- driver
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const jobs = [];
  for (const dev of DEVS) for (const lang of LANGS) for (const s of surfaces(dev)) if (!ONLY || ONLY.test(`${dev}-${s.id}`)) jobs.push({ dev, lang, s });
  const results = [];
  let next = 0;
  const settle = async (p, s, D) => {
    await p.waitForTimeout(s.wait || 1500);
    await p.waitForFunction(sc => sc.some(q => [...document.querySelectorAll(q)].some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden" })), s.scope, { timeout: 8000 }).catch(() => { });
    await p.waitForFunction(() => document.getAnimations().every(a => a.playState !== "running" || a.effect?.getTiming().iterations === Infinity), null, { timeout: 5000, polling: 100 }).catch(() => { });
    await p.mouse.move(D ? 1439 : 389, D ? 899 : 843);
    await p.evaluate(() => document.activeElement?.blur?.());
    await p.waitForTimeout(250);
  };
  // one surface on a fresh page; under heavy load a late app timer can close what setup opened, so an empty result is retried
  async function run({ dev, lang, s }, shoot) {
    const D = dev === "desktop";
    const ctx = await browser.newContext({ viewport: D ? { width: 1440, height: 900 } : { width: 390, height: 844 }, deviceScaleFactor: SHOTS ? 2 : 1, hasTouch: !D });
    await ctx.addInitScript(() => localStorage.setItem("intent-os-hints-seen", "1"));
    await ctx.addInitScript(AUDIT);
    const p = await ctx.newPage();
    const errs = []; p.on("pageerror", e => errs.push(e.message));
    await p.goto(`${ORIGIN}${BASE}?lang=${lang}&device=${dev}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(1400);
    // freeze the home signal rotation so every shot shows the same cards
    await p.evaluate(() => { try { window.__freeze = true; document.documentElement.classList.add("grid-audit") } catch { } });
    if (s.setup) await p.evaluate(s.setup);
    await settle(p, s, D);
    const res = await p.evaluate(cfg => window.__gridAudit(cfg), { scope: s.scope, frames: s.frames, dev });
    if (res.measured && shoot) await p.screenshot({ path: `${OUT}/${dev}-${s.id}.png`, animations: "disabled" });
    await ctx.close();
    return { res, errs };
  }
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++], { dev, lang, s } = job, shoot = SHOTS && lang === LANGS[0];
      let { res, errs } = await run(job, shoot);
      for (let i = 0; i < 2 && !res.measured; i++) ({ res, errs } = await run(job, shoot));
      if (!res.measured) { res.violations.push({ rule: "surface", el: s.scope.join(", "), msg: "surface did not render; nothing measured" }); res.count++ }
      for (const e of errs) { res.violations.push({ rule: "surface", el: "page", msg: `page error: ${e}` }); res.count++ }
      results.push({ dev, lang, surface: s.id, measured: res.measured, count: res.count, violations: res.violations, errors: errs });
      process.stderr.write(`${dev} ${lang} ${s.id}: ${res.count} (${res.measured} el)\n`);
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  await browser.close();
  results.sort((a, b) => (a.dev + a.surface + a.lang).localeCompare(b.dev + b.surface + b.lang));
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(results, null, 1));
  const byRule = {}; let total = 0, measured = 0;
  for (const r of results) { total += r.count; measured += r.measured; for (const v of r.violations) byRule[v.rule] = (byRule[v.rule] || 0) + 1 }
  const lines = [];
  lines.push(`Intent OS layout-grid audit — ${new Date().toISOString()}`);
  lines.push(`surfaces: ${results.length} (${DEVS.join(", ")} × ${LANGS.join(", ")}), elements measured: ${measured}`);
  lines.push(`violations: ${total}  ${Object.entries(byRule).map(([k, v]) => `${k}=${v}`).join("  ")}`);
  lines.push("");
  for (const r of results) {
    lines.push(`${r.count ? "FAIL" : "ok  "}  ${r.dev.padEnd(7)} ${r.lang}  ${r.surface.padEnd(26)} ${String(r.count).padStart(4)} violations  (${r.measured} elements)${r.errors.length ? "  page errors: " + r.errors.join(" | ") : ""}`);
    const seen = new Map();
    for (const v of r.violations) { const k = `${v.rule}  ${v.el}  ${v.msg}`; seen.set(k, (seen.get(k) || 0) + 1) }
    for (const [k, n] of seen) lines.push(`        ${k}${n > 1 ? `  ×${n}` : ""}`);
  }
  fs.writeFileSync(`${OUT}/report.txt`, lines.join("\n") + "\n");
  console.log(lines.slice(0, 3).join("\n"));
})().catch(e => { console.error(e); process.exit(1); });
