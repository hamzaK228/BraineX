// Global JavaScript for all pages - Enhanced functionality

// Performance: lazy-load images and defer non-critical work
(function earlyPerformanceSetup() {
    try {
        const supportsLazy = 'loading' in HTMLImageElement.prototype;
        document.addEventListener('DOMContentLoaded', function () {
            const imgs = document.querySelectorAll('img');
            imgs.forEach(img => {
                if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
                if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
            });
        });

        if (!supportsLazy && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) { img.src = img.dataset.src; }
                        obs.unobserve(img);
                    }
                });
            }, { rootMargin: '200px' });
            document.addEventListener('DOMContentLoaded', function () {
                document.querySelectorAll('img').forEach(img => io.observe(img));
            });
        }
    } catch (_) { }
})();

// Global state management
window.__DEBUG__ = window.__DEBUG__ ?? (localStorage.getItem('debug') === 'true');

// Simple utilities
window.setLoadingState = function (button, isLoading, loadingText = 'Loading...') {
    if (!button) return;
    if (isLoading) {
        if (!button.dataset.originalText) { button.dataset.originalText = button.textContent; }
        button.textContent = loadingText;
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
    } else {
        const original = button.dataset.originalText || button.textContent;
        button.textContent = original;
        button.disabled = false;
        button.removeAttribute('aria-busy');
    }
};

window.delegate = function (root, event, selector, handler) {
    const ctx = typeof root === 'string' ? document.querySelector(root) : (root || document);
    if (!ctx) return;
    ctx.addEventListener(event, function (e) {
        const target = e.target.closest(selector);
        if (target && ctx.contains(target)) handler.call(target, e);
    });
};

