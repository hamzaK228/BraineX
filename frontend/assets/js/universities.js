/**
 * Universities Page JavaScript
 * Features: Filter, Search, View Details
 */

(function () {
  'use strict';

  // State
  let universities = [];
  let filteredUniversities = [];

  // DOM Elements
  const elements = {
    grid: document.getElementById('universitiesGrid'),
    searchInput: document.getElementById('universitySearch'),
    searchBtn: document.getElementById('searchBtn'),
    resultsCount: document.getElementById('resultsCount'),
    noResults: document.getElementById('noResults'),
    sortSelect: document.getElementById('sortSelect'),
    clearFilters: document.getElementById('clearFilters'),
    resetFilters: document.getElementById('resetFilters'),

    // Detail Modal Elements
    detailModal: document.getElementById('detailModal'),
    modalTitle: document.getElementById('modalTitle'),
    detailContentWrapper: document.getElementById('detailContentWrapper'),
    closeDetail: document.getElementById('closeDetail'),
    closeDetailBtn: document.getElementById('closeDetailBtn'),

    filterSidebar: document.getElementById('filterSidebar'),
    toggleFilter: document.getElementById('toggleFilter'),
  };

  // Initialize
  async function init() {
    await loadUniversities();
    setupEventListeners();
    applyFilters();
  }

  // Load universities data
  async function loadUniversities() {
    try {
      let response;
      try {
        // Try API first
        response = await fetch('/api/universities');
        if (!response.ok) throw new Error('API not available');
        universities = await response.json();
      } catch {
        try {
          // Fallback to static JSON
          response = await fetch('/data/universities.json');
          if (!response.ok) throw new Error('Static data not found');
          universities = await response.json();
        } catch (e) {
          console.error('All fetch attempts failed:', e);
          universities = [];
        }
      }
      console.log(`Loaded ${universities.length} universities`);
    } catch (error) {
      console.error('Error loading universities:', error);
      showError();
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // Search
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', debounce(applyFilters, 300));
      // Start search on Enter
      elements.searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFilters();
      });
    }
    if (elements.searchBtn) {
      elements.searchBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any form submission or navigation
        applyFilters();
      });
    }

    // Sort
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', applyFilters);
    }

    // Clear/Reset filters
    if (elements.clearFilters) {
      elements.clearFilters.addEventListener('click', resetAllFilters);
    }
    if (elements.resetFilters) {
      elements.resetFilters.addEventListener('click', resetAllFilters);
    }

    // Filter checkboxes and radios
    document.querySelectorAll('.filter-checkbox input, .filter-radio input').forEach((input) => {
      input.addEventListener('change', applyFilters);
    });

    // Filter toggle (collapsible)
    document.querySelectorAll('.filter-title').forEach((title) => {
      title.addEventListener('click', () => {
        title.classList.toggle('collapsed');
        const options = title.nextElementSibling;
        if (options) {
          options.style.display = title.classList.contains('collapsed') ? 'none' : 'flex';
        }
      });
    });

    // Modal close
    if (elements.closeDetail) {
      elements.closeDetail.addEventListener('click', hideDetail);
    }
    if (elements.closeDetailBtn) {
      elements.closeDetailBtn.addEventListener('click', hideDetail);
    }

    // Modal close on backdrop click
    if (elements.detailModal) {
      elements.detailModal.addEventListener('click', (e) => {
        if (e.target === elements.detailModal) {
          hideDetail();
        }
      });
    }

    // Mobile filter toggle
    if (elements.toggleFilter) {
      elements.toggleFilter.addEventListener('click', toggleFilterSidebar);
    }

    // Close filter/modal on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideDetail();
        if (elements.filterSidebar) {
          elements.filterSidebar.classList.remove('active');
        }
      }
    });
  }

  // Get current filter values
  function getFilters() {
    const filters = {
      search: elements.searchInput?.value?.toLowerCase() || '',
      countries: [],
      majors: [],
      ranking: 'all',
      acceptance: 'all',
      tuition: 'all',
      types: [],
    };

    // Country filters
    document.querySelectorAll('#countryFilters input:checked').forEach((input) => {
      filters.countries.push(input.value);
    });

    // Major filters
    document.querySelectorAll('#majorFilters input:checked').forEach((input) => {
      filters.majors.push(input.value);
    });

    // Ranking filter
    const rankingInput = document.querySelector('#rankingFilters input:checked');
    if (rankingInput) filters.ranking = rankingInput.value;

    // Acceptance filter
    const acceptanceInput = document.querySelector('#acceptanceFilters input:checked');
    if (acceptanceInput) filters.acceptance = acceptanceInput.value;

    // Tuition filter
    const tuitionInput = document.querySelector('#tuitionFilters input:checked');
    if (tuitionInput) filters.tuition = tuitionInput.value;

    // Type filters
    document.querySelectorAll('#typeFilters input:checked').forEach((input) => {
      filters.types.push(input.value);
    });

    return filters;
  }

  // Apply filters and render
  function applyFilters() {
    const filters = getFilters();

    filteredUniversities = universities.filter((uni) => {
      // Search filter
      if (filters.search) {
        const searchStr =
          `${uni.name} ${uni.shortName} ${uni.city} ${uni.country} ${uni.majors.join(' ')}`.toLowerCase();
        if (!searchStr.includes(filters.search)) return false;
      }

      // Country filter
      if (filters.countries.length > 0 && !filters.countries.includes(uni.country)) {
        return false;
      }

      // Major filter
      if (filters.majors.length > 0) {
        const hasMajor = filters.majors.some((major) =>
          uni.majors.some((m) => m.toLowerCase().includes(major.toLowerCase()))
        );
        if (!hasMajor) return false;
      }

      // Ranking filter
      if (filters.ranking !== 'all') {
        const maxRank = parseInt(filters.ranking);
        if (uni.ranking > maxRank) return false;
      }

      // Acceptance filter
      if (filters.acceptance !== 'all') {
        const maxAcceptance = parseInt(filters.acceptance);
        if (uni.acceptanceRate > maxAcceptance) return false;
      }

      // Tuition filter
      if (filters.tuition !== 'all') {
        switch (filters.tuition) {
          case 'free':
            if (uni.tuition > 5000) return false;
            break;
          case 'low':
            if (uni.tuition <= 5000 || uni.tuition > 20000) return false;
            break;
          case 'medium':
            if (uni.tuition <= 20000 || uni.tuition > 40000) return false;
            break;
          case 'high':
            if (uni.tuition <= 40000) return false;
            break;
        }
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(uni.type)) {
        return false;
      }

      return true;
    });

    // Sort
    const sortBy = elements.sortSelect?.value || 'ranking';
    sortUniversities(sortBy);

    // Render
    renderUniversities();
    updateResultsCount();
  }

  // Sort universities
  function sortUniversities(sortBy) {
    filteredUniversities.sort((a, b) => {
      switch (sortBy) {
        case 'ranking':
          return a.ranking - b.ranking;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'acceptance':
          return a.acceptanceRate - b.acceptanceRate;
        case 'tuition-low':
          return a.tuition - b.tuition;
        case 'tuition-high':
          return b.tuition - a.tuition;
        default:
          return a.ranking - b.ranking;
      }
    });
  }

  // Render universities
  function renderUniversities() {
    if (!elements.grid) return;

    if (filteredUniversities.length === 0) {
      elements.grid.innerHTML = '';
      if (elements.noResults) elements.noResults.style.display = 'block';
      return;
    }

    if (elements.noResults) elements.noResults.style.display = 'none';

    elements.grid.innerHTML = filteredUniversities.map((uni) => createUniversityCard(uni)).join('');

    // Attach card event listeners
    elements.grid.querySelectorAll('.btn-detail').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        showUniversityDetail(id);
      });
    });
  }

  // Create university card HTML
  function createUniversityCard(uni) {
    const isTop10 = uni.ranking <= 10;
    const displayedMajors = uni.majors.slice(0, 4);
    const formatTuition = uni.tuition === 0 ? 'Free' : `$${uni.tuition.toLocaleString()}`;

    return `
            <article class="university-card" data-id="${uni.id}">
                <div class="ranking-badge ${isTop10 ? 'top-10' : ''}">#${uni.ranking}</div>
                <div class="card-header">
                    <img src="${uni.logo}" alt="${uni.shortName} logo" class="university-logo" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22>${uni.shortName.charAt(0)}</text></svg>'">
                    <div class="university-info">
                        <h3 class="university-name">${uni.name}</h3>
                        <p class="university-location">📍 ${uni.city}, ${uni.country}</p>
                    </div>
                </div>
                <div class="card-stats">
                    <div class="stat">
                        <span class="stat-value">${uni.acceptanceRate}%</span>
                        <span class="stat-label">Acceptance</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${formatTuition}</span>
                        <span class="stat-label">Tuition/Year</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${uni.studentCount ? uni.studentCount.toLocaleString() : 'N/A'}</span>
                        <span class="stat-label">Students</span>
                    </div>
                </div>
                <div class="major-tags">
                    ${displayedMajors.map((major) => `<span class="major-tag">${major}</span>`).join('')}
                    ${uni.majors.length > 4 ? `<span class="major-tag">+${uni.majors.length - 4} more</span>` : ''}
                </div>
                <div class="card-actions">
                    <a href="${uni.website}" target="_blank" rel="noopener" class="btn-view">Visit Website</a>
                    <button class="btn-detail btn-primary" data-id="${uni.id}" style="padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; background: var(--primary-color, #667eea); color: white;">
                        View Detail
                    </button>
                </div>
            </article>
        `;
  }

  // Update results count
  function updateResultsCount() {
    if (elements.resultsCount) {
      elements.resultsCount.textContent = filteredUniversities.length;
    }
  }

  // Show Detail modal
  function showUniversityDetail(id) {
    const uni = universities.find((u) => u.id === id);
    if (!uni) return;

    // Populate Modal
    if (elements.modalTitle) elements.modalTitle.textContent = uni.name;

    if (elements.detailContentWrapper) {
      const formatTuition = uni.tuition === 0 ? 'Free' : `$${uni.tuition.toLocaleString()}`;

      elements.detailContentWrapper.innerHTML = `
            <div class="university-detail-view" style="padding: 2rem;">
                <div style="display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem;">
                    <img src="${uni.logo}" alt="${uni.shortName}" style="width: 100px; height: 100px; object-fit: contain; border-radius: 12px; background: #f8f9fa; padding: 1rem;"
                        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22>${uni.shortName.charAt(0)}</text></svg>'">
                    <div>
                        <h3 style="margin: 0; font-size: 1.5rem; color: #2d3748;">${uni.name}</h3>
                        <p style="margin: 0.5rem 0 0; color: #718096;">📍 ${uni.city}, ${uni.country}</p>
                        <a href="${uni.website}" target="_blank" style="display: inline-block; margin-top: 0.5rem; color: #667eea; text-decoration: none;">🌐 ${uni.website}</a>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                     <div style="background: #ebf4ff; padding: 1rem; border-radius: 8px;">
                        <strong style="display: block; color: #4a5568; font-size: 0.9rem;">Ranking</strong>
                        <span style="font-size: 1.25rem; font-weight: bold; color: #2b6cb0;">#${uni.ranking}</span>
                     </div>
                     <div style="background: #f0fff4; padding: 1rem; border-radius: 8px;">
                        <strong style="display: block; color: #4a5568; font-size: 0.9rem;">Acceptance Rate</strong>
                        <span style="font-size: 1.25rem; font-weight: bold; color: #2f855a;">${uni.acceptanceRate}%</span>
                     </div>
                     <div style="background: #fff5f5; padding: 1rem; border-radius: 8px;">
                        <strong style="display: block; color: #4a5568; font-size: 0.9rem;">Tuition</strong>
                        <span style="font-size: 1.25rem; font-weight: bold; color: #c53030;">${formatTuition}</span>
                     </div>
                     <div style="background: #faf5ff; padding: 1rem; border-radius: 8px;">
                        <strong style="display: block; color: #4a5568; font-size: 0.9rem;">Students</strong>
                        <span style="font-size: 1.25rem; font-weight: bold; color: #805ad5;">${uni.studentCount ? uni.studentCount.toLocaleString() : 'N/A'}</span>
                     </div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">About</h4>
                    <p style="color: #4a5568; line-height: 1.6;">
                        ${uni.name} is a ${uni.type.toLowerCase()} research university located in ${uni.city}. 
                        Founded in ${uni.foundedYear}, it is known for its strong programs in ${uni.majors.slice(0, 3).join(', ')}.
                        ${uni.researchFunding ? `The university receives approximately ${uni.researchFunding} in research funding annually.` : ''}
                    </p>
                </div>

                <div>
                    <h4 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem;">Popular Majors</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${uni.majors.map((m) => `<span style="background: #edf2f7; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.9rem; color: #4a5568;">${m}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    if (elements.detailModal) {
      elements.detailModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  // Hide Detail modal
  function hideDetail() {
    if (elements.detailModal) {
      elements.detailModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  // Toggle filter sidebar (mobile)
  function toggleFilterSidebar() {
    if (elements.filterSidebar) {
      elements.filterSidebar.classList.toggle('active');
    }
  }

  // Show error state
  function showError() {
    if (elements.grid) {
      elements.grid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">⚠️</div>
                    <h3>Unable to load universities</h3>
                    <p>Please refresh the page or try again later.</p>
                    <button class="btn-reset" onclick="location.reload()">Refresh Page</button>
                </div>
            `;
    }
  }

  // Utility: Debounce
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
