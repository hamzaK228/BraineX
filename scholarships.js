// Scholarships Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    loadScholarships();
    initializeEnhancedFilters();
    initializeAdvancedSearch();
    initializeFeaturedScholarships();
    initializeSavedScholarships();
    setupSortingOptions();
    setupScholarshipActions();
});

// Load scholarships from localStorage or sample data
function loadScholarships() {
    let scholarships = JSON.parse(localStorage.getItem('scholarships')) || [];
    
    if (scholarships.length === 0) {
        scholarships = getSampleScholarships();
        localStorage.setItem('scholarships', JSON.stringify(scholarships));
    }
    
    displayScholarships(scholarships);
    updateScholarshipStats(scholarships);
}

// Sample scholarships data
function getSampleScholarships() {
    return [
        {
            id: 1,
            name: "Gates Cambridge Scholarship",
            organization: "University of Cambridge",
            amount: "Full Funding",
            category: "graduate",
            deadline: "2024-12-15",
            country: "UK",
            description: "Prestigious scholarship for outstanding applicants from outside the UK to pursue graduate study at Cambridge. Covers full cost of studying plus living expenses.",
            website: "https://www.gatescambridge.org/",
            eligibility: "International students (non-UK)",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Full Funding", "International", "Graduate", "Prestigious"]
        },
        {
            id: 2,
            name: "Rhodes Scholarship",
            organization: "University of Oxford",
            amount: "Full Funding",
            category: "graduate",
            deadline: "2024-10-06",
            country: "UK", 
            description: "The world's oldest graduate scholarship program, enabling exceptional young people from around the world to study at Oxford.",
            website: "https://www.rhodeshouse.ox.ac.uk/",
            eligibility: "Citizens of eligible countries",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Full Funding", "International", "Leadership", "Oxford"]
        },
        {
            id: 3,
            name: "Fulbright Program",
            organization: "U.S. Department of State",
            amount: "$25,000-$45,000",
            category: "graduate",
            deadline: "2024-10-12",
            country: "USA",
            description: "Educational exchange program sponsored by the U.S. government. Provides funding for students, scholars, teachers, and professionals.",
            website: "https://us.fulbrightonline.org/",
            eligibility: "International students",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Graduate", "USA", "Exchange", "Research"]
        },
        {
            id: 4,
            name: "Erasmus+ Master's Programme",
            organization: "European Commission",
            amount: "â‚¬1,400/month",
            category: "graduate",
            deadline: "2025-01-15",
            country: "Europe",
            description: "Joint master's programmes between universities in different European countries. Includes monthly allowance and travel costs.",
            website: "https://ec.europa.eu/programmes/erasmus-plus/",
            eligibility: "EU and international students",
            level: "Master's",
            field: "Various fields",
            status: "active",
            tags: ["Europe", "Master's", "Mobility", "EU"]
        },
        {
            id: 5,
            name: "DAAD Scholarships",
            organization: "German Academic Exchange Service",
            amount: "â‚¬850-â‚¬1,200/month",
            category: "graduate",
            deadline: "2024-11-30",
            country: "Germany",
            description: "Various scholarship programs for international students to study in Germany. Covers living expenses and sometimes tuition fees.",
            website: "https://www.daad.de/en/",
            eligibility: "International students",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Germany", "Graduate", "Monthly Allowance", "DAAD"]
        },
        {
            id: 6,
            name: "NSF Graduate Research Fellowship",
            organization: "National Science Foundation",
            amount: "$37,000/year",
            category: "research",
            deadline: "2024-10-25",
            country: "USA",
            description: "Program recognizes and supports outstanding graduate students in NSF-supported STEM disciplines who are pursuing research-based master's and doctoral degrees.",
            website: "https://www.nsfgrfp.org/",
            eligibility: "U.S. citizens and permanent residents",
            level: "Graduate",
            field: "STEM",
            status: "active",
            tags: ["STEM", "Research", "USA", "NSF"]
        },
        {
            id: 7,
            name: "Commonwealth Scholarship",
            organization: "Commonwealth Scholarship Commission",
            amount: "Full Funding",
            category: "graduate",
            deadline: "2024-12-01",
            country: "UK",
            description: "For citizens of Commonwealth countries to pursue master's and PhD studies in the UK. Covers tuition fees, living allowance, and travel costs.",
            website: "https://cscuk.fcdo.gov.uk/",
            eligibility: "Commonwealth country citizens",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Commonwealth", "UK", "Full Funding", "Graduate"]
        },
        {
            id: 8,
            name: "Chevening Scholarships",
            organization: "UK Government",
            amount: "Full Funding",
            category: "graduate",
            deadline: "2024-11-05",
            country: "UK",
            description: "UK government's global scholarship programme, funded by the Foreign and Commonwealth Office. For one-year master's degree courses in the UK.",
            website: "https://www.chevening.org/",
            eligibility: "International students (non-UK)",
            level: "Master's",
            field: "All fields",
            status: "active",
            tags: ["UK", "Master's", "Government", "Leadership"]
        },
        {
            id: 9,
            name: "Australia Awards Scholarships",
            organization: "Australian Government",
            amount: "Full Funding + Living Allowance",
            category: "graduate",
            deadline: "2024-12-31",
            country: "Australia",
            description: "Long-term development scholarships to study at participating Australian universities and Technical and Further Education (TAFE) institutions.",
            website: "https://www.australiaawards.gov.au/",
            eligibility: "Developing country citizens",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Australia", "Development", "Full Funding", "TAFE"]
        },
        {
            id: 10,
            name: "MEXT Scholarships",
            organization: "Japanese Government",
            amount: "Â¥143,000-148,000/month",
            category: "graduate",
            deadline: "2024-11-20",
            country: "Japan",
            description: "Japanese Government (Monbukagakusho) Scholarships for international students to study at Japanese universities.",
            website: "https://www.mext.go.jp/en/",
            eligibility: "International students",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Japan", "MEXT", "Monthly Stipend", "Cultural Exchange"]
        },
        {
            id: 11,
            name: "Swedish Institute Scholarships",
            organization: "Swedish Institute",
            amount: "SEK 10,000/month + Tuition",
            category: "graduate",
            deadline: "2025-01-15",
            country: "Sweden",
            description: "Full scholarships for highly-qualified students from developing countries to pursue master's studies in Sweden.",
            website: "https://si.se/en/apply/scholarships/",
            eligibility: "Developing country citizens",
            level: "Master's",
            field: "All fields",
            status: "active",
            tags: ["Sweden", "Developing Countries", "Sustainability", "Innovation"]
        },
        {
            id: 12,
            name: "New Zealand Development Scholarships",
            organization: "New Zealand Government",
            amount: "Full Funding + NZD 491/week",
            category: "graduate",
            deadline: "2024-12-01",
            country: "New Zealand",
            description: "Scholarships for students from developing countries to gain knowledge and skills to contribute to development in their home countries.",
            website: "https://www.nzaid.govt.nz/",
            eligibility: "Developing country citizens",
            level: "Graduate",
            field: "Development studies",
            status: "active",
            tags: ["New Zealand", "Development", "Pacific", "Sustainability"]
        },
        {
            id: 13,
            name: "Vanier Canada Graduate Scholarships",
            organization: "Government of Canada",
            amount: "CAD $50,000/year",
            category: "research",
            deadline: "2024-11-03",
            country: "Canada",
            description: "Prestigious scholarships to attract and retain world-class doctoral students and to establish Canada as a global center of excellence in research.",
            website: "https://vanier.gc.ca/",
            eligibility: "Canadian and international students",
            level: "PhD",
            field: "All research fields",
            status: "active",
            tags: ["Canada", "PhD", "Research Excellence", "Prestigious"]
        },
        {
            id: 14,
            name: "Orange Tulip Scholarship",
            organization: "Nuffic Neso",
            amount: "â‚¬5,000-â‚¬24,000",
            category: "graduate",
            deadline: "2025-02-01",
            country: "Netherlands",
            description: "Scholarships for excellent students from outside the European Economic Area to study in the Netherlands.",
            website: "https://www.studyinholland.nl/",
            eligibility: "Non-EEA students",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Netherlands", "Innovation", "Diverse Fields", "Europe"]
        },
        {
            id: 15,
            name: "Korean Government Scholarship",
            organization: "NIIED Korea",
            amount: "Full Tuition + KRW 900,000/month",
            category: "graduate",
            deadline: "2024-10-31",
            country: "South Korea",
            description: "Global Korea Scholarship for international students to pursue undergraduate and graduate degrees in Korean universities.",
            website: "https://www.studyinkorea.go.kr/",
            eligibility: "International students",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["South Korea", "KGSP", "Language Learning", "Technology"]
        },
        {
            id: 16,
            name: "Schwarzman Scholars",
            organization: "Tsinghua University",
            amount: "Full Funding + Living Stipend",
            category: "graduate",
            deadline: "2024-09-15",
            country: "China",
            description: "One-year Master's degree program designed to prepare future leaders for the geopolitical landscape of the 21st century.",
            website: "https://www.schwarzmanscholars.org/",
            eligibility: "International students",
            level: "Master's",
            field: "Leadership, Public Policy",
            status: "active",
            tags: ["China", "Leadership", "Global Affairs", "Prestigious"]
        },
        {
            id: 17,
            name: "Mastercard Foundation Scholars",
            organization: "Mastercard Foundation",
            amount: "Full Funding + Support",
            category: "undergraduate",
            deadline: "2024-12-15",
            country: "Multiple",
            description: "Program to develop leaders who will drive social and economic progress in Africa and around the world.",
            website: "https://mastercardfdn.org/",
            eligibility: "African students",
            level: "Undergraduate/Graduate",
            field: "All fields",
            status: "active",
            tags: ["Africa", "Leadership", "Social Impact", "Development"]
        },
        {
            id: 18,
            name: "Swiss Excellence Scholarships",
            organization: "Swiss Government",
            amount: "CHF 1,920/month + Tuition",
            category: "research",
            deadline: "2024-12-01",
            country: "Switzerland",
            description: "Research scholarships for foreign scholars and artists who hold a master's degree or PhD and wish to come to Switzerland.",
            website: "https://www.sbfi.admin.ch/",
            eligibility: "International researchers",
            level: "Postgraduate",
            field: "Research and Arts",
            status: "active",
            tags: ["Switzerland", "Research", "Excellence", "Innovation"]
        },
        {
            id: 19,
            name: "Taiwan Scholarship",
            organization: "Taiwan Government",
            amount: "TWD 25,000/month + Tuition",
            category: "graduate",
            deadline: "2025-01-31",
            country: "Taiwan",
            description: "Scholarships to encourage outstanding international students to undertake degree studies in Taiwan.",
            website: "https://taiwanscholarship.moe.gov.tw/",
            eligibility: "International students",
            level: "Graduate",
            field: "All fields",
            status: "active",
            tags: ["Taiwan", "Asian Studies", "Technology", "Culture"]
        },
        {
            id: 20,
            name: "Belgium Development Cooperation",
            organization: "Belgian Government",
            amount: "Full Funding + â‚¬1,150/month",
            category: "graduate",
            deadline: "2024-11-30",
            country: "Belgium",
            description: "Master's and training scholarships for students and professionals from developing countries.",
            website: "https://www.vliruos.be/",
            eligibility: "Developing country citizens",
            level: "Master's",
            field: "Development studies",
            status: "active",
            tags: ["Belgium", "Development", "Professional Training", "Cooperation"]
        }
    ];
}

