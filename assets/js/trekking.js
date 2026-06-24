document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let allTreks = [];
    let filteredTreks = [];
    
    let searchQuery = '';
    let selectedDistrict = 'all';
    let selectedCity = 'all';
    let selectedDifficulty = 'all'; // 'all', 'easy', 'moderate', 'hard'
    let selectedCategory = 'all';    // Added category state
    let currentSort = 'popularity';
    let perPage = 24;
    let currentPage = 1;

    function getTrekCategory(trek) {
        const title = trek.title.toLowerCase();
        const link = (trek.link || '').toLowerCase();
        if (
            title.includes('temple') || 
            title.includes('jyotirlinga') || 
            title.includes('ashtavinayak') ||
            title.includes('ganpati') ||
            title.includes('vitthal') ||
            title.includes('khandoba') ||
            title.includes('shani') ||
            link.includes('temple') ||
            link.includes('ashtavinayak') ||
            link.includes('mahalaxmi') ||
            link.includes('grishneshwar')
        ) {
            return 'temples';
        } else if (title.includes('camp') || title.includes('camping') || title.includes('lakeside')) {
            return 'camping';
        } else if (title.includes('waterfall') || title.includes('fall') || title.includes('falls')) {
            return 'waterfalls';
        } else {
            return 'treks';
        }
    }

    // --- DOM Elements ---
    const gridContainer = document.querySelector('.cards-results-grid');
    const paginationContainer = document.querySelector('.pagination-container-v8');
    
    const searchInput = document.querySelector('.search-input');
    const districtSelect = document.getElementById('sidebar-district-select');
    const sortSelect = document.getElementById('sidebar-sort-select');
    const perPageSelect = document.getElementById('sidebar-per-page-select');
    const difficultySelect = document.getElementById('sidebar-difficulty-select');
    const citySelect = document.getElementById('sidebar-city-select');
    
    const diffTags = document.querySelectorAll('.diff-tag');
    const resetFiltersBtn = document.querySelector('.clear-filters');
    
    // Add container for active filter chips right before the grid container
    const mainResultsCol = document.querySelector('.listing-main');
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'active-filters-container';
    if (mainResultsCol && gridContainer) {
        mainResultsCol.insertBefore(chipsContainer, gridContainer);
    }

    // Read query parameters from URL on load
    const urlParams = new URLSearchParams(window.location.search);
    const urlCity = urlParams.get('city');
    const urlDistrict = urlParams.get('district');
    const urlCategory = urlParams.get('category');
    const urlSearch = urlParams.get('search');

    if (urlCity) {
        selectedCity = urlCity.toLowerCase();
        if (citySelect) {
            citySelect.value = selectedCity;
        }
    }
    if (urlDistrict) {
        selectedDistrict = urlDistrict.toLowerCase();
        if (districtSelect) {
            districtSelect.value = selectedDistrict;
        }
    }
    if (urlCategory) {
        selectedCategory = urlCategory.toLowerCase();
    }
    if (urlSearch) {
        searchQuery = urlSearch.toLowerCase().trim();
        if (searchInput) {
            searchInput.value = urlSearch;
        }
    }

    // --- Load Data ---
    if (typeof window.placesData !== 'undefined') {
        allTreks = window.placesData;
        setupDifficultyTags();
        applyFiltersAndRender();
    } else {
        console.error('Failed to load places data: window.placesData is undefined');
        renderErrorMsg();
    }

    function renderErrorMsg() {
        if (gridContainer) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--primary); margin-bottom: 15px;"></i>
                    <p>Unable to load trekking adventures at this time. Please check back later.</p>
                </div>
            `;
        }
    }

    // --- Setup Difficulty Tags ---
    function setupDifficultyTags() {
        // Tag 1 (Easy), Tag 2 (Moderate), Tag 3 (Hard)
        const diffGroups = ['easy', 'moderate', 'hard'];
        diffTags.forEach((tag, idx) => {
            const group = diffGroups[idx];
            tag.setAttribute('data-diff', group);
            
            // Override static click listener
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (selectedDifficulty === group) {
                    // Toggle off if clicking the currently active one
                    selectedDifficulty = 'all';
                    tag.classList.remove('active');
                } else {
                    selectedDifficulty = group;
                    diffTags.forEach(t => t.classList.remove('active'));
                    tag.classList.add('active');
                }
                
                currentPage = 1;
                applyFiltersAndRender();
            });
        });
    }

    function updateHeroSection() {
        const metadata = {
            'all': {
                heading: '<span class="gradient-text">ALL PLACES</span>',
                breadcrumb: 'All Places',
                image: 'assets/hero.png'
            },
            'treks': {
                heading: '<span class="gradient-text">TREKKING</span>',
                breadcrumb: 'Treks',
                image: 'assets/trekking.png'
            },
            'temples': {
                heading: '<span class="gradient-text">TEMPLES</span>',
                breadcrumb: 'Temples',
                image: 'assets/bhimashankar_hero.png'
            },
            'camping': {
                heading: '<span class="gradient-text">CAMPING</span>',
                breadcrumb: 'Camping',
                image: 'assets/camping.png'
            },
            'waterfalls': {
                heading: '<span class="gradient-text">WATERFALLS</span>',
                breadcrumb: 'Waterfalls',
                image: 'assets/waterfalls.png'
            }
        };

        const currentMeta = metadata[selectedCategory] || metadata['all'];
        
        const heroImg = document.querySelector('.slider-container img');
        const heroHeading = document.querySelector('.hero-content h1');
        const breadcrumbActive = document.querySelector('.breadcrumb-list .breadcrumb-item:last-child');
        
        if (heroImg) {
            heroImg.src = currentMeta.image;
            heroImg.alt = currentMeta.breadcrumb;
        }
        if (heroHeading) {
            heroHeading.innerHTML = currentMeta.heading;
        }
        if (breadcrumbActive) {
            breadcrumbActive.textContent = currentMeta.breadcrumb;
        }
    }

    // --- Filtering & Sorting Logic ---
    function applyFiltersAndRender() {
        updateHeroSection();
        // 1. Filter
        filteredTreks = allTreks.filter(trek => {
            // Search Query Filter
            const matchesSearch = searchQuery === '' || 
                trek.title.toLowerCase().includes(searchQuery) ||
                trek.description.toLowerCase().includes(searchQuery);
                
            // District Filter
            const matchesDistrict = selectedDistrict === 'all' || 
                trek.district.toLowerCase() === selectedDistrict;
                
            // City Filter
            const matchesCity = selectedCity === 'all' || 
                trek.city.toLowerCase() === selectedCity;
                
            // Difficulty Filter
            const matchesDifficulty = selectedDifficulty === 'all' || 
                trek.difficultyGroup.toLowerCase() === selectedDifficulty;
                
            // Category Filter
            const matchesCategory = selectedCategory === 'all' || 
                getTrekCategory(trek).toLowerCase() === selectedCategory;
                
            return matchesSearch && matchesDistrict && matchesCity && matchesDifficulty && matchesCategory;
        });

        // 2. Sort
        sortFilteredTreks();

        // 3. Update Sidebar Counts & UI Elements
        updateDifficultyCounts();
        renderActiveFilterChips();

        // 4. Render Grid & Pagination
        renderGrid();
        renderPagination();
    }

    function sortFilteredTreks() {
        const difficultyPriority = {
            'easy': 1,
            'moderate': 2,
            'hard': 3,
            'extreme': 4
        };

        filteredTreks.sort((a, b) => {
            if (currentSort === 'popularity') {
                return b.reviewsCount - a.reviewsCount; // More reviews = more popular
            } else if (currentSort === 'rating') {
                return b.rating - a.rating; // Top rated first
            } else if (currentSort === 'difficulty-asc') {
                const pA = difficultyPriority[a.difficultyGroup.toLowerCase()] || 0;
                const pB = difficultyPriority[b.difficultyGroup.toLowerCase()] || 0;
                return pA - pB;
            } else if (currentSort === 'difficulty-desc') {
                const pA = difficultyPriority[a.difficultyGroup.toLowerCase()] || 0;
                const pB = difficultyPriority[b.difficultyGroup.toLowerCase()] || 0;
                return pB - pA;
            } else if (currentSort === 'budget') {
                return a.price - b.price; // Lowest price first
            }
            return 0;
        });
    }

    // --- Update Difficulty Counts Dynamically ---
    function updateDifficultyCounts() {
        // Count how many matching items exist for each difficulty,
        // ignoring the current difficulty filter itself (so user sees potential matches)
        const counts = { easy: 0, moderate: 0, hard: 0 };
        
        allTreks.forEach(trek => {
            const matchesSearch = searchQuery === '' || 
                trek.title.toLowerCase().includes(searchQuery) ||
                trek.description.toLowerCase().includes(searchQuery);
            const matchesDistrict = selectedDistrict === 'all' || 
                trek.district.toLowerCase() === selectedDistrict;
            const matchesCity = selectedCity === 'all' || 
                trek.city.toLowerCase() === selectedCity;
                
            if (matchesSearch && matchesDistrict && matchesCity) {
                const group = trek.difficultyGroup.toLowerCase();
                if (counts[group] !== undefined) {
                    counts[group]++;
                }
            }
        });

        diffTags.forEach(tag => {
            const group = tag.getAttribute('data-diff');
            const countEl = tag.querySelector('.count');
            if (countEl && counts[group] !== undefined) {
                countEl.textContent = counts[group];
            }
        });
    }

    // --- Render Active Filter Chips ---
    function renderActiveFilterChips() {
        chipsContainer.innerHTML = '';
        
        const activeChips = [];
        
        if (searchQuery !== '') {
            activeChips.push({
                type: 'search',
                label: `Search: "${searchQuery}"`,
                clearFn: () => {
                    searchQuery = '';
                    searchInput.value = '';
                }
            });
        }
        
        if (selectedDistrict !== 'all') {
            const districtText = districtSelect.options[districtSelect.selectedIndex].text;
            activeChips.push({
                type: 'district',
                label: districtText,
                clearFn: () => {
                    selectedDistrict = 'all';
                    districtSelect.value = 'all';
                }
            });
        }
        
        if (selectedCity !== 'all') {
            const cityText = citySelect ? citySelect.options[citySelect.selectedIndex].text : selectedCity;
            activeChips.push({
                type: 'city',
                label: `City: ${cityText.charAt(0).toUpperCase() + cityText.slice(1)}`,
                clearFn: () => {
                    selectedCity = 'all';
                    if (citySelect) {
                        citySelect.value = 'all';
                    }
                }
            });
        }
        
        if (selectedDifficulty !== 'all') {
            const diffText = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
            activeChips.push({
                type: 'difficulty',
                label: `Difficulty: ${diffText}`,
                clearFn: () => {
                    selectedDifficulty = 'all';
                    diffTags.forEach(t => t.classList.remove('active'));
                }
            });
        }

        if (selectedCategory !== 'all') {
            const catText = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
            activeChips.push({
                type: 'category',
                label: `Category: ${catText}`,
                clearFn: () => {
                    selectedCategory = 'all';
                }
            });
        }

        if (activeChips.length > 0) {
            activeChips.forEach(chip => {
                const chipEl = document.createElement('div');
                chipEl.className = 'filter-chip';
                chipEl.innerHTML = `${chip.label} <i class="fas fa-times"></i>`;
                chipEl.addEventListener('click', () => {
                    chip.clearFn();
                    currentPage = 1;
                    applyFiltersAndRender();
                });
                chipsContainer.appendChild(chipEl);
            });
            
            // Add a Clear All chip
            const clearAllEl = document.createElement('div');
            clearAllEl.className = 'filter-chip';
            clearAllEl.style.background = 'rgba(255, 59, 48, 0.1)';
            clearAllEl.style.borderColor = 'rgba(255, 59, 48, 0.2)';
            clearAllEl.style.color = '#ff3b30';
            clearAllEl.innerHTML = `Clear All <i class="fas fa-trash-can" style="color: #ff3b30;"></i>`;
            clearAllEl.addEventListener('click', () => {
                resetAllFilters();
            });
            chipsContainer.appendChild(clearAllEl);
        }
    }

    // --- Render Cards Grid ---
    function renderGrid() {
        if (!gridContainer) return;
        gridContainer.innerHTML = '';
        
        if (filteredTreks.length === 0) {
            gridContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="fas fa-search-minus" style="font-size: 3rem; color: var(--primary); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--text-main); font-size: 1.2rem; margin-bottom: 10px;">No Adventures Match Your Filters</h3>
                    <p style="font-size: 0.9rem; margin-bottom: 25px; max-width: 400px; margin-left: auto; margin-right: auto;">We couldn't find any tours matching those specifications. Try relaxing your filters or resetting.</p>
                    <button class="btn-v8" id="no-results-reset-btn" style="margin: 0 auto; display: inline-flex;">Reset All Filters</button>
                </div>
            `;
            const innerReset = document.getElementById('no-results-reset-btn');
            if (innerReset) {
                innerReset.addEventListener('click', resetAllFilters);
            }
            return;
        }

        // Pagination calculation
        let start = 0;
        let end = filteredTreks.length;
        
        if (perPage !== 'all') {
            const limit = parseInt(perPage);
            start = (currentPage - 1) * limit;
            end = Math.min(start + limit, filteredTreks.length);
        }

        const pageItems = filteredTreks.slice(start, end);

        pageItems.forEach(trek => {
            const card = document.createElement('div');
            card.className = 'luxury-card-v8';
            const isPopular = (trek.tags || '').split(',').includes('popular');
            const ribbonHTML = isPopular ? `
                <div class="gift-wrap-v8">
                    <div class="ribbon-v8">Popular</div>
                    <div class="gift-bow-v8">
                        <span class="loop-l"></span>
                        <span class="loop-r"></span>
                        <span class="knot"></span>
                    </div>
                </div>
            ` : '';
            card.innerHTML = `
                <div class="card-image-v8">
                    <img src="${trek.image}" alt="${trek.imageAlt}">
                    ${ribbonHTML}
                    <div class="card-badges-v8">
                        <span class="badge-v8">${trek.difficulty}</span>
                        <span class="badge-v8">${trek.duration}</span>
                    </div>
                </div>
                <div class="card-body-v8">
                    <div class="card-meta-v8">
                        <div class="card-rating-v8">
                            <i class="fas fa-star"></i>
                            <span>${trek.rating.toFixed(1)} (${trek.reviewsCount})</span>
                        </div>
                    </div>
                    <h3>${trek.title}</h3>
                    <p>${trek.description}</p>
                    <div class="card-footer-v8">
                        <a href="${trek.link}" class="btn-v8">View Details <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            `;
            gridContainer.appendChild(card);
        });

        // Trigger reveal observer for the newly loaded items
        if (window.initReveals) {
            window.initReveals();
        }
    }

    // --- Render Pagination ---
    function renderPagination() {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';

        if (perPage === 'all' || filteredTreks.length <= perPage) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';
        const limit = parseInt(perPage);
        const totalPages = Math.ceil(filteredTreks.length / limit);

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.className = `page-btn-v8 ${currentPage === i ? 'active' : ''}`;
            pageLink.textContent = i;
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                applyFiltersAndRender();
                // Smooth scroll to top of listing main column
                const targetScroll = document.querySelector('.listing-main');
                if (targetScroll) {
                    window.scrollTo({
                        top: targetScroll.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
            paginationContainer.appendChild(pageLink);
        }

        // Add a Next button if not on the last page
        if (currentPage < totalPages) {
            const nextLink = document.createElement('a');
            nextLink.href = '#';
            nextLink.className = 'page-btn-v8';
            nextLink.innerHTML = `<i class="fas fa-chevron-right" style="font-size:0.75rem;"></i>`;
            nextLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage++;
                applyFiltersAndRender();
                const targetScroll = document.querySelector('.listing-main');
                if (targetScroll) {
                    window.scrollTo({
                        top: targetScroll.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
            paginationContainer.appendChild(nextLink);
        }
    }

    // --- Reset All Filters ---
    function resetAllFilters() {
        searchQuery = '';
        selectedDistrict = 'all';
        selectedCity = 'all';
        selectedDifficulty = 'all';
        selectedCategory = 'all';
        currentSort = 'popularity';
        perPage = 24;
        currentPage = 1;

        if (searchInput) searchInput.value = '';
        if (districtSelect) districtSelect.value = 'all';
        if (citySelect) citySelect.value = 'all';
        if (sortSelect) sortSelect.value = 'popularity';
        if (perPageSelect) perPageSelect.value = '24';
        
        diffTags.forEach(t => t.classList.remove('active'));

        applyFiltersAndRender();
    }

    // --- Event Listeners ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            currentPage = 1;
            applyFiltersAndRender();
        });
    }

    if (districtSelect) {
        districtSelect.addEventListener('change', (e) => {
            selectedDistrict = e.target.value;
            currentPage = 1;
            applyFiltersAndRender();
        });
    }

    if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
            selectedDifficulty = e.target.value;
            currentPage = 1;
            applyFiltersAndRender();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndRender();
        });
    }

    if (perPageSelect) {
        perPageSelect.addEventListener('change', (e) => {
            perPage = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
            currentPage = 1;
            applyFiltersAndRender();
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetAllFilters();
        });
    }
});
