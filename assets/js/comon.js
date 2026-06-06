// --- Preloader Dynamic Injection & Fade Out ---
(() => {
    const preloader = document.createElement('div');
    preloader.id = 'preloader';
    preloader.className = 'preloader-wrapper';
    preloader.innerHTML = `
        <div class="preloader-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-logo"><i class="fas fa-mountain-sun"></i></div>
        </div>
    `;
    
    if (document.body) {
        document.body.insertBefore(preloader, document.body.firstChild);
        document.body.classList.add('loading-active');
    }

    const hidePreloader = () => {
        preloader.classList.add('fade-out');
        if (document.body) {
            document.body.classList.remove('loading-active');
        }
        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.parentNode.removeChild(preloader);
            }
        }, 600);
    };

    if (document.readyState === 'complete') {
        hidePreloader();
    } else {
        window.addEventListener('load', hidePreloader);
    }
})();

document.addEventListener('DOMContentLoaded', () => {

    // Theme Toggle & Color Palette Picker Logic
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    const themeColors = {
        cyan: {
            dark: { primary: '#00D2FF', glow: 'rgba(0, 210, 255, 0.4)', gradStart: '#FFFFFF', gradEnd: '#00D2FF' },
            light: { primary: '#0369A1', glow: 'rgba(3, 105, 161, 0.2)', gradStart: '#0F172A', gradEnd: '#0369A1' }
        },
        purple: {
            dark: { primary: '#A78BFA', glow: 'rgba(167, 139, 250, 0.4)', gradStart: '#FFFFFF', gradEnd: '#A78BFA' },
            light: { primary: '#6D28D9', glow: 'rgba(109, 40, 217, 0.2)', gradStart: '#0F172A', gradEnd: '#6D28D9' }
        },
        green: {
            dark: { primary: '#34D399', glow: 'rgba(52, 211, 153, 0.4)', gradStart: '#FFFFFF', gradEnd: '#34D399' },
            light: { primary: '#047857', glow: 'rgba(4, 120, 87, 0.2)', gradStart: '#0F172A', gradEnd: '#047857' }
        },
        orange: {
            dark: { primary: '#FB923C', glow: 'rgba(251, 146, 60, 0.4)', gradStart: '#FFFFFF', gradEnd: '#FB923C' },
            light: { primary: '#C2410C', glow: 'rgba(194, 65, 12, 0.2)', gradStart: '#0F172A', gradEnd: '#C2410C' }
        },
        pink: {
            dark: { primary: '#F472B6', glow: 'rgba(244, 114, 182, 0.4)', gradStart: '#FFFFFF', gradEnd: '#F472B6' },
            light: { primary: '#BE185D', glow: 'rgba(190, 24, 93, 0.2)', gradStart: '#0F172A', gradEnd: '#BE185D' }
        }
    };

    function applyThemeColor(colorName) {
        const isLight = body.classList.contains('light-mode');
        const theme = themeColors[colorName] || themeColors.cyan;
        const modeColors = isLight ? theme.light : theme.dark;

        // Set on html (document.documentElement) for root scope
        document.documentElement.style.setProperty('--primary', modeColors.primary);
        document.documentElement.style.setProperty('--primary-glow', modeColors.glow);
        document.documentElement.style.setProperty('--gradient-start', modeColors.gradStart);

        // Set on body to override stylesheet rules defined on body / body.light-mode
        body.style.setProperty('--primary', modeColors.primary);
        body.style.setProperty('--primary-glow', modeColors.glow);
        body.style.setProperty('--gradient-start', modeColors.gradStart);

        sessionStorage.setItem('selected-theme-color', colorName);

        document.querySelectorAll('.color-dot').forEach(dot => {
            if (dot.dataset.name === colorName) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    if (themeToggle && themeIcon) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.classList.add('light-mode');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }

        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');

            if (isLight) {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'light');
            } else {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'dark');
            }

            // Re-apply selected accent color for new theme mode
            const activeColor = sessionStorage.getItem('selected-theme-color') || 'cyan';
            applyThemeColor(activeColor);
        });
    }

    // Toggle color menu dropdown visibility
    const pickerToggle = document.getElementById('color-picker-toggle');
    const pickerMenu = document.getElementById('color-picker-menu');

    if (pickerToggle && pickerMenu) {
        pickerToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            pickerMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!pickerToggle.contains(e.target) && !pickerMenu.contains(e.target)) {
                pickerMenu.classList.remove('active');
            }
        });
    }

    // Add click listeners to color dots
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const colorName = dot.dataset.name;
            applyThemeColor(colorName);
        });
    });

    // Initialize saved color theme from session storage
    const savedColor = sessionStorage.getItem('selected-theme-color') || 'cyan';
    applyThemeColor(savedColor);

    // Navbar Scroll Effect
    const nav = document.getElementById('navbar');
    const handleNavbarScroll = () => {
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    };
    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll();

    // Reading Progress Bar calculation according to GUIDE INDEX content area
    const progressBar = document.getElementById('reading-progress-bar');
    const contentArea = document.querySelector('.content-area');
    if (progressBar && contentArea) {
        window.addEventListener('scroll', () => {
            const rect = contentArea.getBoundingClientRect();
            const contentTop = rect.top + window.scrollY;
            const contentHeight = rect.height;
            const viewportHeight = window.innerHeight;

            // Scroll position relative to the content area start
            const scrollTop = window.scrollY - contentTop;

            // Total scrollable distance within content area
            const scrollHeight = contentHeight - viewportHeight;

            let percent = 0;
            if (scrollHeight > 0) {
                percent = Math.max(0, Math.min(100, (scrollTop / scrollHeight) * 100));
            } else {
                percent = window.scrollY >= contentTop ? 100 : 0;
            }

            progressBar.style.width = `${percent}%`;
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        const navLinksItems = document.querySelectorAll('.nav-links a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                if (link.classList.contains('dropdown-toggle')) {
                    return; // Don't close mobile menu when opening dropdown
                }
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    if (icon) {
                        icon.classList.add('fa-bars');
                        icon.classList.remove('fa-times');
                    }
                }
            });
        });
    }

    // Dropdown Slide Toggle on Mobile
    const dropdownToggle = document.querySelector('.nav-links .dropdown-toggle');
    const dropdownMenu = document.querySelector('.nav-links .dropdown-menu');

    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                e.stopPropagation();
                
                const parentLi = dropdownToggle.parentElement;
                const isVisible = window.getComputedStyle(dropdownMenu).display === 'block';
                if (isVisible) {
                    dropdownMenu.style.display = 'none';
                    dropdownToggle.classList.remove('open');
                    if (parentLi) parentLi.classList.remove('open');
                } else {
                    dropdownMenu.style.display = 'block';
                    dropdownToggle.classList.add('open');
                    if (parentLi) parentLi.classList.add('open');
                }
            }
        });
    }

    // Scroll Spy: Highlight Left Index Links based on Active Section
    const sections = document.querySelectorAll('.content-area .guide-section');
    const indexLinks = document.querySelectorAll('.sidebar-nav .index-link');

    if (sections.length > 0 && indexLinks.length > 0) {
        const spyObserverOptions = {
            root: null,
            rootMargin: '-80px 0px -50% 0px',
            threshold: 0
        };

        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');

                    indexLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href === `#${sectionId}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, spyObserverOptions);

        sections.forEach(section => {
            spyObserver.observe(section);
        });
    }

    // Smooth Scrolling with sticky header offset
    indexLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 90;
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                history.pushState(null, null, targetId);
            }
        });
    });

});