// Display scholarships
function displayScholarships(scholarships) {
    const container = document.getElementById('scholarshipGrid');
    if (!container) return;
    
    container.innerHTML = scholarships.map(scholarship => `
        <div class=\"scholarship-card\" data-id=\"${scholarship.id}\" data-category=\"${scholarship.category}\">
            <div class="scholarship-header">
                <h3>${scholarship.name}</h3>
                <span class="scholarship-amount">${scholarship.amount}</span>
            </div>
            
            <div class="scholarship-organization">
                <i class="fas fa-university"></i>
                <span>${scholarship.organization}</span>
            </div>
            
            <div class="scholarship-details">
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${scholarship.country}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-graduation-cap"></i>
                    <span>${scholarship.level}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-book"></i>
                    <span>${scholarship.field}</span>
                </div>
            </div>
            
            <p class="scholarship-description">${scholarship.description}</p>
            
            <div class="scholarship-tags">
                ${scholarship.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
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
            
            <div class="scholarship-deadline-warning" ${getDaysUntilDeadline(scholarship.deadline) <= 30 ? 'style="display: block;"' : ''}>
                <i class="fas fa-exclamation-triangle"></i>
                <span>Deadline in ${getDaysUntilDeadline(scholarship.deadline)} days!</span>
            </div>
        </div>
    `).join('');
}

