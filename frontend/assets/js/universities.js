/**
 * Universities Page JavaScript
 * Features: Filter, Search, Comparison Tool, PDF Export
 */

(function () {
    'use strict';

    // State
    let universities = [];
    let filteredUniversities = [];
    let selectedForComparison = [];

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
        comparisonBar: document.getElementById('comparisonBar'),
        compareCount: document.getElementById('compareCount'),
        compareBtn: document.getElementById('compareBtn'),
        clearCompare: document.getElementById('clearCompare'),
        comparisonModal: document.getElementById('comparisonModal'),
        comparisonTableWrapper: document.getElementById('comparisonTableWrapper'),
        closeComparison: document.getElementById('closeComparison'),
        closeComparisonBtn: document.getElementById('closeComparisonBtn'),
        exportPdfBtn: document.getElementById('exportPdfBtn'),
        filterSidebar: document.getElementById('filterSidebar'),
        toggleFilter: document.getElementById('toggleFilter')
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
            // Try API first
            let response;
            try {
                response = await fetch('/api/universities');
                if (!response.ok) throw new Error('API not available');
                universities = await response.json();
            } catch {
                // Fallback to static JSON
                response = await fetch('/data/universities.json');
                if (!response.ok) {
                    // Try another path
                    response = await fetch('../data/universities.json');
                }
                if (!response.ok) {
                    response = await fetch('../../backend/data/universities.json');
                }
                universities = await response.json();
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
        }
        if (elements.searchBtn) {
            elements.searchBtn.addEventListener('click', applyFilters);
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
        document.querySelectorAll('.filter-checkbox input, .filter-radio input').forEach(input => {
            input.addEventListener('change', applyFilters);
        });

        // Filter toggle (collapsible)
        document.querySelectorAll('.filter-title').forEach(title => {
            title.addEventListener('click', () => {
                title.classList.toggle('collapsed');
                const options = title.nextElementSibling;
                if (options) {
                    options.style.display = title.classList.contains('collapsed') ? 'none' : 'flex';
                }
            });
        });

        // Comparison
        if (elements.clearCompare) {
            elements.clearCompare.addEventListener('click', clearComparison);
        }
        if (elements.compareBtn) {
            elements.compareBtn.addEventListener('click', showComparison);
        }
        if (elements.closeComparison) {
            elements.closeComparison.addEventListener('click', hideComparison);
        }
        if (elements.closeComparisonBtn) {
            elements.closeComparisonBtn.addEventListener('click', hideComparison);
        }
        if (elements.exportPdfBtn) {
            elements.exportPdfBtn.addEventListener('click', exportToPDF);
        }

        // Modal close on backdrop click
        if (elements.comparisonModal) {
            elements.comparisonModal.addEventListener('click', (e) => {
                if (e.target === elements.comparisonModal) {
                    hideComparison();
                }
            });
        }

        // Mobile filter toggle
        if (elements.toggleFilter) {
            elements.toggleFilter.addEventListener('click', toggleFilterSidebar);
        }

        // Close filter on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideComparison();
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
            types: []
        };

        // Country filters
        document.querySelectorAll('#countryFilters input:checked').forEach(input => {
            filters.countries.push(input.value);
        });

        // Major filters
        document.querySelectorAll('#majorFilters input:checked').forEach(input => {
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
        document.querySelectorAll('#typeFilters input:checked').forEach(input => {
            filters.types.push(input.value);
        });

        return filters;
    }

    // Apply filters and render
    function applyFilters() {
        const filters = getFilters();

        filteredUniversities = universities.filter(uni => {
            // Search filter
            if (filters.search) {
                const searchStr = `${uni.name} ${uni.shortName} ${uni.city} ${uni.country} ${uni.majors.join(' ')}`.toLowerCase();
                if (!searchStr.includes(filters.search)) return false;
            }

            // Country filter
            if (filters.countries.length > 0 && !filters.countries.includes(uni.country)) {
                return false;
            }

            // Major filter
            if (filters.majors.length > 0) {
                const hasMajor = filters.majors.some(major =>
                    uni.majors.some(m => m.toLowerCase().includes(major.toLowerCase()))
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

        elements.grid.innerHTML = filteredUniversities.map(uni => createUniversityCard(uni)).join('');

        // Attach card event listeners
        elements.grid.querySelectorAll('.btn-select').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                toggleCompareSelection(id);
            });
        });
    }

    // Create university card HTML
    function createUniversityCard(uni) {
        const isSelected = selectedForComparison.includes(uni.id);
        const isTop10 = uni.ranking <= 10;
        const displayedMajors = uni.majors.slice(0, 4);
        const formatTuition = uni.tuition === 0 ? 'Free' : `$${uni.tuition.toLocaleString()}`;

        return `
            <article class="university-card ${isSelected ? 'selected' : ''}" data-id="${uni.id}">
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
                    ${displayedMajors.map(major => `<span class="major-tag">${major}</span>`).join('')}
                    ${uni.majors.length > 4 ? `<span class="major-tag">+${uni.majors.length - 4} more</span>` : ''}
                </div>
                <div class="card-actions">
                    <a href="${uni.website}" target="_blank" rel="noopener" class="btn-view">Visit Website</a>
                    <button class="btn-select ${isSelected ? 'selected' : ''}" data-id="${uni.id}">
                        ${isSelected ? '✓ Selected' : 'Compare'}
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

    // Toggle compare selection
    function toggleCompareSelection(id) {
        const index = selectedForComparison.indexOf(id);

        if (index === -1) {
            if (selectedForComparison.length >= 4) {
                alert('You can compare up to 4 universities at a time.');
                return;
            }
            selectedForComparison.push(id);
        } else {
            selectedForComparison.splice(index, 1);
        }

        updateComparisonUI();
        renderUniversities();
    }

    // Update comparison UI
    function updateComparisonUI() {
        const count = selectedForComparison.length;

        if (elements.comparisonBar) {
            elements.comparisonBar.style.display = count > 0 ? 'flex' : 'none';
        }
        if (elements.compareCount) {
            elements.compareCount.textContent = count;
        }
        if (elements.compareBtn) {
            elements.compareBtn.disabled = count < 2;
        }
    }

    // Clear comparison
    function clearComparison() {
        selectedForComparison = [];
        updateComparisonUI();
        renderUniversities();
    }

    // Show comparison modal
    function showComparison() {
        if (selectedForComparison.length < 2) return;

        const selectedUnis = universities.filter(uni => selectedForComparison.includes(uni.id));
        renderComparisonTable(selectedUnis);

        if (elements.comparisonModal) {
            elements.comparisonModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Hide comparison modal
    function hideComparison() {
        if (elements.comparisonModal) {
            elements.comparisonModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Render comparison table
    function renderComparisonTable(selectedUnis) {
        if (!elements.comparisonTableWrapper) return;

        const rows = [
            { label: 'Ranking', key: 'ranking', format: (v) => `#${v}` },
            { label: 'Country', key: 'country' },
            { label: 'City', key: 'city' },
            { label: 'Type', key: 'type' },
            { label: 'Acceptance Rate', key: 'acceptanceRate', format: (v) => `${v}%` },
            { label: 'Tuition (Annual)', key: 'tuition', format: (v) => v === 0 ? 'Free' : `$${v.toLocaleString()}` },
            { label: 'Students', key: 'studentCount', format: (v) => v ? v.toLocaleString() : 'N/A' },
            { label: 'Founded', key: 'foundedYear' },
            { label: 'Research Funding', key: 'researchFunding' },
            { label: 'Top Majors', key: 'majors', format: (v) => v.slice(0, 3).join(', ') }
        ];

        let html = `
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th></th>
                        ${selectedUnis.map(uni => `
                            <td>
                                <div class="compare-university-header">
                                    <img src="${uni.logo}" alt="${uni.shortName}" class="compare-logo"
                                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2230%22>${uni.shortName.charAt(0)}</text></svg>'">
                                    <span class="compare-name">${uni.shortName}</span>
                                </div>
                            </td>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            <th>${row.label}</th>
                            ${selectedUnis.map(uni => {
            const value = uni[row.key];
            const displayValue = row.format ? row.format(value) : value;
            return `<td>${displayValue}</td>`;
        }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        elements.comparisonTableWrapper.innerHTML = html;
    }

    // Export to PDF
    function exportToPDF() {
        if (selectedForComparison.length < 2) return;

        const selectedUnis = universities.filter(uni => selectedForComparison.includes(uni.id));

        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            alert('PDF export library not loaded. Please try again.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        // Title
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text('University Comparison - BraineX', 14, 20);

        // Subtitle
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

        // Table data
        const headers = ['Attribute', ...selectedUnis.map(u => u.shortName)];
        const data = [
            ['Ranking', ...selectedUnis.map(u => `#${u.ranking}`)],
            ['Country', ...selectedUnis.map(u => u.country)],
            ['City', ...selectedUnis.map(u => u.city)],
            ['Type', ...selectedUnis.map(u => u.type)],
            ['Acceptance Rate', ...selectedUnis.map(u => `${u.acceptanceRate}%`)],
            ['Tuition', ...selectedUnis.map(u => u.tuition === 0 ? 'Free' : `$${u.tuition.toLocaleString()}`)],
            ['Students', ...selectedUnis.map(u => u.studentCount ? u.studentCount.toLocaleString() : 'N/A')],
            ['Founded', ...selectedUnis.map(u => u.foundedYear)],
            ['Research Funding', ...selectedUnis.map(u => u.researchFunding)],
            ['Top Majors', ...selectedUnis.map(u => u.majors.slice(0, 3).join(', '))]
        ];

        doc.autoTable({
            head: [headers],
            body: data,
            startY: 35,
            styles: {
                fontSize: 9,
                cellPadding: 4
            },
            headStyles: {
                fillColor: [102, 126, 234],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            columnStyles: {
                0: { fontStyle: 'bold', fillColor: [245, 247, 250] }
            }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                'BraineX - Your Guide to Higher Education | brainex.example',
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Save
        const filename = `university-comparison-${selectedUnis.map(u => u.shortName).join('-').toLowerCase()}.pdf`;
        doc.save(filename);
    }

    // Reset all filters
    function resetAllFilters() {
        // Reset search
        if (elements.searchInput) elements.searchInput.value = '';

        // Check all checkboxes
        document.querySelectorAll('.filter-checkbox input').forEach(input => {
            input.checked = true;
        });

        // Reset radio to "all"
        document.querySelectorAll('.filter-radio input[value="all"]').forEach(input => {
            input.checked = true;
        });

        // Reset sort
        if (elements.sortSelect) elements.sortSelect.value = 'ranking';

        applyFilters();
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
