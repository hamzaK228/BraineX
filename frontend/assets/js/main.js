// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
    // Check for existing login
    checkLoginState();

    // Initialize UI components
    setupUI();

    // Load dynamic data
    loadPublicData();
});

// --- Data Loading & Rendering ---

async function loadPublicData() {
    document.body.classList.add('loading-data');
    try {
        const [fieldsRes, scholarshipsRes, mentorsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/fields`),
            fetch(`${API_BASE_URL}/scholarships`),
            fetch(`${API_BASE_URL}/mentors`)
        ]);

        if (fieldsRes.ok) {
            const data = await fieldsRes.json();
            if (data.success) renderTracks(data.data);
        }

        if (scholarshipsRes.ok) {
            const data = await scholarshipsRes.json();
            if (data.success) renderScholarships(data.data);
        }

        if (mentorsRes.ok) {
            const data = await mentorsRes.json();
            if (data.success) renderMentors(data.data);
        }

    } catch (error) {
        console.error('Error loading public data:', error);
        // Fallback to static HTML if fetch fails (graceful degradation)
    } finally {
        document.body.classList.remove('loading-data');
    }
}

function renderTracks(fields) {
    const slider = document.getElementById('tracksSlider');
    if (!slider) return;

    slider.innerHTML = fields.map(field => `
        <div class="track-card">
            <h3>${field.icon || '📚'} ${field.name}</h3>
            <p>${field.description}</p>
            <div class="track-stats">
                <div class="stat"><span>Salary:</span><strong>${field.salary || 'N/A'}</strong></div>
                <div class="stat"><span>Careers:</span><strong>${field.careers ? field.careers.split(',')[0] : 'Various'}</strong></div>
            </div>
            <button class="btn-explore">Explore Track</button>
        </div>
    `).join('');
}

function renderScholarships(scholarships) {
    const grid = document.querySelector('.scholarship-grid');
    if (!grid) return;

    // Limit to 6 for the homepage if needed, or show all
    // For now showing all active ones
    const activeScholarships = scholarships.filter(s => s.status === 'active');

    grid.innerHTML = activeScholarships.map(s => `
        <div class="scholarship-card" data-category="${s.category}" style="display: block; opacity: 1;">
            <div class="scholarship-header">
                <h3>${s.name}</h3>
                <span class="scholarship-amount">${s.amount}</span>
            </div>
            <div class="scholarship-details">
                <p><strong>Organization:</strong> ${s.organization}</p>
                <p><strong>Country:</strong> ${s.country || 'Global'}</p>
                <p><strong>Deadline:</strong> ${new Date(s.deadline).toLocaleDateString()}</p>
            </div>
            <p class="scholarship-description">${s.description.substring(0, 100)}...</p>
            <div class="scholarship-tags">
                <span class="tag">${s.category}</span>
                ${s.country ? `<span class="tag">${s.country}</span>` : ''}
            </div>
            <button class="btn-apply">View Details</button>
        </div>
    `).join('');
}

function renderMentors(mentors) {
    const grid = document.querySelector('.mentors-grid');
    if (!grid) return;

    // Show verified mentors, maybe limit to 4
    const verifiedMentors = mentors.filter(m => m.status === 'verified').slice(0, 4);

    grid.innerHTML = verifiedMentors.map(m => `
        <div class="mentor-card">
            <div class="mentor-avatar">
                 <div style="background: #667eea; color: white; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1rem;">
                    ${m.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                 </div>
            </div>
            <h3>${m.name}</h3>
            <p class="mentor-title">${m.title}</p>
            <p class="mentor-company">${m.company}</p>
            <div class="mentor-expertise">
                <span>${m.field}</span>
                <span>${m.experience}</span>
            </div>
            <p class="mentor-bio">${m.bio ? m.bio.substring(0, 80) + '...' : 'Experienced mentor ready to help.'}</p>
            <div class="mentor-stats">
                <div><strong>${m.mentees || 0}</strong> Mentees</div>
                <div><strong>${m.rating || '5.0'}★</strong> Rating</div>
            </div>
            <button class="btn-connect">Connect</button>
        </div>
    `).join('');
}

// --- UI & Event Delegation ---

function setupUI() {
    setupAllButtonHandlers();
    setupMobileMenu();
    setupSmoothScroll();
    setupIntersectionObservers();
    setupModals();
    setupAuthForms();
    setupSearch();
    setupFilters(); // Re-implemented with delegation
    setupDelegatedActions(); // For dynamically created buttons
    setupFAQ();
    setupFAQ();
    setupTheme();
    setupTracksSlider();
    animateStatsInit();
}

// Global Event Delegation for Dynamic Content
function setupDelegatedActions() {
    document.body.addEventListener('click', function (e) {
        // Track Explore
        if (e.target.closest('.btn-explore')) {
            const btn = e.target.closest('.btn-explore');
            const trackName = btn.closest('.track-card').querySelector('h3').textContent;
            handleAction(btn, `Exploring ${trackName}... Redirecting to track details.`);
        }

        // Scholarship Apply
        if (e.target.closest('.btn-apply')) {
            const btn = e.target.closest('.btn-apply');
            const scholarshipName = btn.closest('.scholarship-card').querySelector('h3').textContent;
            handleAction(btn, `Redirecting to application for ${scholarshipName}...`);
        }

        // Mentor Connect
        if (e.target.closest('.btn-connect')) {
            const btn = e.target.closest('.btn-connect');
            const mentorName = btn.closest('.mentor-card').querySelector('h3').textContent;
            if (checkLoginForAction()) {
                handleAction(btn, `Connection request sent to ${mentorName}!`, 'Connected ✓');
            }
        }
    });
}

function handleAction(btn, alertMessage, successText = null) {
    const originalText = btn.textContent;
    btn.textContent = 'Processing...';
    btn.disabled = true;

    setTimeout(() => {
        alert(alertMessage);
        btn.textContent = successText || originalText;
        btn.disabled = false;
    }, 1000);
}

function checkLoginForAction() {
    if (localStorage.getItem('brainex_user') || sessionStorage.getItem('brainex_user')) { // Assuming generic check or authAPI
        return true;
    }
    // If authAPI available
    if (window.authAPI && window.authAPI.isAuthenticated()) return true;

    // Not logged in
    openModal('loginModal');
    return false;
}

// Scholarship Filtering (Delegated)
function setupFilters() {
    const filterContainer = document.querySelector('.scholarship-filters');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('filter-btn')) {
            // Update Active State
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filter = e.target.getAttribute('data-filter');
            const cards = document.querySelectorAll('.scholarship-card');

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        }
    });
}

// --- Original UI Functions (Preserved & Optimized) ---

function setupAllButtonHandlers() {
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button, .btn, .category-card, .track-card, .benefit-card');
        if (btn && !btn.disabled) {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 150);
        }
    });
}

function setupMobileMenu() {
    window.toggleMenu = function () {
        const menu = document.getElementById('navMenu');
        const btn = document.querySelector('.mobile-menu-btn');
        menu.classList.toggle('active');
        const isActive = menu.classList.contains('active');
        btn.setAttribute('aria-expanded', isActive);
        btn.textContent = isActive ? '✕' : '☰';
    };

    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', window.toggleMenu);
    }

    // Close on link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            const menu = document.getElementById('navMenu');
            if (menu.classList.contains('active')) {
                window.toggleMenu();
            }
        });
    });
}

function setupTracksSlider() {
    const prevBtn = document.querySelector('.slider-btn.btn-prev');
    const nextBtn = document.querySelector('.slider-btn.btn-next');

    if (prevBtn) prevBtn.addEventListener('click', () => scrollSlider('left'));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollSlider('right'));

    window.scrollSlider = function (direction) {
        const slider = document.getElementById('tracksSlider');
        if (!slider) return;
        const scrollAmount = 400;
        if (direction === 'left') {
            slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function setupIntersectionObservers() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.category-card, .benefit-card, .about').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// Modal System
let currentModal = null;

window.openModal = function (modalId) {
    if (currentModal) closeModal();
    currentModal = document.getElementById(modalId);
    if (currentModal) {
        currentModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function () {
    if (currentModal) {
        currentModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        currentModal = null;
    }
};

window.switchToLogin = () => { closeModal(); openModal('loginModal'); };
window.switchToSignup = () => { closeModal(); openModal('signupModal'); };

function setupModals() {
    // Close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Backdrop clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal();
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Switch links
    const switchSignup = document.querySelector('.js-switch-signup');
    if (switchSignup) switchSignup.addEventListener('click', (e) => { e.preventDefault(); switchToSignup(); });

    const switchLogin = document.querySelector('.js-switch-login');
    if (switchLogin) switchLogin.addEventListener('click', (e) => { e.preventDefault(); switchToLogin(); });

    // Password toggles
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.btn-toggle-password')) {
            const btn = e.target.closest('.btn-toggle-password');
            const targetId = btn.getAttribute('data-target');
            togglePassword(targetId);
        }
    });

    // Social logins
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.btn-social')) {
            const btn = e.target.closest('.btn-social');
            const provider = btn.getAttribute('data-provider');
            socialLogin(provider);
        }
    });

    // Forgot password
    const forgotLink = document.querySelector('.js-forgot-password');
    if (forgotLink) forgotLink.addEventListener('click', (e) => { e.preventDefault(); forgotPassword(); });

    // Bind triggers
    const loginLink = document.querySelector('a[href="#login"]');
    if (loginLink) loginLink.addEventListener('click', (e) => { e.preventDefault(); openModal('loginModal'); });

    const signupLink = document.querySelector('a[href="#signup"]');
    if (signupLink) signupLink.addEventListener('click', (e) => { e.preventDefault(); openModal('signupModal'); });
}

// Authentication Forms
function setupAuthForms() {
    // These should now ideally use authAPI if possible, or we keep logic here.
    // admin.js uses authAPI. main.js previously simulated it or used auth-api.js?
    // The previous main.js had extensive mock validation.
    // We should switch to real authAPI calls.

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = this.email.value;
            const password = this.password.value;

            const btn = this.querySelector('button[type="submit"]');
            btn.textContent = 'Signing in...';
            btn.disabled = true;

            try {
                if (window.authAPI) {
                    const result = await window.authAPI.login(email, password);
                    if (result.success) {
                        closeModal();
                        updateUIForUser(result.data);
                        showNotification('Welcome back!', 'success');
                    } else {
                        showError(this, result.error || 'Login failed');
                    }
                } else {
                    // Fallback to mock if API missing
                    console.warn('AuthAPI missing, using mock');
                    localStorage.setItem('brainex_user', JSON.stringify({ email }));
                    closeModal();
                    location.reload();
                }
            } catch (error) {
                console.error(error);
                showError(this, 'An error occurred');
            } finally {
                btn.textContent = 'Sign In';
                btn.disabled = false;
            }
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            // Similar logic for signup...
            const payload = {
                firstName: this.firstName.value,
                lastName: this.lastName.value,
                email: this.email.value,
                password: this.password.value,
                field: this.field.value
            };

            const btn = this.querySelector('button[type="submit"]');
            btn.textContent = 'Creating account...';
            btn.disabled = true;

            try {
                if (window.authAPI) {
                    const result = await window.authAPI.register(payload);
                    if (result.success) {
                        closeModal();
                        updateUIForUser(result.data);
                        showNotification('Account created!', 'success');
                    } else {
                        showError(this, result.error || 'Signup failed');
                    }
                }
            } catch (error) {
                showError(this, 'An error occurred');
            } finally {
                btn.textContent = 'Create Account';
                btn.disabled = false;
            }
        });
    }
}

function checkLoginState() {
    if (window.authAPI && window.authAPI.isAuthenticated()) {
        window.authAPI.getCurrentUser().then(res => {
            if (res.success) updateUIForUser(res.data);
        });
    }
}

function updateUIForUser(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <div class="user-menu" style="display: flex; align-items: center; gap: 1rem;">
                <span style="color: white; font-weight: 500;">Hello, ${user.firstName || user.name || 'User'}</span>
                <button class="btn btn-outline js-logout-btn">Logout</button>
            </div>
        `;

        // Add listener for dynamically created button
        const logoutBtn = authButtons.querySelector('.js-logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
    }
}

window.logout = function () {
    if (window.authAPI) window.authAPI.logout();
    location.reload();
};

function showError(form, message) {
    alert(message); // Simple fallback
}

window.togglePassword = function (id) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
};

window.toggleFAQ = function (el) {
    el.parentElement.classList.toggle('active');
};

function setupSearch() {
    const btn = document.querySelector('.btn-search');
    if (btn) {
        btn.addEventListener('click', () => {
            btn.textContent = 'Searching...';
            setTimeout(() => {
                alert('Search functionality linked to backend coming in next update!');
                btn.textContent = 'Find Opportunities';
            }, 800);
        });
    }
}

function setupFAQ() {
    // Handled by inline toggleFAQ or could be delegate
}

function setupTheme() {
    window.toggleTheme = function () {
        const body = document.body;
        const btn = document.querySelector('.theme-toggle');
        const isDark = body.classList.toggle('dark-theme');

        localStorage.setItem('brainex_theme', isDark ? 'dark' : 'light');
        if (btn) {
            btn.innerHTML = isDark ? '☀️ Light' : '🌙 Dark';
            btn.setAttribute('aria-pressed', isDark);
        }
    };

    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', window.toggleTheme);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('brainex_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        const btn = document.querySelector('.theme-toggle');
        if (btn) {
            btn.innerHTML = '☀️ Light';
            btn.setAttribute('aria-pressed', true);
        }
    }
}

function animateStatsInit() {
    // Stats animation logic
}

function showNotification(msg, type) {
    // Reuse notification logic
    const notification = document.createElement('div');
    notification.className = `notification ${type}`; // Ensure CSS exists
    notification.textContent = msg;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: ${type === 'success' ? '#28a745' : '#dc3545'}; 
        color: white; padding: 1rem; border-radius: 8px; z-index: 9999;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Export specific functions if needed
window.socialLogin = (p) => alert(`Login with ${p} is a demo feature.`);
window.forgotPassword = () => alert('Reset link sent to your email.');

// Roadmap Tabs (Legacy preserved)
document.querySelectorAll('.roadmap-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        const target = this.getAttribute('data-tab');
        document.querySelectorAll('.roadmap-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.roadmap-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(`${target}-roadmap`).classList.add('active');
    });
});
