(function () {
  const K = (window.Kit = {});
  const stage = document.querySelector('.stage');
  const css = getComputedStyle(stage);
  const W = +css.getPropertyValue('--w');
  K.W = W;
  K.H = +css.getPropertyValue('--h');
  K.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  K.$ = (s, r = document) => r.querySelector(s);
  K.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  K.scale = () => innerWidth / W;

  function fit() { stage.style.transform = `scale(${K.scale()})`; }
  addEventListener('resize', fit);
  fit();

  const P = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  const svg = (d, v = 24) => `<svg viewBox="0 0 ${v} ${v}" ${P}>${d}</svg>`;
  K.icon = {
    back: svg('<path d="M19 12H5m6-6-6 6 6 6"/>'),
    share: svg('<path d="M12 15V4m-4 4 4-4 4 4M5 13v6h14v-6"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/>'),
    like: svg('<path d="M7 10v10H4V10h3Zm0 0 4-7c1.5 0 2.5 1 2.2 2.6L12.6 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7"/>'),
    dislike: svg('<path d="M7 14V4H4v10h3Zm0 0 4 7c1.5 0 2.5-1 2.2-2.6l-.6-3.4H19a2 2 0 0 0 2-2.3l-1.2-7A2 2 0 0 0 17.8 4H7"/>'),
    comment: svg('<path d="M4 5h16v11H9l-5 4V5Z"/>'),
    repost: svg('<path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3m13-3v2a4 4 0 0 1-4 4H4"/>'),
    more: svg('<circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/>'),
    send: svg('<path d="m4 12 16-8-6 16-2-7-8-1Z"/>'),
    star: svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>'),
    close: svg('<path d="m7 7 10 10M17 7 7 17"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    case: svg('<rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V5h6v2M4 12h16"/>'),
    trend: svg('<circle cx="12" cy="12" r="8.5"/><path d="m7.5 14 3-3 2 2 4-4m0 0h-3m3 0v3"/>'),
    history: svg('<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5M12 8v4l3 2"/>'),
    tabBack: svg('<path d="M19 12H5m6-6-6 6 6 6"/>'),
    tabFeed: svg('<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>'),
    tabNew: svg('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>'),
    tabSearch: svg('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>'),
    tabMe: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18c1.3-2 3.2-3 5.5-3s4.2 1 5.5 3"/>'),
  };
  K.verified = '<svg class="verified" viewBox="0 0 24 24"><path fill="#3fa9f5" d="m12 1.5 2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3L2.6 15.8l1-3.1-1-3.1 2.6-1.9 1-3 3.2.1Z"/><path d="m7.8 12.2 2.8 2.8 5.6-5.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const statusHTML = '<span>9:41</span><span class="ic">'
    + '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>'
    + '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.2A10 10 0 0 0 8 .5 10 10 0 0 0 .8 3.4L2 4.6a8.5 8.5 0 0 1 6-2.4Zm0 3.3c1.4 0 2.6.5 3.6 1.4l1.2-1.2A6.7 6.7 0 0 0 8 3.8c-1.9 0-3.6.7-4.8 1.9l1.2 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.3c-.6 0-1.2.2-1.6.6L8 11l1.6-1.6c-.4-.4-1-.6-1.6-.6Z"/></svg>'
    + '<svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="19" height="8" rx="2" fill="currentColor"/><path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4Z" fill="currentColor" opacity=".4"/></svg>'
    + '</span>';
  K.$$('.screen').forEach((s) => {
    s.insertAdjacentHTML('afterbegin', `<div class="status">${statusHTML}</div>`);
    s.insertAdjacentHTML('beforeend', '<div class="home-ind"></div>');
  });
  K.$$('[data-icon]').forEach((el) => { el.innerHTML = K.icon[el.dataset.icon] + el.innerHTML; });

  K.fmt = (n) => Math.round(n).toLocaleString('ru-RU').replace(/\u00a0|\u202f/g, ' ');
  K.count = (el, from, to, dur = 1200, f = K.fmt) => new Promise((res) => {
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = f(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      p < 1 ? requestAnimationFrame(step) : res();
    })(t0);
  });
  K.bump = (el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };

  // Autopilot: runs while the scene is on screen and nobody is touching it.
  const ABORT = Symbol('abort');
  let gen = 0;
  let visible = true;
  let lastUser = -1e9;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { threshold: 0.2 }).observe(stage);
  const live = () => visible && !document.hidden;
  K.idle = () => performance.now() - lastUser > 7000;

  K.wait = (ms) => new Promise((res, rej) => {
    const my = gen;
    let left = ms;
    let prev = performance.now();
    (function tick(now) {
      if (my !== gen) return rej(ABORT);
      if (live()) left -= now - prev;
      prev = now;
      left <= 0 ? res() : requestAnimationFrame(tick);
    })(prev);
  });
  const until = (ok) => new Promise((res) => { (function tick() { ok() ? res() : setTimeout(tick, 250); })(); });

  K.loop = async (reset, script) => {
    reset();
    if (K.reduced) return;
    for (;;) {
      await until(() => live() && K.idle());
      try { await script(); reset(); } catch (e) { if (e !== ABORT) { console.error(e); return; } }
    }
  };

  stage.addEventListener('pointerdown', (e) => {
    if (!e.isTrusted) return;
    lastUser = performance.now();
    gen++;
    finger.classList.remove('show', 'press');
  }, true);

  const finger = document.createElement('div');
  finger.className = 'finger';
  stage.appendChild(finger);

  K.pt = (el, ox = 0.5, oy = 0.5) => {
    const r = el.getBoundingClientRect();
    const s = K.scale();
    return [(r.left + r.width * ox) / s, (r.top + r.height * oy) / s];
  };
  K.moveTo = async (x, y, dur = 650) => {
    const first = !finger.classList.contains('show');
    finger.style.transition = first ? 'opacity .35s' : `opacity .35s, transform .2s, left ${dur}ms var(--ease), top ${dur}ms var(--ease)`;
    finger.style.left = `${x}px`;
    finger.style.top = `${y}px`;
    finger.classList.add('show');
    await K.wait(first ? 350 : dur);
  };
  K.ripple = (x, y, host = stage) => {
    const r = document.createElement('i');
    r.className = 'ripple';
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    host.appendChild(r);
    setTimeout(() => r.remove(), 700);
  };
  K.tap = async (el, act, ox, oy) => {
    const [x, y] = K.pt(el, ox, oy);
    await K.moveTo(x, y);
    finger.classList.add('press');
    K.ripple(x, y);
    await K.wait(150);
    (act || (() => el.click()))();
    finger.classList.remove('press');
    await K.wait(300);
  };
  K.swipe = async (el, dx, dy, onMove) => {
    const [x, y] = K.pt(el);
    await K.moveTo(x, y);
    finger.classList.add('press');
    await K.wait(120);
    onMove && onMove();
    await K.moveTo(x + dx, y + dy, 420);
    finger.classList.remove('press');
    await K.wait(250);
  };
  K.hide = () => finger.classList.remove('show');

  K.scroller = (view, inner) => {
    let y = 0;
    let drag = null;
    const max = () => Math.max(0, inner.scrollHeight - view.clientHeight);
    const to = (v) => { y = Math.max(0, Math.min(max(), v)); inner.style.transform = `translateY(${-y}px)`; };
    view.addEventListener('pointerdown', (e) => { drag = { y0: e.clientY, s: y, moved: false }; });
    addEventListener('pointermove', (e) => {
      if (!drag) return;
      const d = (e.clientY - drag.y0) / K.scale();
      if (Math.abs(d) > 4) { drag.moved = true; inner.style.transition = 'none'; }
      if (drag.moved) to(drag.s - d);
    });
    addEventListener('pointerup', () => { drag = null; inner.style.transition = ''; });
    return { to, get y() { return y; }, max };
  };

  K.type = async (input, text, speed = 55) => {
    for (const ch of text) {
      input.value += ch;
      input.dispatchEvent(new Event('input'));
      await K.wait(speed + Math.random() * 40);
    }
  };
})();
