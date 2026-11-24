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

const COACH = { name: "Cruecial", role: "Super Smash Bros. Coach", pic: "/ui-lab/img/avatars/a4.jpg" };

function fit() {
  const k = Math.min(1, (innerHeight - 24) / 367, (innerWidth - 24) / 300);
  document.documentElement.style.setProperty("--k", Math.max(k, 0.3) + "px");
}
fit();
addEventListener("resize", fit);

function Card({ paid }) {
  return (
    <div className="card">
      <div className="who">
        <img className="pic" src={COACH.pic} alt="" draggable="false" />
        <div>
          <b>{COACH.name}</b>
          <span>{COACH.role}</span>
        </div>
      </div>
      <div className="rule" />
      <div className="sub">
        <i>{paid ? "Total" : "Subtotal"}</i>
        {paid ? <em className="ok">Paid</em> : <em>6 matches</em>}
      </div>
      <div className="price">
        <span className="now">$216</span>
        {paid ? <span className="via">Visa •••• 7044</span> : <span className="was">$240</span>}
      </div>
      <div className="tags">
        <span className="tag">{paid ? "Receipt sent to your email" : "10% discount applied"}</span>
        <span className="info">i</span>
      </div>
      <div className="slot" />
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
      const wave = frame.current;
      const slot = wave?.querySelector(".slot");
      const b = button.current;
      if (!wave || !slot || !b) return;
      const w = wave.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      b.style.left = s.left - w.left + "px";
      b.style.top = s.top - w.top + "px";
      b.style.width = s.width + "px";
      b.style.height = s.height + "px";
      b.style.opacity = "1";
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
      <div className="deal" ref={frame}>
        <DistortionWave
          type="vertical"
          revealed={scrub == null ? second : scrub > 0}
          source={button}
          palette="colorful"
          scrub={scrub}
          cornerRadius={26}
          waveStyle={{
            amplitude: num("amp", 1),
            travel: num("travel", 0.9),
            orientation: num("lean", 1),
          }}
          style={{ width: "100%", height: "100%" }}
          revealedContent={<Card paid />}
          overlay={
            <button
              ref={button}
              className={second ? "pay done" : "pay"}
              type="button"
              onClick={() => {
                touched.current = true;
                setSecond((value) => !value);
              }}
            >
              {second ? "Undo payment" : "Proceed to Payment"}
            </button>
          }
        >
          <Card />
        </DistortionWave>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
