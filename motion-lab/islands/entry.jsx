import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import { Skiper4 } from "./components/skiper4.tsx";
import { Skiper16 } from "./components/skiper16.tsx";
import { Skiper19 } from "./components/skiper19.tsx";
import { Skiper28 } from "./components/skiper28.tsx";
import { Skiper30 } from "./components/skiper30.tsx";
import { Skiper31 } from "./components/skiper31.tsx";
import { Skiper34 } from "./components/skiper34.tsx";
import { Skiper39 } from "./components/skiper39.tsx";
import { Skiper47 } from "./components/skiper47.tsx";
import { Skiper52 } from "./components/skiper52.tsx";
import { Skiper61 } from "./components/skiper61.tsx";
import { Skiper64 } from "./components/skiper64.tsx";
import {
  ChamaacArrow,
  ChamaacCards,
  ChamaacDock,
  ChamaacFocus,
  ChamaacGlow,
  ChamaacInput,
  ChamaacLetters,
  ChamaacLoop,
  ChamaacNeo,
  ChamaacPremium,
  ChamaacShimmer,
  ChamaacSlide,
  ChamaacSteps,
} from "./components/chamaac/stage.jsx";

const COMPONENTS = {
  skiper4: Skiper4,
  skiper16: Skiper16,
  skiper19: Skiper19,
  skiper28: Skiper28,
  skiper30: Skiper30,
  skiper31: Skiper31,
  skiper34: Skiper34,
  skiper39: Skiper39,
  skiper47: Skiper47,
  skiper52: Skiper52,
  skiper61: Skiper61,
  skiper64: Skiper64,
  "chamaac-input": ChamaacInput,
  "chamaac-arrow": ChamaacArrow,
  "chamaac-shimmer": ChamaacShimmer,
  "chamaac-slide": ChamaacSlide,
  "chamaac-focus": ChamaacFocus,
  "chamaac-glow": ChamaacGlow,
  "chamaac-neo": ChamaacNeo,
  "chamaac-premium": ChamaacPremium,
  "chamaac-dock": ChamaacDock,
  "chamaac-cards": ChamaacCards,
  "chamaac-letters": ChamaacLetters,
  "chamaac-loop": ChamaacLoop,
  "chamaac-steps": ChamaacSteps,
};

const SCROLL = new Set([
  "skiper16",
  "skiper19",
  "skiper28",
  "skiper30",
  "skiper31",
  "skiper34",
]);

const params = new URLSearchParams(location.search);
const id = params.get("id") || "";
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const Comp = COMPONENTS[id];

document.body.classList.add("theme-light");
if (params.get("bar") === "0") document.documentElement.classList.add("tile-view");

function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function setScroll(y) {
  const next = Math.max(0, Math.min(y, maxScroll()));
  if (window.__lenis) window.__lenis.scrollTo(next, { immediate: true });
  else window.scrollTo(0, next);
  return next;
}

window.__preview = {
  seek(p) {
    setScroll(Math.max(0, Math.min(1, Number(p) || 0)) * maxScroll());
  },
  play() {},
  pause() {},
};

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || window.parent === window) return;
  window.parent.postMessage({ type: "close" }, location.origin);
});

window.addEventListener("message", (event) => {
  if (event.origin !== location.origin || !event.data) return;
  if (event.data.type === "seek") window.__preview.seek(event.data.p);
  if (event.data.type === "play") window.__preview.play();
  if (event.data.type === "pause") window.__preview.pause();
  if (event.data.type === "replay") location.reload();
});

function Preview() {
  useEffect(() => {
    if (!SCROLL.has(id) || reduced) return undefined;
    const lenis = new Lenis({ autoRaf: true });
    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  if (!Comp) {
    return null;
  }
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      <Comp />
    </MotionConfig>
  );
}

createRoot(document.getElementById("root")).render(<Preview />);
