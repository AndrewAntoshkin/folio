import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ImageGeneration } from "../vendor/img-fx/dist/index.es.js";

const IMAGES = [
  "/ui-lab/img/cover-agents-gently.jpg",
  "/ui-lab/img/cover-quiet-interfaces.jpg",
  "/ui-lab/img/cover-spring-cheatsheet.jpg",
  "/ui-lab/img/cover-tokens-at-scale.jpg",
  "/ui-lab/img/cover-type-on-screens.jpg",
];

const VARIANTS = [
  { preset: "pixels-organic", label: "Organic", delay: [1.6, 2.6] },
  { preset: "pixels-mechanic", label: "Mechanic", delay: [2.4, 3.6] },
  { preset: "sweep-gradient", label: "Sweep", delay: [3.2, 4.4] },
];

const still = new URLSearchParams(location.search).get("still") === "1";

function Tile({ preset, label, delay, paused }) {
  const ref = useRef(null);
  const onClick = () => {
    const h = ref.current;
    if (!h) return;
    if (h.isImageActive()) h.triggerRegenerate({ durationMs: 2200 });
    else h.triggerReveal();
  };
  return (
    <figure className="tile">
      <button className="hit" onClick={onClick} aria-label={label + ": generate an image"}>
        <ImageGeneration
          ref={ref}
          preset={preset}
          theme="dark"
          images={IMAGES}
          autoReveal
          revealDelayRange={delay}
          revealHoldMs={2600}
          paused={paused}
        >
          <div className="face" />
        </ImageGeneration>
      </button>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function App() {
  const [paused, setPaused] = useState(still);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data === "lab:play") setPaused(false);
      if (event.data === "lab:stop") setPaused(true);
    };
    const wake = () => setPaused(false);
    addEventListener("message", onMessage);
    addEventListener("pointerdown", wake, { once: true });
    return () => removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="stage">
      <div className="col">
        {VARIANTS.map((v) => (
          <Tile key={v.preset} {...v} paused={paused} />
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
