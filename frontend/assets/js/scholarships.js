// Scholarships Page Functionality (API Integrated)

const SCHOLARSHIPS_KEY = 'scholarships'; // Keeps cache if needed, but we rely on API now
const SAVED_SCHOLARSHIPS_KEY = 'saved_scholarships';
const API_BASE_URL = window.location.origin + '/api';

let allScholarships = [];
let currentScholarships = [];

document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem(SAVED_SCHOLARSHIPS_KEY)) {
        localStorage.setItem(SAVED_SCHOLARSHIPS_KEY, JSON.stringify([]));
    }

    initializeSearchTabs();
    initializeFilterTabs();
    loadScholarships();
});

async function loadScholarships() {
    const grid = document.getElementById('scholarshipGrid');
    if (grid) {
        grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading scholarships...</p></div>';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/scholarships`);
        if (!response.ok) throw new Error('Failed to fetch scholarships');

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            allScholarships = result.data;
        } else {
            console.error('Invalid data format:', result);
            allScholarships = [];
        }
    } catch (error) {
        console.error('Error loading scholarships:', error);
        allScholarships = [];
        if (grid) grid.innerHTML = '<div class="error-state"><p>Failed to load scholarships. Please try again later.</p></div>';
    }

    currentScholarships = [...allScholarships];
    renderScholarships(currentScholarships);
    updateSaveButtons();
}

function renderScholarships(list) {
    const container = document.getElementById('scholarshipGrid');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '<div class="no-results"><p>No scholarships found matching your criteria.</p></div>';
        return;
    }

    container.innerHTML = list.map(s => renderScholarshipCard(s)).join('');
}

function renderScholarshipCard(scholarship) {
    const daysLeft = getDaysUntilDeadline(scholarship.deadline);
    const showDeadlineWarning = Number.isFinite(daysLeft) && daysLeft <= 30 && daysLeft >= 0;

    // Handle both id (demo) and _id (mongo)
    const id = scholarship.id || scholarship._id;

    return `
        <div class="scholarship-card" data-id="${id}">
            <div class="scholarship-header">
                <h3>${scholarship.name}</h3>
                <span class="scholarship-amount">${scholarship.amount}</span>
            </div>
            <div class="scholarship-organization">
                <i class="fas fa-university"></i>
                <span>${scholarship.organization}</span>
            </div>
            <div class="scholarship-details">
                <div class="detail-item"><i class="fas fa-map-marker-alt"></i><span>${scholarship.country || 'Global'}</span></div>
                <div class="detail-item"><i class="fas fa-calendar-alt"></i><span>Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}</span></div>
                <div class="detail-item"><i class="fas fa-graduation-cap"></i><span>${scholarship.educationLevel || scholarship.level || 'All Levels'}</span></div>
                <div class="detail-item"><i class="fas fa-book"></i><span>${scholarship.field || 'General'}</span></div>
            </div>
            <p class="scholarship-description">${scholarship.description}</p>
            <div class="scholarship-tags">
                <span class="scholarship-tag">${scholarship.category}</span>
                ${(scholarship.tags || []).map(tag => `<span class="scholarship-tag">${tag}</span>`).join('')}
            </div>
            ${showDeadlineWarning ? `
                <div class="deadline-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Deadline in ${daysLeft} days!</span>
                </div>
            ` : ''}
            <div class="scholarship-actions">
                <button class="btn-apply" onclick="applyScholarship('${id}')" data-url="${scholarship.website || '#'}">
                    <i class="fas fa-external-link-alt"></i>
                    Apply
                </button>
                <button class="btn-save" onclick="saveScholarship('${id}')">
                    <i class="fas fa-bookmark"></i>
                    Save
                </button>
                <button class="btn-share" onclick="shareScholarship('${id}')">
                    <i class="fas fa-share"></i>
                    Share
                </button>
            </div>
        </div>
    `;
}

