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
  { preset: "pixels-organic", label: "Organic" },
  { preset: "pixels-mechanic", label: "Mechanic" },
  { preset: "sweep-gradient", label: "Sweep" },
];

const still = new URLSearchParams(location.search).get("still") === "1";

function App() {
  const [paused, setPaused] = useState(still);
  const [preset, setPreset] = useState(VARIANTS[0].preset);
  const ref = useRef(null);

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

  const onTile = () => {
    const h = ref.current;
    if (!h) return;
    if (h.isImageActive()) h.triggerRegenerate({ durationMs: 2200 });
    else h.triggerReveal();
  };

  return (
    <div className="stage">
      <div className="col">
        <button className="hit" onClick={onTile} aria-label="Generate an image">
          <ImageGeneration
            key={preset}
            ref={ref}
            preset={preset}
            theme="dark"
            images={IMAGES}
            autoReveal
            revealDelayRange={[1.2, 2.2]}
            revealHoldMs={3000}
            paused={paused}
          >
            <div className="face" />
          </ImageGeneration>
        </button>
        <div className="pills" role="tablist" aria-label="Loader style">
          {VARIANTS.map((v) => (
            <button
              key={v.preset}
              role="tab"
              aria-selected={preset === v.preset}
              className={"pill" + (preset === v.preset ? " on" : "")}
              onClick={() => setPreset(v.preset)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
