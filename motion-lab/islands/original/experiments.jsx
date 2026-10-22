import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const params = new URLSearchParams(location.search);
const EN = params.get("lang") === "en";
const tx = (ru, en) => (EN ? en : ru);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 };
const SOFT = { type: "spring", stiffness: 280, damping: 28, mass: 0.85 };
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function holdPointer(event) {
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
}

function useBoxSize(ref) {
  const [size, setSize] = useState({ w: 720, h: 520 });
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const read = () => setSize({ w: Math.max(1, node.clientWidth), h: Math.max(1, node.clientHeight) });
    read();
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

function useScrollProgress() {
  const progress = useMotionValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return undefined;
    }
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.set(max <= 1 ? 1 : window.scrollY / max);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [progress]);
  return progress;
}

function StackCard({ index, count, progress, kicker, title, note, wash }) {
  const y = useTransform(progress, (p) => {
    const leave = clamp(p * count - index, 0, 1);
    return index * 28 - leave * 420;
  });
  const scale = useTransform(progress, (p) => {
    const leave = clamp(p * count - index, 0, 1);
    return 1 - index * 0.08 - leave * 0.1;
  });
  const opacity = useTransform(progress, (p) => {
    const leave = clamp(p * count - index, 0, 1);
    return 1 - Math.max(0, leave - 0.55) / 0.45;
  });
  const filter = useTransform(progress, (p) => {
    const leave = clamp(p * count - index, 0, 1);
    return `blur(${(index * 1.7 + leave * 9).toFixed(2)}px)`;
  });
  return (
    <motion.article
      className={`ol-glass ol-card ol-wash ${wash ? `ol-wash-${wash}` : ""}`}
      style={{ y, scale, opacity, filter, zIndex: count - index }}
    >
      <span className="ol-kicker">{kicker}</span>
      <h2>{title}</h2>
      <p className="ol-muted">{note}</p>
    </motion.article>
  );
}

