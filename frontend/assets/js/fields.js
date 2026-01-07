// FIXED FIELDS PAGE - ALL BUTTONS WORK (API Integrated)
const API_BASE_URL = window.location.origin + '/api';

// Global variables to track current state
let currentFields = [];
let allFields = []; // Store master list
let currentCategory = 'all';

console.log('🔥 STARTING FIELDS PAGE (API MODE)');

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM LOADED - INITIALIZING FIELDS PAGE');
    initializeFieldsPage();
});

async function initializeFieldsPage() {
    const grid = document.getElementById('fieldsGrid');
    if (grid) grid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading fields...</p></div>';

    try {
        const response = await fetch(`${API_BASE_URL}/fields`);
        if (!response.ok) throw new Error('Failed to fetch fields');
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            allFields = result.data.map(f => ({ ...f, id: f.id || f._id }));
        } else {
            console.error('Invalid fields data', result);
            allFields = [];
        }
    } catch (err) {
        console.error('Error loading fields:', err);
        if (grid) grid.innerHTML = '<div class="error-state"><p>Failed to load fields.</p></div>';
        allFields = [];
    }

    currentFields = [...allFields];
    populateFieldsGrid(currentFields);
    setupInteractiveElements();
}

function setupInteractiveElements() {
    // Search
    const searchInput = document.querySelector('.field-search .search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase().trim();
            if (query.length > 0) {
                const results = allFields.filter(field =>
                    field.name.toLowerCase().includes(query) ||
                    field.description.toLowerCase().includes(query) ||
                    (field.careers || []).some(career => career.toLowerCase().includes(query))
                );
                currentFields = results;
                populateFieldsGrid(results);
            } else {
                currentFields = [...allFields];
                populateFieldsGrid(allFields);
            }
        });

        const searchBtn = document.querySelector('.btn-search');
        if (searchBtn) searchBtn.addEventListener('click', window.performFieldSearch);
    }

    // Category Cards
    document.querySelectorAll('.category-card').forEach(card => {
        const category = card.getAttribute('data-category');
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => window.filterByCategory(category));
    });

    // Filter Tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        const filter = tab.getAttribute('data-filter');
        tab.style.cursor = 'pointer';
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            // Update UI
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            window.filterByCategory(filter);
        });
    });

    // Pathway Buttons
    document.querySelectorAll('.btn-pathway').forEach(btn => {
        const card = btn.closest('.pathway-card');
        const pathwayName = card.querySelector('h3').textContent;
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => window.showPathwayDetails(pathwayName));
    });

    // Resource Cards
    document.querySelectorAll('.resource-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const h3 = card.querySelector('h3');
            const resourceTitle = h3 ? h3.textContent.toLowerCase() : '';
            let type = 'guides';
            if (resourceTitle.includes('video')) type = 'videos';
            else if (resourceTitle.includes('course')) type = 'coursera';
            else if (resourceTitle.includes('communit')) type = 'communities';
            else if (resourceTitle.includes('data')) type = 'data';
            window.openResourceLink(type);
        });
    });
}

