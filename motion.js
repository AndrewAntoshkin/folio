(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Dock: sliding circular backdrop with liquid stretch */
  const nav = document.querySelector(".dock nav");
  if (nav) {
    const links = [...nav.querySelectorAll("a")];
    const back = nav.querySelector("i");
    const current = links.find((a) => a.getAttribute("aria-current")) || links[0];
    let prevX = null;
    let squishTimer = 0;
    const move = (a, animate = true) => {
      const x = a.getBoundingClientRect().left - nav.getBoundingClientRect().left - 9;
      if (animate && !reduced && prevX !== null && Math.abs(x - prevX) > 4) {
        back.style.setProperty("--sx", "1.18");
        back.style.setProperty("--sy", "0.88");
        clearTimeout(squishTimer);
        squishTimer = setTimeout(() => {
          back.style.setProperty("--sx", "1");
          back.style.setProperty("--sy", "1");
        }, 170);
      }
      prevX = x;
      back.style.setProperty("--x", `${x}px`);
    };
    back.style.transition = "none";
    move(current, false);
    requestAnimationFrame(() => requestAnimationFrame(() => (back.style.transition = "")));
    links.forEach((a) => {
      a.addEventListener("mouseenter", () => move(a));
      a.addEventListener("focus", () => move(a));
    });
    nav.addEventListener("mouseleave", () => move(current));
    addEventListener("resize", () => move(current, false));
  }

  /* Interactive buttons: slide-up text roll + diagonal arrow swap */
  if (!reduced) {
    const makeFlip = (text) => {
      const wrap = document.createElement("span");
      wrap.className = "flip";
      const a = document.createElement("span");
      a.className = "flip-a";
      a.textContent = text;
      const b = document.createElement("span");
      b.className = "flip-b";
      b.setAttribute("aria-hidden", "true");
      b.textContent = text;
      wrap.append(a, b);
      return wrap;
    };

    document.querySelectorAll(".btn, .cta-form button, .lang").forEach((el) => {
      if (el.querySelector(".flip") || el.children.length > 0) return;
      const txt = el.textContent.trim();
      if (!txt) return;
      el.textContent = "";
      el.append(makeFlip(txt));
    });

    document.querySelectorAll(".float").forEach((el) => {
      if (el.querySelector(".flip")) return;
      const svg = el.querySelector("svg");
      const txt = el.textContent.trim();
      el.textContent = "";
      if (txt) el.append(makeFlip(txt));
      if (svg) {
        const swap = document.createElement("span");
        swap.className = "arrow-swap";
        swap.setAttribute("aria-hidden", "true");
        const clone = svg.cloneNode(true);
        swap.append(svg, clone);
        el.append(swap);
      }
    });

    document.querySelectorAll(".arrow-btn").forEach((btn) => {
      const svg = btn.querySelector("svg");
      if (!svg || btn.classList.contains("is-swap")) return;
      btn.classList.add("is-swap");
      const clone = svg.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      btn.append(clone);
    });
  }

  /* Hero: per-word blur-in (blur 10px → 0, y 10px → 0, ~1s, 45ms stagger) */
  let index = 0;
  const split = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(" ");
          const span = document.createElement("span");
          span.className = "w";
          span.style.setProperty("--i", index++);
          span.textContent = part;
          frag.append(span);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== "BR") {
        split(child);
      }
    });
  };
  document.querySelectorAll("[data-split]").forEach(split);

  /* Cyrillic serif fallback has a narrower hyphen than Halant: render hyphens inside Cyrillic words with it */
  const fixHy = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      if (!/[A-Za-z\u0400-\u04FF][-\u2010\u2011][\u0400-\u04FF]/.test(n.textContent)) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(?<=[A-Za-z\u0400-\u04FF])([-\u2010\u2011])(?=[\u0400-\u04FF])/).forEach((part, i) => {
        if (i % 2) {
          const s = document.createElement("span");
          s.className = "hy";
          s.textContent = part;
          frag.append(s);
        } else frag.append(part);
      });
      n.replaceWith(frag);
    });
  };
  document.querySelectorAll("h1, h2, h3, .jtitle").forEach(fixHy);

  /* Scroll reveal: 40px rise */
  const items = document.querySelectorAll("[data-r]");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  /* Hide floating button over the footer */
  const fl = document.querySelector(".float");
  const ft = document.querySelector(".foot");
  if (fl && ft && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => fl.classList.toggle("away", e.isIntersecting), { threshold: 0.35 }).observe(ft);
  }

  /* FAQ accordion */
  document.querySelectorAll(".qa button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qa = btn.closest(".qa");
      const open = qa.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* Hero image parallax */
  const art = document.querySelector("[data-parallax]");
  if (art && !reduced) {
    let ticking = false;
    const apply = () => {
      art.style.setProperty("--py", `${scrollY * 0.15}px`);
      ticking = false;
    };
    addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(apply);
      },
      { passive: true }
    );
    apply();
  }

  /* CTA form → mailto */
  document.querySelectorAll("form[data-subject]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const subject = encodeURIComponent(form.dataset.subject || "Hello");
      const body = encodeURIComponent(`${d.get("question")}\n\n— ${d.get("name")} (${d.get("email")})`);
      location.href = `mailto:andrew.antoshkin@gmail.com?subject=${subject}&body=${body}`;
    });
  })
})();
