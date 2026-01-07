// Mentors Page Full Functionality (API Integrated)

const API_BASE_URL = window.location.origin + '/api';
let allMentors = [];

document.addEventListener('DOMContentLoaded', function () {
    // Event delegation for mentor card actions
    delegate(document, 'click', '.mentor-card .btn-mentor-primary', function (e) {
        e.preventDefault();
        const card = this.closest('.mentor-card');
        const id = card?.dataset.mentorId;
        if (!id) return;
        setLoadingState(this, true, 'Opening...');
        setTimeout(() => { viewMentorProfile(id); setLoadingState(this, false); }, 300);
    });
    delegate(document, 'click', '.mentor-card .btn-mentor-secondary', function (e) {
        e.preventDefault();
        const card = this.closest('.mentor-card');
        const id = card?.dataset.mentorId;
        if (!id) return;
        setLoadingState(this, true, 'Requesting...');
        setTimeout(() => { bookSession(id); setLoadingState(this, false); }, 300);
    });
    delegate(document, 'click', '.mentor-card .btn-mentor-message', function (e) {
        e.preventDefault();
        const card = this.closest('.mentor-card');
        const id = card?.dataset.mentorId;
        if (!id) return;
        setLoadingState(this, true, 'Messaging...');
        setTimeout(() => { sendMessage(id); setLoadingState(this, false); }, 200);
    });

    initializeMentorsPage();
    setupMentorFilters();
    setupMentorSearch();
    setupEnhancedMentorFeatures();
});

async function initializeMentorsPage() {
    await loadMentorsData();
}

async function loadMentorsData() {
    const mentorsGrid = document.getElementById('mentorsGrid');
    if (mentorsGrid) {
        mentorsGrid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading mentors...</p></div>';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/mentors`);
        if (!response.ok) throw new Error('Failed to fetch mentors');

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            allMentors = result.data.map(m => ({ ...m, id: m.id || m._id })); // Ensure ID
        } else {
            allMentors = [];
        }
    } catch (error) {
        console.error('Error loading mentors:', error);
        allMentors = [];
        if (mentorsGrid) mentorsGrid.innerHTML = '<div class="error-state"><p>Failed to load mentors. Please refresh.</p></div>';
        return;
    }

    displayMentors(allMentors);
    updateMentorStats(allMentors);
}

function displayMentors(mentors) {
    const mentorsGrid = document.getElementById('mentorsGrid');
    if (!mentorsGrid) return;

    if (mentors.length === 0) {
        mentorsGrid.innerHTML = '<div class="no-results"><p>No mentors found matching your criteria.</p></div>';
        return;
    }

    mentorsGrid.innerHTML = mentors.map(mentor => createMentorCard(mentor)).join('');
}