// Global functions exposed to window for inline onclicks if needed
window.showFieldDetails = function (fieldId) {
    const field = allFields.find(f => f.id == fieldId || f._id == fieldId);
    if (!field) return;

    // Remove existing
    document.querySelectorAll('.modal, .field-modal').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;`;

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 700px; max-height: 80vh; overflow-y: auto; margin: 20px; position:relative; width:90%;">
            <button class="close-modal" style="position:absolute; right:20px; top:20px; background:none; border:none; font-size:24px; cursor:pointer;" onclick="this.closest('.modal').remove()">&times;</button>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 50px;">${field.icon || '🎓'}</div>
                <h2>${field.name}</h2>
                <span style="background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; text-transform: uppercase; font-size: 12px;">${field.category}</span>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>📋 Overview</h3>
                <p>${field.description}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                <div style="background: #f0f8f0; padding: 15px; border-radius: 10px;">
                    <strong>💰 Salary:</strong><br>${field.salary || 'Varies'}
                </div>
                <div style="background: #f0f8f0; padding: 15px; border-radius: 10px;">
                    <strong>📈 Growth:</strong><br>${field.growthRate || 'Stable'}
                </div>
                <div style="background: #f0f8f0; padding: 15px; border-radius: 10px;">
                    <strong>💼 Jobs:</strong><br>${field.jobOpenings || 'Many'}
                </div>
                <div style="background: #f0f8f0; padding: 15px; border-radius: 10px;">
                    <strong>🎓 Education:</strong><br>${field.education || 'Bachelor\'s'}
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>🚀 Career Paths</h3>
                <div>${(field.careers || []).map(c => `<span style="background: #667eea; color: white; padding: 5px 10px; margin: 3px; border-radius: 15px; display: inline-block; font-size: 12px;">${c}</span>`).join('')}</div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3>🛠️ Required Skills</h3>
                <div>${(field.skills || []).map(s => `<span style="background: #e0e0e0; padding: 5px 10px; margin: 3px; border-radius: 15px; display: inline-block; font-size: 12px;">${s}</span>`).join('')}</div>
            </div>
            
             <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(field.name + ' careers')}', '_blank')" style="background: #667eea; color: white; border: none; padding: 12px 20px; margin: 5px; border-radius: 20px; cursor: pointer;">Search Jobs</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

window.filterByCategory = function (category) {
    if (category && category !== 'all') {
        currentFields = allFields.filter(f => f.category === category);
    } else {
        currentFields = [...allFields];
    }

    currentCategory = category;
    populateFieldsGrid(currentFields);

    // Update headers
    const resultsText = document.querySelector('.detailed-fields h2');
    if (resultsText) {
        resultsText.textContent = currentFields.length > 0
            ? `📋 ${category.toUpperCase()} Fields (${currentFields.length} found)`
            : `📋 No ${category.toUpperCase()} fields found`;
    }

    document.getElementById('detailedFields')?.scrollIntoView({ behavior: 'smooth' });
};

window.performFieldSearch = function () {
    const input = document.querySelector('.field-search .search-input');
    if (!input) return;
    const query = input.value.toLowerCase().trim();
    if (!query) return;

    const results = allFields.filter(field =>
        field.name.toLowerCase().includes(query) ||
        field.description.toLowerCase().includes(query) ||
        (field.careers || []).some(c => c.toLowerCase().includes(query))
    );

    currentFields = results;
    populateFieldsGrid(results);
    document.getElementById('detailedFields')?.scrollIntoView({ behavior: 'smooth' });
};

window.populateFieldsGrid = function (fields) {
    const fieldsGrid = document.getElementById('fieldsGrid');
    if (!fieldsGrid) return;

    if (fields.length === 0) {
        fieldsGrid.innerHTML = `
            <div class="no-results-card">
                <h3>No fields found</h3>
                <p>Try a different search term or browse all fields.</p>
            </div>
        `;
        return;
    }

    // Handle both id and _id
    fieldsGrid.innerHTML = fields.map(field => `
        <div class="field-card" data-category="${field.category}" onclick="showFieldDetails('${field.id || field._id}')">
            <div class="field-header">
                <div class="field-title-wrapper">
                    <div class="field-icon">${field.icon || '🎓'}</div>
                    <h4>${field.name}</h4>
                </div>
                <span class="field-category-badge">${field.category}</span>
            </div>
            
            <p class="field-description">${field.description}</p>
            
            <div class="field-stats">
                <div class="field-stat">
                    <span class="stat-label">Avg Salary</span>
                    <span class="stat-value salary-value">${field.salary || 'N/A'}</span>
                </div>
                <div class="field-stat">
                    <span class="stat-label">Growth Rate</span>
                    <span class="stat-value growth-value">${field.growthRate ? '+' + field.growthRate : 'N/A'}</span>
                </div>
            </div>
            
            <div class="field-tags">
                ${(field.careers || []).slice(0, 3).map(c => `<span class="field-tag">${c}</span>`).join('')}
                ${(field.careers || []).length > 3 ? `<span class="field-tag">+${field.careers.length - 3} more</span>` : ''}
            </div>
            
            <button class="btn-learn-more">Learn More →</button>
        </div>
    `).join('');
};

// ... Keep existing pathway/resource popup functions if consistent ...
window.showPathwayDetails = function (name) {
    // Simplified alert or keeping previous modal logic...
    // Re-implementing a simple version to ensure it works
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;`;
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width:90%; position:relative;">
             <button class="close-modal" style="position:absolute; right:15px; top:15px; background:none; border:none; font-size:24px; cursor:pointer;" onclick="this.closest('.modal').remove()">&times;</button>
             <h2>${name} Roadmap</h2>
             <p>This feature is coming soon! Check back later for detailed career roadmaps.</p>
        </div>
    `;
    document.body.appendChild(modal);
}

window.openResourceLink = function (type) {
    const links = {
        'guides': 'https://www.bls.gov/ooh/',
        'videos': 'https://www.youtube.com/results?search_query=career',
        'coursera': 'https://www.coursera.org/',
        'data': 'https://www.glassdoor.com/'
    };
    window.open(links[type] || 'https://google.com', '_blank');
}

window.sortFields = function () {
    const sortDropdown = document.getElementById('sortDropdown');
    if (!sortDropdown) return;
    const sortBy = sortDropdown.value;

    // Sort currentFields in place
    if (sortBy === 'name') currentFields.sort((a, b) => a.name.localeCompare(b.name));
    // Add other sort cases as needed

    populateFieldsGrid(currentFields);
}

window.resetSort = function () {
    const d = document.getElementById('sortDropdown');
    if (d) d.value = 'name';
    window.filterByCategory(currentCategory);
}
