// API Configuration - Connect to Admin Server
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize connection to admin server
document.addEventListener('DOMContentLoaded', function () {
    connectToAdminServer();
    setupAllButtonHandlers();
});

// Connect to Admin Server (silent - no notifications)
async function connectToAdminServer() {
    // Try to fetch data from server silently with graceful fallback
    document.body.dataset.adminLoading = 'true';
    try {
        const [fields, scholarships, mentors] = await Promise.all([
            fetch(`${API_BASE_URL}/fields`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${API_BASE_URL}/scholarships`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`${API_BASE_URL}/mentors`).then(r => r.ok ? r.json() : null).catch(() => null)
        ]);
        if (fields && fields.fields) {
            localStorage.setItem('fields', JSON.stringify(fields.fields));
        }
        if (scholarships && scholarships.scholarships) {
            localStorage.setItem('scholarships', JSON.stringify(scholarships.scholarships));
        }
        if (mentors && mentors.mentors) {
            localStorage.setItem('mentors', JSON.stringify(mentors.mentors));
        }
    } catch (error) {
        // Silent fallback to cached/local data
    } finally {
        delete document.body.dataset.adminLoading;
    }
}

// Setup all button handlers with visual feedback (no notifications)
function setupAllButtonHandlers() {
    // Add click feedback to all buttons
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button, .btn, .category-card, .track-card, .benefit-card');
        if (btn && !btn.disabled) {
            // Visual feedback
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        }
    });
}

// Enhanced slider // Mobile Menu Toggle
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active');
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        const menu = document.getElementById('navMenu');
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
        }
    });
});

function scrollSlider(direction) {
    const slider = document.getElementById('tracksSlider');
    const scrollAmount = 400;

    if (direction === 'left') {
        slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.category-card, .benefit-card, .track-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// Modal Management
let currentModal = null;

function openModal(modalId) {
    closeModal(); // Close any open modal first
    currentModal = document.getElementById(modalId);
    if (currentModal) {
        currentModal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Reset forms
        const form = currentModal.querySelector('form');
        if (form) {
            form.reset();
            clearErrors();
        }
    }
}

function closeModal() {
    if (currentModal) {
        currentModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        currentModal = null;
    }
}

function switchToLogin() {
    closeModal();
    openModal('loginModal');
}

function switchToSignup() {
    closeModal();
    openModal('signupModal');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Update navigation links to open modals
document.addEventListener('DOMContentLoaded', function () {
    // Login button
    const loginLink = document.querySelector('a[href="#login"]');
    if (loginLink) {
        loginLink.addEventListener('click', function (e) {
            e.preventDefault();
            openModal('loginModal');
        });
    }

    // Signup button
    const signupLink = document.querySelector('a[href="#signup"]');
    if (signupLink) {
        signupLink.addEventListener('click', function (e) {
            e.preventDefault();
            openModal('signupModal');
        });
    }

    // Hero get started button
    const heroCta = document.querySelector('.hero .btn-primary');
    if (heroCta) {
        heroCta.addEventListener('click', function (e) {
            e.preventDefault();
            openModal('signupModal');
        });
    }
});

// Password Toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;

    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// Form Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');

    if (field && errorElement) {
        field.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');

    if (field && errorElement) {
        field.classList.remove('error');
        errorElement.classList.remove('show');
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.classList.remove('show');
    });
    document.querySelectorAll('input, select').forEach(field => {
        field.classList.remove('error');
    });
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    let isValid = true;

    // Clear previous errors
    clearErrors();

    // Validate email
    if (!email) {
        showError('loginEmail', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('loginEmail', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError('loginPassword', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('loginPassword', 'Password must be at least 6 characters');
        isValid = false;
    }

    if (isValid) {
        // Show loading state
        const submitBtn = this.querySelector('.btn-submit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Store user data
            const userData = {
                email: email,
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };

            if (rememberMe) {
                localStorage.setItem('edugateway_user', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('edugateway_user', JSON.stringify(userData));
            }

            // Show success message
            document.getElementById('loginSuccess').classList.add('show');

            // Update UI for logged in state
            updateUIForLoggedInUser(email);

            // Close modal after delay
            setTimeout(() => {
                closeModal();
                showWelcomeMessage(email);
            }, 1500);

            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }, 2000);
    }
});

// Signup Form Handler
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const field = document.getElementById('fieldOfInterest').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const newsletter = document.getElementById('newsletter').checked;

    let isValid = true;

    // Clear previous errors
    clearErrors();

    // Validate first name
    if (!firstName.trim()) {
        showError('firstName', 'First name is required');
        isValid = false;
    }

    // Validate last name
    if (!lastName.trim()) {
        showError('lastName', 'Last name is required');
        isValid = false;
    }

    // Validate email
    if (!email) {
        showError('signupEmail', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('signupEmail', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError('signupPassword', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('signupPassword', 'Password must be at least 6 characters');
        isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
        showError('confirmPassword', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }

    // Validate field of interest
    if (!field) {
        showError('fieldOfInterest', 'Please select your field of interest');
        isValid = false;
    }

    // Validate terms agreement
    if (!agreeTerms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        isValid = false;
    }

    if (isValid) {
        // Show loading state
        const submitBtn = this.querySelector('.btn-submit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Store user data
            const userData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                field: field,
                newsletter: newsletter,
                signupTime: new Date().toISOString()
            };

            localStorage.setItem('edugateway_user', JSON.stringify(userData));

            // Show success message
            document.getElementById('signupSuccess').classList.add('show');

            // Update UI for logged in state
            updateUIForLoggedInUser(email, firstName);

            // Close modal after delay
            setTimeout(() => {
                closeModal();
                showWelcomeMessage(firstName + ' ' + lastName);
            }, 1500);

            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }, 2000);
    }
});

// Social Login
function socialLogin(provider) {
    const providerNames = {
        google: 'Google',
        facebook: 'Facebook',
        linkedin: 'LinkedIn'
    };

    alert(`${providerNames[provider]} login would redirect to ${provider} OAuth. This is a demo version.`);

    // Simulate successful social login
    setTimeout(() => {
        const userData = {
            email: `user@${provider}.com`,
            firstName: 'Demo',
            lastName: 'User',
            loginTime: new Date().toISOString(),
            provider: provider
        };

        localStorage.setItem('edugateway_user', JSON.stringify(userData));
        updateUIForLoggedInUser(userData.email, userData.firstName);
        closeModal();
        showWelcomeMessage(userData.firstName + ' ' + userData.lastName);
    }, 1000);
}

// Forgot Password
function forgotPassword() {
    const email = prompt('Please enter your email address:');
    if (email && validateEmail(email)) {
        alert('Password reset link has been sent to your email address.');
    } else if (email) {
        alert('Please enter a valid email address.');
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(email, firstName = null) {
    const authButtons = document.querySelector('.auth-buttons');
    const displayName = firstName || email.split('@')[0];

    authButtons.innerHTML = `
        <div class="user-menu">
            <span class="welcome-text">Welcome, ${displayName}</span>
            <button class="btn btn-outline" onclick="logout()">Logout</button>
        </div>
    `;
}

// Show welcome message
function showWelcomeMessage(name) {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-notification';
    welcomeDiv.innerHTML = `
        <div class="notification-content">
            <h3>🎉 Welcome to MentoraX!</h3>
            <p>Hi ${name}, you're now ready to explore scholarships and opportunities!</p>
            <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
        </div>
    `;

    welcomeDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 2000;
        background: white;
        border: 2px solid #667eea;
        border-radius: 12px;
        padding: 1.5rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 300px;
            animation: slideInRight 0.5s ease;
        `;

    document.body.appendChild(welcomeDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (welcomeDiv.parentNode) {
            welcomeDiv.remove();
        }
    }, 5000);
}

// Theme Management
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.classList.add('theme-transition');
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    updateThemeToggleUI(newTheme);

    // Remove transition class after animation completes
    setTimeout(() => {
        html.classList.remove('theme-transition');
    }, 300);
}

function updateThemeToggleUI(theme) {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
        toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
}

// Initialize Theme
document.addEventListener('DOMContentLoaded', () => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let initialTheme = 'light';
    if (savedTheme) {
        initialTheme = savedTheme;
    } else if (systemPrefersDark) {
        initialTheme = 'dark';
    }

    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeToggleUI(initialTheme);
});

// Show welcome notification for new users
if (!localStorage.getItem('visited_before')) {
    setTimeout(() => {
        showNotification('Welcome to MentoraX! Explore scholarships and connect with mentors.', 'success');
        localStorage.setItem('visited_before', 'true');
    }, 2000);
}

// Logout function
function logout() {
    localStorage.removeItem('edugateway_user');
    sessionStorage.removeItem('edugateway_user');

    // Reset auth buttons
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <a href="#login" class="btn btn-outline">Log In</a>
        <a href="#signup" class="btn btn-primary">Sign Up</a>
    `;

    // Re-attach event listeners
    authButtons.querySelector('a[href="#login"]').addEventListener('click', function (e) {
        e.preventDefault();
        openModal('loginModal');
    });

    authButtons.querySelector('a[href="#signup"]').addEventListener('click', function (e) {
        e.preventDefault();
        openModal('signupModal');
    });

    alert('You have been logged out successfully.');
}

// Check for existing login on page load
document.addEventListener('DOMContentLoaded', function () {
    const userData = localStorage.getItem('edugateway_user') || sessionStorage.getItem('edugateway_user');
    if (userData) {
        const user = JSON.parse(userData);
        updateUIForLoggedInUser(user.email, user.firstName);
    }

    // Initialize login/signup buttons on all pages
    initializeAuthButtons();
});

// Initialize authentication buttons
function initializeAuthButtons() {
    const loginBtn = document.querySelector('a[href="#login"]');
    const signupBtn = document.querySelector('a[href="#signup"]');
    const getStartedBtn = document.querySelector('a[href="#signup"].btn-primary');

    if (loginBtn) {
        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openModal('loginModal');
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openModal('signupModal');
        });
    }

    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openModal('signupModal');
        });
    }
}

// Global authentication functions
window.openModal = function (modalId) {
    closeModal(); // Close any open modal first
    currentModal = document.getElementById(modalId);
    if (currentModal) {
        currentModal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Reset forms
        const form = currentModal.querySelector('form');
        if (form) {
            form.reset();
            clearErrors();
        }
    }
}

window.closeModal = function () {
    if (currentModal) {
        currentModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        currentModal = null;
    }
}

window.switchToLogin = function () {
    closeModal();
    openModal('loginModal');
}

window.switchToSignup = function () {
    closeModal();
    openModal('signupModal');
}

// FAQ Toggle
function toggleFAQ(questionElement) {
    const faqItem = questionElement.parentElement;
    const isActive = faqItem.classList.contains('active');

    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Open current item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Enhanced search functionality
const searchBtnEl = document.querySelector('.btn-search');
if (searchBtnEl) searchBtnEl.addEventListener('click', function () {
    const field = document.querySelector('.search-input').value;
    const programType = document.querySelectorAll('.search-input')[1].value;
    const deadline = document.querySelectorAll('.search-input')[2].value;

    // Show loading state
    this.textContent = 'Searching...';
    this.disabled = true;

    setTimeout(() => {
        alert(`Searching for ${programType || 'opportunities'} in ${field || 'all fields'}${deadline ? ' with deadline: ' + deadline : ''}. This would redirect to search results page.`);
        this.textContent = 'Find Opportunities';
        this.disabled = false;
    }, 1000);
});

// Add CSS for animations
const additionalStyles = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .welcome-notification .notification-content h3 {
        margin: 0 0 0.5rem 0;
        color: #667eea;
    }
    
    .welcome-notification .notification-content p {
        margin: 0 0 1rem 0;
        color: #666;
    }
    
    .welcome-notification .notification-content button {
        background: #667eea;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .user-menu {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .welcome-text {
        color: white;
        font-weight: 500;
    }
    
    @media (max-width: 768px) {
        .user-menu {
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .welcome-notification {
            right: 10px !important;
            left: 10px !important;
            max-width: none !important;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Scholarship filtering
document.addEventListener('DOMContentLoaded', function () {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const scholarshipCards = document.querySelectorAll('.scholarship-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter cards
            scholarshipCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Mentor connect buttons
    document.querySelectorAll('.btn-connect').forEach(btn => {
        btn.addEventListener('click', function () {
            const mentorName = this.closest('.mentor-card').querySelector('h3').textContent;
            this.textContent = 'Connecting...';
            this.disabled = true;
            this.setAttribute('aria-busy', 'true');

            setTimeout(() => {
                alert(`Great! A connection request has been sent to ${mentorName}. They will get back to you within 24 hours.`);
                this.textContent = 'Connected ✓';
                this.style.background = '#28a745';
                this.disabled = false;
                this.removeAttribute('aria-busy');
            }, 1500);
        });
    });

    // Scholarship apply buttons
    document.querySelectorAll('.btn-apply').forEach(btn => {
        btn.addEventListener('click', function () {
            const scholarshipName = this.closest('.scholarship-card').querySelector('h3').textContent;
            this.textContent = 'Loading...';
            this.disabled = true;
            this.setAttribute('aria-busy', 'true');

            setTimeout(() => {
                alert(`Redirecting to ${scholarshipName} application page. This would open the scholarship details and application form.`);
                this.textContent = 'View Details';
                this.disabled = false;
                this.removeAttribute('aria-busy');
            }, 1000);
        });
    });

    // Roadmap tabs - Enhanced with ARIA and smooth animations
    const roadmapTabs = document.querySelectorAll('.roadmap-tab');
    const roadmapContents = document.querySelectorAll('.roadmap-content');

    roadmapTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            // Update ARIA attributes
            roadmapTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');

            // Show corresponding content with smooth fade animation
            roadmapContents.forEach(content => {
                if (content.id === targetTab + '-roadmap') {
                    // Fade out current content first
                    content.style.display = 'none';
                    content.classList.add('active');

                    // Then fade in with delay
                    setTimeout(() => {
                        content.style.display = 'block';
                        content.style.opacity = '0';

                        // Trigger reflow to ensure transition works
                        void content.offsetWidth;

                        content.style.opacity = '1';

                        // Animate timeline items sequentially
                        const timelineItems = content.querySelectorAll('.timeline-item');
                        timelineItems.forEach((item, index) => {
                            item.style.opacity = '0';
                            item.style.transform = 'translateX(-20px)';

                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'translateX(0)';
                            }, 100 + (index * 150));
                        });
                    }, 100);
                } else {
                    content.classList.remove('active');
                    content.style.display = 'none';
                }
            });
        });
    });
});

// Enhanced track card functionality
document.querySelectorAll('.btn-explore').forEach(btn => {
    btn.addEventListener('click', function () {
        const trackName = this.closest('.track-card').querySelector('h3').textContent;
        this.textContent = 'Loading...';
        this.disabled = true;
        this.setAttribute('aria-busy', 'true');

        setTimeout(() => {
            alert(`Exploring ${trackName} track! This would redirect to a detailed page with:\n• All related scholarships\n• Relevant roadmaps\n• Matched mentors\n• Success stories\n• Resource library`);
            this.textContent = 'Explore Track';
            this.disabled = false;
            this.removeAttribute('aria-busy');
        }, 1000);
    });
});

// Category card interactions
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function () {
        const action = this.querySelector('h3').textContent.toLowerCase();

        if (action.includes('scholarship')) {
            document.getElementById('scholarships').scrollIntoView({ behavior: 'smooth' });
        } else if (action.includes('fields') || action.includes('explore')) {
            document.getElementById('tracks').scrollIntoView({ behavior: 'smooth' });
        } else if (action.includes('project')) {
            alert('Project creation portal coming soon! This would allow you to:\n• Submit project proposals\n• Find collaborators\n• Get funding recommendations\n• Connect with mentors');
        } else if (action.includes('roadmap')) {
            document.getElementById('roadmaps').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Enhanced search with live suggestions
const searchInputs = document.querySelectorAll('.search-input');
let searchTimeout;

searchInputs.forEach(input => {
    input.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            // This would normally make API calls for live search suggestions
            if (window.__DEBUG__) { console.info('Live search:', this.value); }
        }, 300);
    });
});

// Add smooth animations for timeline items
const observerForTimeline = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
        }
    });
}, { threshold: 0.1 });

// Statistics counter animation for about section
function animateStats() {
    const stats = document.querySelectorAll('.stat-item h4');

    stats.forEach(stat => {
        const finalNumber = parseInt(stat.textContent.replace(/[^\d]/g, ''));
        const suffix = stat.textContent.replace(/[\d,]/g, '');
        let currentNumber = 0;
        const increment = finalNumber / 50;

        const updateStat = () => {
            if (currentNumber < finalNumber) {
                currentNumber += increment;
                const displayNumber = Math.floor(currentNumber).toLocaleString();
                stat.textContent = displayNumber + suffix;
                requestAnimationFrame(updateStat);
            } else {
                stat.textContent = finalNumber.toLocaleString() + suffix;
            }
        };

        updateStat();
    });
}

// Trigger stats animation when visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const aboutSection = document.querySelector('.about');
if (aboutSection) {
    statsObserver.observe(aboutSection);
}

// Add particle effect to hero section (optional enhancement)
function createParticle() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation: float ${3 + Math.random() * 4}s infinite ease-in-out;
        pointer-events: none;
    `;

    hero.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 7000);
}

// Create particles periodically
setInterval(createParticle, 500);

// Add floating animation
const floatAnimation = `
    @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        50% { transform: translateY(-20px) rotate(180deg); }
    }
`;

const animationStyle = document.createElement('style');
animationStyle.textContent = floatAnimation;
document.head.appendChild(animationStyle);