function createMentorCard(mentor) {
    // Fallbacks for missing fields in demo data vs mongo data
    const rating = mentor.rating || 5.0;
    const mentees = mentor.mentees || 0;
    const avatar = mentor.avatar || (mentor.name ? mentor.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'M');

    return `
        <div class="mentor-card enhanced" data-mentor-id="${mentor.id}" data-field="${mentor.field || ''}" data-experience="${mentor.experience || ''}">
            <div class="mentor-badge ${mentor.status}">${getMentorBadgeText(mentor)}</div>
            
            <div class="mentor-header">
                <div class="mentor-avatar">
                    <div class="avatar-circle">${avatar}</div>
                    <div class="status-indicator ${mentor.status}"></div>
                </div>
                <div class="mentor-rating">
                    <span class="rating-number">${rating}</span>
                    <div class="stars">
                        ${'?'.repeat(Math.floor(rating))}${'?'.repeat(5 - Math.floor(rating))}
                    </div>
                    <span class="reviews-count">(${mentees} mentees)</span>
                </div>
            </div>
            
            <div class="mentor-info">
                <h3 class="mentor-name">${mentor.name}</h3>
                <p class="mentor-title">${mentor.title}</p>
                <p class="mentor-company">?? ${mentor.company}</p>
                
                <div class="mentor-stats">
                    <div class="stat">
                        <span class="stat-icon">??</span>
                        <span>${mentees} mentees</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">??</span>
                        <span>${mentor.sessions || 0} sessions</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">?</span>
                        <span>${mentor.responseTime || '24h'} response</span>
                    </div>
                </div>
                
                <p class="mentor-bio">${(mentor.bio || '').substring(0, 120)}...</p>
                
                <div class="mentor-specializations">
                    ${(mentor.specializations || mentor.expertise || []).slice(0, 3).map(spec =>
        `<span class="specialization-tag">${spec}</span>`
    ).join('')}
                </div>
                
                <div class="mentor-pricing">
                    <span class="price">$${mentor.rate || 0}/hour</span>
                    <span class="availability">${(mentor.availability || 'Flexible').split(' ').slice(0, 2).join(' ')}</span>
                </div>
            </div>
            
            <div class="mentor-actions">
                <button class="btn-mentor-primary pop-modal" onclick="viewMentorProfile('${mentor.id}')">
                    View Profile
                </button>
                <button class="btn-mentor-secondary" onclick="bookSession('${mentor.id}')">
                    Book Session
                </button>
                <button class="btn-mentor-message" onclick="sendMessage('${mentor.id}')">
                    ??
                </button>
            </div>
        </div>
    `;
}

function getMentorBadgeText(mentor) {
    if (mentor.rating >= 4.9) return "?? Top Rated";
    if (mentor.mentees > 200) return "?? Popular";
    if (mentor.responseTime === "1 hour") return "? Fast Response";
    return "? Verified";
}

function setupMentorFilters() {
    const fieldFilter = document.getElementById('fieldFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const locationFilter = document.getElementById('locationFilter');

    if (fieldFilter) fieldFilter.addEventListener('change', applyFilters);
    if (experienceFilter) experienceFilter.addEventListener('change', applyFilters);
    if (locationFilter) locationFilter.addEventListener('change', applyFilters);

    const searchBtn = document.querySelector('.btn-search-mentors');
    if (searchBtn) searchBtn.addEventListener('click', performMentorSearch);
}

function applyFilters() {
    const fieldValue = document.getElementById('fieldFilter')?.value || '';
    const experienceValue = document.getElementById('experienceFilter')?.value || '';

    const filtered = allMentors.filter(mentor => {
        let matches = true;

        if (fieldValue && mentor.field !== fieldValue) matches = false;
        if (experienceValue && mentor.experience !== experienceValue) matches = false;

        return matches;
    });

    displayMentors(filtered);
    updateSearchResults(filtered.length);
}

function performMentorSearch() {
    applyFilters();
    BraineX.showNotification('Search completed!', 'success');
}

function setupMentorSearch() {
    const searchInput = document.querySelector('.mentor-search input');

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            if (searchTerm.length > 2) {
                searchMentors(searchTerm);
            } else if (searchTerm.length === 0) {
                displayMentors(allMentors);
            }
        });
    }
}

function searchMentors(searchTerm) {
    const filtered = allMentors.filter(mentor =>
        (mentor.name || '').toLowerCase().includes(searchTerm) ||
        (mentor.title || '').toLowerCase().includes(searchTerm) ||
        (mentor.company || '').toLowerCase().includes(searchTerm) ||
        (mentor.expertise || []).some(exp => exp.toLowerCase().includes(searchTerm)) ||
        (mentor.specializations || []).some(spec => spec.toLowerCase().includes(searchTerm))
    );

    displayMentors(filtered);
}

window.viewMentorProfile = function (mentorId) {
    const mentor = allMentors.find(m => m.id == mentorId || m._id == mentorId);
    if (!mentor) return;
    showMentorProfileModal(mentor);
};

function setupEnhancedMentorFeatures() {
    setupMentorBooking();
}

