/* Intent OS · live mode
   A real model (Replicate) assembles the Space, answers module lines and replies in chats.
   Active only on localhost with demos/intent-os/config.local.js present (git-ignored) — Replicate allows
   browser CORS for localhost only, and the token must never ship to the public site.
   Everywhere else the demo keeps running on its scripted blueprints. Add ?live=0 to force scripted mode.
   Relies on globals from index.html: M, S, T, LANG, $, $$, cap, parse, openSpace, renderSpace, layout, arrive,
   moduleHTML, runSteps, refresh, findModule, textOf, blueprintFor, showToast, logMoment, overviewOpen, WX. */
(() => {
  "use strict";
  const API = "https://api.replicate.com/v1";
  const CFG = () => window.INTENT_OS_CONFIG || {};
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const forcedOff = new URLSearchParams(location.search).get("live") === "0";
  const enabled = () => isLocal && !forcedOff && !!CFG().replicateKey;
  const modelName = () => (CFG().model || "openai/gpt-5.6-sol");
  /* Measured on Replicate: openai/* streams line by line (first module ≈2 s); google/gemini-3.5-flash buffers the whole answer
     and its SSE text repeats chunks, so for it we skip SSE and poll the finished prediction instead. */
  const canStream = () => !/^google\//.test(modelName());
  /* Each model family names its inputs differently on Replicate */
  const modelInput = (system, prompt, maxTokens) => /^google\//.test(modelName())
    ? { system_instruction: system, prompt, thinking_level: "none", temperature: 0.8, max_output_tokens: maxTokens }
    : { system_prompt: system, prompt, reasoning_effort: "none", verbosity: "low", max_completion_tokens: maxTokens };
  const auth = () => ({ Authorization: "Bearer " + CFG().replicateKey, "Content-Type": "application/json" });
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ───────── Replicate transport: SSE stream with polling fallback ───────── */
  function run({ system, prompt, maxTokens = 6000, onText, onReset, signal }) {
    return new Promise(async (resolve, reject) => {
      let full = "", settled = false, es = null, pred = null;
      const onAbort = () => {
        if (pred && pred.urls && pred.urls.cancel) fetch(pred.urls.cancel, { method: "POST", headers: auth() }).catch(() => {});
        finish(new DOMException("aborted", "AbortError"));
      };
      const finish = err => {
        if (settled) return; settled = true;
        if (es) es.close();
        if (signal) signal.removeEventListener("abort", onAbort);
        err ? reject(err) : resolve(full);
      };
      const push = t => { if (!t) return; full += t; try { onText && onText(t, full) } catch (e) { console.error("[live] onText", e) } };
      if (signal) { if (signal.aborted) return finish(new DOMException("aborted", "AbortError")); signal.addEventListener("abort", onAbort) }

      try {
        const r = await fetch(`${API}/models/${modelName()}/predictions`, {
          method: "POST", headers: auth(), signal, body: JSON.stringify({
            stream: canStream(),
            input: modelInput(system, prompt, maxTokens)
          })
        });
        if (!r.ok) { const e = new Error("replicate " + r.status); e.status = r.status; throw e }
        pred = await r.json();
      } catch (e) { return finish(e) }

      const poll = async () => {
        for (let i = 0; i < 160 && !settled; i++) {
          const r = await fetch(pred.urls.get, { headers: auth(), signal }).then(x => x.json());
          const out = Array.isArray(r.output) ? r.output.join("") : (r.output || "");
          if (out !== full) {
            if (out.startsWith(full)) push(out.slice(full.length));
            else { full = out; try { onReset && onReset(out) } catch (e) { console.error("[live] onReset", e) } } // streamed text diverged: trust the stored output
          }
          if (r.status === "succeeded") return finish();
          if (r.status === "failed" || r.status === "canceled") return finish(new Error(r.error || r.status));
          await sleep(700);
        }
        finish(new Error("timeout"));
      };
      if (!canStream() || !pred.urls || !pred.urls.stream) return poll().catch(finish);
      es = new EventSource(pred.urls.stream);
      es.addEventListener("output", e => push(e.data));
      es.addEventListener("done", () => finish());
      es.addEventListener("error", () => { if (settled) return; es.close(); poll().catch(finish) });
    });
  }

  /* Pulls complete top-level JSON objects out of a text stream (NDJSON, pretty-printed or fenced — all fine). */
  function extractor(onObj) {
    let depth = 0, inStr = false, esc = false, buf = "";
    return text => {
      for (const ch of text) {
        if (depth === 0) { if (ch === "{") { depth = 1; buf = "{"; inStr = false; esc = false } continue }
        buf += ch;
        if (inStr) { if (esc) esc = false; else if (ch === "\\") esc = true; else if (ch === '"') inStr = false; continue }
        if (ch === '"') inStr = true;
        else if (ch === "{") depth++;
        else if (ch === "}" && --depth === 0) { try { onObj(JSON.parse(buf)) } catch (e) { console.warn("[live] bad json", buf) } buf = "" }
      }
    };
  }

  /* ───────── Prompts ───────── */
  const KINDS = `MODULE KINDS (the only allowed values of "kind") and their "data":
- list: an inbox-like list. {"title":"","rows":[{"from":"","subj":"","time":"09:41","text":"one-line preview","body":["paragraph","paragraph"]}]} — 3-5 rows
- message: one message; "item" is the sender. {"subj":"","time":"","body":["paragraph"]}
- compose: a drafted outgoing message; "item" is a short title like "Reply to Maya". {"to":"person name","text":"the full message in the user's voice"}
- chat: a thread; "item" is the person. {"msgs":[["Person","text"],["me","text"]],"replies":["short reply 1","short reply 2","short reply 3"]} — "me" is the user; 3-5 msgs
- invite: {"title":"","when":"Today · 16:00 – 16:45","who":"","where":""}
- calendar: a day timeline. {"title":"","ask":"question offering to create the proposed event","range":[9,15],"events":[{"s":11,"e":12,"t":"title","w":"place","prop":true}]} — hours as numbers (13.5 = 13:30); at most one "prop":true; range spans 5-8 hours
- options: choices to compare/book; "item" is the title. {"opts":[{"t":"name","s":"details","p":"€184"}]} — 2-4 opts
- listings: places/homes/stays with prices. "item" is the query. {"groups":[{"by":"Homes","items":[{"t":"2 rooms · 54 m²","addr":"name or street","price":"€1,450 / month","type":"interior"}]}]} — type is "interior" or "facade"; 3-4 items
- checklist: {"items":[["text",false],["text",true]]} — 4-6 items
- doc: a short document. {"title":"","paras":["paragraph","paragraph"]}
- chart: {"bars":[["Q1",60,"€4.2M"],["Q2",72,"€5.1M"]],"caption":"one sentence"} — 4 bars; the number is the bar height 10-100, proportional to the real value; the third item is that real value with its unit (max 14 characters), shown in the hover tooltip and consistent with the caption
- summary: {"points":["short point","short point","short point"]}
- weather: {"temp":19,"icon":"part","cond":"Partly cloudy","hours":[["Thu","sun",21,0],["Fri","rain",16,80]]} — icons: sun, cloud, rain, snow, part, fog, storm; each hour is [label, icon, temp, rain%]; 5-6 entries
- map: a real map with pins. "item" is the title. {"city":"Berlin","you":{"name":"Hotel","lat":52.5219,"lng":13.4132},"pins":[{"name":"exactly the place name used in the listing","sub":"short description","lat":52.5201,"lng":13.4108}],"nearby":[{"name":"Café X","kind":"Café","lat":52.523,"lng":13.411}]} — lat/lng are decimal degrees; use accurate coordinates for the real city and for real landmarks you know, and place invented venues within about 1-2 km of the real landmark. 3-5 pins; "you" is optional (the user's anchor: hotel, office, station); 2-3 "nearby" extras
- result: shows the agent working through steps. {"steps":["short step","short step","short step"]} — 3-4 steps, present tense
- suggest: proposed next actions. {"note":"one sentence","items":["short tag"],"actions":["short imperative the user can click","…","…"]} — 3 actions`;

  const PEOPLE = `COLLABORATORS
- People (kind "person") must be chosen ONLY from: ${["Maya Chen", "Leo Park", "Sofia Reyes", "Daniel Kim"].join(", ")} — in Russian write exactly: Майя Чен, Лео Пак, Софья Рейес, Даниэль Ким.
- Services (kind "service") must be chosen ONLY from: Mail, Calendar, Messages, Airline, Stays, Maps, Weather, Homes, Music, Health — in Russian: Почта, Календарь, Сообщения, Авиакомпания, Жильё, Карты, Погода, Объявления, Музыка, Здоровье.
- Names inside module content (senders, "to", chat participants) follow the same rule when they are one of the collaborators.`;

  const STYLE = `STYLE
- All user-facing text must be in the language given in the request.
- Be concrete and realistic: believable names, prices, times, addresses, numbers. You have no live data, so never claim you searched or checked something; present results as the Space's contents.
- Keep it tight: titles up to 6 words, lines up to 90 characters. No emoji except inside chat messages.
- Never output anything except JSON objects. No markdown, no code fences, no commentary.`;

  const SPACE_SYSTEM = `You are the engine of "Intent OS": the user states an intention and the system assembles a Space — a few horizontal flows, each a short thread of work made of small modules that move the intention forward.

OUTPUT FORMAT — a stream of JSON objects, one per line, in this exact order:
1. One line: {"type":"space","title":"short title of the Space","collabs":[{"name":"","kind":"service|person","access":"short phrase: what it sees or may do"}],"rules":[{"text":"a constraint or preference that applies to this Space","on":true}]}  (2-5 collabs, 2-3 rules)
2. 6-8 lines, one per module: {"type":"module","flow":"flow name","kind":"…","item":"module title","source":"name of one of the collabs","data":{…}}
   Group modules into 2-3 flows (a flow name is 1-2 words such as "Flights"). Emit modules flow by flow; never return to an earlier flow.
   Open with the module most useful to act on. Include at least one module the user can act on (compose, invite, options, calendar or listings) and finish with exactly one "result" module that shows what the agent does next.
   Whenever a "listings" module (or any module about venues, hotels, restaurants, stays) is present, add a "map" module right after it with one pin per place, in the same order, each pin named exactly like the listing's "addr".
3. Last line: {"type":"end"}

${KINDS}

${PEOPLE}

${STYLE}`;

  const MODULE_SYSTEM = `You are the engine of "Intent OS". The user typed an instruction into one module of a Space. Replace that module with the result.

OUTPUT: exactly ONE JSON object and nothing else: {"kind":"…","item":"module title","source":"collab name","data":{…}}
- Pick the kind that best fits the result: showing places/locations → map; replying/writing/forwarding/sharing → compose (write the real message text in the user's voice, grounded in the current module's facts); summarizing/translating → summary; finding/comparing/booking → options or listings; scheduling → calendar or invite; planning → checklist; reminders or multi-step automation → result.
- Reuse names, dates and numbers from the current module and its Space. Do not contradict them.

${KINDS}

${PEOPLE}

${STYLE}`;

  const LANGNAME = () => LANG === "ru" ? "Russian" : "English";
  const nowStr = () => new Date().toLocaleString(LANG === "ru" ? "ru-RU" : "en-GB", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

  /* ───────── Normalizers: whatever the model returns, only valid module data reaches the renderer ───────── */
  const A = (x, n = 99) => Array.isArray(x) ? x.slice(0, n) : [];
  const St = (x, d = "", max = 300) => { const s = x == null ? d : String(x).trim(); return s.length > max ? s.slice(0, max - 1) + "…" : s };
  const Nm = (x, d, lo, hi) => { x = +x; return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d };
  const ICONS = ["sun", "cloud", "rain", "snow", "part", "moon", "partn", "fog", "storm"];
  const isMe = w => /^(me|you|я|вы)$/i.test(String(w).trim());
  const NORM = {
    list: d => {
      const rows = A(d.rows, 6).map(r => ({
        from: St(r.from, "", 60), subj: St(r.subj, "", 90), time: St(r.time, "", 12), text: St(r.text, "", 160),
        body: A(r.body, 5).map(p => St(p, "", 600)).filter(Boolean), read: false
      })).filter(r => r.from && (r.subj || r.text));
      rows.forEach(r => { if (!r.body.length) r.body = [r.text || r.subj] });
      return rows.length ? { title: St(d.title, "", 60), rows } : null;
    },
    message: d => { const body = A(d.body, 6).map(p => St(p, "", 700)).filter(Boolean); return body.length ? { subj: St(d.subj, "", 90), time: St(d.time, "", 20), body } : null },
    compose: d => d.text ? { to: St(d.to, "—", 60), text: St(d.text, "", 900) } : null,
    chat: d => {
      const msgs = A(d.msgs, 12).filter(x => Array.isArray(x) && x.length >= 2 && x[1]).map(([w, t]) => [isMe(w) ? "me" : St(w, "", 40), St(t, "", 240)]);
      if (!msgs.length) return null;
      const out = { msgs, replies: A(d.replies, 5).map(x => St(x, "", 160)).filter(Boolean) };
      if (!out.replies.length) out.replies = [T("Sounds good!", "Звучит хорошо!"), T("Let’s do it.", "Давай так.")];
      return out;
    },
    invite: d => d.title && d.when ? { title: St(d.title, "", 90), when: St(d.when, "", 70), who: St(d.who, "—", 90), where: St(d.where, "—", 70) } : null,
    calendar: d => {
      const events = A(d.events, 6).map(e => ({ s: Nm(e.s, NaN, 0, 24), e: Nm(e.e, NaN, 0, 24), t: St(e.t, "", 60), w: St(e.w, "", 50), prop: !!e.prop })).filter(e => Number.isFinite(e.s) && Number.isFinite(e.e) && e.e > e.s && e.t);
      if (!events.length) return null;
      let seen = false; events.forEach(e => { if (e.prop) { if (seen) e.prop = false; seen = true } });
      const hs = events.flatMap(e => [e.s, e.e]);
      const r0 = Math.max(0, Math.floor(Math.min(...hs)) - 1), r1 = Math.min(24, Math.max(Math.ceil(Math.max(...hs)) + 1, r0 + 4));
      return { title: St(d.title, "", 70), ask: St(d.ask, "", 120), range: [r0, r1], now: Math.max(r0, events[0].s - 0.8), events };
    },
    options: d => { const opts = A(d.opts, 4).map(o => ({ t: St(o.t, "", 50), s: St(o.s, "", 70), p: St(o.p, "", 20) })).filter(o => o.t); return opts.length >= 1 ? { opts } : null },
    listings: d => {
      const groups = A(d.groups, 2).map(g => ({
        by: St(g.by, T("Homes", "Объявления"), 30),
        items: A(g.items, 4).map(i => ({ t: St(i.t, "", 50), addr: St(i.addr, "", 50), price: St(i.price, "", 30), seed: Math.abs(hash(St(i.addr) + St(i.t))), type: i.type === "facade" ? "facade" : "interior" })).filter(i => i.addr || i.t)
      })).filter(g => g.items.length);
      return groups.length ? { groups } : null;
    },
    checklist: d => { const items = A(d.items, 8).map(x => Array.isArray(x) ? [St(x[0], "", 90), !!x[1]] : [St(x, "", 90), false]).filter(x => x[0]); return items.length ? { items } : null },
    doc: d => { const paras = A(d.paras, 5).map(p => St(p, "", 700)).filter(Boolean); return paras.length ? { title: St(d.title, "", 90), paras } : null },
    chart: d => {
      const bars = A(d.bars, 6).map(b => Array.isArray(b) ? [St(b[0], "", 12), Nm(b[1], 50, 8, 100), St(b[2], "", 18)] : [St(b && b.label, "", 12), Nm(b && b.value, 50, 8, 100), St(b && b.display, "", 18)]).filter(b => b[0]);
      return bars.length >= 2 ? { bars, caption: St(d.caption, "", 140) } : null;
    },
    summary: d => { const points = A(d.points, 5).map(p => St(p, "", 200)).filter(Boolean); return points.length ? { points } : null },
    weather: d => {
      const hours = A(d.hours, 6).filter(Array.isArray).map(h => [St(h[0], "", 8), ICONS.includes(h[1]) ? h[1] : "cloud", Math.round(Nm(h[2], 15, -60, 60)), Math.round(Nm(h[3], 0, 0, 100))]);
      return hours.length ? { temp: Math.round(Nm(d.temp, hours[0][2], -60, 60)), icon: ICONS.includes(d.icon) ? d.icon : hours[0][1], cond: St(d.cond, "", 70), hours } : null;
    },
    /* The demo's map only knew Lisbon and Berlin. Register a view for whatever city the model picked:
       centre = middle of the pins, tile zoom = the deepest level at which every pin still fits the 640×360 map (upp 1–2 keeps tiles crisp). */
    map: d => {
      const ok = p => p && Number.isFinite(+p.lat) && Number.isFinite(+p.lng) && Math.abs(+p.lat) <= 80 && Math.abs(+p.lng) <= 180;
      const pins = A(d.pins, 6).filter(ok).map(p => ({ name: St(p.name, "", 50), sub: St(p.sub, "", 80), lat: +p.lat, lng: +p.lng })).filter(p => p.name);
      if (!pins.length) return null;
      /* Directions / "locate" need a starting point, so a map without one gets "You" just south-west of the pins' centre. */
      const mid = f => (Math.min(...pins.map(f)) + Math.max(...pins.map(f))) / 2;
      const you = ok(d.you) ? { name: St(d.you.name, T("You", "Вы"), 30), lat: +d.you.lat, lng: +d.you.lng }
        : { name: T("You", "Вы"), lat: mid(p => p.lat) - 0.0025, lng: mid(p => p.lng) - 0.0025 };
      const nearby = A(d.nearby, 4).filter(ok).map(p => ({ name: St(p.name, "", 50), lat: +p.lat, lng: +p.lng, kind: [St(p.kind, T("Place", "Место"), 24), St(p.kind, T("Place", "Место"), 24)] })).filter(p => p.name);
      const pts = you ? [...pins, you] : pins, lats = pts.map(p => p.lat), lngs = pts.map(p => p.lng);
      const c = [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2];
      let z = 2, upp = 1;
      for (let zz = 16; zz >= 2; zz--) {
        const dx = Math.abs(mercX(Math.max(...lngs), zz) - mercX(Math.min(...lngs), zz)), dy = Math.abs(mercY(Math.min(...lats), zz) - mercY(Math.max(...lats), zz));
        const u = Math.min(dx ? 430 / dx : 9, dy ? 240 / dy : 9);
        if (u >= 1) { z = zz; upp = Math.min(2, u); break }
      }
      const key = "live" + Math.abs(hash(St(d.city) + c.join(",") + pins.map(p => p.name).join("|")));
      GEO[key] = { c, z, upp, mode: "foot", osrm: "routed-foot", poi: nearby };
      const out = pins.map(p => ({ ...LL(key, p.lat, p.lng), name: p.name, sub: p.sub }));
      if (you) out.unshift({ ...LL(key, you.lat, you.lng), kind: "you", name: you.name });
      return { city: key, sel: you ? 1 : 0, pins: out };
    },
    result: d => { const steps = A(d.steps, 5).map(s => St(s, "", 80)).filter(Boolean); return steps.length >= 2 ? { steps, done: 0 } : null },
    suggest: d => { const actions = A(d.actions, 4).map(s => St(s, "", 60)).filter(Boolean); return actions.length ? { note: St(d.note, "", 160), items: A(d.items, 4).map(s => St(s, "", 40)).filter(Boolean), actions } : null }
  };

  const normHeader = o => {
    const collabs = A(o.collabs, 5).map((c, i) => ({ id: "c" + i, name: St(c && c.name, "", 40), kind: c && c.kind === "person" ? "person" : "service", access: St(c && c.access, "", 90) })).filter(c => c.name);
    return {
      title: St(o.title, "", 60), collabs,
      rules: A(o.rules, 4).map(r => ({ text: St(r && (r.text || r), "", 90), on: true })).filter(r => r.text)
    };
  };
  const srcId = (name, collabs) => { const k = String(name || "").trim().toLowerCase(); const c = collabs.find(c => c.name.toLowerCase() === k); return c ? c.id : "intent" };
  function buildModule(raw, collabs) {
    const kind = String(raw.kind || "").toLowerCase(), norm = NORM[kind];
    if (!norm) return null;
    let data = null;
    try { data = norm(raw.data && typeof raw.data === "object" ? raw.data : {}) } catch (e) { console.warn("[live] normalize", kind, e) }
    if (!data) return null;
    return M(kind, St(raw.item, "", 70) || cap(kind), srcId(raw.source, collabs), data);
  }

  /* ───────── Home screen busy state ───────── */
  const style = document.createElement("style");
  style.textContent = `
    .home-line.live-busy .cmd{animation:live-pulse 1.1s ease-in-out infinite}
    .home-line.live-busy input,.home-line.live-busy textarea{opacity:.55}
    .live-st{display:inline-flex;align-items:center;gap:8px}
    .live-dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:live-pulse 1.1s ease-in-out infinite}
    @keyframes live-pulse{0%,100%{opacity:.25}50%{opacity:1}}
    .live-badge{display:inline-flex;align-items:center;gap:7px;margin-top:18px;font-size:11px;letter-spacing:.02em;color:var(--quiet);opacity:.85;pointer-events:none;white-space:nowrap}
    .live-badge i{width:6px;height:6px;border-radius:50%;background:#3fb27f;box-shadow:0 0 0 3px rgba(63,178,127,.18)}
    .skel{flex:none;width:var(--mw);height:var(--mh);display:flex;flex-direction:column;gap:14px;padding:76px 30px;border-radius:20px;border:1.5px dashed rgba(47,47,47,.16);background:rgba(47,47,47,.035);transform:scale(.93);opacity:.9;animation:skel-in .6s var(--ease) both}
    .skel i{display:block;height:14px;border-radius:7px;background:linear-gradient(90deg,rgba(47,47,47,.06) 25%,rgba(47,47,47,.14) 50%,rgba(47,47,47,.06) 75%);background-size:200% 100%;animation:skel-shim 1.4s linear infinite}
    .skel i:nth-child(1){width:52%;height:22px;margin-bottom:8px}.skel i:nth-child(3){width:84%}.skel i:nth-child(4){width:68%}.skel i:nth-child(5){width:76%}
    @keyframes skel-shim{to{background-position:-200% 0}}
    @keyframes skel-in{from{opacity:0}}
    .live-prog{position:fixed;z-index:60;top:14px;left:50%;transform:translate(-50%,-6px);display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.82);backdrop-filter:blur(14px);box-shadow:0 8px 24px -10px rgba(0,0,0,.25);font-size:12px;color:var(--ink);opacity:0;pointer-events:none;transition:opacity .35s,transform .45s var(--ease)}
    .live-prog.show{opacity:1;transform:translate(-50%,0)}
    body.night .live-prog{background:rgba(40,40,40,.85)}
    body.night .skel{border-color:rgba(255,255,255,.14);background:rgba(255,255,255,.04)}
    body.night .skel i{background:linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.12) 50%,rgba(255,255,255,.05) 75%);background-size:200% 100%}`;
  document.head.appendChild(style);

  let runId = 0, ctl = null;
  const setBusy = (on, text) => {
    const f = $("#homeLine"), i = $("#intentInput"), p = $("#homeParse");
    f.classList.toggle("live-busy", on); i.disabled = on;
    if (on) { p.innerHTML = `<span class="tok live-st"><i class="live-dot"></i><b id="liveStatus">${esc(text || "")}</b></span>`; p.classList.add("show") }
    else { p.classList.remove("show"); i.disabled = false }
  };
  const status = t => { const el = $("#liveStatus"); if (el) el.textContent = t };
  const cancelRun = () => { runId++; if (ctl) ctl.abort(); ctl = null; $$("#flows .skel").forEach(e => e.remove()); pill && pill.classList.remove("show") };

  addEventListener("keydown", e => {
    if (e.key === "Escape" && $("#homeLine").classList.contains("live-busy")) { e.stopImmediatePropagation(); cancelRun(); setBusy(false); $("#intentInput").focus() }
  }, true);

  function refreshBadge() {
    let b = $("#liveBadge");
    if (!enabled()) { if (b) b.remove(); return }
    if (!b) { b = document.createElement("div"); b.id = "liveBadge"; b.className = "live-badge"; const anchor = $("#blueprints"); anchor ? anchor.insertAdjacentElement("afterend", b) : ($("#home") || document.body).appendChild(b) }
    b.innerHTML = `<i></i>${T("Live", "Живой режим")} · ${esc(modelName().split("/").pop())}`;
  }

  /* ───────── Space generation (streamed: modules appear as the model writes them) ───────── */
  const flowKey = n => String(n || "").trim().toLowerCase();
  /* "Show on map" selects the pin of the chosen listing: connect listing items to map pins by name */
  const plain = s => String(s || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  function linkPins() {
    const mp = allModules().find(x => x.kind === "map");
    if (!mp) return;
    allModules().filter(x => x.kind === "listings").forEach(l => l.data.groups.forEach(g => g.items.forEach(it => {
      if (it.pin != null) return;
      const k = plain(it.addr); if (!k) return;
      const i = mp.data.pins.findIndex(p => p.kind !== "you" && (plain(p.name) === k || plain(p.name).includes(k) || k.includes(plain(p.name))));
      if (i > -1) it.pin = i;
    })));
  }
  /* While the model is still writing: a dashed placeholder after the last card of the flow it is writing in, plus a small progress pill */
  const skelOff = () => $$("#flows .skel").forEach(e => e.remove());
  const skelOn = fi => {
    skelOff();
    const tr = $$("#flows .flow")[fi]?.querySelector(".track");
    if (tr) tr.insertAdjacentHTML("beforeend", `<div class="skel"><i></i><i></i><i></i><i></i><i></i></div>`);
  };
  let pill = null;
  const progress = n => {
    if (!pill) { pill = document.createElement("div"); pill.className = "live-prog"; document.body.appendChild(pill) }
    pill.innerHTML = `<i class="live-dot"></i>${esc(T(`Building · ${n} modules`, `Собираю · ${n} мод.`))}`;
    pill.offsetWidth; pill.classList.add("show");
  };
  const progressOff = () => { pill && pill.classList.remove("show") };
  function appendModule(m, fi) {
    skelOff();
    const fl = S.flows[fi]; fl.modules.push(m);
    if (typeof overviewOpen !== "undefined" && overviewOpen) renderOverview();
    $$("#flows .flow")[fi].querySelector(".track").insertAdjacentHTML("beforeend", moduleHTML(m, fi, fl.modules.length - 1));
    layout(); arrive(m, "down"); runSteps(m);
    if (m.kind === "map") { syncTiles(m); warmRoutes(m) }
    linkPins();
  }
  function appendFlow(name, key, m) {
    skelOff();
    S.flows.push({ name, _k: key, modules: [m] }); S.m.push(0);
    const fi = S.flows.length - 1;
    /* add just the new flow: renderSpace() would rebuild every card and make the page flash */
    $("#flows").insertAdjacentHTML("beforeend", `<div class="flow" data-f="${fi}"><div class="flow-label"><b>${esc(name)}</b><span class="count"></span></div><div class="track">${moduleHTML(m, fi, 0)}</div></div>`);
    $("#navdots").insertAdjacentHTML("beforeend", `<button data-f="${fi}" title="${esc(name)}"></button>`);
    if (typeof overviewOpen !== "undefined" && overviewOpen) renderOverview();
    layout();
    if (m.kind === "map") { syncTiles(m); warmRoutes(m) }
    arrive(m, "down"); runSteps(m); linkPins();
    const lb = $$(".flow-label")[S.flows.length - 1];
    if (lb && !reduce.matches) lb.animate([{ opacity: 0, translate: "-12px 0" }, { opacity: 1, translate: "0 0" }], { duration: 600, easing: EASE });
  }

  async function openFromIntent(intent) {
    cancelRun();
    const my = ++runId; ctl = new AbortController();
    const mine = ctl;
    setBusy(true, T("Reading your intent…", "Читаю намерение…"));
    let header = null, bp = null, opened = false, built = 0, runError = null;
    const MAX = 10;

    const onObj = o => {
      if (my !== runId || !o || typeof o !== "object") return;
      if (o.type === "space") {
        header = normHeader(o);
        status(header.title ? T(`Space: ${header.title}`, `Пространство: ${header.title}`) : T("Choosing modules…", "Подбираю модули…"));
        return;
      }
      if (o.type === "end") { skelOff(); progressOff(); return }
      if (built >= MAX || !(o.type === "module" || o.kind)) return;
      if (opened && S !== bp) { mine.abort(); return }
      const collabs = (bp && bp.collabs) || (header && header.collabs) || [];
      const m = buildModule(o, collabs);
      if (!m) { console.warn("[live] module rejected", o); return }
      built++;
      const name = St(o.flow, "", 24) || T("Intent", "Основное"), key = flowKey(name);
      if (!opened) {
        bp = { id: "live", live: true, intent, title: (header && header.title) || cap(intent.trim()), collabs, rules: (header && header.rules) || [], flows: [{ name, _k: key, modules: [m] }] };
        opened = true; openSpace(bp);
        $("#intentInput").value = ""; setBusy(false);
        skelOn(0); progress(built);
        return;
      }
      const fi = bp.flows.findIndex(f => f._k === key);
      fi > -1 ? appendModule(m, fi) : appendFlow(name, key, m);
      if (built < MAX) { skelOn(fi > -1 ? fi : S.flows.length - 1); progress(built) } else progressOff();
    };
    /* If the transport has to restart from the stored text, objects already handled are skipped, never duplicated */
    let handled = 0, skip = 0;
    const wrap = o => { if (skip > 0) { skip--; return } handled++; onObj(o) };
    let feed = extractor(wrap);
    const t0 = Date.now(); window.__liveRaw = []; // dev aid: [ms since submit, chunk]
    try {
      await run({
        system: SPACE_SYSTEM, prompt: `Language: ${LANGNAME()}\nNow: ${nowStr()}\nUser's intention: ${intent}`, signal: mine.signal,
        onText: t => { window.__liveRaw.push([Date.now() - t0, t]); feed(t) },
        onReset: full => { skip = handled; feed = extractor(wrap); feed(full) }
      });
    } catch (e) { runError = e }
    console.debug("[live] stream finished", { ms: Date.now() - t0, chars: window.__liveRaw.reduce((n, c) => n + c[1].length, 0), built, opened, runError });
    if (my === runId) { skelOff(); progressOff() }
    if (my !== runId) return;
    if (!opened) {
      setBusy(false);
      if (runError && runError.name === "AbortError") return;
      console.warn("[live] falling back to scripted blueprint", runError);
      showToast(runError && (runError.status === 401 || runError.status === 403) ? T("Replicate rejected the token — showing a prepared Space", "Replicate отклонил ключ — показываю готовое пространство") : T("Model unavailable — showing a prepared Space", "Модель недоступна — показываю готовое пространство"));
      $("#intentInput").value = "";
      openSpace(blueprintFor(intent));
      return;
    }
    if (runError && runError.name !== "AbortError") showToast(T("Generation was cut short", "Генерация прервалась"));
    else if (!runError) showToast(T(`Built live · ${modelName().split("/").pop()} · ${built} modules`, `Собрано вживую · ${modelName().split("/").pop()} · ${built} мод.`));
  }

  /* ───────── A line typed inside a module ───────── */
  const wants = (text, m) => {
    const p = parse(text);
    if (p.verb === "play" || p.verb === "wake") return false;
    if (p.verb === "find" && /sneak|shoe|кросс|кед|обув/i.test(p.noun)) return false;
    return true;
  };
  /* keep=true: rewrite the module in place (same kind, same title, same condition) instead of reinterpreting the line */
  async function transform(m, text, ctx, legacy, keep) {
    const loc = findModule(m.id);
    if (!loc) return legacy();
    const prev = { kind: m.kind, item: m.item, data: m.data, modifier: m.modifier, source: m.source };
    const p = parse(text);
    const snapshot = JSON.stringify({ kind: prev.kind, item: prev.item, data: prev.data }).slice(0, 3500);
    const siblings = allModules().filter(x => x !== m).map(x => `${x.kind}: ${x.item}`).slice(0, 12);
    if (!keep) {
      m.modifier = p.modifier;
      if (!/^(this|it|that|them|это|его|её|их)$/i.test(p.noun)) m.item = cap(p.noun);
    }
    m.kind = "result";
    m.data = { steps: keep ? [T("Reading the current version", "Читаю текущую версию"), T("Rewriting", "Переписываю"), T("Checking it fits the Space", "Сверяю с пространством")] : [T(`Understanding: ${text}`, `Понимаю: ${text}`), T("Working on it", "Работаю над этим"), T("Preparing the result", "Готовлю результат")], done: 1, hold: true };
    refresh(m);
    let obj = null;
    try {
      const txt = await run({
        system: MODULE_SYSTEM, maxTokens: 2500,
        prompt: `Language: ${LANGNAME()}\nNow: ${nowStr()}\nSpace: ${S.title}\nSpace collaborators: ${S.collabs.map(c => c.name).join(", ") || "none"}\nOther modules: ${siblings.join(" | ") || "none"}\nCurrent module (JSON): ${snapshot}\nContext as text: ${ctx.join(" ").slice(0, 800)}\nUser instruction: ${text}`
      });
      extractor(o => { if (!obj && o && typeof o === "object") obj = o })(txt);
    } catch (e) { console.warn("[live] module line failed", e) }
    if (!findModule(m.id)) return;
    const nm = obj && buildModule(obj, S.collabs);
    if (!nm || (keep && nm.kind !== prev.kind)) {
      Object.assign(m, prev);
      refresh(m, false);
      return legacy();
    }
    m.kind = nm.kind; m.data = nm.data; m.item = keep ? prev.item : (nm.item || prev.item);
    if (nm.source && nm.source !== "intent") m.source = nm.source;
    refresh(m); runSteps(m); linkPins();
  }

  /* ───────── Rework a module in place: another version, shorter, more detail, warmer, more formal ───────── */
  const TEXTY = ["compose", "doc", "message", "summary"];
  const REWORKS = () => ({
    again: { label: T("Regenerate this module", "Перегенерировать модуль"), kinds: [...TEXTY, "options", "checklist", "chart", "invite", "calendar", "list", "suggest"],
      ask: "Write a different version of this module: same kind, same topic and constraints, but fresh concrete content. Do not repeat the current wording, names or numbers." },
    shorter: { label: T("Rewrite shorter", "Переписать короче"), kinds: TEXTY,
      ask: "Rewrite this module about half as long. Keep only what matters. Same kind, same facts." },
    longer: { label: T("Rewrite with more detail", "Переписать подробнее"), kinds: TEXTY,
      ask: "Rewrite this module with more concrete detail, about 1.5 times as long. Same kind, same facts, no filler." },
    warmer: { label: T("Rewrite in a warmer tone", "Переписать теплее"), kinds: ["compose", "message", "doc"],
      ask: "Rewrite this module in a warmer, friendlier tone. Same kind, same facts and length." },
    formal: { label: T("Rewrite more formally", "Переписать формальнее"), kinds: ["compose", "message", "doc"],
      ask: "Rewrite this module in a more formal, professional tone. Same kind, same facts and length." }
  });
  const canRework = m => enabled() && !!m && REWORKS().again.kinds.includes(m.kind);
  const reworkItems = m => !enabled() || !m ? [] : Object.entries(REWORKS()).filter(([, r]) => r.kinds.includes(m.kind)).map(([k, r]) => ({ label: r.label, fn: () => rework(m, k) }));
  function rework(m, mode) {
    const r = REWORKS()[mode];
    if (!r || !enabled() || !findModule(m.id)) return;
    transform(m, r.ask, textOf(m), () => showToast(T("Model unavailable — nothing changed", "Модель недоступна — ничего не изменилось")), true);
  }

  /* ───────── Click on a chart bar: the model explains what is behind that value ───────── */
  async function drill(chart, i, mod) {
    const [q, v, disp] = chart.data.bars[i];
    const prev = { kind: mod.kind, item: mod.item, data: mod.data };
    mod.kind = "result";
    mod.data = { steps: [T(`Looking at ${q}`, `Смотрю на «${q}»`), T("Comparing with the other bars", "Сравниваю с остальными столбцами"), T("Writing the breakdown", "Пишу разбор")], done: 1, hold: true };
    refresh(mod);
    let obj = null;
    try {
      const snapshot = JSON.stringify({ item: chart.item, bars: chart.data.bars, caption: chart.data.caption }).slice(0, 1500);
      const txt = await run({
        system: MODULE_SYSTEM, maxTokens: 1500,
        prompt: `Language: ${LANGNAME()}\nSpace: ${S.title}\nReturn ONE "summary" module: "item" = "${q} · breakdown" in the user's language, 3 short points. Explain what is behind the selected bar: the likely drivers, how it compares with the neighbouring bars, and one concrete next step. Do not contradict the chart caption; state nothing as checked data.\nChart (JSON): ${snapshot}\nSelected bar: #${i + 1} "${q}" = ${disp || v}`
      });
      extractor(o => { if (!obj && o && typeof o === "object") obj = o })(txt);
    } catch (e) { console.warn("[live] drill failed", e) }
    if (!findModule(mod.id)) return;
    const nm = obj && buildModule({ ...obj, kind: "summary" }, S.collabs);
    if (nm && nm.kind === "summary") { mod.kind = "summary"; mod.data = nm.data; if (nm.item) mod.item = nm.item }
    else Object.assign(mod, prev);
    refresh(mod);
  }

  /* ───────── "Show on map" in a Space the model built without a map ───────── */
  let makingMap = false;
  async function makeMap(m) {
    if (makingMap) return;
    makingMap = true;
    showToast(T("Building the map…", "Собираю карту…"));
    let txt = "";
    try {
      const snapshot = JSON.stringify({ kind: m.kind, item: m.item, data: m.data }).slice(0, 3500);
      txt = await run({
        system: MODULE_SYSTEM, maxTokens: 1800,
        prompt: `Language: ${LANGNAME()}\nSpace: ${S.title}\nReturn a "map" module that shows the places from the current module: one pin per place, in the same order, each pin named exactly like the place (use the listing's "addr" or the option's name). Use accurate real-world coordinates for the city.\nCurrent module (JSON): ${snapshot}`
      });
      let obj = null; extractor(o => { if (!obj && o && typeof o === "object") obj = o })(txt);
      const nm = obj && buildModule({ ...obj, kind: "map" }, S.collabs);
      if (!nm) throw new Error("no map");
      const maps = S.collabs.find(c => /^(maps|карты)$/i.test(c.name)); if (maps) nm.source = maps.id;
      insertAfter(m, nm); linkPins();
      DO.showmap(m);
    } catch (e) {
      console.warn("[live] map failed", e, txt);
      showToast(T("No map in this Space", "В пространстве нет карты"));
    } finally { makingMap = false }
  }

  /* ───────── Chat replies ───────── */
  async function chatReply(m) {
    const who = (m.data.msgs.find(x => x[0] !== "me") || [m.item])[0] || m.item;
    const history = m.data.msgs.slice(-8).map(([w, t]) => `${w === "me" ? "User" : w}: ${t}`).join("\n");
    try {
      const txt = await run({
        maxTokens: 300,
        system: `You are ${who}, texting with the user inside an app. Context: the user's current Space is "${S.title}". Reply as ${who} with ONE short, natural chat message (max 140 characters) in ${LANGNAME()}. No quotes, no name prefix, no markdown, no explanations.`,
        prompt: `Conversation so far:\n${history}\n\nWrite ${who}'s next message.`
      });
      const out = txt.trim().replace(/^["“«]|["”»]$/g, "").replace(new RegExp("^" + who.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*:\\s*", "i"), "");
      return out.slice(0, 200) || null;
    } catch (e) { console.warn("[live] chat reply failed", e); return null }
  }

  window.Live = { enabled, openFromIntent, transform, wants, chatReply, makeMap, refreshBadge, modelName, rework, reworkItems, canRework, drill };

  /* config.local.js is loaded only on localhost, so the public site never requests it */
  if (isLocal && !forcedOff) {
    const s = document.createElement("script");
    s.src = "/demos/intent-os/config.local.js";
    s.onload = s.onerror = refreshBadge;
    document.head.appendChild(s);
  }
})();
