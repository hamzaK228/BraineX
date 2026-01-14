// API Configuration
const API_BASE_URL = '/api';

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
            if (data.success && data.data) renderTracks(data.data);
        }

        if (scholarshipsRes.ok) {
            const data = await scholarshipsRes.json();
            if (data.success && data.data) renderScholarships(data.data);
        }

        if (mentorsRes.ok) {
            const data = await mentorsRes.json();
            if (data.success && data.data) renderMentors(data.data);
        }

    } catch (error) {
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
            console.error('Error loading public data:', error);
        }
        showNotification('Unable to load some content. Please refresh completely.', 'error');
    } finally {
        document.body.classList.remove('loading-data');
    }
}

function renderTracks(fields) {
    const slider = document.getElementById('tracksSlider');
    if (!slider) return;

    slider.innerHTML = fields.map(field => {
        const iconText = field.icon || '📚';
        const nameText = field.name || 'Unknown';
        const descText = field.description || 'No description';
        const salaryText = field.salary || 'N/A';
        const careerText = field.careers ? field.careers.split(',')[0] : 'Various';

        return `
            <div class="track-card">
                <h3>${escapeHtml(iconText)} ${escapeHtml(nameText)}</h3>
                <p>${escapeHtml(descText)}</p>
                <div class="track-stats">
                    <div class="stat"><span>Salary:</span><strong>${escapeHtml(salaryText)}</strong></div>
                    <div class="stat"><span>Careers:</span><strong>${escapeHtml(careerText)}</strong></div>
                </div>
                <button class="btn-explore">Explore Track</button>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderScholarships(scholarships) {
    const grid = document.querySelector('.scholarship-grid');
    if (!grid) return;

    // Only show top 4 most popular scholarships (Full Funding first)
    const popularScholarships = scholarships
        .filter(s => s.status === 'active')
        .sort((a, b) => {
            // Prioritize Full Funding scholarships
            if (a.amount === 'Full Funding' && b.amount !== 'Full Funding') return -1;
            if (b.amount === 'Full Funding' && a.amount !== 'Full Funding') return 1;
            return 0;
        })
        .slice(0, 4); // Only show 4

    grid.innerHTML = popularScholarships.map(s => {
        const deadline = s.deadline ? new Date(s.deadline).toLocaleDateString() : 'N/A';
        const name = escapeHtml(s.name || 'Scholarship');
        const amount = escapeHtml(s.amount || 'N/A');
        const org = escapeHtml(s.organization || 'N/A');
        const country = escapeHtml(s.country || 'Global');
        const desc = escapeHtml((s.description || '').substring(0, 100));
        const category = escapeHtml(s.category || 'General');

        return `
            <div class="scholarship-card" data-category="${category}">
                <div class="scholarship-header">
                    <h3>${name}</h3>
                    <span class="scholarship-amount">${amount}</span>
                </div>
                <div class="scholarship-details">
                    <p><strong>Organization:</strong> ${org}</p>
                    <p><strong>Country:</strong> ${country}</p>
                    <p><strong>Deadline:</strong> ${deadline}</p>
                </div>
                <p class="scholarship-description">${desc}...</p>
                <div class="scholarship-tags">
                    <span class="tag">${category}</span>
                    ${country !== 'Global' ? `<span class="tag">${country}</span>` : ''}
                </div>
                <a href="/scholarships?name=${encodeURIComponent(s.name)}" class="btn-apply" style="text-decoration: none; text-align: center; display: inline-block;">View Details</a>
            </div>
        `;
    }).join('');
}

function renderMentors(mentors) {
    const grid = document.querySelector('.mentors-grid');
    if (!grid) return;

    const verifiedMentors = mentors.filter(m => m.status === 'verified').slice(0, 4);

    grid.innerHTML = verifiedMentors.map(m => {
        const name = escapeHtml(m.name || 'Mentor');
        return `
            <div class="mentor-card">
                <div class="mentor-avatar">
                     <div style="background: #667eea; color: white; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1rem;">
                        ${name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                     </div>
                </div>
                <h3>${name}</h3>
                <p class="mentor-title">${escapeHtml(m.title || 'Professional')}</p>
                <p class="mentor-company">${escapeHtml(m.company || 'BraineX')}</p>
                <div class="mentor-expertise">
                    <span>${escapeHtml(m.field || 'General')}</span>
                    <span>${escapeHtml(m.experience || 'Experienced')}</span>
                </div>
                <p class="mentor-bio">${m.bio ? escapeHtml(m.bio.substring(0, 80)) + '...' : 'Experienced mentor ready to help.'}</p>
                <div class="mentor-stats">
                    <div><strong>${m.mentees || 0}</strong> Mentees</div>
                    <div><strong>${m.rating || '5.0'}★</strong> Rating</div>
                </div>
                <button class="btn-connect">Connect</button>
            </div>
        `;
    }).join('');
}

// --- UI & Event Delegation ---

function setupUI() {
    setupInteractionHandlers();
    setupMobileMenu();
    setupSmoothScroll();
    setupIntersectionObservers();
    setupFormValidation();
    setupTracksSlider();
    setupFAQ();
    setupTheme();
    animateStatsInit();

    // Global Modal Delegation & CSP Comp
    setupGlobalDelegation();

    // NEW: Setup scholarship filters
    setupScholarshipFilters();

    // NEW: Setup roadmap tabs
    setupRoadmapTabs();

    // NEW: Setup Find Opportunities button
    setupFindOpportunities();
}

// NEW: Handle Find Opportunities search
function setupFindOpportunities() {
    const searchBtn = document.querySelector('.btn-search');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const fieldSelect = document.querySelector('.search-bar select:first-child');
            const typeSelect = document.querySelector('.search-bar select:nth-child(2)');
            const dateInput = document.querySelector('.search-bar input[type="date"]');

            const field = fieldSelect?.value || '';
            const type = typeSelect?.value || '';
            const date = dateInput?.value || '';

            // Build query string
            const params = new URLSearchParams();
            if (field) params.append('field', field);
            if (type) params.append('type', type);
            if (date) params.append('deadline', date);

            // Navigate to scholarships page with filters
            const queryString = params.toString();
            window.location.href = `/scholarships${queryString ? '?' + queryString : ''}`;
        });
    }
}

// NEW: Handle scholarship filter buttons on main page
function setupScholarshipFilters() {
    const filterBtns = document.querySelectorAll('.scholarship-filters .filter-btn');
    const scholarshipCards = document.querySelectorAll('.scholarship-grid .scholarship-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            // Filter cards
            scholarshipCards.forEach(card => {
                const category = card.getAttribute('data-category')?.toLowerCase() || '';
                if (filter === 'all') {
                    card.style.display = '';
                } else if (category.includes(filter) ||
                    card.textContent.toLowerCase().includes(filter)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// NEW: Handle roadmap tabs on main page
function setupRoadmapTabs() {
    const tabs = document.querySelectorAll('.roadmap-tab');
    const contents = document.querySelectorAll('.roadmap-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Show corresponding content
            const targetId = tab.getAttribute('data-tab') + '-roadmap';
            contents.forEach(content => {
                if (content.id === targetId) {
                    content.classList.add('active');
                    content.setAttribute('aria-hidden', 'false');
                } else {
                    content.classList.remove('active');
                    content.setAttribute('aria-hidden', 'true');
                }
            });
        });
    });
}

function setupInteractionHandlers() {
    document.addEventListener('click', function (e) {
        // Visual feedback for all buttons
        const btn = e.target.closest('button, .btn, .category-card, .track-card, .benefit-card');
        if (btn && !btn.disabled) {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 150);
        }

        // Track Explore - Navigate to fields page with track info
        if (e.target.closest('.btn-explore')) {
            e.preventDefault();
            const b = e.target.closest('.btn-explore');
            const card = b.closest('.track-card');
            if (card) {
                const titleEl = card.querySelector('h3');
                const name = titleEl ? titleEl.textContent : '';
                // Extract field name from the title (remove emoji)
                const fieldName = name.replace(/^[\u{1F300}-\u{1F9FF}\s]+/u, '').trim();
                // Navigate to fields page with search for this field
                window.location.href = `/fields?search=${encodeURIComponent(fieldName)}`;
            } else {
                window.location.href = '/fields';
            }
        }

        // Scholarship Apply
        if (e.target.closest('.btn-apply')) {
            const b = e.target.closest('.btn-apply');
            const card = b.closest('.scholarship-card');
            const name = card ? card.querySelector('h3').textContent : 'this scholarship';
            window.location.href = `/scholarships?name=${encodeURIComponent(name)}`;
        }

        // Mentor Connect
        if (e.target.closest('.btn-connect')) {
            const b = e.target.closest('.btn-connect');
            const card = b.closest('.mentor-card');
            const name = card ? card.querySelector('h3').textContent : 'this mentor';
            if (checkLoginForAction()) {
                handleAction(b, `Initiating connection with ${name}...`, 'Request Sent ✓');
            }
        }
    });
}

function setupGlobalDelegation() {
    document.addEventListener('click', function (e) {
        // Modal Actions
        const closeBtn = e.target.closest('.close-modal');
        if (closeBtn || (e.target.classList.contains('modal') && !e.target.classList.contains('modal-content'))) {
            window.closeModal();
        }

        const loginTrigger = e.target.closest('a[href="#login"]');
        if (loginTrigger) {
            e.preventDefault();
            window.openModal('loginModal');
        }

        const signupTrigger = e.target.closest('a[href="#signup"]');
        if (signupTrigger) {
            e.preventDefault();
            window.openModal('signupModal');
        }

        // Auth Form Shortcuts
        const signupSwitch = e.target.closest('a[onclick="switchToSignup()"]') || (e.target.tagName === 'A' && e.target.textContent.toLowerCase().includes('sign up here'));
        if (signupSwitch && e.target.closest('#loginModal')) {
            e.preventDefault();
            window.switchToSignup();
        }

        const loginSwitch = e.target.closest('a[onclick="switchToLogin()"]') || (e.target.tagName === 'A' && e.target.textContent.toLowerCase().includes('sign in here'));
        if (loginSwitch && e.target.closest('#signupModal')) {
            e.preventDefault();
            window.switchToLogin();
        }

        // Password Toggles
        const passToggle = e.target.closest('.password-toggle button, button[onclick^="togglePassword"]');
        if (passToggle) {
            e.preventDefault();
            const input = passToggle.parentElement.querySelector('input');
            if (input) {
                input.type = input.type === 'password' ? 'text' : 'password';
            }
        }

        // Social Logins
        const socialBtn = e.target.closest('.btn-social');
        if (socialBtn) {
            const provider = socialBtn.getAttribute('data-provider') || 'social';
            window.socialLogin(provider);
        }

        // FAQ Items
        const faqHeader = e.target.closest('.faq-question');
        if (faqHeader) {
            window.toggleFAQ(faqHeader);
        }

        // Mobile Toggle Link Closing
        if (e.target.closest('.nav-menu a')) {
            const menu = document.getElementById('navMenu');
            if (menu && menu.classList.contains('active')) {
                window.toggleMenu();
            }
        }
    });
}

function handleAction(btn, message, successText = null) {
    const originalText = btn.textContent;
    btn.textContent = 'Processing...';
    btn.disabled = true;

    setTimeout(() => {
        showNotification(successText || 'Action successful!', 'success');
        btn.textContent = successText || originalText;
        btn.disabled = false;
    }, 1000);
}

function checkLoginForAction() {
    if (window.authAPI && window.authAPI.isAuthenticated()) return true;
    window.openModal('loginModal');
    showNotification('Please sign in to continue.', 'info');
    return false;
}

// --- Auth flows ---

async function checkLoginState() {
    if (window.authAPI && window.authAPI.isAuthenticated()) {
        try {
            const res = await window.authAPI.getCurrentUser();
            if (res.success) updateUIForUser(res.data);
        } catch (e) {
            console.error('Session verification failed', e);
        }
    }
}

function updateUIForUser(user) {
    const containers = document.querySelectorAll('.auth-buttons');
    containers.forEach(container => {
        container.innerHTML = `
            <div class="user-profile" style="display: flex; align-items: center; gap: 15px;">
                <span class="user-greeting" style="color: white; font-weight: 500;">Hi, ${user.firstName || 'Student'}</span>
                <button class="btn btn-outline btn-logout" style="border-color: rgba(255,255,255,0.3); color: white;">Logout</button>
            </div>
        `;
        const logoutBtn = container.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.authAPI) window.authAPI.logout();
                window.location.reload();
            });
        }
    });
}

function setupFormValidation() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Authenticating...';

            try {
                const res = await window.authAPI.login({ email: loginForm.email.value, password: loginForm.password.value });
                if (res.success) {
                    window.closeModal();
                    updateUIForUser(res.data);
                    showNotification('Login successful!', 'success');
                } else {
                    showNotification(res.error || 'Invalid credentials', 'error');
                }
            } catch (err) {
                showNotification('Connection error', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Sign In';
            }
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = signupForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Creating account...';

            const data = {
                firstName: signupForm.firstName.value,
                lastName: signupForm.lastName.value,
                email: signupForm.email.value,
                password: signupForm.password.value,
                field: signupForm.field.value
            };

            try {
                const res = await window.authAPI.register(data);
                if (res.success) {
                    window.closeModal();
                    updateUIForUser(res.data);
                    showNotification('Welcome to BraineX!', 'success');
                } else {
                    showNotification(res.error || 'Registration failed', 'error');
                }
            } catch (err) {
                showNotification('Connection error', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        });
    }
}

// --- Menu & Navigation ---

function setupMobileMenu() {
    window.toggleMenu = function () {
        const menu = document.getElementById('navMenu');
        const btn = document.querySelector('.mobile-menu-btn');
        if (!menu || !btn) return;

        const isOpen = menu.classList.toggle('active');
        btn.setAttribute('aria-expanded', isOpen);
        btn.textContent = isOpen ? '✕' : '☰';
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    const btn = document.querySelector('.mobile-menu-btn');
    if (btn) btn.addEventListener('click', window.toggleMenu);
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// --- Specific Features ---

function setupTracksSlider() {
    const slider = document.getElementById('tracksSlider');
    const prev = document.querySelector('.slider-btn.btn-prev');
    const next = document.querySelector('.slider-btn.btn-next');

    if (!slider) return;

    const scroll = (dir) => {
        const amount = slider.clientWidth * 0.8;
        slider.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    if (prev) prev.addEventListener('click', () => scroll('left'));
    if (next) next.addEventListener('click', () => scroll('right'));
}

window.toggleFAQ = function (question) {
    const item = question.closest('.faq-item');
    if (!item) return;

    const wasActive = item.classList.contains('active');

    // Close others
    document.querySelectorAll('.faq-item.active').forEach(i => {
        i.classList.remove('active');
        const ans = i.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = null;
        const tg = i.querySelector('.faq-toggle');
        if (tg) tg.textContent = '+';
    });

    if (!wasActive) {
        item.classList.add('active');
        const ans = item.querySelector('.faq-answer');
        if (ans) ans.style.maxHeight = ans.scrollHeight + "px";
        const tg = item.querySelector('.faq-toggle');
        if (tg) tg.textContent = '-';
    }
};

function setupFAQ() {
    // Delegation is handled in setupGlobalDelegation
}

function setupTheme() {
    const getTheme = () => localStorage.getItem('brainex_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const setTheme = (t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('brainex_theme', t);
        const btn = document.querySelector('.theme-toggle');
        if (btn) btn.innerHTML = t === 'dark' ? '☀️ Light' : '🌙 Dark';
    };

    setTheme(getTheme());

    window.toggleTheme = () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(next);
    };
}

// --- Modals ---

let currentActiveModal = null;

window.openModal = function (id) {
    if (currentActiveModal) window.closeModal();
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        currentActiveModal = modal;
    }
};

window.closeModal = function () {
    if (currentActiveModal) {
        currentActiveModal.classList.remove('show');
        document.body.style.overflow = '';
        currentActiveModal = null;
    }
};

window.switchToLogin = () => window.openModal('loginModal');
window.switchToSignup = () => window.openModal('signupModal');

// --- Utilities ---

function setupIntersectionObservers() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.category-card, .benefit-card, .track-card, .scholarship-card').forEach(el => observer.observe(el));
}

function animateStatsInit() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.innerText.replace(/\D/g, ''));
                if (!isNaN(target)) animateNumber(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    });

    document.querySelectorAll('.stat-number').forEach(s => observer.observe(s));
}

function animateNumber(el, target) {
    let current = 0;
    const increment = target / 60;
    const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.innerText = target + (el.innerText.includes('%') ? '%' : '+');
            clearInterval(interval);
        } else {
            el.innerText = Math.floor(current) + (el.innerText.includes('%') ? '%' : '+');
        }
    }, 16);
}

function showNotification(msg, type = 'info') {
    const existing = document.querySelector('.notification-container');
    const container = existing || document.createElement('div');
    if (!existing) {
        container.className = 'notification-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; pointer-events: none;';
        document.body.appendChild(container);
    }

    const note = document.createElement('div');
    note.className = `notification ${type}`;
    note.innerText = msg;
    note.style.cssText = `
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white; padding: 12px 24px; border-radius: 8px; margin-bottom: 10px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); pointer-events: auto;
        animation: slideIn 0.3s ease-out forwards;
    `;

    container.appendChild(note);
    setTimeout(() => {
        note.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => note.remove(), 300);
    }, 4000);
}

// Global Exports
window.socialLogin = (provider) => showNotification(`Social login with ${provider} is not configured.`, 'info');
window.forgotPassword = () => showNotification("Password reset feature coming soon!", "info");