// Initialize filters
function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter scholarships
            filterScholarships(filter);
        });
    });
    
    // Advanced search form
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performAdvancedSearch();
        });
    }
    
    // Add reset button functionality
    const resetBtn = document.querySelector('.btn-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // Reset all form fields
            document.querySelectorAll('.search-form select').forEach(select => {
                select.value = '';
            });
            
            // Reset filters
            filterBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
            
            // Show all scholarships
            loadScholarships();
            MentoraX.showNotification('Filters reset', 'info');
        });
    }
    
    // Add saved scholarships button
    const resultsHeader = document.querySelector('.results-header');
    if (resultsHeader && !document.querySelector('.btn-saved-scholarships')) {
        const savedBtn = document.createElement('button');
        savedBtn.className = 'btn-saved-scholarships';
        savedBtn.innerHTML = 'ðŸ“š Saved Scholarships';
        savedBtn.onclick = showSavedScholarships;
        resultsHeader.appendChild(savedBtn);
    }
}

// Filter scholarships
function filterScholarships(category) {
    const scholarships = JSON.parse(localStorage.getItem('scholarships')) || getSampleScholarships();
    let filtered = scholarships;
    
    if (category && category !== 'all') {
        filtered = scholarships.filter(s => s.category === category);
    }
    
    displayScholarships(filtered);
    updateResultsCount(filtered.length);
}

