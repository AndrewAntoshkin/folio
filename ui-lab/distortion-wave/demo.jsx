import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { DistortionWave } from "../vendor/distortion-waves/dist/index.es.js";

const params = new URLSearchParams(location.search);
const num = (key, fallback) => {
  const value = parseFloat(params.get("p." + key));
  return Number.isFinite(value) ? value : fallback;
};
const held = parseFloat(params.get("at"));
const scrub = Number.isFinite(held) ? held : undefined;

const PLANS = [
  { name: "Prudence", cur: "$", amount: "87.50", next: "Next payment will be charged in 25th September", card: "visa", last: "7044" },
  { name: "Momentum", cur: "$", amount: "124.00", next: "Next payment will be charged in 2nd October", card: "mc", last: "3318" },
];

const KEYS = [
  ["l", 92, 26],
  ["l", 140, 46],
  ["l", 194, 46],
  ["r", 164, 74],
];

function fit() {
  const k = Math.min(1, (innerHeight - 24) / 620, (innerWidth - 24) / 300);
  document.documentElement.style.setProperty("--k", Math.max(k, 0.3) + "px");
}
fit();
addEventListener("resize", fit);

function Screen({ plan }) {
  return (
    <div className="screen">
      <div className="nav">
        <span className="back">
          <svg viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 6 8.5 12l6 6" /></svg>
        </span>
        <b>Installment Payments</b>
      </div>
      <div className="plan">
        <h3>{plan.name}</h3>
        <p className="about">The monthly payment is distributed automatically between digital product selected by the automated system.</p>
        <div className="price">
          <span className="cur">{plan.cur}</span>
          <span className="num">{plan.amount}</span>
          <span className="per">/month</span>
        </div>
        <p className="next">{plan.next}</p>
        <div className="pay">
          {plan.card === "visa" ? <span className="visa">VISA</span> : <span className="mc"><i /><i /></span>}
          <span className="dots">•••• {plan.last}</span>
          <span className="slot" />
        </div>
        <div className="edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 4.5 19.5 8.5 8.5 19.5 4 20l.5-4.5L15.5 4.5Z" /><path d="M13 20h7" /></svg>
          Edit Settings
        </div>
      </div>
      <div className="peek">
        <b>Authorized Dealer</b>
        <span>Your purchase is covered for the whole length of the plan.</span>
      </div>
    </div>
  );
}

function App() {
  const [second, setSecond] = useState(false);
  const button = useRef(null);
  const frame = useRef(null);
  const playing = useRef(false);
  const touched = useRef(false);

  useLayoutEffect(() => {
    const place = () => {
      const wave = frame.current?.querySelector(".wave");
      const slot = wave?.querySelector(".slot");
      const b = button.current;
      if (!wave || !slot || !b) return;
      const w = wave.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      b.style.left = s.left - w.left + "px";
      b.style.top = s.top - w.top + "px";
      b.style.width = s.width + "px";
      b.style.height = s.height + "px";
      b.classList.add("ready");
    };
    place();
    const raf = requestAnimationFrame(place);
    const t1 = setTimeout(place, 150);
    const t2 = setTimeout(place, 600);
    addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      removeEventListener("resize", place);
    };
  }, []);

  useEffect(() => {
    let timer = 0;
    let dead = false;
    const arm = (delay) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (dead || !playing.current || touched.current) return;
        setSecond((value) => !value);
        arm(2600);
      }, delay);
    };
    const onMessage = (event) => {
      if (event.data === "lab:play") {
        playing.current = true;
        arm(400);
      }
      if (event.data === "lab:stop") {
        playing.current = false;
        clearTimeout(timer);
      }
    };
    addEventListener("message", onMessage);
    if (params.get("still") !== "1") {
      playing.current = true;
      arm(1200);
    }
    return () => {
      dead = true;
      clearTimeout(timer);
      removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <div className="stage">
      <div className="phone" ref={frame}>
        {KEYS.map(([side, top, h], i) => (
          <i key={i} className={"key " + side} style={{ top: top + "rem", height: h + "rem" }} />
        ))}
        <div className="bezel">
          <DistortionWave
            className="wave"
            type="vertical"
            revealed={scrub == null ? second : scrub > 0}
            source={button}
            palette="colorful"
            scrub={scrub}
            cornerRadius={42}
            waveStyle={{
              amplitude: num("amp", 1),
              travel: num("travel", 0.9),
              orientation: num("lean", 1),
            }}
            revealedContent={<Screen plan={PLANS[1]} />}
            overlay={
              <button
                ref={button}
                className="chg"
                type="button"
                onClick={() => {
                  touched.current = true;
                  setSecond((value) => !value);
                }}
              >
                Show/Change
              </button>
            }
          >
            <Screen plan={PLANS[0]} />
          </DistortionWave>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