function Stack() {
  const progress = useScrollProgress();
  const cards = [
    ["YaOS", tx("Дом слышит намерение", "The home hears an intent"), tx("Свет, климат и замок без меню.", "Light, climate, and the lock, without a menu."), ""],
    ["Halo", tx("Память держит нить", "Memory keeps the thread"), tx("Контекст остаётся между сессиями.", "Context stays between sessions."), "blue"],
    ["Город", tx("Услуга без очереди", "A service without a queue"), tx("Парковка и запись в одной карточке.", "Parking and a visit on one card."), "sand"],
    ["Портфель", tx("Кейс открывается целиком", "A case opens in full"), tx("От списка к развороту одним жестом.", "From the list to the spread in one gesture."), ""],
  ];
  return (
    <div className="ol-long" style={{ height: "190vh" }}>
      <div className="ol-pin">
        <div className="ol-stack">
          {cards.map(([kicker, title, note, wash], index) => (
            <StackCard key={kicker} index={index} count={cards.length} progress={progress} kicker={kicker} title={title} note={note} wash={wash} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Intent() {
  const ideas = [
    [tx("Приглуши свет", "Dim the lights"), tx("Гостиная погаснет к 22:00.", "The living room fades at 10 pm.")],
    [tx("Климат 21°", "Climate 21°"), tx("Спальня держит 21° до утра.", "The bedroom holds 21° until morning.")],
    [tx("Парковка у дома", "Parking at home"), tx("Место во дворе свободно до 20:00.", "The courtyard spot is free until 8 pm.")],
  ];
  const [text, setText] = useState("");
  const [reply, setReply] = useState(null);
  const send = (value) => {
    const next = (value ?? text).trim();
    if (!next) return;
    const hit = ideas.find(([label]) => label === next);
    setReply(hit ? hit[1] : tx("Я понял. Сделаю это спокойно.", "Understood. I'll do it quietly."));
    setText(next);
  };
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <form
          className="ol-glass ol-intent"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <span className="ol-kicker">YaOS</span>
          <textarea
            className="ol-field"
            value={text}
            placeholder={tx("Что сделать?", "What should happen?")}
            aria-label={tx("Намерение", "Intent")}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="ol-chips">
            {ideas.map(([label]) => (
              <button key={label} type="button" className={text === label ? "ol-chip is-on" : "ol-chip"} onClick={() => send(label)}>
                {label}
              </button>
            ))}
          </div>
          <div className="ol-row">
            <p className="ol-muted">{tx("Намерение вместо меню", "Intent instead of a menu")}</p>
            <button className="ol-send" type="submit">{tx("Сделать", "Do it")}</button>
          </div>
          {reply && (
            <motion.div className="ol-reply" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={SOFT}>
              <strong>{tx("Готово", "Done")}</strong>
              <span>{reply}</span>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}

function GatherLetter({ char, index, center, progress }) {
  const x = useTransform(progress, (p) => (1 - p) * (index - center) * 42);
  return <motion.span style={{ x }}>{char}</motion.span>;
}

function Gather() {
  const word = tx("спокойно", "quietly");
  const chars = [...word];
  const center = (chars.length - 1) / 2;
  const progress = useScrollProgress();
  return (
    <div className="ol-long" style={{ height: "180vh" }}>
      <div className="ol-pin">
        <div>
          <span className="ol-kicker" style={{ textAlign: "center" }}>{tx("Слово", "A word")}</span>
          <div className="ol-word" aria-label={word}>
            {chars.map((char, index) => (
              <GatherLetter key={`${char}-${index}`} char={char} index={index} center={center} progress={progress} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dock() {
  const groups = {
    home: null,
    devices: [
      [tx("Лампа", "Lamp"), tx("Гостиная · 40%", "Living room · 40%"), ""],
      [tx("Климат", "Climate"), tx("Спальня · 21°", "Bedroom · 21°"), "blue"],
      [tx("Замок", "Lock"), tx("Закрыт", "Locked"), "sand"],
    ],
    city: [
      [tx("Парковка", "Parking"), tx("Двор · свободно", "Courtyard · free"), "sand"],
      [tx("Запись", "Visit"), tx("Терапевт · четверг", "Clinic · Thursday"), ""],
    ],
    work: [
      [tx("Halo", "Halo"), tx("Память сессии", "Session memory"), "blue"],
      [tx("Кейсы", "Cases"), tx("Четыре разворота", "Four spreads"), ""],
    ],
  };
  const labels = [
    ["home", tx("Дом", "Home")],
    ["devices", tx("Вещи", "Devices")],
    ["city", tx("Город", "City")],
    ["work", tx("Работа", "Work")],
  ];
  const [open, setOpen] = useState("devices");
  const items = groups[open];
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <div className="ol-dock">
          {items && (
            <motion.div className="ol-glass ol-dock-menu" layout transition={SPRING}>
              {items.map(([title, note, wash]) => (
                <button key={title} type="button" className="ol-dock-item">
                  <span>
                    <b style={{ fontWeight: 500 }}>{title}</b>
                    <span className="ol-muted" style={{ display: "block" }}>{note}</span>
                  </span>
                  <i className={`ol-swatch ${wash}`} aria-hidden="true" />
                </button>
              ))}
            </motion.div>
          )}
          <div className="ol-glass ol-pill" role="tablist">
            {labels.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={open === id}
                className={open === id ? "is-on" : ""}
                onClick={() => setOpen(open === id ? "home" : id)}
                onMouseEnter={() => { if (groups[id]) setOpen(id); }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Melt() {
  const box = useRef(null);
  const dragging = useRef(false);
  const x = useSpring(0, { stiffness: 260, damping: 22, mass: 0.8 });
  const y = useSpring(0, { stiffness: 260, damping: 22, mass: 0.8 });
  useEffect(() => {
    const node = box.current;
    if (!node) return undefined;
    const place = () => {
      if (dragging.current) return;
      x.set(node.clientWidth * 0.48);
      y.set(node.clientHeight * 0.28);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(node);
    return () => observer.disconnect();
  }, [x, y]);
  const drag = (event) => {
    const bounds = box.current.getBoundingClientRect();
    const size = event.currentTarget.getBoundingClientRect().width;
    x.set(event.clientX - bounds.left - size / 2);
    y.set(event.clientY - bounds.top - size / 2);
  };
  return (
    <div className="ol-fill">
      <div className="ol-melt" ref={box}>
        <div className="ol-goo">
          <div className="ol-blob still">{tx("Свет", "Light")}</div>
          <motion.div
            className="ol-blob dim"
            style={{ x, y }}
            onPointerDown={(event) => {
              dragging.current = true;
              holdPointer(event);
            }}
            onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) drag(event); }}
            onPointerUp={() => { dragging.current = false; }}
            onPointerCancel={() => { dragging.current = false; }}
          >
            {tx("Климат", "Climate")}
          </motion.div>
        </div>
        <svg className="ol-goo-svg" aria-hidden="true">
          <filter id="ol-goo" x="-80%" y="-80%" width="260%" height="260%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </svg>
      </div>
    </div>
  );
}

function Passage() {
  const cases = [
    ["yaos", "YaOS", tx("Операционная система намерений", "An operating system of intents"), tx("Дом, город и работа отвечают одной фразой. Без меню.", "Home, city, and work answer one sentence. No menu."), [tx("Свет", "Light"), tx("Климат", "Climate"), tx("Замок", "Lock")]],
    ["halo", "Halo", tx("Рабочая память", "Working memory"), tx("Нить разговора не рвётся между окнами и сессиями.", "The thread stays across windows and sessions."), [tx("Контекст", "Context"), tx("Кейсы", "Cases"), tx("Заметки", "Notes")]],
    ["city", tx("Москва", "Moscow"), tx("Городские услуги", "City services"), tx("Парковка, запись и пропуск собираются в одном жесте.", "Parking, a visit, and a pass gather in one gesture."), [tx("Двор", "Yard"), tx("Поликлиника", "Clinic"), tx("Пропуск", "Pass")]],
  ];
  const root = useRef(null);
  const [view, setView] = useState(null);
  const item = cases.find(([id]) => id === view?.id);
  const measure = (node) => {
    const parent = root.current.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    return {
      x: rect.left - parent.left,
      y: rect.top - parent.top,
      w: rect.width,
      h: rect.height,
      pw: parent.width,
      ph: parent.height,
    };
  };
  const open = (id, event) => {
    const from = measure(event.currentTarget);
    setView({ id, ...from, closing: false });
  };
  const shut = () => setView((current) => (current ? { ...current, closing: true } : current));
  return (
    <div className="ol-fill">
      <div className="ol-pass" ref={root}>
        <div className="ol-list">
          {cases.map(([id, title, line]) => (
            <button key={id} type="button" className={view?.id === id && !view.closing ? "ol-glass ol-project is-quiet" : "ol-glass ol-project"} onClick={(event) => open(id, event)}>
              <span>
                <b>{title}</b>
                <span className="ol-muted" style={{ display: "block" }}>{line}</span>
              </span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
        {view && item && (
          <motion.article
            className="ol-glass ol-spread ol-wash"
            initial={{ left: view.x, top: view.y, width: view.w, height: view.h }}
            animate={view.closing
              ? { left: view.x, top: view.y, width: view.w, height: view.h }
              : { left: 20, top: 20, width: Math.max(view.w, view.pw - 40), height: Math.max(view.h, view.ph - 40) }}
            transition={SPRING}
            onAnimationComplete={() => { if (view.closing) setView(null); }}
          >
            <motion.div
              className="ol-spread-copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: view.closing ? 0 : 1 }}
              transition={{ duration: reduced ? 0 : 0.22, delay: view.closing || reduced ? 0 : 0.12 }}
            >
              <button type="button" className="ol-back" onClick={shut}>{tx("‹ Назад", "‹ Back")}</button>
              <span className="ol-kicker">{item[1]}</span>
              <h2>{item[2]}</h2>
              <p className="ol-muted">{item[3]}</p>
              <div className="ol-facts">
                {item[4].map((fact) => <span key={fact} className="ol-fact">{fact}</span>)}
              </div>
            </motion.div>
          </motion.article>
        )}
      </div>
    </div>
  );
}

function Sheet() {
  const [open, setOpen] = useState(true);
  const y = useMotionValue(0);
  useEffect(() => {
    animate(y, open ? 0 : 360, reduced ? { duration: 0 } : SOFT);
  }, [open, y]);
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <div className="ol-glass ol-phone">
          <svg className="ol-yard" viewBox="0 0 380 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <linearGradient id="ol-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1c2a24" />
                <stop offset="1" stopColor="#101410" />
              </linearGradient>
            </defs>
            <rect width="380" height="640" fill="url(#ol-sky)" />
            <rect x="18" y="168" width="78" height="300" rx="10" fill="rgba(255,255,255,0.07)" />
            <rect x="284" y="140" width="78" height="340" rx="10" fill="rgba(255,255,255,0.07)" />
            <rect x="36" y="196" width="18" height="22" rx="3" fill="rgba(202,232,189,0.35)" />
            <rect x="60" y="196" width="18" height="22" rx="3" fill="rgba(202,232,189,0.2)" />
            <rect x="36" y="232" width="18" height="22" rx="3" fill="rgba(202,232,189,0.2)" />
            <rect x="302" y="176" width="18" height="22" rx="3" fill="rgba(202,232,189,0.28)" />
            <rect x="326" y="176" width="18" height="22" rx="3" fill="rgba(202,232,189,0.16)" />
            <circle cx="70" cy="430" r="28" fill="rgba(202,232,189,0.16)" />
            <circle cx="308" cy="448" r="34" fill="rgba(202,232,189,0.12)" />
            <rect x="118" y="250" width="144" height="168" rx="22" fill="rgba(202,232,189,0.14)" stroke="rgba(202,232,189,0.72)" />
            <rect x="138" y="276" width="46" height="34" rx="8" fill="#cae8bd" />
            <path d="M190 418v78" stroke="rgba(255,255,255,0.28)" strokeWidth="10" strokeLinecap="round" />
            <text x="190" y="310" textAnchor="middle" fill="#142016" fontSize="16" fontFamily="Google Sans, sans-serif">14</text>
          </svg>
          <div className="ol-phone-copy">
            <span className="ol-kicker">{tx("Москва", "Moscow")}</span>
            <h2>{tx("Двор, место 14", "Courtyard, bay 14")}</h2>
            <p className="ol-muted">{tx("Свободно до восьми вечера.", "Free until eight in the evening.")}</p>
            <button type="button" className="ol-send" onClick={() => setOpen(true)}>{tx("Оплатить", "Pay")}</button>
          </div>
          <motion.div
            className="ol-sheet"
            style={{ y }}
            onPointerDown={(event) => {
              if (event.target.closest("button")) return;
              holdPointer(event);
              event.currentTarget.dataset.drag = `${event.pointerId}:${event.clientY}:${y.get()}`;
            }}
            onPointerMove={(event) => {
              const raw = event.currentTarget.dataset.drag;
              if (!raw || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
              const [, start, origin] = raw.split(":");
              y.set(clamp(Number(origin) + event.clientY - Number(start), 0, 460));
            }}
            onPointerUp={(event) => {
              delete event.currentTarget.dataset.drag;
              if (y.get() > 88) setOpen(false);
              else animate(y, open ? 0 : 360, reduced ? { duration: 0 } : SPRING);
            }}
            onPointerCancel={(event) => { delete event.currentTarget.dataset.drag; }}
          >
            <div className="ol-handle" />
            <span className="ol-kicker">{tx("Парковка", "Parking")}</span>
            <h2>{tx("Час во дворе", "An hour in the courtyard")}</h2>
            <div className="ol-amount">120 ₽</div>
            <button type="button" className="ol-send" onClick={() => setOpen(false)}>{tx("Подтвердить", "Confirm")}</button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Island() {
  const states = ["idle", "bell", "live"];
  const [mode, setMode] = useState("bell");
  const shape = {
    idle: { width: 148, height: 44 },
    bell: { width: 336, height: 78 },
    live: { width: 348, height: 168 },
  }[mode];
  const cycle = () => setMode(states[(states.indexOf(mode) + 1) % states.length]);
  return (
    <div className="ol-fill">
      <div className="ol-island-scene">
        <div className="ol-device">
          <div className="ol-status"><span>21:40</span><span>{tx("дома", "home")}</span></div>
          <motion.button
            type="button"
            className={`ol-island is-${mode}`}
            onClick={cycle}
            animate={shape}
            transition={SPRING}
          >
            <i className="ol-dot" aria-hidden="true" />
            {mode === "idle" && <span className="ol-island-idle">21:40</span>}
            {mode === "bell" && (
              <span className="ol-island-copy">
                <strong>{tx("Домофон", "Doorbell")}</strong>
                <small>{tx("Марина · у двери", "Marina · at the door")}</small>
              </span>
            )}
            {mode === "live" && (
              <span className="ol-island-live">
                <strong>{tx("Дверь открыта", "Door is open")}</strong>
                <small>{tx("подъезд 2 · 12 секунд", "entrance 2 · 12 seconds")}</small>
                <i className="ol-livebar" aria-hidden="true" />
                <span className="ol-live-actions">
                  <em>{tx("Закрыть", "Close")}</em>
                  <em>{tx("Свет", "Light")}</em>
                </span>
              </span>
            )}
          </motion.button>
          <div className="ol-glyphs" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <p className="ol-muted">{tx("Нажмите остров", "Tap the island")}</p>
        </div>
        <aside className="ol-glass ol-island-side">
          <span className="ol-kicker">{tx("Живая активность", "Live activity")}</span>
          <h2>{mode === "live" ? tx("Дверь открыта", "Door is open") : mode === "bell" ? tx("Марина у двери", "Marina is at the door") : tx("Дом спокоен", "The home is quiet")}</h2>
          <p className="ol-muted">{mode === "live" ? tx("Замок держит подъезд двенадцать секунд, затем закроется сам.", "The lock holds the entrance for twelve seconds, then shuts itself.") : tx("Остров разворачивается от времени к звонку и к открытой двери.", "The island unfolds from the clock, to the bell, to the open door.")}</p>
          <ol>
            <li><b>21:40</b> {tx("звонок", "ring")}</li>
            <li><b>21:40</b> {tx("свет в прихожей", "hall light")}</li>
            <li><b>21:41</b> {mode === "live" ? tx("открыто", "opened") : tx("ждёт", "waiting")}</li>
          </ol>
        </aside>
      </div>
    </div>
  );
}

function Toast() {
  const seed = [
    [tx("Кейс сохранён", "Case saved"), tx("Halo лежит в портфеле.", "Halo is in the portfolio."), tx("сейчас", "now")],
    [tx("Свет приглушён", "Lights dimmed"), tx("Гостиная держит 40%.", "The living room holds 40%."), tx("1 мин", "1 min")],
    [tx("Запись стоит", "Visit is set"), tx("Терапевт, четверг, 11:20.", "Clinic, Thursday, 11:20."), tx("2 мин", "2 min")],
  ];
  const [items, setItems] = useState(seed);
  const [open, setOpen] = useState(false);
  const push = () => {
    const next = seed[items.length % seed.length];
    setItems((list) => [[`${next[0]}`, next[1], tx("сейчас", "now")], ...list].slice(0, 4));
    setOpen(true);
  };
  return (
    <div className="ol-fill">
      <div className="ol-toast-scene">
        <div className="ol-ghost" aria-hidden="true">
          <span className="ol-kicker">Halo</span>
          <h2>{tx("Память сессии", "Session memory")}</h2>
          <p />
          <p />
          <p />
        </div>
        <div
          className={open ? "ol-toasts is-open" : "ol-toasts"}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={() => setOpen((value) => !value)}
        >
          {items.map((item, index) => (
            <motion.button
              key={`${item[0]}-${index}`}
              type="button"
              className="ol-glass ol-toast"
              initial={reduced ? false : { opacity: 0, y: -18, scale: 0.96 }}
              animate={{
                opacity: open || index === 0 ? 1 : 0.55,
                y: open ? index * 96 : index * 14,
                scale: open ? 1 : 1 - index * 0.06,
              }}
              transition={SPRING}
              style={{ zIndex: 10 - index }}
              onClick={(event) => {
                event.stopPropagation();
                setItems((list) => list.filter((_, itemIndex) => itemIndex !== index));
              }}
            >
              <i className="ol-toast-mark" aria-hidden="true" />
              <span>
                <strong>{item[0]}</strong>
                <small>{item[1]}</small>
              </span>
              <em>{item[2]}</em>
            </motion.button>
          ))}
        </div>
        <button type="button" className="ol-send" onClick={push}>{tx("Ещё одно", "Another")}</button>
      </div>
    </div>
  );
}

function Command() {
  const commands = [
    [tx("Открыть YaOS", "Open YaOS"), "Y"],
    [tx("Новый кейс", "New case"), "N"],
    [tx("Парковка у дома", "Parking at home"), "P"],
    [tx("Баланс портфеля", "Portfolio balance"), "B"],
    [tx("Запись к терапевту", "Book a clinic visit"), "C"],
  ];
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState("");
  const list = commands.filter(([label]) => label.toLowerCase().includes(query.toLowerCase()));
  const run = (label) => setDone(label);
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <div className="ol-glass ol-command" role="listbox">
          <input
            value={query}
            placeholder={tx("Команда", "Command")}
            aria-label={tx("Команда", "Command")}
            onChange={(event) => { setQuery(event.target.value); setIndex(0); setDone(""); }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") { event.preventDefault(); setIndex((value) => Math.min(list.length - 1, value + 1)); }
              if (event.key === "ArrowUp") { event.preventDefault(); setIndex((value) => Math.max(0, value - 1)); }
              if (event.key === "Enter" && list[index]) run(list[index][0]);
            }}
          />
          {list.map(([label, key], item) => (
            <button key={label} type="button" className={item === index ? "ol-cmd is-on" : "ol-cmd"} onMouseEnter={() => setIndex(item)} onClick={() => run(label)}>
              <span>{label}</span>
              <kbd>{key}</kbd>
            </button>
          ))}
          {done && <p className="ol-muted" style={{ padding: "8px 14px 12px" }}>{tx("Открываю", "Opening")} · {done}</p>}
        </div>
      </div>
    </div>
  );
}

function Order() {
  const seed = [
    [tx("YaOS", "YaOS"), tx("Дом", "Home")],
    [tx("Halo", "Halo"), tx("Память", "Memory")],
    [tx("Город", "City"), tx("Услуги", "Services")],
    [tx("Фонд", "Fund"), tx("Долгий", "Long")],
  ];
  const [rows, setRows] = useState(seed);
  const drag = useRef(null);
  const move = (index, target) => {
    if (target < 0 || target >= rows.length || target === index) return;
    const next = rows.slice();
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    setRows(next);
    drag.current = target;
  };
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <div className="ol-order">
          {rows.map(([title, note], index) => (
            <motion.div
              key={title}
              layout
              transition={SPRING}
              className="ol-glass ol-hold"
              onPointerDown={(event) => {
                holdPointer(event);
                drag.current = index;
              }}
              onPointerMove={(event) => {
                const from = drag.current;
                if (from == null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
                const nodes = [...event.currentTarget.parentElement.children];
                let nearest = from;
                let best = Infinity;
                nodes.forEach((node, item) => {
                  const box = node.getBoundingClientRect();
                  const dist = Math.abs(event.clientY - (box.top + box.height / 2));
                  if (dist < best) {
                    best = dist;
                    nearest = item;
                  }
                });
                if (nearest !== from) move(from, nearest);
              }}
              onPointerUp={() => { drag.current = null; }}
            >
              <span>
                <b>{title}</b>
                <span className="ol-muted" style={{ display: "block" }}>{note}</span>
              </span>
              <span className="ol-grip" aria-hidden="true">⋮⋮</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function YieldCell({ char }) {
  if (char === "\u202f" || char === " ") return <span className="ol-num-gap" />;
  const n = Number(char);
  return (
    <span className="ol-digit">
      <motion.span className="ol-reel" initial={false} animate={{ y: `${-n}em` }} transition={reduced ? { duration: 0 } : SPRING}>
        {"0123456789".split("").map((digit) => <i key={digit}>{digit}</i>)}
      </motion.span>
    </span>
  );
}

function Yield() {
  const presets = ["1\u202f240\u202f000", "2\u202f480\u202f000", "860\u202f000"];
  const [value, setValue] = useState(presets[0]);
  const cells = [...value];
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <div className="ol-yield">
          <span className="ol-kicker">{tx("Портфель", "Portfolio")}</span>
          <div className="ol-figure" aria-label={`${value} ₽`}>
            {cells.map((char, index) => <YieldCell key={index} char={char} />)}
            <span className="ol-currency">₽</span>
          </div>
          <div className="ol-presets">
            {presets.map((preset) => (
              <button key={preset} type="button" className={preset === value ? "ol-chip is-on" : "ol-chip"} onClick={() => setValue(preset)}>
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Glass() {
  const rx = useSpring(0, { stiffness: 180, damping: 18 });
  const ry = useSpring(0, { stiffness: 180, damping: 18 });
  const move = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    event.currentTarget.style.setProperty("--sx", `${px * 100}%`);
    event.currentTarget.style.setProperty("--sy", `${py * 100}%`);
    ry.set((px - 0.5) * 14);
    rx.set((0.5 - py) * 12);
  };
  return (
    <div className="ol-fill">
      <div className="ol-center ol-stage-3d">
        <motion.article
          className="ol-glass ol-glass-card ol-wash"
          style={{ rotateX: rx, rotateY: ry }}
          onPointerMove={move}
          onPointerLeave={(event) => {
            rx.set(0);
            ry.set(0);
            event.currentTarget.style.setProperty("--sx", "50%");
            event.currentTarget.style.setProperty("--sy", "20%");
          }}
        >
          <div className="ol-sheen" />
          <span className="ol-kicker">YaOS</span>
          <h2>{tx("Стекло держит свет", "Glass holds the light")}</h2>
        </motion.article>
      </div>
    </div>
  );
}

function Spotlight() {
  const line = tx("Намерение вместо меню", "Intent instead of a menu");
  const move = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--x", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--y", `${event.clientY - box.top}px`);
  };
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <div className="ol-spot" onPointerMove={move}>
          <p className="base">{line}</p>
          <p className="lit">{line}</p>
        </div>
      </div>
    </div>
  );
}

function Rise() {
  const progress = useScrollProgress();
  const rotateX = useTransform(progress, (p) => (1 - p) * 28);
  const y = useTransform(progress, (p) => (1 - p) * 56);
  return (
    <div className="ol-long" style={{ height: "200vh" }}>
      <div className="ol-pin ol-stage-3d">
        <motion.h2 className="ol-rise" style={{ rotateX, y }}>
          {tx("Город отвечает спокойно", "The city answers quietly")}
        </motion.h2>
      </div>
    </div>
  );
}

function MagnetBit({ label, hx, hy, px, py, primary }) {
  const homeX = useMotionValue(hx);
  const homeY = useMotionValue(hy);
  useEffect(() => {
    homeX.set(hx);
    homeY.set(hy);
  }, [hx, hy, homeX, homeY]);
  const x = useTransform([px, py, homeX, homeY], ([cx, cy, ox, oy]) => {
    const dx = cx - ox;
    const dy = cy - oy;
    const dist = Math.hypot(dx, dy) || 1;
    const reach = Math.max(0, 1 - dist / 360);
    return (dx / dist) * reach * 72;
  });
  const y = useTransform([px, py, homeX, homeY], ([cx, cy, ox, oy]) => {
    const dx = cx - ox;
    const dy = cy - oy;
    const dist = Math.hypot(dx, dy) || 1;
    const reach = Math.max(0, 1 - dist / 360);
    return (dy / dist) * reach * 56;
  });
  return (
    <motion.button type="button" className={primary ? "ol-magnet is-primary" : "ol-magnet"} style={{ x, y, left: `calc(50% + ${hx}px)`, top: `calc(50% + ${hy}px)`, translateX: "-50%", translateY: "-50%" }}>
      {label}
    </motion.button>
  );
}

function Magnet() {
  const field = useRef(null);
  const size = useBoxSize(field);
  const px = useMotionValue(0);
  const py = useMotionValue(9999);
  const bits = [
    [tx("Написать", "Write"), 0, 0, true],
    [tx("Кейс", "Case"), -0.32, -0.26, false],
    [tx("Город", "City"), 0.34, -0.22, false],
    [tx("Портфель", "Portfolio"), -0.3, 0.28, false],
    [tx("Дом", "Home"), 0.32, 0.3, false],
  ];
  const move = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    px.set(event.clientX - (box.left + box.width / 2));
    py.set(event.clientY - (box.top + box.height / 2));
  };
  return (
    <div className="ol-fill" onPointerMove={move} onPointerLeave={() => { px.set(0); py.set(9999); }}>
      <div className="ol-magnet-field" ref={field}>
        {bits.map(([label, fx, fy, primary]) => (
          <MagnetBit key={label} label={label} hx={fx * size.w} hy={fy * size.h} px={px} py={py} primary={primary} />
        ))}
      </div>
    </div>
  );
}

function Tickets() {
  const cards = [
    [tx("Парковка", "Parking"), tx("Двор · место 14", "Courtyard · bay 14"), tx("до 20:00", "until 8 pm"), ""],
    [tx("Запись", "Visit"), tx("Терапевт", "Clinic"), tx("четверг, 11:20", "Thursday, 11:20"), "blue"],
    [tx("Пропуск", "Pass"), tx("Подъезд 2", "Entrance 2"), tx("сегодня", "today"), "sand"],
    [tx("Свет", "Light"), tx("Гостиная", "Living room"), tx("40%", "40%"), ""],
  ];
  const stage = useRef(null);
  const rail = useRef(null);
  const x = useMotionValue(0);
  const drag = useRef(null);
  const limit = useRef(0);
  useEffect(() => {
    const measure = () => {
      const node = rail.current;
      const parent = stage.current;
      if (!node || !parent) return;
      limit.current = Math.max(0, node.scrollWidth - parent.clientWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (rail.current) observer.observe(rail.current);
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="ol-fill">
      <div className="ol-ticket-stage" ref={stage}>
        <motion.div
          ref={rail}
          className="ol-rail"
          style={{ x }}
          onPointerDown={(event) => {
            holdPointer(event);
            drag.current = { id: event.pointerId, start: event.clientX, origin: x.get() };
          }}
          onPointerMove={(event) => {
            const active = drag.current;
            if (!active || active.id !== event.pointerId) return;
            const next = clamp(active.origin + event.clientX - active.start, -limit.current, 0);
            x.set(next);
          }}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
        >
          {cards.map(([kicker, title, when, wash]) => (
            <article key={title} className={`ol-glass ol-ticket ol-wash ${wash ? `ol-wash-${wash}` : ""}`}>
              <span className="ol-kicker">{kicker}</span>
              <div>
                <h2>{title}</h2>
                <span>{when}</span>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function FieldBit({ label, hx, hy, px, py }) {
  const homeX = useMotionValue(hx);
  const homeY = useMotionValue(hy);
  useEffect(() => {
    homeX.set(hx);
    homeY.set(hy);
  }, [hx, hy, homeX, homeY]);
  const x = useTransform([px, py, homeX, homeY], ([cx, cy, ox, oy]) => {
    const dx = ox - cx;
    const dy = oy - cy;
    const dist = Math.hypot(cx - ox, cy - oy);
    const push = Math.max(0, 260 - dist) / 260 * 120;
    const len = Math.hypot(dx, dy) || 1;
    return (dx / len) * push;
  });
  const y = useTransform([px, py, homeX, homeY], ([cx, cy, ox, oy]) => {
    const dx = ox - cx;
    const dy = oy - cy;
    const dist = Math.hypot(cx - ox, cy - oy);
    const push = Math.max(0, 260 - dist) / 260 * 96;
    const len = Math.hypot(dx, dy) || 1;
    return (dy / len) * push;
  });
  return (
    <motion.span className="ol-field-bit" style={{ x, y, left: `calc(50% + ${hx}px)`, top: `calc(50% + ${hy}px)`, translateX: "-50%", translateY: "-50%" }}>{label}</motion.span>
  );
}

function Field() {
  const scene = useRef(null);
  const size = useBoxSize(scene);
  const px = useMotionValue(9999);
  const py = useMotionValue(9999);
  const bits = [
    [tx("Лампа", "Lamp"), -0.36, -0.18],
    [tx("Замок", "Lock"), -0.14, -0.3],
    [tx("Парковка", "Parking"), 0.16, -0.26],
    [tx("Запись", "Visit"), 0.38, -0.06],
    ["Halo", -0.34, 0.2],
    [tx("Фонд", "Fund"), 0.02, 0.3],
    [tx("Климат", "Climate"), 0.34, 0.22],
  ];
  const move = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    px.set(event.clientX - (box.left + box.width / 2));
    py.set(event.clientY - (box.top + box.height / 2));
  };
  return (
    <div className="ol-fill" onPointerMove={move} onPointerLeave={() => { px.set(9999); py.set(9999); }}>
      <div className="ol-field-scene" ref={scene}>
        <div className="ol-field-core">
          <span className="ol-kicker">YaOS</span>
          <h2>{tx("Поле дома", "The field of the home")}</h2>
          <p className="ol-muted">{tx("Чипы отступают от руки.", "The chips spring away from the hand.")}</p>
        </div>
        {bits.map(([label, fx, fy]) => (
          <FieldBit key={label} label={label} hx={fx * size.w} hy={fy * size.h} px={px} py={py} />
        ))}
      </div>
    </div>
  );
}

export const Pieces = {
  stack: Stack,
  intent: Intent,
  gather: Gather,
  dock: Dock,
  melt: Melt,
  passage: Passage,
  sheet: Sheet,
  island: Island,
  toast: Toast,
  command: Command,
  order: Order,
  yield: Yield,
  glass: Glass,
  spotlight: Spotlight,
  rise: Rise,
  magnet: Magnet,
  tickets: Tickets,
  field: Field,
};