function setupMentorBooking() {
    window.bookMentorSession = function (mentorId) {
        const mentor = allMentors.find(m => m.id == mentorId || m._id == mentorId);

        if (!mentor) {
            BraineX.showNotification('Mentor not found', 'error');
            return;
        }

        if (window.authAPI && !window.authAPI.isAuthenticated()) {
            BraineX.showNotification('Please login to book a session', 'error');
            BraineX.openModal('loginModal');
            return;
        }

        showBookingModal(mentor);
    };

    window.bookSession = window.bookMentorSession;
}

function showMentorProfileModal(mentor) {
    const avatar = mentor.avatar || (mentor.name ? mentor.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'M');
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content mentor-profile-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            
            <div class="profile-header">
                <div class="profile-avatar">
                    <div class="avatar-large">${avatar}</div>
                    <div class="verification-badge">? Verified</div>
                </div>
                <div class="profile-info">
                    <h2>${mentor.name}</h2>
                    <h3>${mentor.title}</h3>
                    <p class="company">?? ${mentor.company}</p>
                    <div class="profile-rating">
                        <span class="rating">${mentor.rating || 5.0} ?????</span>
                        <span class="mentees">${mentor.mentees || 0} mentees • ${mentor.sessions || 0} sessions</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-content">
                <div class="profile-section">
                    <h4>????? About</h4>
                    <p>${mentor.bio || 'No bio available.'}</p>
                </div>
                
                 <div class="pricing-section">
                    <div class="price-card">
                        <h4>?? Mentorship Rates</h4>
                        <div class="price-options">
                            <div class="price-option">
                                <span class="duration">1 hour session</span>
                                <span class="price">$${mentor.rate || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="profile-actions">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                <button class="btn-message" onclick="sendMessage('${mentor.id}'); this.closest('.modal').remove();">
                    Send Message
                </button>
                <button class="btn-primary" onclick="bookSession('${mentor.id}'); this.closest('.modal').remove();">
                    Book Session
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function showBookingModal(mentor) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content booking-modal">
            <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            <div class="booking-header">
                <h2>?? Book a Session</h2>
                <div class="mentor-summary">
                    <div>
                        <h3>${mentor.name}</h3>
                        <p>${mentor.title}</p>
                    </div>
                </div>
            </div>
            
            <form class="booking-form" onsubmit="submitBooking(event, '${mentor.id}')">
                <div class="form-group">
                     <label>Select Date</label>
                     <input type="date" name="date" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea name="message" required placeholder="What do you want to discuss?"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Confirm Booking</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

window.submitBooking = async function (event, mentorId) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector('button[type="submit"]');

    if (!window.authAPI) return;
    window.setLoadingState(btn, true, 'Booking...');

    try {
        const formData = new FormData(form);
        const bookingData = {
            date: formData.get('date'),
            message: formData.get('message')
        };

        const response = await window.authAPI.request('/applications', {
            method: 'POST',
            body: JSON.stringify({
                type: 'mentorship',
                mentorId: mentorId,
                data: bookingData
            })
        });

        const result = await response.json();

        if (result.success) {
            BraineX.showNotification('Session request sent! The mentor will contact you.', 'success');
            form.closest('.modal').remove();
        } else {
            throw new Error(result.error);
        }
    } catch (e) {
        console.error(e);
        BraineX.showNotification(e.message || 'Booking failed', 'error');
    } finally {
        window.setLoadingState(btn, false);
    }
};

window.sendMessage = function (mentorId) {
    const mentor = allMentors.find(m => m.id == mentorId || m._id == mentorId);
    if (!mentor) return;

    // Just mock message for now, as we don't have chat backend
    const message = prompt(`Send a message to ${mentor.name}:`);
    if (message && message.trim()) {
        BraineX.showNotification(`Message sent to ${mentor.name}!`, 'success');
    }
};

function updateMentorStats(mentors) {
    const totalMentors = document.querySelector('.mentor-stats .stat:first-child .stat-number');
    if (totalMentors) totalMentors.textContent = `${mentors.length}+`;
}

function updateSearchResults(count) {
    const resultsText = document.querySelector('.directory-header h2');
    if (resultsText) resultsText.textContent = `Mentor Directory (${count} mentors found)`;
}