// Advanced search
function performAdvancedSearch() {
    const field = document.getElementById('fieldSelect')?.value;
    const level = document.getElementById('levelSelect')?.value;
    const country = document.getElementById('countrySelect')?.value;
    const funding = document.getElementById('fundingSelect')?.value;
    const deadline = document.getElementById('deadlineSelect')?.value;
    const eligibility = document.getElementById('eligibilitySelect')?.value;
    
    const scholarships = JSON.parse(localStorage.getItem('scholarships')) || getSampleScholarships();
    
    let filtered = scholarships.filter(scholarship => {
        let matches = true;
        
        if (field && !scholarship.field.toLowerCase().includes(field.toLowerCase()) && field !== scholarship.field) {
            matches = false;
        }
        
        if (level && scholarship.level.toLowerCase() !== level.toLowerCase()) {
            matches = false;
        }
        
        if (country && scholarship.country.toLowerCase() !== country.toLowerCase()) {
            matches = false;
        }
        
        if (funding) {
            if (funding === 'full' && !scholarship.amount.toLowerCase().includes('full')) {
                matches = false;
            }
            if (funding === 'partial' && scholarship.amount.toLowerCase().includes('full')) {
                matches = false;
            }
        }
        
        if (deadline) {
            const daysUntil = getDaysUntilDeadline(scholarship.deadline);
            const deadlineDays = parseInt(deadline);
            if (daysUntil > deadlineDays || daysUntil < 0) {
                matches = false;
            }
        }
        
        return matches;
    });
    
    displayScholarships(filtered);
    updateResultsCount(filtered.length);
    showSearchResults();
}

// Initialize search
function initializeSearch() {
    const searchBtns = document.querySelectorAll('.btn-search-primary');
    searchBtns.forEach(btn => {
        btn.addEventListener('click', performAdvancedSearch);
    });
}

// Apply for scholarship
function applyScholarship(id) {
    const scholarships = JSON.parse(localStorage.getItem('scholarships')) || getSampleScholarships();
    const scholarship = scholarships.find(s => s.id === id);
    
    if (scholarship && scholarship.website) {
        // Show application modal first
        showApplicationModal(scholarship);
    } else {
        MentoraX.showNotification('Application link not available', 'error');
    }
}

// Show application modal
function showApplicationModal(scholarship) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content application-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            <h2>ðŸŽ“ Apply for ${scholarship.name}</h2>
            <div class="application-info">
                <div class="scholarship-summary">
                    <h3>${scholarship.organization}</h3>
                    <p><strong>Amount:</strong> ${scholarship.amount}</p>
                    <p><strong>Deadline:</strong> ${new Date(scholarship.deadline).toLocaleDateString()}</p>
                    <p><strong>Eligibility:</strong> ${scholarship.eligibility}</p>
                </div>
                
                <div class="application-checklist">
                    <h4>ðŸ“‹ Application Requirements:</h4>
                    <ul>
                        <li><input type="checkbox"> Academic transcripts</li>
                        <li><input type="checkbox"> Personal statement/Essay</li>
                        <li><input type="checkbox"> Letters of recommendation (2-3)</li>
                        <li><input type="checkbox"> Language proficiency test (if required)</li>
                        <li><input type="checkbox"> CV/Resume</li>
                        <li><input type="checkbox"> Research proposal (for research-based programs)</li>
                    </ul>
                </div>
                
                <div class="application-timeline">
                    <h4>â° Recommended Timeline:</h4>
                    <div class="timeline-item">
                        <span class="timeline-marker">4-6 months before</span>
                        <span>Start gathering documents</span>
                    </div>
                    <div class="timeline-item">
                        <span class="timeline-marker">2-3 months before</span>
                        <span>Request recommendation letters</span>
                    </div>
                    <div class="timeline-item">
                        <span class="timeline-marker">1 month before</span>
                        <span>Finalize and review application</span>
                    </div>
                </div>
                
                <div class="application-tips">
                    <h4>ðŸ’¡ Application Tips:</h4>
                    <ul>
                        <li>Start early - quality applications take time</li>
                        <li>Tailor your essays to the specific scholarship</li>
                        <li>Get feedback from mentors or advisors</li>
                        <li>Follow all instructions carefully</li>
                    </ul>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn-primary" onclick="openScholarshipWebsite('${scholarship.website}', ${scholarship.id})">
                    Visit Official Website
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Open scholarship website
function openScholarshipWebsite(url, scholarshipId) {
    if (url && url !== '#') {
        // Track application attempt
        trackScholarshipApplication(scholarshipId);
        
        // Open in new tab
        window.open(url, '_blank');
        
        MentoraX.showNotification('Good luck with your application!', 'success');
    } else {
        MentoraX.showNotification('Application website not available', 'error');
    }
}

// Track scholarship application
function trackScholarshipApplication(scholarshipId) {
    let applications = JSON.parse(localStorage.getItem('scholarship_applications')) || [];
    applications.push({
        scholarshipId: scholarshipId,
        appliedAt: new Date().toISOString(),
        status: 'applied'
    });
    localStorage.setItem('scholarship_applications', JSON.stringify(applications));
}

// Save scholarship
function saveScholarship(id) {
    let savedScholarships = JSON.parse(localStorage.getItem('saved_scholarships')) || [];
    
    if (!savedScholarships.includes(id)) {
        savedScholarships.push(id);
        localStorage.setItem('saved_scholarships', JSON.stringify(savedScholarships));
        MentoraX.showNotification('Scholarship saved to your list!', 'success');
        
        // Update UI
        const saveBtn = document.querySelector(`button[onclick="saveScholarship(${id})"]`);
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-bookmark" style="color: #667eea;"></i> Saved';
            saveBtn.onclick = () => removeSavedScholarship(id);
        }
    } else {
        removeSavedScholarship(id);
    }
}