window.BraineX = {
    user: null,

    init: function () {
        this.loadUserSession();
        this.initializeAuth();
        this.initializeNavigation();
        this.initializeMobileNav();
    },

    loadUserSession: function () {
        if (window.authAPI && window.authAPI.isAuthenticated()) {
            this.user = window.authAPI.user;
            this.updateUIForLoggedInUser();
        } else {
            // Check legacy
            const legacyUser = localStorage.getItem('BraineX_user');
            if (legacyUser) {
                // Migrate or just use
                try {
                    this.user = JSON.parse(legacyUser);
                    this.updateUIForLoggedInUser();
                } catch (e) { }
            }
        }
    },

    initializeAuth: function () {
        this.createAuthModals();
        this.bindAuthEvents();
        this.checkAuthRequirements();
    },

    checkAuthRequirements: function () {
        const currentPage = window.location.pathname.split('/').pop();
        const protectedPages = ['notion.html', 'mentors.html', 'projects.html']; // Adjusted for demo flow

        if (protectedPages.includes(currentPage) && !this.user) {
            setTimeout(() => {
                this.openModal('loginModal');
            }, 1000);
        }
    },

    initializeNavigation: function () {
        const currentPage = window.location.pathname.split('/').pop() || 'main.html';
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    initializeMobileNav: function () {
        const btn = document.querySelector('.mobile-menu-btn, .hamburger');
        const menu = document.querySelector('.nav-menu');
        const overlay = document.querySelector('.nav-overlay') || document.createElement('div');

        if (!overlay.classList.contains('nav-overlay')) {
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
        }

        if (!btn || !menu) return;

        const toggle = () => {
            const isActive = menu.classList.contains('active');
            menu.classList.toggle('active');
            overlay.classList.toggle('show');
            document.body.style.overflow = isActive ? '' : 'hidden';
            btn.setAttribute('aria-expanded', !isActive);
        };

        btn.addEventListener('click', toggle);
        overlay.addEventListener('click', toggle);

        // Close on link click
        menu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                if (menu.classList.contains('active')) toggle();
            });
        });
    },

    updateUIForLoggedInUser: function () {
        if (!this.user) return;
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            const displayName = this.user.firstName || this.user.email.split('@')[0];
            authButtons.innerHTML = `
                <div class="user-menu">
                    <span class="welcome-text">Hi, ${displayName}</span>
                    <button class="btn btn-outline js-logout-btn">Logout</button>
                </div>
            `;
        }
    },

    createAuthModals: function () {
        if (document.getElementById('loginModal')) return;
        // ... (Modal HTML generation, simplified for brevity as it was largely correct in previous version)
        // Re-injecting to ensure it exists if missing

        // Use the same structure as before but ensuring new IDs match
        const modalHTML = `
            <!-- Login Modal -->
            <div id="loginModal" class="modal">
                <div class="modal-content">
                    <button class="close-modal" onclick="BraineX.closeModal()">&times;</button>
                    <h2>Welcome Back</h2>
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" name="loginEmail" required>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <div class="password-toggle">
                                <input type="password" id="loginPassword" name="loginPassword" required>
                                <button type="button" onclick="BraineX.togglePassword('loginPassword')">???</button>
                            </div>
                        </div>
                        <button type="submit" class="btn-submit">Sign In</button>
                    </form>
                    <div class="form-footer">
                        <p>Don't have an account? <a href="#" onclick="BraineX.switchToSignup()">Sign up here</a></p>
                        <p><a href="#" onclick="BraineX.forgotPassword()">Forgot password?</a></p>
                    </div>
                </div>
            </div>

             <!-- Forgot Password Modal -->
            <div id="forgotPasswordModal" class="modal">
                <div class="modal-content">
                    <button class="close-modal" onclick="BraineX.closeModal()">&times;</button>
                    <h2>Reset Password</h2>
                    <p>Enter your email to receive a reset link</p>
                    <form id="forgotPasswordForm" class="auth-form">
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" name="resetEmail" required>
                        </div>
                        <button type="submit" class="btn-submit">Send Reset Link</button>
                    </form>
                    <div class="form-footer">
                        <a href="#" onclick="BraineX.switchToLogin()">Back to Login</a>
                    </div>
                </div>
            </div>

            <!-- Signup Modal -->
             <div id="signupModal" class="modal">
                <div class="modal-content">
                    <button class="close-modal" onclick="BraineX.closeModal()">&times;</button>
                    <h2>Join BraineX</h2>
                    <form id="signupForm" class="auth-form">
                        <div class="form-row">
                            <div class="form-group"><label>First Name</label><input type="text" name="firstName" required></div>
                            <div class="form-group"><label>Last Name</label><input type="text" name="lastName" required></div>
                        </div>
                        <div class="form-group"><label>Email</label><input type="email" name="signupEmail" required></div>
                        <div class="form-group"><label>Password</label><input type="password" name="signupPassword" required></div>
                        <button type="submit" class="btn-submit">Create Account</button>
                    </form>
                     <div class="form-footer">
                        <p>Already have an account? <a href="#" onclick="BraineX.switchToLogin()">Sign in</a></p>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.addModalCSS();
    },

    addModalCSS: function () {
        if (document.getElementById('auth-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'auth-modal-styles';
        style.textContent = `
            .modal { display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); backdrop-filter: blur(5px); justify-content: center; align-items: center; }
            .modal.show { display: flex; }
            .modal-content { background: white; padding: 2.5rem; border-radius: 12px; width: 100%; max-width: 420px; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
            .close-modal { position: absolute; right: 1.5rem; top: 1.5rem; font-size: 1.5rem; background: none; border: none; cursor: pointer; color: #666; }
            .auth-form .form-group { margin-bottom: 1.25rem; }
            .auth-form label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; }
            .auth-form input { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.95rem; }
            .auth-form input:focus { outline: none; border-color: #667eea; ring: 2px solid rgba(102,126,234,0.2); }
            .btn-submit { width: 100%; background: #667eea; color: white; padding: 0.75rem; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
            .btn-submit:hover { background: #5a67d8; }
            .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
            .form-footer { margin-top: 1.5rem; text-align: center; font-size: 0.9rem; color: #6b7280; }
            .form-footer a { color: #667eea; text-decoration: none; }
            .password-toggle { position: relative; }
            .password-toggle button { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; }
            .form-row { display: flex; gap: 1rem; }
            .form-row > div { flex: 1; }
         `;
        document.head.appendChild(style);
    },

    bindAuthEvents: function () {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href="#login"]')) { e.preventDefault(); this.openModal('loginModal'); }
            if (e.target.matches('a[href="#signup"]')) { e.preventDefault(); this.openModal('signupModal'); }
            if (e.target.closest('.js-logout-btn')) { e.preventDefault(); this.logout(); }
            if (e.target.classList.contains('modal')) this.closeModal();
        });

        document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeModal(); });

        document.addEventListener('submit', async (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                await this.handleLogin(e.target);
            }
            if (e.target.id === 'signupForm') {
                e.preventDefault();
                await this.handleSignup(e.target);
            }
            if (e.target.id === 'forgotPasswordForm') {
                e.preventDefault();
                await this.handleForgotPassword(e.target);
            }
        });
    },

    openModal: function (id) {
        this.closeModal();
        const el = document.getElementById(id);
        if (el) el.classList.add('show');
    },

    closeModal: function () {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    },

    switchToLogin: function () { this.openModal('loginModal'); },
    switchToSignup: function () { this.openModal('signupModal'); },

    forgotPassword: function () {
        this.openModal('forgotPasswordModal');
    },

    handleLogin: async function (form) {
        const btn = form.querySelector('button[type="submit"]');
        window.setLoadingState(btn, true);
        try {
            const email = form.loginEmail.value;
            const password = form.loginPassword.value; // ID might be different

            // Use AuthAPI
            if (window.authAPI) {
                const res = await window.authAPI.login(email, password);
                if (res.success) {
                    this.user = res.data;
                    this.updateUIForLoggedInUser();
                    this.closeModal();
                    this.showNotification('Successfully logged in!', 'success');
                } else {
                    this.showNotification(res.error || 'Login failed', 'error');
                }
            }
        } catch (err) {
            console.error(err);
            this.showNotification('An error occurred during login', 'error');
        } finally {
            window.setLoadingState(btn, false);
        }
    },

    handleSignup: async function (form) {
        const btn = form.querySelector('button[type="submit"]');
        window.setLoadingState(btn, true);
        try {
            const data = {
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                email: form.signupEmail.value,
                password: form.signupPassword.value
            };
            if (window.authAPI) {
                const res = await window.authAPI.register(data);
                if (res.success) {
                    this.user = res.data;
                    this.updateUIForLoggedInUser();
                    this.closeModal();
                    this.showNotification('Account created successfully!', 'success');
                } else {
                    this.showNotification(res.error || 'Signup failed', 'error');
                }
            }
        } catch (err) {
            this.showNotification('An error occurred', 'error');
        } finally {
            window.setLoadingState(btn, false);
        }
    },

    handleForgotPassword: async function (form) {
        const btn = form.querySelector('button[type="submit"]');
        window.setLoadingState(btn, true);
        try {
            const email = form.resetEmail.value;
            if (window.authAPI) {
                // Assuming requestPasswordReset exists or similar
                const res = await window.authAPI.requestPasswordReset(email);
                if (res.success) {
                    this.showNotification('Password reset link sent!', 'success');
                    this.closeModal();
                } else {
                    this.showNotification(res.error || 'Could not send reset link', 'error');
                }
            } else {
                // Fallback for demo
                setTimeout(() => {
                    this.showNotification('Demo: Reset link sent (simulated)', 'success');
                    this.closeModal();
                }, 1000);
            }
        } catch (err) {
            console.error(err);
            this.showNotification('Error sending reset link', 'error');
        } finally {
            window.setLoadingState(btn, false);
        }
    },

    logout: async function () {
        if (window.authAPI) await window.authAPI.logout();
        this.user = null;
        localStorage.removeItem('BraineX_user');
        window.location.reload();
    },

    togglePassword: function (id) {
        const el = document.getElementById(id);
        if (el) el.type = el.type === 'password' ? 'text' : 'password';
    },

    showNotification: function (msg, type = 'info') {
        const div = document.createElement('div');
        div.className = `notification ${type}`;
        div.textContent = msg;
        div.style.cssText = `position:fixed; top:20px; right:20px; background:${type == 'success' ? '#10B981' : '#EF4444'}; color:white; padding:1rem; border-radius:8px; z-index:3000; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BraineX.init());
} else {
    BraineX.init();
}
