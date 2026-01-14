/**
 * Fields Page JavaScript
 * Handles field discovery, filtering, search, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize fields
    loadFields();

    // Setup event listeners for filters
    setupFilters();

    // Setup Search
    document.querySelector('.field-search .btn-search')?.addEventListener('click', window.performFieldSearch);

    // Setup Sort
    document.getElementById('sortDropdown')?.addEventListener('change', window.sortFields);
    document.querySelector('.btn-reset')?.addEventListener('click', window.resetSort);

    // Setup Delegation for card buttons
    const grid = document.getElementById('fieldsGrid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-explore-field')) {
                const btn = e.target;
                // Find ID - in renderFields we use exploreField('${field.id}')
                // I should update renderFields to use data-id
            }
        });
    }

    // Setup Resource links delegation
    document.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            if (type) window.openResourceLink(type);
        });
    });

    // Setup theme if not already handled by theme.js (it is handled there)
});

// State
let allFields = [];
let filteredFields = [];

/**
 * Load fields from API or Fallback
 */
async function loadFields() {
    const container = document.getElementById('fieldsGrid'); // ID from fields.html
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading fields...</div>';

    try {
        const response = await fetch('/api/fields');
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
            allFields = data.data;
        } else {
            if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
                console.warn('API returned no fields, using fallback data.');
            }
            allFields = getFallbackFields();
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error loading fields from API:', error);
        }
        allFields = getFallbackFields();
    }

    filteredFields = [...allFields];
    renderFields(filteredFields);
}

/**
 * Render fields to the grid
 */
function renderFields(fields) {
    const container = document.getElementById('fieldsGrid');
    if (!container) return;

    if (fields.length === 0) {
        container.innerHTML = '<div class="no-results">No fields found matching your criteria.</div>';
        return;
    }

    container.innerHTML = fields.map(field => `
        <div class="field-card" data-category="${field.category || 'other'}">
            <div class="field-icon">${field.icon || '🎓'}</div>
            <h3>${escapeHtml(field.name)}</h3>
            <p class="field-description">${escapeHtml(field.description || '')}</p>
            <div class="field-stats">
                <div class="stat"><strong>Avg Salary:</strong> ${escapeHtml(field.salary || 'N/A')}</div>
                <div class="stat"><strong>Growth:</strong> ${escapeHtml(field.growth_rate || 'N/A')}</div>
            </div>
            <button class="btn btn-primary btn-explore-field" data-id="${field.id}">Explore Field</button>
        </div>
    `).join('');
}

/**
 * Filter fields by category
 * Global function as used in HTML onclicks
 */
window.filterByCategory = function (category) {
    // Update active tab UI
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        if (tab.dataset.filter === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Scroll to fields section
    document.getElementById('detailedFields').scrollIntoView({ behavior: 'smooth' });

    // Filter logic
    if (category === 'all') {
        filteredFields = [...allFields];
    } else {
        filteredFields = allFields.filter(field =>
            (field.category && field.category.toLowerCase() === category.toLowerCase()) ||
            (field.tags && field.tags.includes(category))
        );
    }
    renderFields(filteredFields);
};

/**
 * Setup filter tab click listeners
 */
function setupFilters() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.filter;
            window.filterByCategory(category);
        });
    });
}

/**
 * Search fields
 */
window.performFieldSearch = function () {
    const searchInput = document.querySelector('.field-search .search-input');
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        filteredFields = [...allFields];
    } else {
        filteredFields = allFields.filter(field =>
            field.name.toLowerCase().includes(query) ||
            field.description.toLowerCase().includes(query) ||
            (field.tags && field.tags.some(tag => tag.toLowerCase().includes(query)))
        );
    }

    // Switch filter tab to All if searching
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.filter-tab[data-filter="all"]')?.classList.add('active');

    renderFields(filteredFields);
    document.getElementById('detailedFields').scrollIntoView({ behavior: 'smooth' });
};

// Enter key for search
document.querySelector('.field-search .search-input')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') window.performFieldSearch();
});

/**
 * Sort fields
 */