// Remove saved scholarship
function removeSavedScholarship(id) {
    let savedScholarships = JSON.parse(localStorage.getItem('saved_scholarships')) || [];
    savedScholarships = savedScholarships.filter(savedId => savedId !== id);
    localStorage.setItem('saved_scholarships', JSON.stringify(savedScholarships));
    MentoraX.showNotification('Scholarship removed from saved list', 'info');
    
    // Update UI
    const saveBtn = document.querySelector(`button[onclick*="saveScholarship(${id})"], button[onclick*="removeSavedScholarship(${id})"]`);
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i> Save';
        saveBtn.onclick = () => saveScholarship(id);
    }
}

// Share scholarship
function shareScholarship(id) {
    const scholarships = JSON.parse(localStorage.getItem('scholarships')) || getSampleScholarships();
    const scholarship = scholarships.find(s => s.id === id);
    
    if (scholarship) {
        if (navigator.share) {
            navigator.share({
                title: scholarship.name,
                text: `Check out this scholarship: ${scholarship.name} from ${scholarship.organization}`,
                url: window.location.href + '#scholarship-' + id
            });
        } else {
            // Fallback for browsers without Web Share API
            const shareData = `${scholarship.name} - ${scholarship.organization}\n${scholarship.description}\nDeadline: ${new Date(scholarship.deadline).toLocaleDateString()}\nAmount: ${scholarship.amount}`;
            
            navigator.clipboard.writeText(shareData).then(() => {
                MentoraX.showNotification('Scholarship details copied to clipboard!', 'success');
            }).catch(() => {
                MentoraX.showNotification('Unable to copy to clipboard', 'error');
            });
        }
    }
}

// Initialize featured scholarships
function initializeFeaturedScholarships() {
    const featuredCards = document.querySelectorAll('.btn-featured');
    featuredCards.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.featured-card');
            const title = card.querySelector('h3').textContent;
            
            // Find scholarship by title
            const scholarships = JSON.parse(localStorage.getItem('scholarships')) || getSampleScholarships();
            const scholarship = scholarships.find(s => s.name.includes(title.split(' ').slice(0, 2).join(' ')));
            
            if (scholarship) {
                showScholarshipDetails(scholarship);
            }
        });
    }
});

// Enhanced filter initialization
function initializeEnhancedFilters() {
    initializeFilters(); // Keep existing functionality
    
    // Add field filter if it doesn't exist
    const filtersContainer = document.querySelector('.scholarship-filters');
    if (filtersContainer && !document.getElementById('fieldFilter')) {
        const fieldFilterHTML = `
            <select id="fieldFilter" class="filter-select">
                <option value="all">All Fields</option>
                <option value="engineering">Engineering</option>
                <option value="medicine">Medicine</option>
                <option value="business">Business</option>
                <option value="arts">Arts & Humanities</option>
                <option value="science">Sciences</option>
                <option value="social">Social Sciences</option>
            </select>
        `;
        filtersContainer.insertAdjacentHTML('beforeend', fieldFilterHTML);
        document.getElementById('fieldFilter').addEventListener('change', applyFilters);
    }
}

// Enhanced search functionality
function initializeAdvancedSearch() {
    initializeSearch(); // Keep existing functionality
    
    const searchInput = document.querySelector('.scholarship-search input');
    if (searchInput) {
        // Add real-time search
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performAdvancedSearch(e.target.value);
            }, 300);
        });
    }
}

