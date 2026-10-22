import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const params = new URLSearchParams(location.search);
const EN = params.get("lang") === "en";
const tx = (ru, en) => (EN ? en : ru);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 };
const SOFT = { type: "spring", stiffness: 280, damping: 28, mass: 0.85 };

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

function StackCard({ index, progress, kicker, title, note, wash }) {
  const y = useTransform(progress, (p) => {
    const cover = Math.min(1, Math.max(0, p * 3.1 - index));
    return index * 18 - cover * 14;
  });
  const scale = useTransform(progress, (p) => {
    const cover = Math.min(1, Math.max(0, p * 3.1 - index));
    return 1 - cover * 0.07;
  });
  return (
    <motion.article
      className={`ol-glass ol-card ol-wash ${wash ? `ol-wash-${wash}` : ""}`}
      style={{ y, scale, zIndex: index }}
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
    <div className="ol-long" style={{ height: "220vh" }}>
      <div className="ol-pin">
        <div className="ol-stack">
          {cards.map(([kicker, title, note, wash], index) => (
            <StackCard key={kicker} index={index} progress={progress} kicker={kicker} title={title} note={note} wash={wash} />
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
  const x = useSpring(148, { stiffness: 280, damping: 24, mass: 0.7 });
  const y = useSpring(62, { stiffness: 280, damping: 24, mass: 0.7 });
  const drag = (event) => {
    const bounds = event.currentTarget.parentElement.getBoundingClientRect();
    x.set(event.clientX - bounds.left - 70);
    y.set(event.clientY - bounds.top - 70);
  };
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <div className="ol-melt" style={{ filter: "url(#ol-goo)" }}>
          <div className="ol-blob" style={{ left: 70, top: 90 }}>{tx("Свет", "Light")}</div>
          <motion.div
            className="ol-blob dim"
            style={{ x, y }}
            onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
            onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) drag(event); }}
          >
            {tx("Климат", "Climate")}
          </motion.div>
          <svg width="0" height="0" aria-hidden="true">
            <filter id="ol-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </svg>
        </div>
      </div>
    </div>
  );
}

function Passage() {
  const cases = [
    ["yaos", "YaOS", tx("Операционная система намерений", "An operating system of intents"), tx("Дом, город и работа отвечают одной фразой.", "Home, city, and work answer one sentence.")],
    ["halo", "Halo", tx("Рабочая память", "Working memory"), tx("Нить разговора не рвётся между окнами.", "The thread of a conversation stays across windows.")],
    ["city", tx("Москва", "Moscow"), tx("Городские услуги", "City services"), tx("Парковка, запись и пропуск в одном жесте.", "Parking, a visit, and a pass in one gesture.")],
  ];
  const [current, setCurrent] = useState(null);
  const item = cases.find(([id]) => id === current);
  return (
    <div className="ol-fill">
      <div className="ol-center">
        {!item && (
          <div className="ol-list">
            {cases.map(([id, title, line]) => (
              <motion.button key={id} type="button" layoutId={`case-${id}`} className="ol-glass ol-project" onClick={() => setCurrent(id)} transition={SPRING}>
                <span>
                  <b>{title}</b>
                  <span className="ol-muted" style={{ display: "block" }}>{line}</span>
                </span>
                <span aria-hidden="true">→</span>
              </motion.button>
            ))}
          </div>
        )}
        {item && (
          <motion.article layoutId={`case-${item[0]}`} className="ol-glass ol-detail ol-wash" transition={SPRING}>
            <button type="button" className="ol-back" onClick={() => setCurrent(null)}>{tx("‹ Назад", "‹ Back")}</button>
            <span className="ol-kicker">{item[1]}</span>
            <h2>{item[2]}</h2>
            <p className="ol-muted">{item[3]}</p>
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
        <div className="ol-glass ol-phone ol-wash ol-wash-sand">
          <div>
            <span className="ol-kicker">{tx("Москва", "Moscow")}</span>
            <h2 style={{ margin: "8px 0", fontSize: 32, fontWeight: 400 }}>{tx("Двор, место 14", "Courtyard, bay 14")}</h2>
            <p className="ol-muted">{tx("Свободно до восьми вечера.", "Free until eight in the evening.")}</p>
            <button type="button" className="ol-send" style={{ marginTop: 18 }} onClick={() => setOpen(true)}>{tx("Оплатить", "Pay")}</button>
          </div>
          <motion.div
            className="ol-sheet"
            style={{ y }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.y > 70 || info.velocity.y > 500) setOpen(false);
              else animate(y, 0, reduced ? { duration: 0 } : SPRING);
            }}
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
  const [wide, setWide] = useState(true);
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <div className="ol-island-wrap">
          <motion.button
            type="button"
            className="ol-island"
            onClick={() => setWide((value) => !value)}
            animate={{ width: wide ? 320 : 148 }}
            transition={SPRING}
          >
            <i className="ol-dot" aria-hidden="true" />
            {wide && (
              <span>
                <strong>{tx("Домофон", "Doorbell")}</strong>
                <small>{tx("Марина · у двери", "Marina · at the door")}</small>
              </span>
            )}
          </motion.button>
          <p className="ol-muted">{tx("Нажмите остров", "Tap the island")}</p>
        </div>
      </div>
    </div>
  );
}