function initializeSearchTabs() {
    const searchTabs = document.querySelectorAll('.search-tab');
    const searchContents = document.querySelectorAll('.search-content');

    if (!searchTabs.length) return;

    searchTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            searchTabs.forEach(t => t.classList.remove('active'));
            searchContents.forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-search');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function initializeFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter') || 'all';
            filterScholarshipsByCategory(filter);
        });
    });
}

window.performScholarshipSearch = function () {
    const input = document.querySelector('.fields-hero .search-input');
    const query = (input?.value || '').trim().toLowerCase();

    if (!query) {
        currentScholarships = [...allScholarships];
    } else {
        currentScholarships = allScholarships.filter(s => {
            const haystack = [
                s.name,
                s.organization,
                s.amount,
                s.country,
                s.level || s.educationLevel,
                s.field,
                s.description,
                ...(s.tags || [])
            ].join(' ').toLowerCase();
            return haystack.includes(query);
        });
    }

    renderScholarships(currentScholarships);
    updateSaveButtons();
    showSearchResults();
};

window.filterScholarshipsByCategory = function (category) {
    if (!category || category === 'all') {
        currentScholarships = [...allScholarships];
    } else {
        const key = category.toLowerCase();
        currentScholarships = allScholarships.filter(s => {
            // Check direct category match first
            if (s.category && s.category.toLowerCase() === key) return true;

            // Fallback to text search in fields/tags for broader matching if category is loose
            const field = (s.field || '').toLowerCase();
            const tags = (s.tags || []).join(' ').toLowerCase();
            const cat = (s.category || '').toLowerCase();

            if (key === 'stem') return cat === 'stem' || /tech|engineer|science|computer|ai|data|math/.test(field + ' ' + tags);
            if (key === 'business') return cat === 'business' || /business|econom|finance|mba|startup|entrepreneur/.test(field + ' ' + tags);
            if (key === 'social') return cat === 'social' || /social|law|education|policy|public|psych/.test(field + ' ' + tags);
            if (key === 'creative') return cat === 'creative' || /art|design|media|music|film|architecture/.test(field + ' ' + tags);

            return false;
        });
    }

    renderScholarships(currentScholarships);
    updateSaveButtons();
    // Only scroll if initiated by user click on tab, usually handled by caller or simple re-render
};

window.sortScholarships = function () {
    const sort = document.getElementById('sortDropdown')?.value || 'deadline';
    const list = [...currentScholarships];

    if (sort === 'deadline') {
        list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sort === 'amount') {
        list.sort((a, b) => extractAmountValue(b.amount) - extractAmountValue(a.amount));
    } else if (sort === 'name') {
        list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    } else if (sort === 'category') {
        list.sort((a, b) => String(a.category || '').localeCompare(String(b.category || '')));
    }

    currentScholarships = list;
    renderScholarships(currentScholarships);
    updateSaveButtons();
};

window.resetSort = function () {
    const dropdown = document.getElementById('sortDropdown');
    if (dropdown) dropdown.value = 'deadline';
    window.sortScholarships();
};

function extractAmountValue(amountStr) {
    if (!amountStr) return 0;
    const s = String(amountStr).toLowerCase();
    if (s.includes('full')) return 1000000;
    const numbers = s.replace(/,/g, '').match(/\d+/g);
    return numbers ? parseInt(numbers[0], 10) : 0;
}

function getDaysUntilDeadline(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function showSearchResults() {
    const resultsSection = document.getElementById('scholarshipGrid');
    if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });
}

window.applyScholarship = function (id) {
    const scholarship = allScholarships.find(s => (s.id == id || s._id == id));
    if (!scholarship) return;
    const url = scholarship.website;
    if (url && url !== '#') window.open(url, '_blank');
};

window.shareScholarship = function (id) {
    const scholarship = allScholarships.find(s => (s.id == id || s._id == id));
    if (!scholarship) return;

    const text = `${scholarship.name} - ${scholarship.organization}\n${scholarship.amount}\nDeadline: ${new Date(scholarship.deadline).toLocaleDateString()}`;
    if (navigator.share) {
        navigator.share({ title: scholarship.name, text });
        return;
    }
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
        alert('Scholarship info copied to clipboard!');
    }
};

