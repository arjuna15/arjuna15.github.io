// Theme Switcher Initialization (runs immediately to prevent flash)
const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};
setTheme(getPreferredTheme());

document.addEventListener('DOMContentLoaded', () => {
    // Set up click handlers for theme togglers
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const handleThemeToggle = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };
    if (themeToggle) themeToggle.addEventListener('click', handleThemeToggle);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', handleThemeToggle);

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    const hasFinePointer = window.matchMedia?.('(pointer: fine)')?.matches ?? false;
    const hasHover = window.matchMedia?.('(hover: hover)')?.matches ?? false;
    const allowMotion = !prefersReducedMotion;

    // Enable reveal styles only when JS is running (prevents hidden content if JS/CDNs fail).
    document.body.classList.add('reveal-on');

    // Initialize Lenis Smooth Scroll
    let lenis;
    if (allowMotion && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 0.95,
            smoothTouch: false,
            touchMultiplier: 1.5,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Bind Lenis scrolling to all internal anchors
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                // Allow skip-link to work normally
                if (this.classList.contains('skip-link')) return;

                e.preventDefault();
                const target = document.querySelector(targetId);
                if (target) {
                    lenis.scrollTo(target);
                }
            });
        });


    }

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

    // Neo-Brutalist Cursor setup (Vanilla requestAnimationFrame for buttery smoothness)
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    const allowCursor = allowMotion && hasFinePointer && hasHover && cursor && cursorDot;

    if (allowCursor) {
        document.body.classList.add('has-custom-cursor');

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        let dotX = 0;
        let dotY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateCursor() {
            cursorX += (mouseX - cursorX) * 0.16;
            cursorY += (mouseY - cursorY) * 0.16;
            dotX += (mouseX - dotX) * 0.45;
            dotY += (mouseY - dotY) * 0.45;

            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            cursorDot.style.left = `${dotX}px`;
            cursorDot.style.top = `${dotY}px`;

            requestAnimationFrame(updateCursor);
        }
        requestAnimationFrame(updateCursor);

        document.querySelectorAll('a, button, .project-card, .highlight, .social-badge').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
            });
        });
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

    // Handle Contact Form Submit and Redirect to WhatsApp
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent standard page reload / submit
            
            const name = document.getElementById('form-name').value;
            const email = document.getElementById('form-email').value;
            const message = document.getElementById('form-message').value;
            
            const waNumber = "6281212142716";
            const text = `Halo Arjuna, saya *${name}* (${email}).\n\n${message}`;
            
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
        });
    }

    setTimeout(() => highlightBottomNav(), 50);
    window.addEventListener('scroll', highlightBottomNav, { passive: true });
    window.addEventListener('resize', highlightBottomNav, { passive: true });
});
