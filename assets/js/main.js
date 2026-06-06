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

// --- Swiper Slider Initializations (Only if Library is Loaded) ---
if (typeof Swiper !== 'undefined') {
    // Dynamic Slider Rendering based on Tags
    (() => {
        const monsoonWrapper = document.getElementById('monsoon-swiper-wrapper');
        const popularWrapper = document.getElementById('popular-swiper-wrapper');
        
        if (!window.placesData) return;
        
        // Filter places
        const monsoonPlaces = window.placesData.filter(place => {
            const tags = (place.tags || '').split(',');
            return tags.includes('mansoon');
        });
        
        const popularPlaces = window.placesData.filter(place => {
            const tags = (place.tags || '').split(',');
            return tags.includes('popular');
        });
        
        // Pick N random
        const getRandomItems = (arr, n) => {
            const shuffled = [...arr].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, n);
        };
        
        // Pick Monsoon specials first
        const randomMonsoon = getRandomItems(monsoonPlaces, 6);
        
        // Prevent duplication: Exclude already selected Monsoon items from the Popular selection
        const eligiblePopular = popularPlaces.filter(place => !randomMonsoon.includes(place));
        const randomPopular = getRandomItems(eligiblePopular, 6);
        
        // Generate Slide HTML
        const createSlideHTML = (place, showRibbon) => {
            const ribbonHTML = showRibbon ? `
                <div class="gift-wrap-v8">
                    <div class="ribbon-v8">Popular</div>
                    <div class="gift-bow-v8">
                        <span class="loop-l"></span>
                        <span class="loop-r"></span>
                        <span class="knot"></span>
                    </div>
                </div>
            ` : '';
            
            return `
                <div class="swiper-slide">
                    <div class="luxury-card-v8">
                        <div class="card-image-v8">
                            ${ribbonHTML}
                            <img src="${place.image}" alt="${place.imageAlt || place.title}">
                            <div class="card-badges-v8">
                                <span class="badge-v8">${place.difficulty}</span>
                                <span class="badge-v8">${place.duration}</span>
                            </div>
                        </div>
                        <div class="card-body-v8">
                            <div class="card-meta-v8">
                                <div class="card-rating-v8">
                                    <i class="fas fa-star"></i>
                                    <span>${place.rating.toFixed(1)} (${place.reviewsCount})</span>
                                </div>
                            </div>
                            <h3>${place.title}</h3>
                            <p>${place.description}</p>
                            <div class="card-footer-v8">
                                <a href="${place.link || '#'}" class="btn-v8">View Details <i class="fas fa-arrow-right"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };
        
        if (monsoonWrapper) {
            monsoonWrapper.innerHTML = randomMonsoon.map(place => createSlideHTML(place, false)).join('');
        }
        if (popularWrapper) {
            popularWrapper.innerHTML = randomPopular.map(place => createSlideHTML(place, true)).join('');
        }
    })();

    // 1. Hero Content Slider
    const heroSwiper = new Swiper('.hero-swiper', {
        loop: true,
        speed: 1000,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.hero-swiper .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.hero-swiper .swiper-button-next',
            prevEl: '.hero-swiper .swiper-button-prev',
        },
        on: {
            slideChangeTransitionStart: function () {
                const activeSlide = this.slides[this.activeIndex];
                const reveals = activeSlide.querySelectorAll('.reveal');
                reveals.forEach(el => {
                    el.classList.remove('active');
                    void el.offsetWidth;
                    el.classList.add('active');
                });
            }
        }
    });

    // 2. Upcoming Expeditions Slider (Supports multiple instances)
    const expeditionSwipers = document.querySelectorAll('.expedition-swiper');
    expeditionSwipers.forEach((swiperEl, index) => {
        const parent = swiperEl.parentElement;
        
        // Generate unique class names for this specific instance's controls
        const nextClass = `exp-next-${index}`;
        const prevClass = `exp-prev-${index}`;
        const paginationClass = `exp-pagination-${index}`;
        
        // Apply the unique classes to the DOM elements
        const nextBtn = swiperEl.querySelector('.exp-next');
        const prevBtn = swiperEl.querySelector('.exp-prev');
        const paginationEl = parent.querySelector('.exp-pagination');
        
        if (nextBtn) nextBtn.classList.add(nextClass);
        if (prevBtn) prevBtn.classList.add(prevClass);
        if (paginationEl) paginationEl.classList.add(paginationClass);

        new Swiper(swiperEl, {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            navigation: {
                nextEl: `.${nextClass}`,
                prevEl: `.${prevClass}`,
            },
            pagination: {
                el: `.${paginationClass}`,
                clickable: true,
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1400: { slidesPerView: 3 }
            }
        });
    });

    // 3. Testimonials Slider
    const testiSwiper = new Swiper('.testimonial-swiper', {
        slidesPerView: 3, // Show 3 stories by default
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 4000,
        },
        pagination: {
            el: '.testimonial-swiper .swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            // Ensure mobile/tablet still scale down properly
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    });
}

// --- Legacy Background Slider Fallback (For Trekking/Raigad pages) ---
const sliderImages = document.querySelectorAll('.slider-container img');
if (sliderImages.length > 1) {
    let currentSlide = 0;
    setInterval(() => {
        sliderImages[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % sliderImages.length;
        sliderImages[currentSlide].classList.add('active');
    }, 3000);
}

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

// Check for saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    icon.classList.replace('fa-moon', 'fa-sun');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    
    // Update icon
    if (isLight) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    }
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Reveal Animations on Scroll (Using Intersection Observer for performance)
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Once revealed, we can stop observing this element
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15, // Trigger when 15% of element is visible
    rootMargin: '0px 0px -50px 0px' // Slightly offset the trigger point
});

// Initialize reveal elements
const initReveals = () => {
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
};

// Re-run on DOMContentLoaded and load
window.addEventListener('DOMContentLoaded', initReveals);
window.addEventListener('load', initReveals);

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Simple Form Handling (Demo)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.submit-btn');
        const originalText = btn.innerText;
        
        btn.innerText = 'Sending...';
        btn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            btn.innerText = 'Thank You! We\'ll contact you soon.';
            btn.style.background = '#10B981'; // Success Green
            contactForm.reset();
            
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = 'var(--primary)';
                btn.disabled = false;
            }, 3000);
        }, 1500);
    });
}

// Category Card Interactions
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.zIndex = '10';
    });
    card.addEventListener('mouseleave', () => {
        card.style.zIndex = '1';
    });
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
}

// Close mobile menu when clicking a link
const navLinksItems = document.querySelectorAll('.nav-links a');
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    });
});
