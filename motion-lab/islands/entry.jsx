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
const autoplay = params.get("autoplay") === "1" && SCROLL.has(id);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const Comp = COMPONENTS[id];

document.body.classList.add("theme-light");

function maxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function setScroll(y) {
  const next = Math.max(0, Math.min(y, maxScroll()));
  if (window.__lenis) window.__lenis.scrollTo(next, { immediate: true });
  else window.scrollTo(0, next);
  return next;
}

let paused = false;
let raf = 0;
let y = 0;
let dir = 1;

function tick() {
  raf = 0;
  if (!autoplay || reduced || paused) return;
  const max = maxScroll();
  if (max > 8) {
    const speed = Math.max(1.4, max / 420);
    y += dir * speed;
    if (y >= max) {
      y = max;
      dir = -1;
    } else if (y <= 0) {
      y = 0;
      dir = 1;
    }
    y = setScroll(y);
  }
  raf = requestAnimationFrame(tick);
}

function start() {
  if (raf || !autoplay || reduced) return;
  raf = requestAnimationFrame(tick);
}

window.__preview = {
  seek(p) {
    paused = true;
    cancelAnimationFrame(raf);
    raf = 0;
    y = setScroll(Math.max(0, Math.min(1, Number(p) || 0)) * maxScroll());
  },
  play() {
    paused = false;
    start();
  },
  pause() {
    paused = true;
  },
};

window.addEventListener("message", (event) => {
  if (event.origin !== location.origin || !event.data) return;
  if (event.data.type === "seek") window.__preview.seek(event.data.p);
  if (event.data.type === "play") window.__preview.play();
  if (event.data.type === "pause") window.__preview.pause();
  if (event.data.type === "replay") location.reload();
});

window.addEventListener("wheel", () => window.__preview.pause(), { passive: true });
window.addEventListener("pointerdown", () => {
  if (SCROLL.has(id)) window.__preview.pause();
});

function Preview() {
  useEffect(() => {
    if (!SCROLL.has(id) || reduced) return undefined;
    const lenis = new Lenis({ autoRaf: true });
    window.__lenis = lenis;
    const kick = window.setTimeout(start, 700);
    return () => {
      window.clearTimeout(kick);
      cancelAnimationFrame(raf);
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
