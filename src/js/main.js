document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const hasFinePointer = window.matchMedia?.('(pointer: fine)')?.matches ?? false;
    const hasHover = window.matchMedia?.('(hover: hover)')?.matches ?? false;
    const allowMotion = !prefersReducedMotion;

    // Enable reveal styles only when JS is running (prevents hidden content if JS/CDNs fail).
    document.body.classList.add('reveal-on');

    // Lucide Icons setup
    try {
        window.lucide?.createIcons?.();
    } catch (_) {}

    // Mobile nav toggle (top navigation for small screen fallback / bottom nav fallback)
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

    // Reveal on Scroll
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

    // Neo-Brutalist Cursor setup
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    const allowCursor = allowMotion && hasFinePointer && hasHover && cursor && cursorDot && window.gsap;

    if (allowCursor) {
        document.body.classList.add('has-custom-cursor');

        document.addEventListener('mousemove', (e) => {
            // Snappier transition for Neo-Brutalist cursor
            window.gsap.to(cursor, { x: e.clientX - 12, y: e.clientY - 12, duration: 0.2, ease: 'power1.out' });
            window.gsap.to(cursorDot, { x: e.clientX - 3, y: e.clientY - 3, duration: 0.05, ease: 'power1.out' });
        });

        document.querySelectorAll('a, button, .project-card, .highlight').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                window.gsap.to(cursor, { scale: 1.5, rotate: 45, backgroundColor: '#ff6b8b', duration: 0.15 });
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                window.gsap.to(cursor, { scale: 1, rotate: 0, backgroundColor: '#ffe135', duration: 0.15 });
            });
        });
    }

    // GSAP animations for Neo-Brutalist reveal
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
                y: -30,
                opacity: 0,
                duration: 0.5,
                ease: 'back.out(1.7)',
                delay: 0.1,
            });

            // Hero stagger (snappier, energetic)
            window.gsap.from(
                ['.hero-name', '.eyebrow', '.hero-title', '.hero-subtitle', '.hero-actions', '.hero-badges'],
                {
                    opacity: 0,
                    y: 30,
                    duration: 0.6,
                    ease: 'back.out(1.5)',
                    stagger: 0.1,
                    delay: 0.2,
                    clearProps: 'transform',
                }
            );
        } catch (_) {}
    }

    if (hasScrollTrigger) {
        try {
            // Section title pops
            window.gsap.utils.toArray('.section-title').forEach((title) => {
                window.gsap.from(title, {
                    scrollTrigger: {
                        trigger: title,
                        start: 'top 90%',
                        toggleActions: 'play none none reverse',
                    },
                    opacity: 0,
                    scale: 0.9,
                    y: 20,
                    duration: 0.5,
                    ease: 'back.out(2)',
                });
            });

            // About blocks popping
            window.gsap.from('.about-card', {
                scrollTrigger: { trigger: '.section-about', start: 'top 80%' },
                opacity: 0,
                x: -30,
                duration: 0.6,
                ease: 'back.out(1.2)',
            });
            window.gsap.from('.highlight', {
                scrollTrigger: { trigger: '.about-highlights', start: 'top 85%' },
                opacity: 0,
                y: 30,
                duration: 0.5,
                ease: 'back.out(1.5)',
                stagger: 0.1,
            });

            // Project cards pop
            const cards = window.gsap.utils.toArray('.project-card');
            cards.forEach((card) => {
                window.gsap.from(card, {
                    scrollTrigger: { trigger: card, start: 'top 90%' },
                    opacity: 0,
                    y: 40,
                    duration: 0.5,
                    ease: 'back.out(1.2)',
                    clearProps: 'transform',
                });
            });

            // Contact section card
            window.gsap.from('.contact-card', {
                scrollTrigger: { trigger: '.section-contact', start: 'top 85%' },
                opacity: 0,
                scale: 0.95,
                y: 30,
                duration: 0.6,
                ease: 'back.out(1.5)',
            });
        } catch (_) {}
    }

    // Mobile Bottom Nav Tracking
    const bottomNav = document.querySelector('.mobile-bottom-nav');
    const bottomNavItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
    const sections = document.querySelectorAll('section[id]');

    const highlightBottomNav = () => {
        let scrollY = window.pageYOffset;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        // At the bottom of the page
        if (scrollY + clientHeight >= scrollHeight - 20) {
            bottomNavItems.forEach((item) => {
                item.classList.remove('active');
                if (item.getAttribute('href') === '#contact') {
                    item.classList.add('active');
                }
            });
            return;
        }

        sections.forEach((current) => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 180;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                bottomNavItems.forEach((item) => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    };

    setTimeout(() => highlightBottomNav(), 50);
    window.addEventListener('scroll', highlightBottomNav, { passive: true });
    window.addEventListener('resize', highlightBottomNav, { passive: true });
});
