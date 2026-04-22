document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const hasFinePointer = window.matchMedia?.('(pointer: fine)')?.matches ?? false;
    const hasHover = window.matchMedia?.('(hover: hover)')?.matches ?? false;
    const hasCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
    const allowMotion = !prefersReducedMotion;

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
                color: 0x10b981,
                wireframe: true,
                transparent: true,
                opacity: 0.28,
                emissive: 0x10b981,
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
                color: 0x10b981,
                transparent: true,
                opacity: 0.34,
                blending: window.THREE.AdditiveBlending,
            })
        );
        mainGroup.add(particlesMesh);

        const pointLight = new window.THREE.PointLight(0x10b981, 10);
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
    if (hasGsap) {
        try {
            if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
            window.gsap.from('.hero-title', { opacity: 0, y: 16, duration: 0.9, ease: 'power3.out', delay: 0.05 });
            window.gsap.from('.hero-subtitle', { opacity: 0, y: 12, duration: 0.8, ease: 'power3.out', delay: 0.12 });
            window.gsap.from('.hero-actions', { opacity: 0, y: 10, duration: 0.7, ease: 'power3.out', delay: 0.18 });
        } catch (_) {}
    }
});
