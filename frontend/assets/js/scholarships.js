// Scholarships Page Functionality

const SCHOLARSHIPS_KEY = 'scholarships';
const SAVED_SCHOLARSHIPS_KEY = 'saved_scholarships';

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

function loadScholarships() {
    allScholarships = JSON.parse(localStorage.getItem(SCHOLARSHIPS_KEY)) || [];
    if (!allScholarships.length) {
        allScholarships = getSampleScholarships();
        localStorage.setItem(SCHOLARSHIPS_KEY, JSON.stringify(allScholarships));
    }

    currentScholarships = [...allScholarships];
    renderScholarships(currentScholarships);
    updateSaveButtons();
}

function renderScholarships(list) {
    const container = document.getElementById('scholarshipGrid');
    if (!container) return;

    container.innerHTML = list.map(s => renderScholarshipCard(s)).join('');
}

function renderScholarshipCard(scholarship) {
    const daysLeft = getDaysUntilDeadline(scholarship.deadline);
    const showDeadlineWarning = Number.isFinite(daysLeft) && daysLeft <= 30;

    return `
        <div class="scholarship-card" data-id="${scholarship.id}">
            <div class="scholarship-header">
                <h3>${scholarship.name}</h3>
                <span class="scholarship-amount">${scholarship.amount}</span>
            </div>
            <div class="scholarship-organization">
                <i class="fas fa-university"></i>
                <span>${scholarship.organization}</span>
            </div>
            <div class="scholarship-details">
                <div class="detail-item"><i class="fas fa-map-marker-alt"></i><span>${scholarship.country}</span></div>
                <div class="detail-item"><i class="fas fa-calendar-alt"></i><span>Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}</span></div>
                <div class="detail-item"><i class="fas fa-graduation-cap"></i><span>${scholarship.level}</span></div>
                <div class="detail-item"><i class="fas fa-book"></i><span>${scholarship.field}</span></div>
            </div>
            <p class="scholarship-description">${scholarship.description}</p>
            <div class="scholarship-tags">
                ${(scholarship.tags || []).map(tag => `<span class="scholarship-tag">${tag}</span>`).join('')}
            </div>
            ${showDeadlineWarning ? `
                <div class="deadline-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Deadline in ${daysLeft} days!</span>
                </div>
            ` : ''}
            <div class="scholarship-actions">
                <button class="btn-apply" onclick="applyScholarship(${scholarship.id})" data-url="${scholarship.website}">
                    <i class="fas fa-external-link-alt"></i>
                    Apply Now
                </button>
                <button class="btn-save" onclick="saveScholarship(${scholarship.id})">
                    <i class="fas fa-bookmark"></i>
                    Save
                </button>
                <button class="btn-share" onclick="shareScholarship(${scholarship.id})">
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

function performScholarshipSearch() {
    const input = document.querySelector('.fields-hero .search-input');
    const query = (input?.value || '').trim().toLowerCase();
    if (!query) {
        currentScholarships = [...allScholarships];
        renderScholarships(currentScholarships);
        updateSaveButtons();
        return;
    }

    currentScholarships = allScholarships.filter(s => {
        const haystack = [
            s.name,
            s.organization,
            s.amount,
            s.country,
            s.level,
            s.field,
            s.description,
            ...(s.tags || [])
        ].join(' ').toLowerCase();
        return haystack.includes(query);
    });

    renderScholarships(currentScholarships);
    updateSaveButtons();
    showSearchResults();
}

function filterScholarshipsByCategory(category) {
    if (!category || category === 'all') {
        currentScholarships = [...allScholarships];
        renderScholarships(currentScholarships);
        updateSaveButtons();
        return;
    }

    const key = category.toLowerCase();
    currentScholarships = allScholarships.filter(s => {
        const field = (s.field || '').toLowerCase();
        const tags = (s.tags || []).join(' ').toLowerCase();

        if (key === 'stem') return /tech|engineer|science|computer|ai|data|math/.test(field + ' ' + tags);
        if (key === 'business') return /business|econom|finance|mba|startup|entrepreneur/.test(field + ' ' + tags);
        if (key === 'social') return /social|law|education|policy|public|psych/.test(field + ' ' + tags);
        if (key === 'creative') return /art|design|media|music|film|architecture/.test(field + ' ' + tags);

        return false;
    });

    renderScholarships(currentScholarships);
    updateSaveButtons();
    showSearchResults();
}

function sortScholarships() {
    const sort = document.getElementById('sortDropdown')?.value || 'deadline';
    const list = [...currentScholarships];

    if (sort === 'deadline') {
        list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sort === 'amount') {
        list.sort((a, b) => extractAmountValue(b.amount) - extractAmountValue(a.amount));
    } else if (sort === 'name') {
        list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }

    currentScholarships = list;
    renderScholarships(currentScholarships);
    updateSaveButtons();
}

function resetSort() {
    const dropdown = document.getElementById('sortDropdown');
    if (dropdown) dropdown.value = 'deadline';
    sortScholarships();
}

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

function applyScholarship(id) {
    const scholarship = allScholarships.find(s => s.id === id);
    if (!scholarship) return;
    const url = scholarship.website;
    if (url && url !== '#') window.open(url, '_blank');
}

function shareScholarship(id) {
    const scholarship = allScholarships.find(s => s.id === id);
    if (!scholarship) return;

    const text = `${scholarship.name} - ${scholarship.organization}\n${scholarship.amount}\nDeadline: ${new Date(scholarship.deadline).toLocaleDateString()}`;
    if (navigator.share) {
        navigator.share({ title: scholarship.name, text });
        return;
    }
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
    }
}

function saveScholarship(id) {
    const saved = JSON.parse(localStorage.getItem(SAVED_SCHOLARSHIPS_KEY)) || [];
    if (saved.includes(id)) {
        removeSavedScholarship(id);
        return;
    }
    saved.push(id);
    localStorage.setItem(SAVED_SCHOLARSHIPS_KEY, JSON.stringify(saved));
    updateSaveButtons();
}

function removeSavedScholarship(id) {
    const saved = JSON.parse(localStorage.getItem(SAVED_SCHOLARSHIPS_KEY)) || [];
    localStorage.setItem(SAVED_SCHOLARSHIPS_KEY, JSON.stringify(saved.filter(x => x !== id)));
    updateSaveButtons();
}

function updateSaveButtons() {
    const saved = JSON.parse(localStorage.getItem(SAVED_SCHOLARSHIPS_KEY)) || [];
    document.querySelectorAll('.btn-save').forEach(btn => {
        const match = (btn.getAttribute('onclick') || '').match(/saveScholarship\((\d+)\)/);
        const id = match ? parseInt(match[1], 10) : null;
        if (!id) return;

        const isSaved = saved.includes(id);
        btn.classList.toggle('saved', isSaved);
        btn.innerHTML = isSaved
            ? '<i class="fas fa-bookmark"></i> Saved'
            : '<i class="fas fa-bookmark"></i> Save';
        btn.onclick = () => (isSaved ? removeSavedScholarship(id) : saveScholarship(id));
    });
}

function showSavedScholarships() {
    const savedIds = JSON.parse(localStorage.getItem(SAVED_SCHOLARSHIPS_KEY)) || [];
    const savedSection = document.getElementById('savedScholarshipsSection');
    const savedGrid = document.getElementById('savedScholarshipsGrid');
    const mainGrid = document.getElementById('scholarshipGrid');

    if (!savedSection || !savedGrid || !mainGrid) return;
    if (!savedIds.length) return;

    const savedScholarships = allScholarships.filter(s => savedIds.includes(s.id));
    mainGrid.style.display = 'none';
    savedSection.style.display = 'block';
    savedGrid.innerHTML = savedScholarships.map(s => renderScholarshipCard(s)).join('');
    updateSaveButtons();
    savedSection.scrollIntoView({ behavior: 'smooth' });
}

function showAllScholarships() {
    const savedSection = document.getElementById('savedScholarshipsSection');
    const mainGrid = document.getElementById('scholarshipGrid');
    if (!savedSection || !mainGrid) return;

    savedSection.style.display = 'none';
    mainGrid.style.display = 'grid';
    renderScholarships(currentScholarships);
    updateSaveButtons();
}

function openResourceLink(key) {
    const map = {
        essays: 'https://www.collegeboard.org/',
        deadlines: 'https://www.scholarships.com/',
        tips: 'https://www.fastweb.com/',
        search: 'https://scholarship360.org/',
        interviews: 'https://www.youtube.com/'
    };
    const url = map[key] || 'https://www.google.com/';
    window.open(url, '_blank');
}

function showScholarshipDetails(name) {
    const scholarship = allScholarships.find(s => s.name === name) || allScholarships.find(s => s.name.includes(name));
    if (!scholarship) return;

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content scholarship-details-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            <h2>${scholarship.name}</h2>
            <p>${scholarship.description}</p>
            <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
                <button class="btn-apply" onclick="applyScholarship(${scholarship.id}); this.closest('.modal').remove()">Apply Now</button>
                <button class="btn-outline" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Sample scholarships data
function getSampleScholarships() {
    return [
        {
            id: 1,
            name: 'Gates Cambridge Scholarship',
            organization: 'University of Cambridge',
            amount: 'Full Funding',
            deadline: '2026-12-15',
            country: 'UK',
            description: 'Prestigious scholarship for outstanding applicants from outside the UK to pursue graduate study at Cambridge.',
            website: 'https://www.gatescambridge.org/',
            level: 'Graduate',
            field: 'All fields',
            tags: ['Full Funding', 'International', 'Graduate', 'Prestigious']
        },
        {
            id: 2,
            name: 'Rhodes Scholarship',
            organization: 'University of Oxford',
            amount: 'Full Funding',
            deadline: '2026-10-06',
            country: 'UK',
            description: "The world's oldest graduate scholarship program, enabling exceptional young people from around the world to study at Oxford.",
            website: 'https://www.rhodeshouse.ox.ac.uk/',
            level: 'Graduate',
            field: 'All fields',
            tags: ['Full Funding', 'International', 'Leadership', 'Oxford']
        },
        {
            id: 3,
            name: 'Fulbright Program',
            organization: 'U.S. Department of State',
            amount: '$25,000-$45,000',
            deadline: '2026-10-12',
            country: 'USA',
            description: 'Educational exchange program sponsored by the U.S. government. Provides funding for students, scholars, teachers, and professionals.',
            website: 'https://us.fulbrightonline.org/',
            level: 'Graduate',
            field: 'All fields',
            tags: ['Graduate', 'USA', 'Exchange', 'Research']
        }
    ];
}
