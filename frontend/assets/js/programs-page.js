/**
 * Programs Page JavaScript
 * Features: Filter, Search, Countdown Timers, Featured Carousel, Application Assistant, Comparison
 */

(function () {
  'use strict';

  // State
  let programs = [];
  let filteredPrograms = [];
  let currentCarouselIndex = 0;
  let currentApplicationProgram = null;
  let currentStep = 0;
  let selectedPrograms = new Set(); // Track selected programs for comparison

  // DOM Elements
  const elements = {
    grid: document.getElementById('programsGrid'),
    searchInput: document.querySelector('.sidebar-search-input'), // Updated selector
    // Mobile search fallback
    mobileSearchInput: document.getElementById('programSearch'),

    resultsCount: document.getElementById('resultsCount'),
    noResults: document.getElementById('noResults'),
    sortSelect: document.getElementById('sortSelect'),
    clearFilters: document.getElementById('clearFilters'),
    clearFiltersEmpty: document.getElementById('clearFiltersEmpty'),
    filterSidebar: document.getElementById('filterSidebar'),

    // New Elements
    durationSlider: document.getElementById('durationSlider'),
    durationValue: document.getElementById('durationValue'),
    comparisonPanel: document.getElementById('comparisonPanel'),
    comparisonList: document.getElementById('comparisonList'),
    compareBtn: document.getElementById('compareBtn'),
    quickFilters: document.getElementById('quickFilters'),

    // Existing Elements
    carouselTrack: document.getElementById('carouselTrack'),
    carouselPrev: document.getElementById('carouselPrev'),
    carouselNext: document.getElementById('carouselNext'),
    carouselDots: document.getElementById('carouselDots'),
    applicationModal: document.getElementById('applicationModal'),
    applicationBody: document.getElementById('applicationBody'),
    closeApplication: document.getElementById('closeApplication'),
    prevStep: document.getElementById('prevStep'),
    nextStep: document.getElementById('nextStep'),
    stepIndicator: document.getElementById('stepIndicator'),
  };

  // Initialize
  async function init() {
    await loadPrograms();
    setupEventListeners();
    applyFilters(); // Initial render
    renderFeaturedCarousel();
    startCountdownTimers();

    // Load saved comparison state
    const saved = localStorage.getItem('brainex_compare_programs');
    if (saved) {
      try {
        JSON.parse(saved).forEach(id => selectedPrograms.add(id));
        updateComparisonPanel();
      } catch (e) { }
    }
  }

  // Load programs data
  async function loadPrograms() {
    try {
      let response;
      try {
        // Try API first
        response = await fetch('/api/programs');
        if (!response.ok) throw new Error('API not available');
        programs = await response.json();
      } catch {
        try {
          // Fallback to static JSON
          response = await fetch('/data/programs.json');
          if (!response.ok) throw new Error('Static data not found');
          programs = await response.json();
        } catch (e) {
          console.error('All fetch attempts failed:', e);
          // Fallback data for demo
          programs = getDemoPrograms();
        }
      }
      console.log(`Loaded ${programs.length} programs`);
      filteredPrograms = [...programs];
    } catch (error) {
      console.error('Error loading programs:', error);
      showError();
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // Search inputs
    const handleSearch = debounce(() => applyFilters(), 300);
    if (elements.searchInput) elements.searchInput.addEventListener('input', handleSearch);
    if (elements.mobileSearchInput) elements.mobileSearchInput.addEventListener('input', handleSearch);

    // Sort
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', applyFilters);
    }

    // Clear filters
    if (elements.clearFilters) {
      elements.clearFilters.addEventListener('click', resetAllFilters);
    }
    if (elements.clearFiltersEmpty) {
      elements.clearFiltersEmpty.addEventListener('click', resetAllFilters);
    }

    // Duration Slider
    if (elements.durationSlider) {
      elements.durationSlider.addEventListener('input', (e) => {
        elements.durationValue.textContent = e.target.value;
        applyFilters();
      });
    }

    // Degree Badges
    document.querySelectorAll('.degree-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.target.classList.toggle('active');
        applyFilters();
      });
    });

    // Language checkboxes
    document.querySelectorAll('.language-option input').forEach(input => {
      input.addEventListener('change', applyFilters);
    });

    // Quick Filters
    if (elements.quickFilters) {
      elements.quickFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.quick-filter-pill');
        if (!btn) return;

        // Toggle active state
        btn.classList.toggle('active');
        applyFilters();
      });
    }

    // View Toggle
    document.querySelectorAll('.view-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-button').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const view = e.currentTarget.dataset.view;
        elements.grid.className = `programs-grid ${view === 'list' ? 'list-view' : ''}`;
      });
    });

    // Carousel
    if (elements.carouselPrev) elements.carouselPrev.addEventListener('click', () => moveCarousel(-1));
    if (elements.carouselNext) elements.carouselNext.addEventListener('click', () => moveCarousel(1));

    // Application Modal
    if (elements.closeApplication) elements.closeApplication.addEventListener('click', closeApplicationModal);
    if (elements.prevStep) elements.prevStep.addEventListener('click', () => navigateStep(-1));
    if (elements.nextStep) elements.nextStep.addEventListener('click', () => navigateStep(1));
    if (elements.applicationModal) {
      elements.applicationModal.addEventListener('click', (e) => {
        if (e.target === elements.applicationModal) closeApplicationModal();
      });
    }

    // Comparison UI
    if (elements.compareBtn) {
      elements.compareBtn.addEventListener('click', showComparisonModal);
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeApplicationModal();
        const modal = document.getElementById('comparisonModal');
        if (modal) modal.style.display = 'none';
      }
    });
  }

  // Get current filter values
  function getFilters() {
    const filters = {
      search: elements.searchInput?.value?.toLowerCase() || elements.mobileSearchInput?.value?.toLowerCase() || '',
      degrees: [],
      durationMax: parseInt(elements.durationSlider?.value || 6),
      languages: [],
      quickFilters: []
    };

    // Degree badges
    document.querySelectorAll('.degree-badge.active').forEach(b => filters.degrees.push(b.dataset.value));

    // Languages
    document.querySelectorAll('.language-option input:checked').forEach(i => filters.languages.push(i.value));

    // Quick Filters
    document.querySelectorAll('.quick-filter-pill.active').forEach(b => filters.quickFilters.push(b.dataset.filter));

    return filters;
  }

  // Apply filters and render
  function applyFilters() {
    const filters = getFilters();

    filteredPrograms = programs.filter((prog) => {
      // Search
      if (filters.search) {
        const searchStr = `${prog.name} ${prog.organization} ${prog.description || ''}`.toLowerCase();
        if (!searchStr.includes(filters.search)) return false;
      }

      // Degree
      if (filters.degrees.length > 0) {
        if (!filters.degrees.includes(prog.degree)) return false;
      }

      // Duration (Simplified parsing)
      if (prog.durationValue && prog.durationValue > filters.durationMax) return false;

      // Language
      if (filters.languages.length > 0) {
        // Assuming prog.language is a string, check if it matches any selected
        if (!filters.languages.includes(prog.language || 'English')) return false;
      }

      // Quick Filters Logic
      if (filters.quickFilters.length > 0) {
        for (const qf of filters.quickFilters) {
          if (qf === 'available-now') {
            if (new Date(prog.deadline) < new Date()) return false;
          }
          if (qf === 'full-funding') {
            if (prog.cost > 0) return false;
          }
          if (qf === 'online') {
            if (prog.mode !== 'Online') return false;
          }
          if (qf === 'part-time') {
            if (prog.studyType !== 'Part-time') return false;
          }
        }
      }

      return true;
    });

    // Sort
    const sortBy = elements.sortSelect?.value || 'relevance';
    sortPrograms(sortBy);

    // Render
    renderPrograms();
    updateResultsCount();
  }

  // Sort programs
  function sortPrograms(sortBy) {
    filteredPrograms.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'tuition-low':
          return (a.cost || 0) - (b.cost || 0);
        case 'tuition-high':
          return (b.cost || 0) - (a.cost || 0);
        case 'year':
          return (a.durationValue || 0) - (b.durationValue || 0);
        default: // Relevance (Newest first)
          return 0; // Keep original order or shuffle
      }
    });
  }

  // Render programs grid
  function renderPrograms() {
    if (!elements.grid) return;

    if (filteredPrograms.length === 0) {
      elements.grid.innerHTML = '';
      if (elements.noResults) elements.noResults.style.display = 'block';
      return;
    }

    if (elements.noResults) elements.noResults.style.display = 'none';

    elements.grid.innerHTML = filteredPrograms.map(prog => createProgramCard(prog)).join('');

    // Bind Comparison Checkboxes
    elements.grid.querySelectorAll('.compare-checkbox input').forEach(cb => {
      cb.addEventListener('change', (e) => toggleComparison(e.target.dataset.id, e.target.checked));
    });

    // Bind Apply Guide Buttons
    elements.grid.querySelectorAll('.btn-guide').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Reuse existing application guide logic if needed, or link to details
        // For now, let's just log or open details
        const id = e.target.closest('.btn-guide').dataset.id;
        console.log("View details for", id);
      });
    });
  }

  function createProgramCard(prog) {
    const isCompare = selectedPrograms.has(String(prog.id));

    // Calculate deadline status
    const deadlineDiff = new Date(prog.deadline) - new Date();
    const daysLeft = Math.ceil(deadlineDiff / (1000 * 60 * 60 * 24));
    let deadlineClass = 'normal';
    let deadlineText = `Deadline: ${new Date(prog.deadline).toLocaleDateString()}`;

    if (daysLeft < 0) {
      deadlineClass = 'expired';
      deadlineText = 'Application Closed';
    } else if (daysLeft < 30) {
      deadlineClass = 'urgent';
      deadlineText = `🔥 Ends in ${daysLeft} days!`;
    } else if (daysLeft < 90) {
      deadlineClass = 'soon';
      deadlineText = `⏰ Ends in ${Math.round(daysLeft / 30)} months`;
    }

    // Requirements
    const reqs = prog.requirements || ['GPA 3.0+', 'Toefl 80+'];

    return `
      <div class="program-card ${prog.competitive ? 'competitive' : ''} fade-in">
        <div class="compare-checkbox">
            <input type="checkbox" data-id="${prog.id}" ${isCompare ? 'checked' : ''} title="Compare">
        </div>

        <div class="card-header">
            <div>
                <span class="card-degree">${prog.degree || 'Certificate'}</span>
                <div class="university-name">${prog.organization}</div>
            </div>
            <img src="${prog.logo || '/assets/images/university-placeholder.png'}" 
                 class="university-logo" 
                 alt="${prog.organization}"
                 onerror="this.src='https://via.placeholder.com/50?text=UNI'">
        </div>
        
        <h3 class="program-title">${prog.name}</h3>
        
        <div class="program-meta">
            <div class="meta-item"><i class="far fa-clock"></i> ${prog.duration || 'Flexible'}</div>
            <div class="meta-item"><i class="fas fa-globe"></i> ${prog.language || 'English'}</div>
            <div class="meta-item"><i class="fas fa-laptop"></i> ${prog.mode || 'On-campus'}</div>
        </div>
        
        <div class="program-tuition">
            ${prog.cost === 0 ? 'Free' : '$' + (prog.cost || 0).toLocaleString()} <span>/ program</span>
        </div>
        
        <div class="program-requirements">
            ${reqs.slice(0, 3).map(r => `<span class="req-pill">${r}</span>`).join('')}
        </div>
        
        <div class="deadline-info ${deadlineClass}">
            ${deadlineText}
        </div>

        <div class="card-actions">
             <!-- Using existing openApplicationGuide logic if 'btn-guide' is present -->
            <button class="btn-apply" onclick="window.open('${prog.website || '#'}', '_blank')">Apply Now</button>
        </div>
      </div>
    `;
  }

  function updateResultsCount() {
    if (elements.resultsCount) elements.resultsCount.textContent = filteredPrograms.length;
  }

  // Comparison Logic
  function toggleComparison(id, checked) {
    if (checked) {
      if (selectedPrograms.size >= 4) {
        alert("You can compare up to 4 programs.");
        // Uncheck the box
        const cb = document.querySelector(`.compare-checkbox input[data-id="${id}"]`);
        if (cb) cb.checked = false;
        return;
      }
      selectedPrograms.add(String(id));
    } else {
      selectedPrograms.delete(String(id));
    }

    // Update LocalStorage
    localStorage.setItem('brainex_compare_programs', JSON.stringify(Array.from(selectedPrograms)));

    updateComparisonPanel();
  }

  function updateComparisonPanel() {
    const panel = elements.comparisonPanel;
    const list = elements.comparisonList;
    const btn = elements.compareBtn;

    if (selectedPrograms.size > 0) {
      panel.classList.add('active');
      btn.innerText = `Compare (${selectedPrograms.size})`;

      list.innerHTML = Array.from(selectedPrograms).map(id => {
        const prog = programs.find(p => String(p.id) === String(id));
        if (!prog) return '';
        return `
                <div class="compare-thumb">
                    <img src="${prog.logo || '/assets/images/university-placeholder.png'}" onerror="this.src='https://via.placeholder.com/50'">
                    <div class="remove-thumb" data-id="${id}">×</div>
                </div>
             `;
      }).join('');

      // Bind remove buttons
      list.querySelectorAll('.remove-thumb').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
          toggleComparison(e.target.dataset.id, false);
          // Also uncheck in grid if visible
          const cb = document.querySelector(`.compare-checkbox input[data-id="${e.target.dataset.id}"]`);
          if (cb) cb.checked = false;
        });
      });

    } else {
      panel.classList.remove('active');
    }
  }

  // ========================================
  // Comparison Modal (New Version)
  // ========================================
  function showComparisonModal() {
    const selectedIds = Array.from(selectedPrograms);
    if (selectedIds.length === 0) return;

    const items = selectedIds.map(id => programs.find(p => String(p.id) === String(id))).filter(Boolean);

    // Construct Modal HTML
    let modal = document.getElementById('comparisonModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'comparisonModal';
      modal.className = 'modal';
      modal.style.cssText = 'display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000;';
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });
    }

    modal.innerHTML = `
        <div class="modal-content" style="background: white; border-radius: 16px; width: 95%; max-width: 1200px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; padding: 0;">
            <div class="modal-header" style="padding: 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: white;">
                <h2>Compare Programs</h2>
                <button class="close-modal" id="closeCompareModal" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            
            <div class="comparison-table-wrapper" style="overflow: auto; flex: 1; padding: 24px;">
                <table style="width: 100%; border-collapse: collapse; min-width: 800px;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 12px; width: 200px; color: #718096;">Feature</th>
                            ${items.map(p => `
                                <th style="text-align: left; padding: 12px; min-width: 250px;">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                        <img src="${p.logo}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 50%;">
                                        <div style="font-weight: 700;">${p.name}</div>
                                    </div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding: 12px; font-weight: 600;">Cost</td>${items.map(p => `<td style="padding: 12px;">$${(p.cost || 0).toLocaleString()}</td>`).join('')}</tr>
                        <tr><td style="padding: 12px; font-weight: 600;">Duration</td>${items.map(p => `<td style="padding: 12px;">${p.duration}</td>`).join('')}</tr>
                        <tr><td style="padding: 12px; font-weight: 600;">Deadline</td>${items.map(p => `<td style="padding: 12px;">${new Date(p.deadline).toLocaleDateString()}</td>`).join('')}</tr>
                        <tr><td style="padding: 12px; font-weight: 600;">Location</td>${items.map(p => `<td style="padding: 12px;">${p.location}</td>`).join('')}</tr>
                        <tr><td style="padding: 12px; font-weight: 600;">Degree</td>${items.map(p => `<td style="padding: 12px;">${p.degree || '-'}</td>`).join('')}</tr>
                        <tr><td style="padding: 12px; font-weight: 600;">Action</td>${items.map(p => `<td style="padding: 12px;"><a href="${p.website}" target="_blank" class="btn-apply" style="display:inline-block; font-size: 14px; padding: 8px 16px;">Apply</a></td>`).join('')}</tr>
                    </tbody>
                </table>
            </div>
        </div>
      `;

    modal.style.display = 'flex';
    document.getElementById('closeCompareModal').onclick = () => modal.style.display = 'none';
  }

  // ========================================
  // Remaining Utilities (Carousel, Assistant)
  // ========================================

  function resetAllFilters() {
    // Clear all inputs
    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.durationSlider) {
      elements.durationSlider.value = 6;
      elements.durationValue.textContent = '6';
    }
    document.querySelectorAll('.degree-badge').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.language-option input').forEach(i => i.checked = false);
    document.querySelector('.language-option input[value="English"]').checked = true; // Default
    document.querySelectorAll('.quick-filter-pill').forEach(b => b.classList.remove('active'));

    applyFilters();
  }

  function startCountdownTimers() {
    setInterval(() => {
      // Update any visible countdowns (if any)
      document.querySelectorAll('.countdown-container').forEach(el => {
        const deadline = el.dataset.deadline;
        el.innerHTML = `
                  <div class="countdown-label">Deadline</div>
                  ${renderCountdownTimer(deadline)}
              `;
      });
    }, 60000);
  }

  function renderCountdownTimer(deadline) {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    if (diff <= 0) return `<div class="countdown-expired">Deadline Passed</div>`;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `
            <div class="countdown-timer">
                <div class="countdown-unit">
                    <span class="countdown-value">${days}</span>
                    <span class="countdown-text">Days</span>
                </div>
                <div class="countdown-unit">
                    <span class="countdown-value">${hours}</span>
                    <span class="countdown-text">Hrs</span>
                </div>
            </div>
        `;
  }

  // --- Carousel Logic (Preserved) ---
  function renderFeaturedCarousel() {
    const featured = programs.filter((p) => p.featured);
    if (!elements.carouselTrack || featured.length === 0) return;

    elements.carouselTrack.innerHTML = featured.map(prog => `
        <div class="featured-card">
            <span class="featured-badge">⭐ Featured</span>
            <div class="program-organization">${prog.organization}</div>
            <h3 class="program-name">${prog.shortName || prog.name}</h3>
            <div class="program-meta">
                <span>📍 ${prog.location}</span>
                <span>⏱️ ${prog.duration}</span>
            </div>
            <div class="countdown-container" data-deadline="${prog.deadline}">
                <div class="countdown-label">Deadline</div>
                ${renderCountdownTimer(prog.deadline)}
            </div>
             <div class="card-actions" style="margin-top: 16px;">
                <button class="btn-apply" onclick="window.open('${prog.website}', '_blank')">View Program</button>
            </div>
        </div>
    `).join('');

    // Add dots
    if (elements.carouselDots) {
      const numDots = Math.ceil(featured.length / 3); // 3 items per slide roughly
      elements.carouselDots.innerHTML = Array(numDots).fill(0).map((_, i) =>
        `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
      ).join('');

      elements.carouselDots.querySelectorAll('.carousel-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          currentCarouselIndex = parseInt(dot.dataset.index);
          updateCarousel();
        });
      });
    }
  }

  function moveCarousel(dir) {
    if (!elements.carouselTrack) return;
    const featured = programs.filter(p => p.featured);
    // Logic assumes 3 items view
    const maxIndex = Math.ceil(featured.length / 3) - 1;
    currentCarouselIndex = Math.max(0, Math.min(maxIndex, currentCarouselIndex + dir));
    updateCarousel();
  }

  function updateCarousel() {
    if (!elements.carouselTrack) return;
    // Fixed width for demo
    const cardWidth = 350 + 24;
    elements.carouselTrack.style.transform = `translateX(-${currentCarouselIndex * cardWidth * 3}px)`;
    elements.carouselDots?.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === currentCarouselIndex));
  }

  // --- Application Assistant (Preserved/Simplified) ---
  function openApplicationGuide(id) {
    // Kept for compatibility if we wire it back up
    console.log("Open guide for", id);
  }

  function closeApplicationModal() {
    if (elements.applicationModal) elements.applicationModal.style.display = 'none';
    document.body.style.overflow = '';
    const modal = document.getElementById('comparisonModal');
    if (modal) modal.style.display = 'none';
  }

  function navigateStep(dir) { /* ... */ }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  function getDemoPrograms() {
    return [
      {
        "id": "p1",
        "name": "Summer Science Program",
        "shortName": "SSP",
        "organization": "SSP International",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/2/24/SSP_Logo.png",
        "description": "A 39-day residential enrichment program designed to challenge and inspire talented high school juniors.",
        "type": "Research",
        "category": "STEM",
        "location": "Various Campuses",
        "locationType": "Residential",
        "duration": "5 weeks",
        "durationValue": 0.1,
        "cost": 6950,
        "costLabel": "$6,950",
        "financialAid": "Generous need-based aid",
        "deadline": "2025-03-03T23:59:59Z",
        "startDate": "2025-06-16",
        "ageMin": 15,
        "ageMax": 18,
        "requirements": ["Transcripts", "Test Scores", "2 Recommendations"],
        "acceptanceRate": 10,
        "website": "https://summerscience.org",
        "featured": true,
        "competitive": true,
        "degree": "Certificate"
      },
      {
        "id": "p2",
        "name": "Management & Technology Summer Institute",
        "shortName": "M&TSI",
        "organization": "University of Pennsylvania",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/University_of_Pennsylvania_shield.svg/1200px-University_of_Pennsylvania_shield.svg.png",
        "description": "A rigorous for-credit summer program for rising seniors who want to explore the integration of technological concepts and management principles.",
        "type": "Academic",
        "category": "Business & Tech",
        "location": "Philadelphia, PA",
        "locationType": "Residential",
        "duration": "3 weeks",
        "durationValue": 0.1,
        "cost": 9000,
        "costLabel": "$9,000",
        "deadline": "2025-02-01T23:59:59Z",
        "startDate": "2025-07-07",
        "ageMin": 16,
        "ageMax": 18,
        "requirements": ["High GPA", "Essays", "Leadership"],
        "acceptanceRate": 15,
        "website": "https://fisher.wharton.upenn.edu/mtsi/",
        "featured": true,
        "competitive": true,
        "degree": "Certificate"
      },
      {
        "id": "p3",
        "name": "Introduction to Computer Science",
        "shortName": "CS101",
        "organization": "Stanford University",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/1200px-Seal_of_Leland_Stanford_Junior_University.svg.png",
        "description": "Learn the fundamentals of programming and computer science in this intensive online course.",
        "type": "Course",
        "category": "Computer Science",
        "location": "Online",
        "locationType": "Online",
        "duration": "8 weeks",
        "durationValue": 0.2,
        "cost": 1500,
        "costLabel": "$1,500",
        "deadline": "2025-05-15T23:59:59Z",
        "ageMin": 14,
        "ageMax": 19,
        "requirements": ["Math proficiency"],
        "acceptanceRate": 40,
        "website": "#",
        "featured": false,
        "competitive": false,
        "degree": "Certificate",
        "mode": "Online"
      },
      {
        "id": "p4",
        "name": "Bachelor of Data Science",
        "organization": "MIT",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1200px-MIT_logo.svg.png",
        "degree": "Bachelor",
        "duration": "4 years",
        "durationValue": 4,
        "cost": 58000,
        "location": "Cambridge, MA",
        "deadline": "2025-01-01",
        "featured": true,
        "competitive": true
      },
      {
        "id": "p5",
        "name": "Master in Artificial Intelligence",
        "organization": "Carnegie Mellon",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Carnegie_Mellon_University_seal.svg/1200px-Carnegie_Mellon_University_seal.svg.png",
        "degree": "Master",
        "duration": "2 years",
        "durationValue": 2,
        "cost": 45000,
        "location": "Pittsburgh, PA",
        "deadline": "2025-03-15",
        "featured": true
      }
    ];
  }

  // Auto Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
