/** Shared springs, digit reels, and stage math. See DESIGN.md. */

export const STAGE = { w: 392, h: 640 };

export const SPRING = {
  soft: { stiffness: 170, damping: 22, mass: 1 },
  snappy: { stiffness: 320, damping: 28, mass: 1 },
  gentle: { stiffness: 120, damping: 20, mass: 1 },
  sheet: { stiffness: 210, damping: 30, mass: 1 },
  pop: { stiffness: 420, damping: 26, mass: 0.9 },
  digit: { stiffness: 280, damping: 19, mass: 1 },
};

export const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function pick(lang, ru, en) {
  return lang === "en" ? en : ru;
}

export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function spring() {
  return { x: 0, v: 0 };
}

/** Step a spring toward target. Snaps when the reader asked for less motion. */
export function springStep(s, target, dt, cfg, snap) {
  if (snap || reduced) {
    s.x = target;
    s.v = 0;
    return s.x;
  }
  const accel = (-cfg.stiffness * (s.x - target) - cfg.damping * s.v) / cfg.mass;
  s.v += accel * dt;
  s.x += s.v * dt;
  if (Math.abs(s.v) < 0.015 && Math.abs(s.x - target) < 0.015) {
    s.x = target;
    s.v = 0;
  }
  return s.x;
}

export function snapSpring(s, value) {
  s.x = value;
  s.v = 0;
}

export function easeInOut(t) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;
}

export function quad(p0, p1, p2, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

export function stagePoint(stage, event) {
  const rect = stage.getBoundingClientRect();
  const sx = STAGE.w / rect.width;
  const sy = STAGE.h / rect.height;
  return {
    x: (event.clientX - rect.left) * sx,
    y: (event.clientY - rect.top) * sy,
  };
}

export function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}

export function injectStyle(id, css) {
  const sid = `lab-style-${id}`;
  if (document.getElementById(sid)) return;
  const node = document.createElement("style");
  node.id = sid;
  node.textContent = css;
  document.head.appendChild(node);
}

/**
 * Fixed-width digit reels. Leading places fade out; the ones place never shifts.
 * The strip is padded so a small spring overshoot still shows a digit.
 */
export function createDigits(host, { size = 64, places = 5 } = {}) {
  host.classList.add("digits");
  host.style.setProperty("--dig", `${size}px`);
  host.setAttribute("aria-hidden", "true");
  const columns = [];
  let sep = null;
  for (let i = 0; i < places; i += 1) {
    if (i > 0 && (places - i) % 3 === 0) {
      sep = el("span", "digits-sep", "\u2009");
      host.append(sep);
    }
    const col = el("span", "digits-col");
    const strip = el("span", "digits-strip");
    ["9", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].forEach((d) => {
      strip.append(el("span", "", d));
    });
    col.append(strip);
    host.append(col);
    columns.push({
      col,
      strip,
      pos: spring(),
      fade: spring(),
      digit: 0,
      live: i >= places - 1,
    });
  }
  if (sep) sep.dataset.sep = "1";

  let target = 0;

  function layout(value, jump) {
    target = Math.max(0, Math.min(10 ** places - 1, Math.round(value)));
    const body = String(target).padStart(places, " ");
    let higher = false;
    columns.forEach((col, i) => {
      const ch = body[i];
      const live = ch !== " ";
      col.live = live;
      if (live) {
        col.digit = Number(ch);
        higher = true;
      }
      if (jump) {
        snapSpring(col.pos, col.digit);
        snapSpring(col.fade, live ? 1 : 0);
      }
    });
    const sepNode = host.querySelector(".digits-sep");
    if (sepNode) {
      const group = columns.slice(0, places - 3).some((col) => col.live);
      sepNode.style.opacity = group ? "1" : "0";
    }
    return higher;
  }

  return {
    set(value) {
      layout(value, false);
    },
    jump(value) {
      layout(value, true);
    },
    tick(dt, snap) {
      columns.forEach((col) => {
        springStep(col.pos, col.digit, dt, SPRING.digit, snap);
        springStep(col.fade, col.live ? 1 : 0, dt, SPRING.snappy, snap);
        const index = col.pos.x + 1;
        col.strip.style.transform = `translate3d(0, ${-index * size}px, 0)`;
        col.col.style.opacity = String(clamp(col.fade.x, 0, 1));
      });
    },
    get value() {
      return target;
    },
  };
}