window.saveScholarship = function (id) {
    // Stringify ID because localstorage array usually holds strings or numbers
    const idStr = String(id);
    let saved = JSON.parse(localStorage.getItem(SAVED_SCHOLARSHIPS_KEY)) || [];
    // Ensure we handle both string and number comparison types safely
    if (saved.some(sid => String(sid) === idStr)) {
        removeSavedScholarship(id);
        return;
    }
    saved.push(id);
    localStorage.setItem(SAVED_SCHOLARSHIPS_KEY, JSON.stringify(saved));
    updateSaveButtons();
};

function removeSavedScholarship(id) {
    const idStr = String(id);
    let saved = JSON.parse(localStorage.getItem(SAVED_SCHOLARSHIPS_KEY)) || [];
    saved = saved.filter(x => String(x) !== idStr);
    localStorage.setItem(SAVED_SCHOLARSHIPS_KEY, JSON.stringify(saved));
    updateSaveButtons();
}

function updateSaveButtons() {
    const saved = JSON.parse(localStorage.getItem(SAVED_SCHOLARSHIPS_KEY)) || [];
    const savedStrs = saved.map(String);

    document.querySelectorAll('.btn-save').forEach(btn => {
        const match = (btn.getAttribute('onclick') || '').match(/saveScholarship\(['"]?([a-zA-Z0-9_-]+)['"]?\)/);
        const id = match ? match[1] : null;
        if (!id) return;

        const isSaved = savedStrs.includes(String(id));
        btn.classList.toggle('saved', isSaved);
        btn.innerHTML = isSaved
            ? '<i class="fas fa-bookmark"></i> Saved'
            : '<i class="fas fa-bookmark"></i> Save';

        // Rebind click to avoid issues with onclick attribute vs event listener
        // But for now, reliance on onclick inline is okay if parameters are strings
    });
}

window.showSavedScholarships = function () {
    const savedIds = JSON.parse(localStorage.getItem(SAVED_SCHOLARSHIPS_KEY)) || [];
    const savedSection = document.getElementById('savedScholarshipsSection');
    const savedGrid = document.getElementById('savedScholarshipsGrid');
    const mainGrid = document.getElementById('scholarshipGrid');

    if (!savedSection || !savedGrid || !mainGrid) return;
    // Hide main results container wrapper if present or just the grid
    // The previous implementation hid mainGrid. 

    if (savedIds.length === 0) {
        alert("No saved scholarships yet.");
        return;
    }

    const savedScholarships = allScholarships.filter(s => savedIds.some(sid => String(sid) === String(s.id || s._id)));

    mainGrid.style.display = 'none';
    savedSection.style.display = 'block';

    savedGrid.innerHTML = savedScholarships.map(s => renderScholarshipCard(s)).join('');
    updateSaveButtons();
    savedSection.scrollIntoView({ behavior: 'smooth' });
};

window.showAllScholarships = function () {
    const savedSection = document.getElementById('savedScholarshipsSection');
    const mainGrid = document.getElementById('scholarshipGrid');
    if (!savedSection || !mainGrid) return;

    savedSection.style.display = 'none';
    mainGrid.style.display = 'grid'; // Restore grid layout
    renderScholarships(currentScholarships);
    updateSaveButtons();
};

window.showScholarshipDetails = function (name) {
    const scholarship = allScholarships.find(s => s.name === name) || allScholarships.find(s => s.name.includes(name));
    if (!scholarship) return;

    // Create modal logic (simplified)
    const id = scholarship.id || scholarship._id;
    // Just alert or open simple modal. Existing code had modal.
    // Reusing existing modal logic from viewing file
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content scholarship-details-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            <h2>${scholarship.name}</h2>
            <p>${scholarship.description}</p>
            <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
                <button class="btn-apply" onclick="applyScholarship('${id}'); this.closest('.modal').remove()">Apply Now</button>
                <button class="btn-outline" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};