window.sortFields = function () {
    const sortValue = document.getElementById('sortDropdown').value;

    let sorted = [...filteredFields];

    switch (sortValue) {
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'salary':
            // Simple parsing for "$120k" strings
            sorted.sort((a, b) => parseSalary(b.salary) - parseSalary(a.salary));
            break;
        case 'salary-asc':
            sorted.sort((a, b) => parseSalary(a.salary) - parseSalary(b.salary));
            break;
        case 'growth':
            sorted.sort((a, b) => parseFloat(b.growth_rate) - parseFloat(a.growth_rate));
            break;
        case 'category':
            sorted.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
            break;
    }

    renderFields(sorted);
};

window.resetSort = function () {
    document.getElementById('sortDropdown').value = 'name';
    window.sortFields();
};

function parseSalary(salaryStr) {
    if (!salaryStr) return 0;
    // Extract numbers, remove k/K
    let num = parseFloat(salaryStr.replace(/[^0-9.]/g, ''));
    if (salaryStr.toLowerCase().includes('k')) num *= 1000;
    return num;
}

/**
 * Explore Field Redirect
 */
window.exploreField = function (fieldId) {
    window.location.href = `/scholarships?field=${fieldId}`;
};

/**
 * Show Pathway Details (Mock Modal)
 */
window.showPathwayDetails = function (pathwayName) {
    alert(`Showing detailed pathway roadmap for: ${pathwayName}\n\n(This feature would open a detailed modal or page in production)`);
    // Ideally, navigate to a roadmap page with query param
    window.location.href = `/roadmaps?pathway=${encodeURIComponent(pathwayName)}`;
};

/**
 * Open Resource Link
 */
window.openResourceLink = function (type) {
    const links = {
        'guides': 'https://www.bls.gov/ooh/',
        'videos': 'https://www.youtube.com/results?search_query=career+exploration',
        'coursera': 'https://www.coursera.org',
        'linkedin': 'https://www.linkedin.com/learning',
        'communities': 'https://www.reddit.com/r/careeradvice/',
        'data': 'https://www.glassdoor.com/Salaries/index.htm',
        'indeed': 'https://www.indeed.com/career-advice',
        'khan': 'https://www.khanacademy.org'
    };

    if (links[type]) {
        window.open(links[type], '_blank');
    }
};

/**
 * Fallback Data
 */
function getFallbackFields() {
    return [
        {
            id: 'cs',
            name: 'Computer Science',
            description: 'Study of computation, automation, and information.',
            category: 'stem',
            icon: '💻',
            salary: '$110k',
            growth_rate: '15%',
            tags: ['tech', 'coding', 'software']
        },
        {
            id: 'bio',
            name: 'Biology',
            description: 'The science of life and living organisms.',
            category: 'stem',
            icon: '🧬',
            salary: '$70k',
            growth_rate: '5%',
            tags: ['science', 'life', 'research']
        },
        {
            id: 'business',
            name: 'Business Administration',
            description: 'Management of business operations and decision making.',
            category: 'business',
            icon: '📊',
            salary: '$85k',
            growth_rate: '8%',
            tags: ['management', 'finance']
        },
        {
            id: 'psych',
            name: 'Psychology',
            description: 'Scientific study of the mind and behavior.',
            category: 'social',
            icon: '🧠',
            salary: '$60k',
            growth_rate: '6%',
            tags: ['health', 'mind']
        },
        {
            id: 'design',
            name: 'Graphic Design',
            description: 'Visual communication and problem-solving through typography and imagery.',
            category: 'creative',
            icon: '🎨',
            salary: '$55k',
            growth_rate: '3%',
            tags: ['art', 'media']
        },
        {
            id: 'eng',
            name: 'Mechanical Engineering',
            description: 'Design, analysis, and manufacturing of mechanical systems.',
            category: 'stem',
            icon: '⚙️',
            salary: '$95k',
            growth_rate: '7%',
            tags: ['engineering', 'machines']
        },
        {
            id: 'econ',
            name: 'Economics',
            description: 'Social science conducting research on production, distribution, and consumption.',
            category: 'business',
            icon: '💰',
            salary: '$105k',
            growth_rate: '13%',
            tags: ['finance', 'money']
        },
        {
            id: 'film',
            name: 'Film Studies',
            description: 'Theoretical, historical, and critical approaches to cinema.',
            category: 'creative',
            icon: '🎬',
            salary: '$50k',
            growth_rate: '4%',
            tags: ['art', 'media']
        }
    ];
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