function performAdvancedSearch(query) {
    if (!query.trim()) {
        loadScholarships();
        return;
    }
    
    const scholarships = JSON.parse(localStorage.getItem('scholarships')) || getSampleScholarships();
    const filteredScholarships = scholarships.filter(scholarship => 
        scholarship.name.toLowerCase().includes(query.toLowerCase()) ||
        scholarship.organization.toLowerCase().includes(query.toLowerCase()) ||
        scholarship.description.toLowerCase().includes(query.toLowerCase()) ||
        scholarship.field.toLowerCase().includes(query.toLowerCase()) ||
        scholarship.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    displayScholarships(filteredScholarships);
    updateScholarshipStats(filteredScholarships);
}

// Sorting functionality
function setupSortingOptions() {
    const sortContainer = document.querySelector('.scholarship-controls') || document.querySelector('.scholarship-filters');
    if (sortContainer && !document.getElementById('sortSelect')) {
        const sortHTML = `
            <div class="sort-container" style="margin-left: auto;">
                <label for="sortSelect" style="margin-right: 8px; font-weight: 600;">Sort by:</label>
                <select id="sortSelect" class="filter-select" style="min-width: 150px;">
                    <option value="deadline">Deadline (Soon)</option>
                    <option value="amount">Amount (High to Low)</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="recent">Recently Added</option>
                </select>
            </div>
        `;
        sortContainer.insertAdjacentHTML('beforeend', sortHTML);
        document.getElementById('sortSelect').addEventListener('change', function() {
            const scholarships = getCurrentDisplayedScholarships();
            const sorted = sortScholarships(scholarships, this.value);
            displayScholarships(sorted);
        });
    }
}

function sortScholarships(scholarships, sortBy) {
    const sorted = [...scholarships];
    
    switch(sortBy) {
        case 'deadline':
            return sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        case 'amount':
            return sorted.sort((a, b) => {
                const amountA = extractAmountValue(a.amount);
                const amountB = extractAmountValue(b.amount);
                return amountB - amountA;
            });
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'recent':
            return sorted.reverse();
        default:
            return sorted;
    }
}

function extractAmountValue(amountStr) {
    if (amountStr.toLowerCase().includes('full')) return 100000;
    const numbers = amountStr.match(/\d+/g);
    return numbers ? parseInt(numbers[0]) : 0;
}

function getCurrentDisplayedScholarships() {
    return JSON.parse(localStorage.getItem('scholarships')) || getSampleScholarships();
}

// Saved scholarships functionality
function initializeSavedScholarships() {
    if (!localStorage.getItem('savedScholarships')) {
        localStorage.setItem('savedScholarships', JSON.stringify([]));
    }
    
    // Add saved scholarships section to the page if it doesn't exist
    addSavedScholarshipsSection();
}

function addSavedScholarshipsSection() {
    const mainContainer = document.querySelector('.scholarships-container') || document.querySelector('main');
    if (mainContainer && !document.getElementById('savedScholarshipsSection')) {
        const savedSectionHTML = `
            <section id="savedScholarshipsSection" class="saved-scholarships" style="
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                border-radius: 20px;
                padding: 30px;
                margin: 30px 0;
                color: white;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            ">
                <div class="section-header" style="text-align: center; margin-bottom: 25px;">
                    <h2 style="margin: 0; font-size: 28px; font-weight: 700;">ðŸ’¾ Saved Scholarships</h2>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Quick access to scholarships you've bookmarked</p>
                </div>
                <div id="savedScholarshipsList" class="saved-list" style="
                    display: grid;
                    gap: 15px;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                ">
                    <div class="empty-saved" style="
                        text-align: center;
                        padding: 40px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 15px;
                        grid-column: 1 / -1;
                    ">
                        <div style="font-size: 48px; margin-bottom: 15px;">ðŸ“š</div>
                        <p style="margin: 0; font-size: 16px;">No saved scholarships yet. Start saving scholarships you're interested in!</p>
                    </div>
                </div>
            </section>
        `;
        mainContainer.insertAdjacentHTML('afterbegin', savedSectionHTML);
    }
    
    updateSavedScholarshipsList();
}

        function saveScholarship(scholarshipId) {
            const savedScholarships = JSON.parse(localStorage.getItem('savedScholarships')) || [];
            
            if (!savedScholarships.includes(scholarshipId)) {
                savedScholarships.push(scholarshipId);
                localStorage.setItem('savedScholarships', JSON.stringify(savedScholarships));
                MentoraX.showNotification('Scholarship saved! ðŸ“š', 'success');
                updateSavedScholarshipsList();
                updateSaveButtons();
            } else {
                MentoraX.showNotification('Scholarship already saved', 'info');
            }
        }

        function unsaveScholarship(scholarshipId) {
            const savedScholarships = JSON.parse(localStorage.getItem('savedScholarships')) || [];
            const index = savedScholarships.indexOf(scholarshipId);
            
            if (index > -1) {
                savedScholarships.splice(index, 1);
                localStorage.setItem('savedScholarships', JSON.stringify(savedScholarships));
                MentoraX.showNotification('Scholarship removed from saved', 'info');
                updateSavedScholarshipsList();
                updateSaveButtons();
            }
        }

        function updateSavedScholarshipsList() {
            const savedList = document.getElementById('savedScholarshipsList');
            if (!savedList) return;
            
            const savedIds = JSON.parse(localStorage.getItem('savedScholarships')) || [];
            const allScholarships = JSON.parse(localStorage.getItem('scholarships')) || getSampleScholarships();
            const savedScholarships = allScholarships.filter(s => savedIds.includes(s.id));
            
            if (savedScholarships.length === 0) {
                savedList.innerHTML = `
                    <div class="empty-saved" style="
                        text-align: center;
                        padding: 40px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 15px;
                        grid-column: 1 / -1;
                    ">
                        <div style="font-size: 48px; margin-bottom: 15px;">ðŸ“š</div>
                        <p style="margin: 0; font-size: 16px;">No saved scholarships yet. Start saving scholarships you're interested in!</p>
                    </div>
                `;
            } else {
                savedList.innerHTML = savedScholarships.map(scholarship => `
                    <div class="saved-scholarship-card" style="
                        background: rgba(255, 255, 255, 0.15);
                        border-radius: 15px;
                        padding: 20px;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        transition: transform 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                        <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${scholarship.name}</h4>
                        <p style="margin: 0 0 12px 0; font-size: 14px; opacity: 0.9;">${scholarship.organization}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="background: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                ${scholarship.amount}
                            </span>
                            <button onclick="unsaveScholarship(${scholarship.id})" style="
                                background: rgba(255, 255, 255, 0.2);
                                border: none;
                                color: white;
                                padding: 6px 12px;
                                border-radius: 20px;
                                cursor: pointer;
                                font-size: 12px;
                                transition: all 0.3s ease;
                            " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">Remove</button>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Setup scholarship action buttons
        function setupScholarshipActions() {
            // Add save buttons to scholarship cards
            setTimeout(() => {
                updateScholarshipCardsWithSaveButtons();
            }, 100);
        }

        function updateScholarshipCardsWithSaveButtons() {
            const scholarshipCards = document.querySelectorAll('.scholarship-card');
            scholarshipCards.forEach(card => {
                if (!card.querySelector('.save-btn')) {
                    // Extract scholarship ID (you might need to adjust this based on your HTML structure)
                    const applyBtn = card.querySelector('a[href*="apply"]') || card.querySelector('.btn-apply');
                    if (applyBtn) {
                        const scholarshipId = Math.random() * 1000 | 0; // Generate ID if not available
                        const saveBtn = document.createElement('button');
                        saveBtn.className = 'save-btn';
                        saveBtn.dataset.id = scholarshipId;
                        saveBtn.innerHTML = 'ðŸ’¾ Save';
                        saveBtn.style.cssText = `
                            background: #667eea;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-size: 14px;
                            cursor: pointer;
                            margin-left: 10px;
                            transition: all 0.3s ease;
                        `;
                        applyBtn.parentNode.appendChild(saveBtn);
                    }
                }
            });
            
            updateSaveButtons();
        }

        function updateSaveButtons() {
            const savedIds = JSON.parse(localStorage.getItem('savedScholarships')) || [];
            document.querySelectorAll('.save-btn').forEach(btn => {
                const scholarshipId = parseInt(btn.dataset.id);
                if (savedIds.includes(scholarshipId)) {
                    btn.innerHTML = 'ðŸ’¾ Saved';
                    btn.style.background = '#38a169';
                } else {
                    btn.innerHTML = 'ðŸ’¾ Save';
                    btn.style.background = '#667eea';
                }
            });
        }
    });
}

// Show scholarship details
function showScholarshipDetails(scholarship) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content scholarship-details-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            <div class="scholarship-details-header">
                <h2>${scholarship.name}</h2>
                <span class="scholarship-amount-large">${scholarship.amount}</span>
            </div>
            
            <div class="scholarship-details-content">
                <div class="details-section">
                    <h3>ðŸ“‹ Overview</h3>
                    <p>${scholarship.description}</p>
                </div>
                
                <div class="details-grid">
                    <div class="detail-box">
                        <h4>ðŸ›ï¸ Organization</h4>
                        <p>${scholarship.organization}</p>
                    </div>
                    <div class="detail-box">
                        <h4>ðŸŒ Country</h4>
                        <p>${scholarship.country}</p>
                    </div>
                    <div class="detail-box">
                        <h4>ðŸ“… Deadline</h4>
                        <p>${new Date(scholarship.deadline).toLocaleDateString()}</p>
                    </div>
                    <div class="detail-box">
                        <h4>ðŸŽ“ Level</h4>
                        <p>${scholarship.level}</p>
                    </div>
                    <div class="detail-box">
                        <h4>ðŸ“š Field</h4>
                        <p>${scholarship.field}</p>
                    </div>
                    <div class="detail-box">
                        <h4>ðŸ‘¥ Eligibility</h4>
                        <p>${scholarship.eligibility}</p>
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>ðŸ·ï¸ Tags</h3>
                    <div class="scholarship-tags">
                        ${scholarship.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn-primary" onclick="applyScholarship(${scholarship.id}); this.closest('.modal').remove();">
                    Apply for This Scholarship
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Utility functions
function getDaysUntilDeadline(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function updateResultsCount(count) {
    const resultsHeader = document.querySelector('.results-header h2');
    if (resultsHeader) {
        resultsHeader.textContent = `Scholarship Opportunities (${count} found)`;
    }
}

function showSearchResults() {
    const resultsSection = document.getElementById('scholarshipGrid');
    if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function updateScholarshipStats(scholarships) {
    // Update hero stats if elements exist
    const activeCount = document.querySelector('.hero-stats .stat:first-child .stat-number');
    const totalFunding = document.querySelector('.hero-stats .stat:nth-child(2) .stat-number');
    const countriesCount = document.querySelector('.hero-stats .stat:nth-child(3) .stat-number');
    
    if (activeCount) activeCount.textContent = scholarships.length;
    if (totalFunding) totalFunding.textContent = '$2.3B+';
    if (countriesCount) {
        const uniqueCountries = [...new Set(scholarships.map(s => s.country))].length;
        countriesCount.textContent = uniqueCountries;
    }
}

// Show saved scholarships
function showSavedScholarships() {
    const savedIds = JSON.parse(localStorage.getItem('saved_scholarships')) || [];
    
    if (savedIds.length === 0) {
        MentoraX.showNotification('No saved scholarships yet. Start saving scholarships to view them here!', 'info');
        return;
    }
    
    const scholarships = JSON.parse(localStorage.getItem('scholarships')) || getSampleScholarships();
    const savedScholarships = scholarships.filter(s => savedIds.includes(s.id));
    
    // Hide main grid and show saved section
    document.getElementById('scholarshipGrid').style.display = 'none';
    const savedSection = document.getElementById('savedScholarshipsSection');
    savedSection.style.display = 'block';
    
    // Display saved scholarships
    const savedGrid = document.getElementById('savedScholarshipsGrid');
    savedGrid.innerHTML = savedScholarships.map(scholarship => createScholarshipCard(scholarship, true)).join('');
    
    // Scroll to saved section
    savedSection.scrollIntoView({ behavior: 'smooth' });
    
    MentoraX.showNotification(`Showing ${savedScholarships.length} saved scholarships`, 'success');
}

// Show all scholarships
function showAllScholarships() {
    document.getElementById('savedScholarshipsSection').style.display = 'none';
    document.getElementById('scholarshipGrid').style.display = 'grid';
    loadScholarships();
}

// Create scholarship card with option to show if saved
function createScholarshipCard(scholarship, isSavedView = false) {
    const savedIds = JSON.parse(localStorage.getItem('saved_scholarships')) || [];
    const isSaved = savedIds.includes(scholarship.id);
    
    return displayScholarships([scholarship]).replace(
        `<button class="btn-save" onclick="saveScholarship(${scholarship.id})">`,
        `<button class="btn-save ${isSaved ? 'saved' : ''}" onclick="${isSaved ? 'removeSavedScholarship' : 'saveScholarship'}(${scholarship.id})">
            <i class="fas fa-bookmark" style="color: ${isSaved ? '#667eea' : 'inherit'};"></i> ${isSaved ? 'Saved' : 'Save'}`
    );
}

// Enhanced sort functionality
function initializeSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            const scholarships = JSON.parse(localStorage.getItem('scholarships')) || getSampleScholarships();
            
            let sortedScholarships = [...scholarships];
            
            switch(sortBy) {
                case 'deadline':
                    sortedScholarships.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
                    break;
                case 'amount':
                    sortedScholarships.sort((a, b) => {
                        const amountA = extractAmount(a.amount);
                        const amountB = extractAmount(b.amount);
                        return amountB - amountA;
                    });
                    break;
                case 'popularity':
                    sortedScholarships.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                    break;
                case 'relevance':
                default:
                    // Keep original order for relevance
                    break;
            }
            
            displayScholarships(sortedScholarships);
            MentoraX.showNotification(`Scholarships sorted by ${sortBy}`, 'success');
        });
    }
}

// Extract numeric amount from scholarship amount string
function extractAmount(amountString) {
    if (amountString.toLowerCase().includes('full')) return 1000000; // Treat full funding as highest
    const numbers = amountString.match(/\d+,?\d*/g);
    if (numbers) {
        return parseInt(numbers[0].replace(',', ''));
    }
    return 0;
}

// Add CSS for saved scholarships styling
const savedScholarshipStyles = `
    .saved-scholarships-section {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        padding: 2rem;
        border-radius: 16px;
        margin-bottom: 2rem;
    }
    
    .saved-scholarships-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
    }
    
    .btn-back-to-all {
        background: #667eea;
        color: white;
        border: none;
        padding: 0.8rem 2rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .btn-back-to-all:hover {
        background: #5a6fd8;
        transform: translateY(-2px);
    }
    
    .btn-saved-scholarships {
        background: #28a745;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .btn-saved-scholarships:hover {
        background: #218838;
        transform: translateY(-2px);
    }
    
    .btn-save.saved {
        background: #e3f2fd;
        color: #1976d2;
        border: 1px solid #1976d2;
    }
    
    @media (max-width: 768px) {
        .saved-scholarships-grid {
            grid-template-columns: 1fr;
        }
    }
`;

// Add styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = savedScholarshipStyles;
document.head.appendChild(styleSheet);

// Enhanced Scholarship Page Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeSorting();
    initializeSearchTabs();
    initializeAdvancedSearch();
    initializeScholarshipTracking();
    initializeAIMatching();
    initializeRealTimeFilters();
    loadScholarshipData();
    initializeNotifications();
});

// Initialize search tabs functionality
function initializeSearchTabs() {
    const searchTabs = document.querySelectorAll('.search-tab');
    const searchContents = document.querySelectorAll('.search-content');
    
    searchTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            searchTabs.forEach(t => t.classList.remove('active'));
            searchContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-search');
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
            }
        });
    });
    
    // Show basic search by default
    const basicSearch = document.getElementById('basic-search');
    if (basicSearch) {
        basicSearch.style.display = 'block';
    }
}
