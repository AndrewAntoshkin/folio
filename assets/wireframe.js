(() => {
    const root = document.documentElement;
    const page = document.querySelector('.page');
    const body = document.body;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Fold-in on load ─────────────────────────────────────
    document.querySelectorAll('[data-fold]').forEach((el, i) => {
        el.style.animationDelay = `${el.dataset.fold || (100 + i * 50)}ms`;
    });

    // ── Nav dim siblings on hover ───────────────────────────
    const nav = document.querySelector('.top-nav');
    if (nav) {
        nav.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('mouseenter', () => nav.classList.add('nav-hover'));
            link.addEventListener('mouseleave', () => nav.classList.remove('nav-hover'));
        });
    }

    // ── Crosshair overlay ───────────────────────────────────
    const crosshair = document.querySelector('.crosshair');
    if (crosshair && !reduced && matchMedia('(min-width: 769px)').matches) {
        const lineH = crosshair.querySelector('.crosshair-h');
        const lineV = crosshair.querySelector('.crosshair-v');
        const coords = crosshair.querySelector('.crosshair-coords');
        let raf = 0;
        let mx = 0;
        let my = 0;

        const render = () => {
            raf = 0;
            lineH.style.transform = `translateY(${my}px)`;
            lineV.style.transform = `translateX(${mx}px)`;
            coords.style.transform = `translate(${mx + 12}px, ${my + 12}px)`;
            coords.textContent = `${Math.round(mx)} · ${Math.round(my)}`;
        };

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            if (!raf) raf = requestAnimationFrame(render);
        }, { passive: true });
    }

    // ── Theme (light / dark) ──────────────────────────────
    const themeToggles = document.querySelectorAll('[data-theme-toggle]');
    const themeMeta = document.getElementById('themeColorMeta');

    const updateThemeColor = () => {
        const dark = root.dataset.theme === 'dark';
        if (!themeMeta) return;
        themeMeta.content = dark ? '#101010' : '#FDFDFC';
    };

    const syncTheme = () => {
        const dark = root.dataset.theme === 'dark';
        themeToggles.forEach((toggle) => {
            toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
        });
        updateThemeColor();
    };

    if (themeToggles.length) {
        try {
            if (localStorage.getItem('theme') === 'dark') root.dataset.theme = 'dark';
        } catch (e) {}
        syncTheme();
        themeToggles.forEach((toggle) => {
            toggle.addEventListener('click', () => {
                root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
                try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
                syncTheme();
            });
        });
    }

    (() => {
        const sel = document.querySelector('.sel');
        const sizeLabel = document.getElementById('selSize');
        const markLabel = document.getElementById('markSize');
        const mark = document.querySelector('.hero-mark img');
        const colorLabel = document.getElementById('selColor');
        const serif = document.querySelector('.hero-title .serif');
        const colLabel = document.getElementById('colWidth');
        const content = document.querySelector('.content--home') || document.querySelector('.content');
        if (!sel || !sizeLabel || !colorLabel || !serif || !colLabel || !content) return;

        const dims = (el) => {
            const r = el.getBoundingClientRect();
            return `${Math.round(r.width)} × ${Math.round(r.height)}`;
        };

        const hex = (el) => getComputedStyle(el).color
            .match(/\d+/g)
            .slice(0, 3)
            .reduce((s, n) => s + Number(n).toString(16).padStart(2, '0'), '#');

        const update = () => {
            sizeLabel.firstChild.nodeValue = dims(sel);
            if (markLabel && mark) markLabel.firstChild.nodeValue = dims(mark);
            colorLabel.lastChild.previousSibling.nodeValue = hex(serif);
            colLabel.textContent = `${Math.round(content.clientWidth)} px`;
        };

        update();
        addEventListener('resize', update, { passive: true });
        new MutationObserver(update).observe(document.documentElement, { attributeFilter: ['data-theme'] });
        new MutationObserver(update).observe(body, { attributeFilter: ['data-guides'] });
        if (document.fonts) document.fonts.ready.then(update);
    })();

    (() => {
        const rail = document.querySelector('.career-list--timeline');
        const label = document.querySelector('#careerSpan b');
        if (!rail || !label) return;

        const rows = rail.querySelectorAll('.career-row');
        const metas = rail.querySelectorAll('.career-date');
        if (!metas.length) return;

        const start = metas[metas.length - 1].textContent.match(/\d{4}/);
        if (!start) return;

        const chip = document.getElementById('careerSpan');
        const total = new Date().getFullYear() - Number(start[0]);
        const calm = matchMedia('(prefers-reduced-motion: reduce)');
        const run = Math.max(rows.length - 1, 0) * 500;

        const word = (n) => {
            if (document.documentElement.lang === 'en') return n === 1 ? 'year' : 'years';
            const tail = n % 100;
            const last = n % 10;
            if (tail > 4 && tail < 21) return 'лет';
            if (last === 1) return 'год';
            if (last > 1 && last < 5) return 'года';
            return 'лет';
        };
        const show = (n) => { label.textContent = `${n} ${word(n)}`; };

        rows.forEach((row, i) => row.style.setProperty('--lvl', rows.length - 1 - i));

        const travel = () => rows.length ? rows[rows.length - 1].offsetTop : 0;
        const park = () => { chip.style.transform = `translateY(${travel()}px)`; };

        let frame = 0;
        let ride = null;

        const play = () => {
            if (!rail.classList.contains('is-drawn')) return;
            if (body.dataset.guides === 'false') return;

            cancelAnimationFrame(frame);
            if (ride) ride.cancel();

            const dist = travel();
            if (calm.matches || !total || !dist) {
                chip.style.transform = 'translateY(0px)';
                show(total);
                return;
            }

            ride = chip.animate(
                [{ transform: `translateY(${dist}px)` }, { transform: 'translateY(0px)' }],
                { duration: run, easing: 'linear', fill: 'both' },
            );

            const tick = () => {
                const p = ride.effect.getComputedTiming().progress;
                if (p == null) { show(total); return; }
                show(Math.round(total * p));
                frame = requestAnimationFrame(tick);
            };
            ride.addEventListener('finish', () => { cancelAnimationFrame(frame); show(total); });
            frame = requestAnimationFrame(tick);
        };

        show(0);
        park();
        addEventListener('resize', () => { if (!ride) park(); }, { passive: true });

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    rail.classList.add('is-drawn');
                    play();
                    io.disconnect();
                });
            }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });
            io.observe(rail);
        } else {
            rail.classList.add('is-drawn');
            play();
        }

        new MutationObserver(play).observe(body, { attributeFilter: ['data-guides'] });
    })();

    // ── Copy email ──────────────────────────────────────────
    document.querySelectorAll('[data-copy]').forEach((el) => {
        el.addEventListener('click', async (e) => {
            e.preventDefault();
            const value = el.dataset.copy;
            try {
                await navigator.clipboard.writeText(value);
            } catch (err) {
                const ta = document.createElement('textarea');
                ta.value = value;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
            }
            const badge = el.querySelector('.copied');
            if (!badge) return;
            badge.hidden = false;
            clearTimeout(badge._t);
            badge._t = setTimeout(() => { badge.hidden = true; }, 1600);
        });
    });

    // ── Mobile nav ──────────────────────────────────────────
    const mobileBtn = document.querySelector('.mobile-pill');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileBtn && mobileMenu) {
        const close = () => {
            mobileBtn.setAttribute('aria-expanded', 'false');
            mobileMenu.hidden = true;
            document.body.classList.remove('menu-open');
        };
        mobileBtn.addEventListener('click', () => {
            const open = mobileBtn.getAttribute('aria-expanded') === 'true';
            mobileBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
            mobileMenu.hidden = open;
            document.body.classList.toggle('menu-open', !open);
            if (!open) mobileBtn.querySelector('.pill-icon')?.classList.add('icon-open');
            else mobileBtn.querySelector('.pill-icon')?.classList.remove('icon-open');
        });
        mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
    }

    // ── Active nav by pathname ──────────────────────────────
    const pathKey = (() => {
        const p = location.pathname.split('/').pop() || 'index.html';
        if (p === 'index.html' || p === '') return 'home';
        if (p.startsWith('cursor-figma') || p.startsWith('design-md') || p.startsWith('dev-for-designers')) return 'writing';
        return p.replace('.html', '');
    })();
    document.querySelectorAll('.nav-links .nav-link').forEach((link) => {
        const href = link.getAttribute('href') || '';
        const key = href === 'index.html' ? 'home' : href.replace('.html', '');
        link.classList.toggle('active', key === pathKey);
    });

    const projectNav = document.querySelector('.top-nav--project');
    if (projectNav) {
        const groups = [
            [...projectNav.querySelectorAll('a[href^="#"]')],
            [...document.querySelectorAll('.mobile-menu--project a[href^="#"]')],
        ];
        const sections = groups[0]
            .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
            .filter(Boolean);
        const markSection = () => {
            if (!sections.length) return;
            let current = sections[0];
            sections.forEach((section) => {
                if (section.getBoundingClientRect().top <= 120) current = section;
            });
            const id = `#${current.id}`;
            groups.flat().forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === id);
            });
        };
        document.addEventListener('scroll', markSection, { passive: true });
        window.addEventListener('hashchange', markSection);
        requestAnimationFrame(() => requestAnimationFrame(markSection));
    }

    // ── FAQ accordion ─────────────────────────────────────
    document.querySelectorAll('.faq-q').forEach((btn) => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const open = item.classList.contains('open');
            item.closest('.faq-section')?.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
            if (!open) item.classList.add('open');
        });
    });

    // ── Article prose stagger ─────────────────────────────
    document.querySelectorAll('.prose:not(.prose--docs)').forEach((prose) => {
        let delay = 180;
        prose.querySelectorAll('h2, h3, p, ul, ol, pre').forEach((el) => {
            el.classList.add('fold');
            el.dataset.fold = String(delay);
            delay += 40;
        });
    });
})();
