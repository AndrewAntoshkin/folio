import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import { Pieces } from "./original/experiments.jsx";

const params = new URLSearchParams(location.search);
const id = params.get("id") || "";
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.lang = params.get("lang") === "en" ? "en" : "ru";
const Comp = Pieces[id];

if (params.get("bar") === "0") document.documentElement.classList.add("tile-view");

function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

window.__preview = {
  seek(p) {
    const next = Math.max(0, Math.min(1, Number(p) || 0)) * maxScroll();
    window.scrollTo(0, next);
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
});

function Preview() {
  useEffect(() => {
    const hero = Number(params.get("hero"));
    if (!(hero > 0)) return undefined;
    let tries = 0;
    let timer = 0;
    const kick = () => {
      window.__preview.seek(hero);
      tries += 1;
      if (tries < 8) timer = window.setTimeout(kick, 90);
    };
    timer = window.setTimeout(kick, 40);
    return () => window.clearTimeout(timer);
  }, []);

  if (!Comp) return null;
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      <Comp />
    </MotionConfig>
  );
}

createRoot(document.getElementById("root")).render(<Preview />);
