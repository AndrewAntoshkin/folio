import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { DistortionWave } from "../vendor/distortion-waves/dist/index.es.js";

const params = new URLSearchParams(location.search);
const num = (key, fallback) => {
  const value = parseFloat(params.get("p." + key));
  return Number.isFinite(value) ? value : fallback;
};
const held = parseFloat(params.get("at"));
const scrub = Number.isFinite(held) ? held : undefined;

function Screen({ sent }) {
  return (
    <div className={"screen" + (sent ? " sent" : "")}>
      <p className="kicker">{sent ? "Receipt" : "Review"}</p>
      <h2>{sent ? "Sent" : "Send"}</h2>
      <p className="amount">$128.00</p>
      <div className="who">
        <strong>Maya Chen</strong>
        <span>{sent ? "Arrived just now" : "Today · Design"}</span>
      </div>
    </div>
  );
}

function App() {
  const [sent, setSent] = useState(false);
  const button = useRef(null);
  const playing = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    let timer = 0;
    let dead = false;
    const arm = (delay) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (dead || !playing.current || touched.current) return;
        setSent((value) => !value);
        arm(2400);
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
      arm(800);
    }
    return () => {
      dead = true;
      clearTimeout(timer);
      removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <div className="stage">
      <DistortionWave
        className="wave"
        type="vertical"
        revealed={scrub == null ? sent : scrub > 0}
        source={button}
        palette="colorful"
        scrub={scrub}
        waveStyle={{
          amplitude: num("amp", 1),
          travel: num("travel", 0.9),
          orientation: num("lean", 1),
        }}
        revealedContent={<Screen sent />}
        overlay={
          <button
            ref={button}
            className={sent ? "go sent" : "go"}
            type="button"
            onClick={() => {
              touched.current = true;
              setSent((value) => !value);
            }}
          >
            {sent ? "Undo" : "Confirm"}
          </button>
        }
      >
        <Screen />
      </DistortionWave>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
