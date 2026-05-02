document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const hasFinePointer = window.matchMedia?.('(pointer: fine)')?.matches ?? false;
    const hasHover = window.matchMedia?.('(hover: hover)')?.matches ?? false;
    const hasCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
    const allowMotion = !prefersReducedMotion;

    // Enable reveal styles only when JS is running (prevents hidden content if JS/CDNs fail).
    document.body.classList.add('reveal-on');

    // Parallax starfield (very light) — respects reduced-motion automatically via allowMotion.
    const parallaxBg = document.getElementById('parallax-bg');
    const constellationCanvas = document.getElementById('constellation-canvas');
    if (parallaxBg) {
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;
        let latestScrollY = window.scrollY || 0;
        let rafId = 0;
        let constellation = null;

        const setupConstellation = () => {
            if (!constellationCanvas) return null;
            const ctx = constellationCanvas.getContext?.('2d');
            if (!ctx) return null;

            // Pisces-inspired constellation (two "fish" loops connected by a cord).
            // Normalized points (0..1) + edges (pairs of indices).
            const points = [
                // Left fish loop (0-4)
                { x: 0.24, y: 0.54, s: 1.55 }, // bright
                { x: 0.18, y: 0.46, s: 1.05 },
                { x: 0.22, y: 0.38, s: 1.15 },
                { x: 0.30, y: 0.40, s: 1.0 },
                { x: 0.32, y: 0.50, s: 1.2 },

                // Right fish loop (5-9)
                { x: 0.74, y: 0.30, s: 1.65 }, // bright
                { x: 0.82, y: 0.36, s: 1.05 },
                { x: 0.80, y: 0.46, s: 1.1 },
                { x: 0.70, y: 0.44, s: 1.0 },
                { x: 0.68, y: 0.34, s: 1.25 },

                // Cord / connector (10-12)
                { x: 0.40, y: 0.46, s: 0.95 },
                { x: 0.52, y: 0.42, s: 1.05 },
                { x: 0.62, y: 0.38, s: 0.95 },
            ];

            const edges = [
                // Left loop
                [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
                // Right loop
                [5, 6], [6, 7], [7, 8], [8, 9], [9, 5],
                // Cord
                [3, 10], [10, 11], [11, 12], [12, 9],
            ];

            const state = {
                ctx,
                points: points.map((p, i) => ({
                    ...p,
                    phase: (i * 0.9) % (Math.PI * 2),
                })),
                edges,
                width: 0,
                height: 0,
                dpr: 1,
            };

            const resize = () => {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                state.dpr = dpr;
                state.width = Math.max(1, Math.floor(window.innerWidth));
                state.height = Math.max(1, Math.floor(window.innerHeight));
                constellationCanvas.width = Math.floor(state.width * dpr);
                constellationCanvas.height = Math.floor(state.height * dpr);
                constellationCanvas.style.width = `${state.width}px`;
                constellationCanvas.style.height = `${state.height}px`;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            };

            resize();
            window.addEventListener('resize', resize, { passive: true });

            return state;
        };

        constellation = setupConstellation();

        const drawConstellation = (timeMs) => {
            if (!constellation) return;
            const { ctx, width, height, points, edges } = constellation;
            ctx.clearRect(0, 0, width, height);

            // Parallax offsets (subtle)
            const ox = currentX * 0.6;
            const oy = currentY * 0.5 - latestScrollY * 0.03;

            // Line styling (lean emerald so it matches the 3D background)
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';

            // Glow lines
            ctx.save();
            ctx.shadowColor = 'rgba(16, 185, 129, 0.22)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            edges.forEach(([a, b]) => {
                const pa = points[a];
                const pb = points[b];
                const ax = pa.x * width + ox;
                const ay = pa.y * height + oy;
                const bx = pb.x * width + ox;
                const by = pb.y * height + oy;
                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
            });
            ctx.stroke();
            ctx.restore();

            // Nodes
            const t = timeMs * 0.001;
            points.forEach((p) => {
                const tw = allowMotion ? (0.55 + 0.45 * Math.sin(t * 1.6 + p.phase)) : 0.85;
                const r = (2.0 + p.s * 1.35) * tw;
                const x = p.x * width + ox;
                const y = p.y * height + oy;

                // outer glow
                ctx.beginPath();
                ctx.fillStyle = `rgba(16, 185, 129, ${0.12 * p.s})`;
                ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
                ctx.fill();

                // core
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${0.50 + 0.25 * p.s})`;
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const updateParallax = () => {
            rafId = requestAnimationFrame(updateParallax);
            if (!allowMotion) return;

            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;

            const scrollShift = latestScrollY * 0.06;
            parallaxBg.style.setProperty('--pax', `${currentX}px`);
            parallaxBg.style.setProperty('--pay', `${currentY}px`);
            parallaxBg.style.setProperty('--ps', `${scrollShift}px`);

            // Draw constellation on the same tick (keeps it aligned with parallax vars).
            drawConstellation(performance.now());
        };

        const onPointerMove = (e) => {
            if (!allowMotion) return;
            const x = (e.clientX / window.innerWidth - 0.5);
            const y = (e.clientY / window.innerHeight - 0.5);
            targetX = x * 22;
            targetY = y * 18;
        };

        const onScroll = () => {
            latestScrollY = window.scrollY || 0;
        };

        if (allowMotion) {
            if (hasFinePointer) document.addEventListener('mousemove', onPointerMove, { passive: true });
            window.addEventListener('scroll', onScroll, { passive: true });
        } else {
            parallaxBg.style.setProperty('--pax', `0px`);
            parallaxBg.style.setProperty('--pay', `0px`);
            parallaxBg.style.setProperty('--ps', `0px`);
            drawConstellation(performance.now());
        }

        updateParallax();

        // Cleanup hook (in case this code is ever embedded in an SPA)
        window.addEventListener('beforeunload', () => {
            if (rafId) cancelAnimationFrame(rafId);
        }, { once: true });
    }

    // Icons (safe even if lucide fails to load)
    try {
        window.lucide?.createIcons?.();
    } catch (_) {}

    // Mobile nav
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navDrawer = document.getElementById('nav-drawer');
    const navOverlay = document.getElementById('nav-overlay');

    let lastFocused = null;
    const setNavOpen = (open) => {
        if (!navToggle || !navDrawer || !navOverlay) return;
        navToggle.setAttribute('aria-expanded', String(open));
        navDrawer.setAttribute('aria-hidden', String(!open));
        navOverlay.hidden = !open;
        navDrawer.classList.toggle('is-open', open);
        document.body.style.overflow = open ? 'hidden' : '';
        if (open) {
            lastFocused = document.activeElement;
            navClose?.focus?.();
        } else {
            lastFocused?.focus?.();
            lastFocused = null;
        }
    };

    navToggle?.addEventListener('click', () => setNavOpen(true));
    navClose?.addEventListener('click', () => setNavOpen(false));
    navOverlay?.addEventListener('click', () => setNavOpen(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setNavOpen(false);
    });
    navDrawer?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setNavOpen(false));
    });

    // Reveal (no-lib baseline)
    // Make hero content visible immediately (important above-the-fold content).
    const heroRevealEls = Array.from(document.querySelectorAll('#hero .reveal'));
    heroRevealEls.forEach((el) => el.classList.add('is-visible'));

    const revealEls = Array.from(document.querySelectorAll('.reveal')).filter((el) => !el.closest('#hero'));
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    // Smooth scroll (Lenis) — skip on touch/coarse and reduced motion
    const allowLenis = allowMotion && hasFinePointer && typeof window.Lenis === 'function';
    if (allowLenis) {
        const lenis = new window.Lenis({
            duration: 1.05,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
        });

        const raf = (time) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    // Custom cursor + magnetic (only on fine pointer + hover)
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    const allowCursor = allowMotion && hasFinePointer && hasHover && cursor && cursorDot && window.gsap;

    if (allowCursor) {
        document.body.classList.add('has-custom-cursor');

        document.addEventListener('mousemove', (e) => {
            window.gsap.to(cursor, { x: e.clientX - 17, y: e.clientY - 17, duration: 0.6, ease: 'power2.out' });
            window.gsap.to(cursorDot, { x: e.clientX - 3, y: e.clientY - 3, duration: 0.12, ease: 'power2.out' });
        });

        document.querySelectorAll('a, button, .project-card').forEach((el) => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });

        document.querySelectorAll('.magnetic-area').forEach((area) => {
            const btn = area.querySelector('a, button');
            if (!btn) return;

            area.addEventListener('mousemove', (e) => {
                const rect = area.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                window.gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.28, ease: 'power2.out' });
            });
            area.addEventListener('mouseleave', () => {
                window.gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)' });
            });
        });
    }

    // Three.js background — gated for perf & accessibility
    const supportsWebGL = () => {
        try {
            const testCanvas = document.createElement('canvas');
            return Boolean(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'));
        } catch (_) {
            return false;
        }
    };

    const deviceMemory = typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? navigator.deviceMemory : 4;
    const hardwareConcurrency = typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator ? navigator.hardwareConcurrency : 8;
    const lowEndDevice = (deviceMemory && deviceMemory <= 2) || (hardwareConcurrency && hardwareConcurrency <= 4);

    const allowThree = allowMotion && typeof window.THREE === 'object' && supportsWebGL();
    if (allowThree) {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;

        const renderer = new window.THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setClearAlpha(0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        const pixelRatioCap = hasCoarsePointer ? 1.25 : 2;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));

        const scene = new window.THREE.Scene();
        const camera = new window.THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const mainGroup = new window.THREE.Group();
        scene.add(mainGroup);

        const centerpiece = new window.THREE.Mesh(
            new window.THREE.TorusKnotGeometry(1.2, 0.36, lowEndDevice ? 90 : 150, lowEndDevice ? 14 : 20),
            new window.THREE.MeshStandardMaterial({
                color: 0x10B981,
                wireframe: true,
                transparent: true,
                opacity: 0.28,
                emissive: 0x10B981,
                emissiveIntensity: 0.55,
            })
        );
        mainGroup.add(centerpiece);

        const particlesCount = lowEndDevice ? 700 : (hasCoarsePointer ? 1000 : 1500);
        const posArray = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 20;
        const particlesGeometry = new window.THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new window.THREE.BufferAttribute(posArray, 3));
        const particlesMesh = new window.THREE.Points(
            particlesGeometry,
            new window.THREE.PointsMaterial({
                size: hasCoarsePointer ? 0.007 : 0.006,
                color: 0xD4AF37,
                transparent: true,
                opacity: 0.34,
                blending: window.THREE.AdditiveBlending,
            })
        );
        mainGroup.add(particlesMesh);

        const pointLight = new window.THREE.PointLight(0xD4AF37, 10);
        pointLight.position.set(2, 3, 4);
        scene.add(pointLight);
        scene.add(new window.THREE.AmbientLight(0xffffff, 0.08));

        let mouseX = 0;
        let mouseY = 0;
        // Input (desktop) + gentle auto-motion (mobile)
        if (hasFinePointer) {
            document.addEventListener('mousemove', (e) => {
                mouseX = (e.clientX / window.innerWidth - 0.5);
                mouseY = (e.clientY / window.innerHeight - 0.5);
            }, { passive: true });
        }

        let running = true;
        const animate = () => {
            if (!running) return;
            requestAnimationFrame(animate);
            const t = performance.now() * 0.0002;
            const autoY = Math.cos(t) * 0.10;
            const autoX = Math.sin(t) * 0.08;

            centerpiece.rotation.y += 0.0045;
            centerpiece.rotation.x += 0.0018;
            particlesMesh.rotation.y += 0.001;
            mainGroup.rotation.y += ((mouseX * 0.35 + autoY) - mainGroup.rotation.y) * 0.05;
            mainGroup.rotation.x += ((mouseY * 0.25 + autoX) - mainGroup.rotation.x) * 0.05;
            renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
        };
        window.addEventListener('resize', onResize, { passive: true });

        document.addEventListener('visibilitychange', () => {
            running = document.visibilityState !== 'hidden';
            if (running) animate();
        });
    }

    // GSAP enhancements (optional)
    const hasGsap = allowMotion && window.gsap;
    const hasScrollTrigger = hasGsap && window.ScrollTrigger;
    if (hasScrollTrigger) {
        try {
            window.gsap.registerPlugin(window.ScrollTrigger);
        } catch (_) {}
    }

    if (hasGsap) {
        try {
            // Header enter
            window.gsap.from('.site-header', {
                y: -10,
                opacity: 0,
                duration: 0.65,
                ease: 'power3.out',
                delay: 0.05,
            });

            // Hero (staggered)
            window.gsap.from(
                ['.hero-name', '.eyebrow', '.hero-title', '.hero-subtitle', '.hero-actions', '.hero-badges'],
                {
                    opacity: 0,
                    y: 16,
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: 0.08,
                    delay: 0.08,
                    clearProps: 'transform',
                }
            );

            // Subtle idle motion
            window.gsap.to('.about-icon', {
                y: -6,
                duration: 2.4,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            });
            window.gsap.to('.badge', {
                y: -4,
                duration: 2.2,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                stagger: 0.15,
            });
        } catch (_) {}
    }

    if (hasScrollTrigger) {
        try {
            // Section titles
            window.gsap.utils.toArray('.section-title').forEach((title) => {
                window.gsap.from(title, {
                    scrollTrigger: {
                        trigger: title,
                        start: 'top 86%',
                        toggleActions: 'play none none reverse',
                    },
                    opacity: 0,
                    y: 18,
                    duration: 0.75,
                    ease: 'power3.out',
                });
            });

            // About blocks
            window.gsap.from('.about-card', {
                scrollTrigger: { trigger: '.section-about', start: 'top 72%' },
                opacity: 0,
                y: 20,
                duration: 0.8,
                ease: 'power3.out',
            });
            window.gsap.from('.highlight', {
                scrollTrigger: { trigger: '.about-highlights', start: 'top 80%' },
                opacity: 0,
                y: 18,
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.12,
            });

            // Projects (batch for smoother + more "alive")
            const cards = window.gsap.utils.toArray('.project-card');
            if (window.ScrollTrigger.batch) {
                window.ScrollTrigger.batch(cards, {
                    start: 'top 85%',
                    onEnter: (batch) =>
                        window.gsap.fromTo(
                            batch,
                            { opacity: 0, y: 22, scale: 0.98 },
                            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }
                        ),
                });
            } else {
                cards.forEach((card) => {
                    window.gsap.from(card, {
                        scrollTrigger: { trigger: card, start: 'top 88%' },
                        opacity: 0,
                        y: 22,
                        scale: 0.98,
                        duration: 0.7,
                        ease: 'power3.out',
                        clearProps: 'transform',
                    });
                });
            }

            // Contact
            window.gsap.from('.contact-card', {
                scrollTrigger: { trigger: '.section-contact', start: 'top 78%' },
                opacity: 0,
                y: 22,
                duration: 0.75,
                ease: 'power3.out',
            });
            window.gsap.from('.social a', {
                scrollTrigger: { trigger: '.section-contact', start: 'top 72%' },
                opacity: 0,
                y: 10,
                duration: 0.55,
                ease: 'power3.out',
                stagger: 0.09,
            });
        } catch (_) {}
    }
});