function Toast() {
  const notes = [
    tx("Кейс сохранён", "Case saved"),
    tx("Свет приглушён", "Lights dimmed"),
    tx("Запись на четверг", "Visit set for Thursday"),
  ];
  const [items, setItems] = useState([notes[0]]);
  const push = () => {
    const next = notes[items.length % notes.length];
    setItems((list) => [...list, `${next} · ${list.length + 1}`].slice(-3));
  };
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <div className="ol-toast-wrap">
          <div className="ol-toasts">
            {items.map((item) => (
              <motion.button
                key={item}
                type="button"
                className="ol-glass ol-toast"
                initial={reduced ? false : { opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={SPRING}
                onClick={() => setItems((list) => list.filter((entry) => entry !== item))}
              >
                <span>{item}</span>
                <span aria-hidden="true">×</span>
              </motion.button>
            ))}
          </div>
          <button type="button" className="ol-send" onClick={push}>{tx("Ещё одно", "Another")}</button>
        </div>
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
                drag.current = index;
                event.currentTarget.setPointerCapture(event.pointerId);
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
  if (char < "0" || char > "9") return <span className="ol-num-gap" />;
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
  const presets = ["1 240 000", "2 480 000", "860 000"];
  const width = Math.max(...presets.map((preset) => preset.length));
  const [value, setValue] = useState(presets[0]);
  const cells = [...value.padStart(width, " ")];
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

function Magnet() {
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.5 });
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.5 });
  return (
    <div className="ol-fill">
      <div className="ol-center">
        <motion.button
          type="button"
          className="ol-magnet"
          style={{ x, y }}
          onPointerMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            const dx = event.clientX - (box.left + box.width / 2);
            const dy = event.clientY - (box.top + box.height / 2);
            x.set(Math.max(-22, Math.min(22, dx * 0.35)));
            y.set(Math.max(-16, Math.min(16, dy * 0.35)));
          }}
          onPointerLeave={() => { x.set(0); y.set(0); }}
        >
          {tx("Написать", "Write")}
        </motion.button>
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
  const rail = useRef(null);
  const x = useMotionValue(0);
  const [bound, setBound] = useState(0);
  useEffect(() => {
    const node = rail.current;
    const parent = node?.parentElement;
    if (!node || !parent) return undefined;
    const measure = () => {
      setBound(-Math.max(0, node.scrollWidth - parent.clientWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="ol-fill">
      <div className="ol-center" style={{ padding: 0 }}>
        <motion.div
          ref={rail}
          className="ol-rail"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: bound, right: 0 }}
          dragElastic={0.12}
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
};
