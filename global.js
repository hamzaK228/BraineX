// Global JavaScript for all pages - Enhanced functionality

// Performance: lazy-load images and defer non-critical work
(function earlyPerformanceSetup(){
  try {
    const supportsLazy = 'loading' in HTMLImageElement.prototype;
    document.addEventListener('DOMContentLoaded', function(){
      const imgs = document.querySelectorAll('img');
      imgs.forEach(img => {
        if (!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
      });
    });

    if (!supportsLazy && 'IntersectionObserver' in window){
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting){
            const img = entry.target;
            if (img.dataset.src){ img.src = img.dataset.src; }
            obs.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });
      document.addEventListener('DOMContentLoaded', function(){
        document.querySelectorAll('img').forEach(img => io.observe(img));
      });
    }
  } catch(_){}
})();

// Global state management
// Debug flag and safe console wrappers
window.__DEBUG__ = window.__DEBUG__ ?? (localStorage.getItem('debug') === 'true');
(function setupSafeConsole(){
  try {
    if (!window.__DEBUG__) {
      const noop = function(){};
      console.log = noop;
      console.debug = noop;
      console.info = noop;
      // keep warn and error visible in production
    }
  } catch(_) {}
})();

// Simple utilities
window.setLoadingState = function(button, isLoading, loadingText = 'Loading...'){
  if (!button) return;
  if (isLoading){
    if (!button.dataset.originalText){ button.dataset.originalText = button.textContent; }
    button.textContent = loadingText;
    button.disabled = true;
    button.setAttribute('aria-busy','true');
  } else {
    const original = button.dataset.originalText || button.textContent;
    button.textContent = original;
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
};
window.delegate = function(root, event, selector, handler){
  const ctx = typeof root === 'string' ? document.querySelector(root) : (root || document);
  if (!ctx) return;
  ctx.addEventListener(event, function(e){
    const target = e.target.closest(selector);
    if (target && ctx.contains(target)) handler.call(target, e);
  });
};
window.debounce = function(fn, wait = 150){
  let t; return function(...args){
    const ctx = this; clearTimeout(t); t = setTimeout(()=>fn.apply(ctx,args), wait);
  };
};
window.throttle = function(fn, limit = 200){
  let inThrottle, lastArgs, lastThis; return function(...args){
    if (!inThrottle){ fn.apply(this,args); inThrottle = true; setTimeout(()=>{ inThrottle=false; if (lastArgs){ fn.apply(lastThis,lastArgs); lastArgs=lastThis=null; } }, limit); }
    else { lastArgs=args; lastThis=this; }
  };
};
window.MentoraX = {
    user: null,
    data: {
        scholarships: [],
        mentors: [],
        fields: [],
        events: [],
        projects: [],
        goals: [],
        notes: [],
        tasks: []
    },
    init: function() {
        this.loadUserSession();
        this.loadData();
        this.initializeAuth();
        this.initializeNavigation();
    },
    
    loadUserSession: function() {
        const userData = localStorage.getItem('MentoraX_user') || sessionStorage.getItem('MentoraX_user');
        if (userData) {
            this.user = JSON.parse(userData);
            this.updateUIForLoggedInUser();
        }
    },
    
    loadData: function() {
        // Load data from localStorage or admin-created data
        this.data.scholarships = JSON.parse(localStorage.getItem('scholarships')) || [];
        this.data.mentors = JSON.parse(localStorage.getItem('mentors')) || [];
        this.data.fields = JSON.parse(localStorage.getItem('fields')) || [];
        this.data.events = JSON.parse(localStorage.getItem('events')) || [];
        this.data.projects = JSON.parse(localStorage.getItem('projects')) || [];
        this.data.goals = JSON.parse(localStorage.getItem('MentoraX_goals')) || [];
        this.data.notes = JSON.parse(localStorage.getItem('MentoraX_notes')) || [];
        this.data.tasks = JSON.parse(localStorage.getItem('MentoraX_tasks')) || [];
    },
    
    saveData: function() {
        Object.keys(this.data).forEach(key => {
            if (key.startsWith('MentoraX_') || ['goals', 'notes', 'tasks'].includes(key)) {
                localStorage.setItem(`MentoraX_${key}`, JSON.stringify(this.data[key]));
            } else {
                localStorage.setItem(key, JSON.stringify(this.data[key]));
            }
        });
    },
    
    initializeAuth: function() {
        // Initialize authentication modals and forms
        this.createAuthModals();
        this.bindAuthEvents();
        this.checkAuthRequirements();
    },
    
    checkAuthRequirements: function() {
        // Check if current page requires authentication
        const currentPage = window.location.pathname.split('/').pop();
        const protectedPages = ['notion.html', 'mentors.html', 'projects.html'];
        
        if (protectedPages.includes(currentPage) && !this.user) {
            // Show login modal immediately for protected pages
            setTimeout(() => {
                this.openModal('loginModal');
            }, 1000);
        }
    },
    
    initializeNavigation: function() {
        // Add active class to current page
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
   
   // Mobile navigation: consistent behavior across pages
   initializeMobileNav: function() {
       const btn = document.querySelector('.mobile-menu-btn, .hamburger');
       const menu = document.querySelector('.nav-menu');
       if (!btn || !menu) return;

       // Ensure ARIA attributes
       btn.setAttribute('aria-controls', 'navMenu');
       btn.setAttribute('aria-expanded', 'false');
       btn.setAttribute('type', 'button');
       menu.id = menu.id || 'navMenu';
       menu.setAttribute('role', 'navigation');

       // Create overlay for tap-outside
       let overlay = document.querySelector('.nav-overlay');
       if (!overlay) {
           overlay = document.createElement('div');
           overlay.className = 'nav-overlay';
           document.body.appendChild(overlay);
       }

       const openMenu = () => {
           menu.classList.add('active');
           overlay.classList.add('show');
           document.body.style.overflow = 'hidden';
           btn.setAttribute('aria-expanded', 'true');
           // focus first link for keyboard users
           const firstLink = menu.querySelector('a, button');
           if (firstLink) firstLink.focus({ preventScroll: true });
       };
       const closeMenu = () => {
           menu.classList.remove('active');
           overlay.classList.remove('show');
           document.body.style.overflow = '';
           btn.setAttribute('aria-expanded', 'false');
           btn.focus({ preventScroll: true });
       };
       const toggleMenu = () => {
           if (menu.classList.contains('active')) closeMenu(); else openMenu();
       };

       // Click/Tap handlers
       btn.addEventListener('click', toggleMenu);
       overlay.addEventListener('click', closeMenu);

       // Tap outside (if clicking outside menu area)
       document.addEventListener('click', (e) => {
           if (!menu.classList.contains('active')) return;
           const withinMenu = e.target.closest('.nav-menu') || e.target.closest('.mobile-menu-btn') || e.target.closest('.hamburger');
           if (!withinMenu) closeMenu();
       });

       // Close on Escape
       document.addEventListener('keydown', (e) => {
           if (e.key === 'Escape' && menu.classList.contains('active')) closeMenu();
       });

       // Close when a link is clicked
       document.addEventListener('click', (e) => {
           const link = e.target.closest('.nav-menu a');
           if (link && menu.classList.contains('active')) closeMenu();
       });
   },
    
    updateUIForLoggedInUser: function() {
        if (!this.user) return;
        
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            const displayName = this.user.firstName || this.user.email.split('@')[0];
            authButtons.innerHTML = `
                <div class="user-menu">
                    <span class="welcome-text">Welcome, ${displayName}</span>
                    <button class="btn btn-outline" onclick="MentoraX.logout()">Logout</button>
                </div>
            `;
        }
    },
    
    createAuthModals: function() {
        if (document.getElementById('loginModal')) return; // Already exists
        
        // Force authentication check for protected pages
        const currentPage = window.location.pathname.split('/').pop();
        const protectedPages = ['notion.html', 'mentors.html', 'projects.html'];
        
        if (protectedPages.includes(currentPage) && !this.user) {
            setTimeout(() => {
                this.openModal('loginModal');
            }, 500);
        }
        
        const modalHTML = `
            <!-- Login Modal -->
            <div id="loginModal" class="modal">
                <div class="modal-content">
                    <button class="close-modal" onclick="MentoraX.closeModal()">&times;</button>
                    <h2>Welcome Back</h2>
                    <p>Sign in to access your personalized dashboard</p>
                    <div id="loginSuccess" class="success-message">
                        <strong>Success!</strong> You have been logged in successfully.
                    </div>
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label for="loginEmail">Email Address</label>
                            <input type="email" id="loginEmail" name="email" required>
                            <div class="error-message" id="emailError">Please enter a valid email address</div>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <div class="password-toggle">
                                <input type="password" id="loginPassword" name="password" required>
                                <button type="button" onclick="MentoraX.togglePassword('loginPassword')">ðŸ‘ï¸</button>
                            </div>
                            <div class="error-message" id="passwordError">Password must be at least 6 characters</div>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="rememberMe" name="remember">
                            <label for="rememberMe">Remember me</label>
                        </div>
                        <button type="submit" class="btn-submit">Sign In</button>
                    </form>
                    <div class="divider"><span>or</span></div>
                    <div class="social-login">
                        <button class="btn-social" onclick="MentoraX.socialLogin('google')">ðŸ”</button>
                        <button class="btn-social" onclick="MentoraX.socialLogin('facebook')">ðŸ“˜</button>
                        <button class="btn-social" onclick="MentoraX.socialLogin('linkedin')">ðŸ’¼</button>
                    </div>
                    <div class="form-footer">
                        <p>Don't have an account? <a href="#" onclick="MentoraX.switchToSignup()">Sign up here</a></p>
                        <p><a href="#" onclick="MentoraX.forgotPassword()">Forgot your password?</a></p>
                    </div>
                </div>
            </div>

            <!-- Signup Modal -->
            <div id="signupModal" class="modal">
                <div class="modal-content">
                    <button class="close-modal" onclick="MentoraX.closeModal()">&times;</button>
                    <h2>Join MentoraX</h2>
                    <p>Create your account and unlock endless opportunities</p>
                    <div id="signupSuccess" class="success-message">
                        <strong>Success!</strong> Your account has been created successfully.
                    </div>
                    <form id="signupForm" class="auth-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="firstName">First Name</label>
                                <input type="text" id="firstName" name="firstName" required>
                                <div class="error-message" id="firstNameError">First name is required</div>
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name</label>
                                <input type="text" id="lastName" name="lastName" required>
                                <div class="error-message" id="lastNameError">Last name is required</div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="signupEmail">Email Address</label>
                            <input type="email" id="signupEmail" name="email" required>
                            <div class="error-message" id="signupEmailError">Please enter a valid email address</div>
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">Password</label>
                            <div class="password-toggle">
                                <input type="password" id="signupPassword" name="password" required>
                                <button type="button" onclick="MentoraX.togglePassword('signupPassword')">ðŸ‘ï¸</button>
                            </div>
                            <div class="error-message" id="signupPasswordError">Password must be at least 6 characters</div>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
                            <div class="password-toggle">
                                <input type="password" id="confirmPassword" name="confirmPassword" required>
                                <button type="button" onclick="MentoraX.togglePassword('confirmPassword')">ðŸ‘ï¸</button>
                            </div>
                            <div class="error-message" id="confirmPasswordError">Passwords do not match</div>
                        </div>
                        <div class="form-group">
                            <label for="fieldOfInterest">Field of Interest</label>
                            <select id="fieldOfInterest" name="field" required>
                                <option value="">Select your field</option>
                                <option value="ai">Artificial Intelligence</option>
                                <option value="biotech">Biotech & Health Sciences</option>
                                <option value="climate">Climate Tech</option>
                                <option value="engineering">Engineering</option>
                                <option value="entrepreneurship">Entrepreneurship</option>
                                <option value="social">Social Impact</option>
                                <option value="media">Digital Media</option>
                                <option value="economics">Economics & Finance</option>
                            </select>
                            <div class="error-message" id="fieldError">Please select your field of interest</div>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="agreeTerms" name="terms" required>
                            <label for="agreeTerms">I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></label>
                        </div>
                        <button type="submit" class="btn-submit">Create Account</button>
                    </form>
                    <div class="divider"><span>or</span></div>
                    <div class="social-login">
                        <button class="btn-social" onclick="MentoraX.socialLogin('google')">ðŸ”</button>
                        <button class="btn-social" onclick="MentoraX.socialLogin('facebook')">ðŸ“˜</button>
                        <button class="btn-social" onclick="MentoraX.socialLogin('linkedin')">ðŸ’¼</button>
                    </div>
                    <div class="form-footer">
                        <p>Already have an account? <a href="#" onclick="MentoraX.switchToLogin()">Sign in here</a></p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.addModalCSS();
    },
    
    addModalCSS: function() {
        if (document.getElementById('auth-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'auth-modal-styles';
        styles.textContent = `
            .modal { display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); }
            .modal.show { display: flex; justify-content: center; align-items: center; }
            .modal-content { background: white; padding: 3rem; border-radius: 16px; max-width: 450px; width: 90%; position: relative; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); }
            .close-modal { position: absolute; right: 1.5rem; top: 1.5rem; font-size: 2rem; cursor: pointer; color: #999; background: none; border: none; }
            .auth-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .form-group { margin-bottom: 1rem; }
            .form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-weight: 600; }
            .form-group input, .form-group select { width: 100%; padding: 0.9rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: all 0.3s; }
            .form-group input:focus, .form-group select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
            .password-toggle { position: relative; }
            .password-toggle button { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.2rem; color: #999; }
            .checkbox-group { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0; }
            .checkbox-group input[type="checkbox"] { width: auto; cursor: pointer; }
            .btn-submit { width: 100%; padding: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
            .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
            .divider { display: flex; align-items: center; text-align: center; margin: 1.5rem 0; color: #999; }
            .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid #e0e0e0; }
            .divider span { padding: 0 1rem; }
            .social-login { display: flex; gap: 1rem; margin-top: 1rem; }
            .btn-social { flex: 1; padding: 0.8rem; border: 2px solid #e0e0e0; background: white; border-radius: 8px; cursor: pointer; transition: all 0.3s; font-size: 1.5rem; }
            .btn-social:hover { border-color: #667eea; background: #f8f9fa; }
            .form-footer { text-align: center; margin-top: 1.5rem; color: #666; }
            .form-footer a { color: #667eea; text-decoration: none; font-weight: 600; }
            .success-message { background: #d4edda; color: #155724; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid #c3e6cb; display: none; }
            .success-message.show { display: block; }
            .error-message { color: #e74c3c; font-size: 0.85rem; margin-top: 0.3rem; display: none; }
            .error-message.show { display: block; }
            .user-menu { display: flex; align-items: center; gap: 1rem; }
            .welcome-text { color: white; font-weight: 500; }
            @media (max-width: 768px) { .auth-form .form-row { grid-template-columns: 1fr; } .user-menu { flex-direction: column; gap: 0.5rem; } }
        `;
        document.head.appendChild(styles);
    },
    
    bindAuthEvents: function() {
        // Bind authentication events
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href="#login"]')) {
                e.preventDefault();
                this.openModal('loginModal');
            }
            
            if (e.target.matches('a[href="#signup"]')) {
                e.preventDefault();
                this.openModal('signupModal');
            }
            
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
        
        // Bind form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin(e.target);
            }
            
            if (e.target.id === 'signupForm') {
                e.preventDefault();
                this.handleSignup(e.target);
            }
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },
    
    openModal: function(modalId) {
        this.closeModal(); // Close any open modal first
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Reset forms
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                this.clearErrors();
            }
        }
    },
    
    closeModal: function() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = 'auto';
    },
    
    switchToLogin: function() {
        this.closeModal();
        this.openModal('loginModal');
    },
    
    switchToSignup: function() {
        this.closeModal();
        this.openModal('signupModal');
    },
    
    togglePassword: function(inputId) {
        const input = document.getElementById(inputId);
        const button = input.nextElementSibling;
        
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = 'ðŸ™ˆ';
        } else {
            input.type = 'password';
            button.textContent = 'ðŸ‘ï¸';
        }
    },
    
    handleLogin: function(form) {
        const email = form.loginEmail.value;
        const password = form.loginPassword.value;
        const rememberMe = form.rememberMe.checked;
        
        let isValid = true;
        this.clearErrors();
        
        // Validate email
        if (!email) {
            this.showError('loginEmail', 'Email is required');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showError('loginEmail', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            this.showError('loginPassword', 'Password is required');
            isValid = false;
        } else if (!this.validatePassword(password)) {
            this.showError('loginPassword', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (isValid) {
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing In...';
            
            // Simulate API call
            setTimeout(() => {
                const userData = {
                    email: email,
                    loginTime: new Date().toISOString(),
                    rememberMe: rememberMe
                };
                
                if (rememberMe) {
                    localStorage.setItem('MentoraX_user', JSON.stringify(userData));
                } else {
                    sessionStorage.setItem('MentoraX_user', JSON.stringify(userData));
                }
                
                this.user = userData;
                document.getElementById('loginSuccess').classList.add('show');
                this.updateUIForLoggedInUser();
                
                setTimeout(() => {
                    this.closeModal();
                    this.showNotification('Welcome back! You are now logged in.', 'success');
                }, 1500);
                
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }, 2000);
        }
    },
    
    handleSignup: function(form) {
        const firstName = form.firstName.value;
        const lastName = form.lastName.value;
        const email = form.signupEmail.value;
        const password = form.signupPassword.value;
        const confirmPassword = form.confirmPassword.value;
        const field = form.fieldOfInterest.value;
        const agreeTerms = form.agreeTerms.checked;
        
        let isValid = true;
        this.clearErrors();
        
        // Validate all fields
        if (!firstName.trim()) {
            this.showError('firstName', 'First name is required');
            isValid = false;
        }
        
        if (!lastName.trim()) {
            this.showError('lastName', 'Last name is required');
            isValid = false;
        }
        
        if (!email) {
            this.showError('signupEmail', 'Email is required');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showError('signupEmail', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!password) {
            this.showError('signupPassword', 'Password is required');
            isValid = false;
        } else if (!this.validatePassword(password)) {
            this.showError('signupPassword', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (!confirmPassword) {
            this.showError('confirmPassword', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        if (!field) {
            this.showError('fieldOfInterest', 'Please select your field of interest');
            isValid = false;
        }
        
        if (!agreeTerms) {
            this.showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
            isValid = false;
        }
        
        if (isValid) {
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';
            
            // Simulate API call
            setTimeout(() => {
                const userData = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    field: field,
                    signupTime: new Date().toISOString()
                };
                
                localStorage.setItem('MentoraX_user', JSON.stringify(userData));
                this.user = userData;
                
                document.getElementById('signupSuccess').classList.add('show');
                this.updateUIForLoggedInUser();
                
                setTimeout(() => {
                    this.closeModal();
                    this.showNotification(`Welcome ${firstName}! Your account has been created successfully.`, 'success');
                }, 1500);
                
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }, 2000);
        }
    },
    
    socialLogin: function(provider) {
        const providerNames = {
            google: 'Google',
            facebook: 'Facebook',
            linkedin: 'LinkedIn'
        };
        
        this.showNotification(`${providerNames[provider]} login would redirect to ${provider} OAuth. This is a demo version.`, 'info');
        
        // Simulate successful social login
        setTimeout(() => {
            const userData = {
                email: `user@${provider}.com`,
                firstName: 'Demo',
                lastName: 'User',
                loginTime: new Date().toISOString(),
                provider: provider
            };
            
            localStorage.setItem('MentoraX_user', JSON.stringify(userData));
            this.user = userData;
            this.updateUIForLoggedInUser();
            this.closeModal();
            this.showNotification('Welcome! You have been logged in successfully.', 'success');
        }, 1000);
    },
    
    forgotPassword: function() {
        const email = prompt('Please enter your email address:');
        if (email && this.validateEmail(email)) {
            this.showNotification('Password reset link has been sent to your email address.', 'success');
        } else if (email) {
            this.showNotification('Please enter a valid email address.', 'error');
        }
    },
    
    logout: function() {
        localStorage.removeItem('MentoraX_user');
        sessionStorage.removeItem('MentoraX_user');
        this.user = null;
        
        // Reset auth buttons
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <a href="#login" class="btn btn-outline">Log In</a>
                <a href="#signup" class="btn btn-primary">Sign Up</a>
            `;
        }
        
        this.showNotification('You have been logged out successfully.', 'info');
    },
    
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validatePassword: function(password) {
        return password.length >= 6;
    },
    
    showError: function(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (field && errorElement) {
            field.classList.add('error');
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },
    
    clearError: function(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');
        
        if (field && errorElement) {
            field.classList.remove('error');
            errorElement.classList.remove('show');
        }
    },
    
    clearErrors: function() {
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
        document.querySelectorAll('input, select').forEach(field => {
            field.classList.remove('error');
        });
    },
    
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea'};
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        
        notification.querySelector('button').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
           if (notification.parentNode) {
               notification.remove();
           }
       }, 5000);
   },

   // Contact form enhancements (validation, feedback, loading, sanitization)
   initContactForms: function() {
       const forms = document.querySelectorAll('form.contact-form, form[data-form="contact"], #contactForm');
       if (!forms.length) return;

       forms.forEach(form => {
           // Real-time validation
           form.querySelectorAll('input, textarea, select').forEach(field => {
               field.addEventListener('input', this.debounce(() => {
                   this.validateField(field);
               }, 200));
               field.addEventListener('blur', () => this.validateField(field));
           });

           form.addEventListener('submit', (e) => {
               e.preventDefault();
               const submitBtn = form.querySelector('button[type="submit"], .btn, .btn-submit');

               const formData = new FormData(form);
               const data = {};
               formData.forEach((v, k) => data[k] = this.sanitizeInput(String(v)));

               // Validate all fields before submission
               const invalids = [];
               form.querySelectorAll('input, textarea, select').forEach(f => {
                   if (!this.validateField(f)) invalids.push(f.name || f.id);
               });

               if (invalids.length) {
                   this.showNotification('Please fix the highlighted fields before submitting.', 'error');
                   return;
               }

               // Loading state
               if (typeof window.setLoadingState === 'function' && submitBtn) {
                   window.setLoadingState(submitBtn, true, 'Sending...');
               } else if (submitBtn) {
                   submitBtn.disabled = true;
               }

               // Simulate async submission
               setTimeout(() => {
                   // Success toast
                   this.showNotification('Thank you! Your message has been sent successfully.', 'success');

                   // Reset loading state and form
                   if (typeof window.setLoadingState === 'function' && submitBtn) {
                       window.setLoadingState(submitBtn, false);
                   } else if (submitBtn) {
                       submitBtn.disabled = false;
                   }
                   form.reset();

                   // Clear validation states
                   form.querySelectorAll('.error-message').forEach(el => el.remove());
                   form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
                   form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.setAttribute('aria-invalid', 'false'));
               }, 1000);
           });
       });
   },

   validateField: function(field) {
       if (!field) return true;
       const value = (field.value || '').trim();
       const name = (field.name || field.id || '').toLowerCase();
       const required = field.hasAttribute('required');
       let valid = true;
       let message = '';

       if (required && !value) {
           valid = false;
           message = 'This field is required';
       }

       if (valid && name.includes('email')) {
           const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
           if (value && !emailRegex.test(value)) {
               valid = false;
               message = 'Please enter a valid email address';
           }
       }

       if (valid && (name.includes('phone') || field.type === 'tel')) {
           const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/; // loose, international-friendly
           if (value && !phoneRegex.test(value)) {
               valid = false;
               message = 'Please enter a valid phone number';
           }
       }

       // Show or clear error
       this.setFieldValidity(field, valid, message);
       return valid;
   },

   setFieldValidity: function(field, valid, message) {
       const group = field.closest('.form-group') || field.parentElement;
       let errorEl = group ? group.querySelector('.error-message') : null;

       if (!valid) {
           field.classList.add('error');
           field.setAttribute('aria-invalid', 'true');
           if (!errorEl) {
               errorEl = document.createElement('div');
               errorEl.className = 'error-message show';
               if (group) group.appendChild(errorEl); else field.insertAdjacentElement('afterend', errorEl);
           }
           errorEl.textContent = message || 'Invalid value';
           errorEl.classList.add('show');
       } else {
           field.classList.remove('error');
           field.setAttribute('aria-invalid', 'false');
           if (errorEl) errorEl.classList.remove('show');
       }
   },

   sanitizeInput: function(str) {
       // Basic sanitization – strip tags and dangerous characters
       const div = document.createElement('div');
       div.textContent = str;
       const clean = div.innerHTML
           .replace(/[\u0000-\u001F\u007F]/g, '')
           .replace(/<[^>]*>/g, '');
       return clean.trim();
   },
    
    // Fix login system across all pages
    initializeLoginUIOnAllPages: function() {
        const currentUser = this.getCurrentUser();
        const loginButton = document.querySelector('#loginButton') || document.querySelector('.login-btn') || document.querySelector('[onclick*="openModal"]');
        
        if (loginButton) {
            if (currentUser) {
                // User is logged in - show user info
                loginButton.innerHTML = `
                    <span style="margin-right: 8px;">ðŸ‘‹</span>
                    <span>${currentUser.name}</span>
                    <span style="margin-left: 8px; cursor: pointer;" onclick="MentoraX.logout()">ðŸšª</span>
                `;
                loginButton.style.background = 'linear-gradient(135deg, #38a169, #2f855a)';
            } else {
                // User not logged in - show login button
                loginButton.innerHTML = 'ðŸ” Login';
                loginButton.onclick = () => this.openModal('loginModal');
                loginButton.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            }
        }
        
        // Check if this is a protected page and user is not logged in
        if (this.isProtectedPage() && !currentUser) {
            this.showLoginRequiredForPage();
        }
    },
    
    isProtectedPage: function() {
        const protectedPages = ['notion.html', 'my-goal'];
        const currentPage = window.location.pathname;
        return protectedPages.some(page => currentPage.includes(page));
    },
    
    showLoginRequiredForPage: function() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                text-align: center;
                max-width: 500px;
                margin: 20px;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">ðŸ”</div>
                <h2 style="margin: 0 0 15px 0; color: #2d3748;">Login Required</h2>
                <p style="margin: 0 0 25px 0; color: #4a5568;">
                    You need to be logged in to access this section. Please login or create an account to continue.
                </p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="MentoraX.openModal('loginModal'); this.closest('div').remove();" style="
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Login</button>
                    <button onclick="window.location.href='index.html'" style="
                        background: #e2e8f0;
                        color: #2d3748;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Go Home</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    },
    
    logout: function() {
        localStorage.removeItem('currentUser');
        this.showNotification('Logged out successfully! ðŸ‘‹', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
};

// Theme handling
(function setupTheme(){
  const STORAGE_KEY = 'theme';
  const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const getTheme = () => localStorage.getItem(STORAGE_KEY) || (prefersDark() ? 'dark' : 'light');
  const setTheme = (t) => { localStorage.setItem(STORAGE_KEY, t); };

  const applyTheme = (theme, smooth=false) => {
    const root = document.documentElement;
    if (smooth) {
      root.classList.add('theme-transition');
      setTimeout(()=>root.classList.remove('theme-transition'), 300);
    }
    root.setAttribute('data-theme', theme);
    // Update any existing toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const dark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(dark));
      btn.innerHTML = dark ? '☀️' : '🌙';
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-label', btn.title);
    });
  };

  // Apply early to avoid FOUC
  applyTheme(getTheme());

  const ensureToggleInNav = () => {
    // If a toggle already exists, return it
    let btn = document.querySelector('header .theme-toggle');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-toggle';
      btn.title = 'Switch to dark mode';
      btn.setAttribute('aria-pressed','false');
      // Place next to auth buttons if available
      const auth = document.querySelector('header .auth-buttons');
      if (auth && auth.parentElement) {
        auth.parentElement.insertBefore(btn, auth.nextSibling);
      } else {
        // fallback: append to header nav
        const nav = document.querySelector('header nav, header .nav-container, header');
        if (nav) nav.appendChild(btn);
      }
    }
    btn.addEventListener('click', () => {
      const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
      setTheme(next);
      applyTheme(next, true);
    });
    return btn;
  };

  const ensureFloatingToggle = () => {
    // Add a floating/sticky toggle that's always visible
    let f = document.querySelector('.theme-toggle-floating');
    if (!f) {
      f = document.createElement('button');
      f.className = 'theme-toggle theme-toggle-floating';
      f.type = 'button';
      f.setAttribute('aria-pressed','false');
      f.title = 'Toggle color theme';
      f.style.position = 'fixed';
      f.style.top = '14px';
      f.style.right = '14px';
      f.style.zIndex = '1200';
      document.body.appendChild(f);
      f.addEventListener('click', () => {
        const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
        setTheme(next);
        applyTheme(next, true);
      });
    }
    return f;
  };

  const injectToggleStyles = () => {
    if (document.getElementById('theme-toggle-styles')) return;
    const s = document.createElement('style');
    s.id = 'theme-toggle-styles';
    s.textContent = `
      .theme-transition, .theme-transition * { transition: background-color .3s ease, color .3s ease, border-color .3s ease, box-shadow .3s ease; }
      .theme-toggle { margin-left: .75rem; padding: .5rem .75rem; border-radius: 999px; border: 1px solid var(--color-border, #e2e8f0); background: var(--color-bg-alt, #f8f9fa); color: var(--color-text, #2d3748); cursor: pointer; display: inline-flex; align-items: center; gap: .5rem; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
      .theme-toggle:hover { box-shadow: 0 4px 14px rgba(0,0,0,.12); }
      .theme-toggle-floating { position: fixed; top: 14px; right: 14px; }
      [data-theme="dark"] .theme-toggle { background: rgba(22, 33, 62, 0.85); border-color: #2a2f45; color: #e0e0e0; }
    `;
    document.head.appendChild(s);
  };

  const init = () => {
    injectToggleStyles();
    ensureToggleInNav();
    ensureFloatingToggle();
    // react to system theme change if user has not chosen
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener?.('change', () => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(getTheme(), true);
        }
      });
    } catch(_) {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function setupTheme(){
  const STORAGE_KEY = 'theme';
  const getStored = () => localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const applyTheme = (theme, smooth = false) => {
    const root = document.documentElement;
    if (smooth) {
      root.classList.add('theme-transition');
      setTimeout(()=>root.classList.remove('theme-transition'), 300);
    }
    root.setAttribute('data-theme', theme);
    const btns = document.querySelectorAll('.theme-toggle');
    btns.forEach(btn => {
      const dark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(dark));
      btn.innerHTML = dark ? '☀️ Light' : '🌙 Dark';
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    });
  };
  // Apply theme ASAP to avoid FOUC
  const initial = (localStorage.getItem(STORAGE_KEY)) || (systemPrefersDark() ? 'dark' : 'light');
  applyTheme(initial);

  const init = () => {
    const current = getStored() || (systemPrefersDark() ? 'dark' : 'light');
    applyTheme(current);
    // Create toggle button in header and footer if missing
    const createBtn = () => {
      const b = document.createElement('button');
      b.className = 'theme-toggle';
      b.type = 'button';
      b.setAttribute('aria-label','Toggle color theme');
      b.setAttribute('aria-pressed','false');
      b.addEventListener('click', () => {
        const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next, true);
      });
      return b;
    };
    const ensureInHeader = () => {
      const nav = document.querySelector('header nav') || document.querySelector('nav');
      if (nav && !nav.querySelector('.theme-toggle')) {
        const btn = createBtn();
        nav.appendChild(btn);
      }
    };
    const ensureInFooter = () => {
      const footer = document.querySelector('footer .footer-bottom, footer .footer-content, footer');
      if (footer && !footer.querySelector('.theme-toggle')) {
        const wrapper = document.createElement('div');
        wrapper.style.marginTop = '1rem';
        const btn = createBtn();
        wrapper.appendChild(btn);
        footer.appendChild(wrapper);
      }
    };
    document.addEventListener('DOMContentLoaded', ()=>{
      ensureInHeader();
      ensureInFooter();
      // Bind click handlers to any existing static toggle buttons
      const bindExisting = () => {
        document.querySelectorAll('.theme-toggle').forEach(btn => {
          if (btn.dataset.boundThemeToggle) return;
          btn.dataset.boundThemeToggle = '1';
          btn.addEventListener('click', () => {
            const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
            localStorage.setItem(STORAGE_KEY, next);
            applyTheme(next, true);
          });
        });
      };
      bindExisting();
      applyTheme(document.documentElement.getAttribute('data-theme') || current);
    });

    // React to system changes if user has no explicit choice
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener?.('change', (e)=>{
        if (!getStored()) applyTheme(e.matches ? 'dark' : 'light');
      });
    }
  };
  // Global delegation to catch clicks on any .theme-toggle (present or future)
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('.theme-toggle');
    if (!t) return;
    e.preventDefault();
    const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next, true);
  });

  init();
  
  // Expose toggleTheme globally for inline onclick handlers
  window.toggleTheme = function(){
    try {
      const STORAGE_KEY = 'theme';
      const next=(document.documentElement.getAttribute('data-theme')==='dark')?'light':'dark';
      localStorage.setItem(STORAGE_KEY,next);
      applyTheme(next,true);
    } catch(e) {
      console.error('toggleTheme error:', e);
    }
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    MentoraX.init();
    
    // Initialize login UI on all pages
    MentoraX.initializeLoginUIOnAllPages();
    
    // Handle field-to-scholarship navigation
    const searchField = localStorage.getItem('scholarship_search_field');
    if (searchField && window.location.pathname.includes('scholarships.html')) {
        setTimeout(() => {
            const searchInput = document.querySelector('.scholarship-search input') || document.querySelector('input[placeholder*="search"]');
            if (searchInput) {
                searchInput.value = searchField;
                searchInput.dispatchEvent(new Event('input'));
            }
            localStorage.removeItem('scholarship_search_field');
        }, 500);
    }
    
    // Handle field-to-mentor navigation
    const mentorField = localStorage.getItem('mentor_search_field');
    if (mentorField && window.location.pathname.includes('mentors.html')) {
        setTimeout(() => {
            const categoryFilter = document.querySelector('#categoryFilter') || document.querySelector('select[name*="category"]');
            if (categoryFilter) {
                categoryFilter.value = mentorField;
                categoryFilter.dispatchEvent(new Event('change'));
            }
            localStorage.removeItem('mentor_search_field');
        }, 500);
    }
    
    // Initialize enhanced contact forms
    MentoraX.initContactForms();
   MentoraX.initializeMobileNav();
   MentoraX.initPerformanceOptimizations();

    // Admin panel access
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            window.open('admin.html', '_blank');
        }
    });
});

