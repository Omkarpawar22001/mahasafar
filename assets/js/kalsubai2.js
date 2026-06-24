// --- Splash Popup ---
(() => {
    const splash = document.createElement('div');
    splash.id = 'splash-popup';
    splash.innerHTML = '<img src="assets/mahasafar.png" alt="Welcome">';
    if (document.body) {
        document.body.insertBefore(splash, document.body.firstChild);
        document.body.style.overflow = 'hidden';
    }

    setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => {
            if (splash.parentNode) splash.parentNode.removeChild(splash);
            document.body.style.overflow = '';
        }, 500);
    }, 3000);
})();

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

    let isHidden = false;
    const hidePreloader = () => {
        if (isHidden) return;
        isHidden = true;
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

    // Hide preloader when the DOM is parsed and ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        hidePreloader();
    } else {
        document.addEventListener('DOMContentLoaded', hidePreloader);
    }

    // Safety fallback: hide preloader after 1.5 seconds under all circumstances
    setTimeout(hidePreloader, 1500);

    // Also hide on window load
    window.addEventListener('load', hidePreloader);
})();

document.addEventListener('DOMContentLoaded', () => {

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

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
        });
    }

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

    // --- Dynamic Google Maps Directions Integration ---
    const mapSection = document.getElementById('location-map');
    if (mapSection) {
        const sectionDesc = mapSection.querySelector('.section-desc');
        const mapBox = mapSection.querySelector('.location-map-box');
        const mapLink = mapSection.querySelector('.location-map-link');
        const iframe = mapSection.querySelector('.location-map-iframe');

        if (mapBox && iframe) {
            // 1. Extract destination name and clean it up
            const destinationVal = sectionDesc ? sectionDesc.textContent.trim() : 'Destination';

            // 2. Extract marker coordinates from OpenStreetMap iframe src
            let lat = '';
            let lon = '';
            const src = iframe.src;
            const markerMatch = src.match(/marker=([^&]+)/);
            if (markerMatch) {
                const coords = decodeURIComponent(markerMatch[1]).split(',');
                lat = coords[0].trim();
                lon = coords[1].trim();
            }

            if (lat && lon) {
                // 3. Replace OSM iframe with Google Maps Embed iframe
                const googleMapSrc = `https://maps.google.com/maps?q=${lat},${lon}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
                iframe.src = googleMapSrc;

                // 4. Update the "View Larger Map" link to point to Google Maps search query
                if (mapLink) {
                    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                    mapLink.innerHTML = `<i class="fas fa-map-location-dot"></i> View on Google Maps`;
                }

                // 5. Create and insert the Directions Route Form container
                const routeContainer = document.createElement('div');
                routeContainer.className = 'map-route-container glass';
                routeContainer.innerHTML = `
                    <div class="map-route-form">
                        <div class="map-input-group">
                            <label for="map-from"><i class="fas fa-location-dot"></i> From</label>
                            <div class="map-input-wrapper">
                                <input type="text" id="map-from" class="map-input" placeholder="Enter starting city/location..." autocomplete="off">
                                <div id="map-suggest-dropdown" class="map-suggest-dropdown"></div>
                            </div>
                        </div>
                        <div class="map-input-group">
                            <label for="map-to"><i class="fas fa-flag"></i> Destination</label>
                            <input type="text" id="map-to" class="map-input" value="${destinationVal}" readonly>
                        </div>
                        <button type="button" id="map-search-btn" class="map-btn">
                            <i class="fas fa-route"></i> Search
                        </button>
                    </div>
                `;

                // Insert the form container right above the map box
                mapBox.parentNode.insertBefore(routeContainer, mapBox);

                // 6. Hook up the search functionality and suggestions autocomplete
                const searchBtn = routeContainer.querySelector('#map-search-btn');
                const fromInput = routeContainer.querySelector('#map-from');
                const dropdown = routeContainer.querySelector('#map-suggest-dropdown');

                const cities = [
                    "Ahmednagar", "Alibag", "Amravati", "Aurangabad", "Bandra", "Borivali",
                    "Chhatrapati Sambhajinagar", "Dadar", "Dombivli", "Jalgaon", "Kalyan",
                    "Karjat", "Khopoli", "Kolhapur", "Lonavala", "Mumbai", "Nagpur",
                    "Nashik", "Navi Mumbai", "Panvel", "Pune", "Ratnagiri", "Sangli",
                    "Satara", "Shivajinagar", "Solapur", "Swargate", "Thane"
                ].sort();

                let highlightedIndex = -1;

                const updateHighlight = (items) => {
                    items.forEach((item, index) => {
                        if (index === highlightedIndex) {
                            item.classList.add('highlighted');
                            item.scrollIntoView({ block: 'nearest' });
                        } else {
                            item.classList.remove('highlighted');
                        }
                    });
                };

                const updateIframeMap = (fromVal) => {
                    if (fromVal) {
                        iframe.src = `https://maps.google.com/maps?saddr=${encodeURIComponent(fromVal)}&daddr=${lat},${lon}&output=embed`;
                    } else {
                        iframe.src = `https://maps.google.com/maps?q=${lat},${lon}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
                    }
                };

                const selectSuggestion = (city) => {
                    fromInput.value = city;
                    dropdown.style.display = 'none';
                    updateIframeMap(city);
                };

                const showSuggestions = (query) => {
                    dropdown.innerHTML = '';
                    let filtered = [];
                    if (!query) {
                        filtered = cities;
                    } else {
                        const lower = query.toLowerCase();
                        filtered = cities.filter(city => city.toLowerCase().includes(lower));
                    }

                    if (filtered.length > 0) {
                        if (!query) {
                            const header = document.createElement('div');
                            header.className = 'map-suggest-header';
                            header.innerText = 'All Starting Points';
                            dropdown.appendChild(header);
                        }
                        filtered.forEach((city) => {
                            const item = document.createElement('div');
                            item.className = 'map-suggest-item';
                            item.innerHTML = `<i class="fas fa-location-dot"></i> ${city}`;
                            item.dataset.value = city;
                            // Use mousedown instead of click to prevent focusout race conditions
                            item.addEventListener('mousedown', (e) => {
                                e.preventDefault(); // Prevents input focus loss
                                selectSuggestion(city);
                            });
                            dropdown.appendChild(item);
                        });
                        dropdown.style.display = 'block';
                    } else {
                        dropdown.style.display = 'none';
                    }
                    highlightedIndex = -1;
                };

                fromInput.addEventListener('focus', () => {
                    showSuggestions(fromInput.value.trim());
                });

                fromInput.addEventListener('input', () => {
                    const val = fromInput.value.trim();
                    showSuggestions(val);
                    if (!val) {
                        updateIframeMap('');
                    }
                });

                document.addEventListener('mousedown', (e) => {
                    if (!fromInput.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.style.display = 'none';
                    }
                });

                fromInput.addEventListener('keydown', (e) => {
                    const items = dropdown.querySelectorAll('.map-suggest-item');
                    if (dropdown.style.display === 'block' && items.length > 0) {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            highlightedIndex = (highlightedIndex + 1) % items.length;
                            updateHighlight(items);
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
                            updateHighlight(items);
                        } else if (e.key === 'Enter') {
                            if (highlightedIndex > -1 && highlightedIndex < items.length) {
                                e.preventDefault();
                                selectSuggestion(items[highlightedIndex].dataset.value);
                            }
                        } else if (e.key === 'Escape') {
                            dropdown.style.display = 'none';
                        }
                    }
                });

                const performSearch = () => {
                    const fromVal = fromInput.value.trim();
                    if (!fromVal) {
                        alert('Please enter your starting location.');
                        fromInput.focus();
                        return;
                    }
                    dropdown.style.display = 'none';
                    updateIframeMap(fromVal);
                    // Open Google Maps directions in a new tab
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromVal)}&destination=${lat},${lon}`;
                    window.open(directionsUrl, '_blank');
                };

                searchBtn.addEventListener('click', performSearch);
                fromInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && highlightedIndex === -1) {
                        performSearch();
                    }
                });
            }
        }
    }

    // --- Sync Dynamic Metadata from places.js ---
    if (typeof window.placesData !== 'undefined') {
        const currentPage = window.location.pathname.split('/').pop() || 'rajgad_fort.html';
        const place = window.placesData.find(p => p.link === currentPage);
        if (place) {
            // Update ratings
            const ratingEls = document.querySelectorAll('#dynamic-rating, #hero-rating-val');
            const reviewEls = document.querySelectorAll('#dynamic-reviews, #hero-reviews-val');
            
            ratingEls.forEach(el => el.textContent = place.rating.toFixed(1));
            reviewEls.forEach(el => el.textContent = place.reviewsCount);

            // Update stats
            const diffEl = document.getElementById('stat-difficulty');
            const durEl = document.getElementById('stat-duration');
            if (diffEl) diffEl.textContent = place.difficulty;
            if (durEl) durEl.textContent = place.duration;
        }
    }

});