// Add slide animation CSS
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
`;
document.head.appendChild(animationStyles);

// Expose global functions for backwards compatibility
window.openModal = MentoraX.openModal.bind(MentoraX);
window.closeModal = MentoraX.closeModal.bind(MentoraX);
window.switchToLogin = MentoraX.switchToLogin.bind(MentoraX);
window.switchToSignup = MentoraX.switchToSignup.bind(MentoraX);
window.togglePassword = MentoraX.togglePassword.bind(MentoraX);
window.socialLogin = MentoraX.socialLogin.bind(MentoraX);
window.forgotPassword = MentoraX.forgotPassword.bind(MentoraX);

// Performance helpers
MentoraX.initPerformanceOptimizations = function(){
  try {
    // Lazy-load images
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
    });

    // Preload key CSS if not already
    const head = document.head;
    const ensurePreload = (href) => {
      if (!href) return;
      const exists = !!document.querySelector(`link[rel="preload"][href="${href}"]`);
      if (!exists) {
        const l = document.createElement('link');
        l.rel = 'preload'; l.as = 'style'; l.href = href; head.appendChild(l);
      }
    };
    // Guess primary stylesheet for current page
    const pageStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.getAttribute('href'));
    if (pageStyles.length) ensurePreload(pageStyles[0]);

    // Prefetch likely next pages
    const pages = ['scholarships.html','mentors.html','projects.html','fields.html','about.html','notion.html'];
    pages.forEach(p => {
      if (!document.querySelector(`link[rel="prefetch"][href="${p}"]`)){
        const pf = document.createElement('link'); pf.rel='prefetch'; pf.href=p; document.head.appendChild(pf);
      }
    });
  } catch(_) {}
};
