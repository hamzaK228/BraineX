/**
 * BraineX Global JavaScript
 * Shared utilities and functions across all pages
 */

// Initialize auth API on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  if (window.authAPI && window.authAPI.isAuthenticated()) {
    updateUIForAuthenticatedUser();
  }
});

/**
 * Update UI elements for authenticated users
 */
function updateUIForAuthenticatedUser() {
  const authButtons = document.querySelector('.auth-buttons');
  const user = window.authAPI.user;

  if (authButtons && user) {
    authButtons.innerHTML = `
      <span style="color: white; margin-right: 1rem;">
        Welcome, ${user.firstName || user.name || 'User'}!
      </span>
      ${user.role === 'admin' ? '<a href="/admin" class="btn btn-outline" style="margin-right: 0.5rem">Admin</a>' : ''}
      <button class="btn btn-primary" onclick="handleLogout()">Logout</button>
    `;
  }
}

// Initialize Auth Interaction Listeners
// Initialize Auth Interaction Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Global Click Delegation
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');

    // Mobile Menu Toggle
    if (target && target.classList.contains('mobile-menu-btn')) {
      const navMenu = document.getElementById('navMenu');
      if (navMenu) {
        navMenu.classList.toggle('active');
        const expanded = navMenu.classList.contains('active');
        target.setAttribute('aria-expanded', expanded);
        target.innerHTML = expanded ? '✕' : '☰';
      }
      return;
    }

    // Close Mobile Menu on Link Click
    if (target && target.closest('.nav-menu a')) {
      const navMenu = document.getElementById('navMenu');
      const btn = document.querySelector('.mobile-menu-btn');

      // Use a small delay to ensure the click/navigation registers before hiding the menu
      // This fixes the "can't switch pages" issue on some mobile browsers
      if (navMenu && navMenu.classList.contains('active')) {
        setTimeout(() => {
          navMenu.classList.remove('active');
          if (btn) {
            btn.setAttribute('aria-expanded', 'false');
            btn.innerHTML = '☰';
          }
        }, 300);
      }
    }

    if (!target) return;

    const href = target.getAttribute('href');

    // Login Modal Triggers
    if (href === '#login' || target.classList.contains('js-switch-login')) {
      e.preventDefault();
      if (window.closeModal) window.closeModal(); // Close others first
      setTimeout(() => {
        if (window.openModal) window.openModal('loginModal');
      }, 50);
    }

    // Signup Modal Triggers
    if (href === '#signup' || target.classList.contains('js-switch-signup')) {
      e.preventDefault();
      if (window.closeModal) window.closeModal();
      setTimeout(() => {
        if (window.openModal) window.openModal('signupModal');
      }, 50);
    }
  });

  // Auth Form Handling
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Signing in...';
      btn.disabled = true;

      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      // Handle "Remember Me" checkbox manually if needed
      if (loginForm.querySelector('#rememberMe')?.checked) data.remember = true;

      try {
        await window.authAPI.login(data);
        window.showNotification('Login successful!', 'success');
        setTimeout(() => {
          window.closeModal();
          window.location.reload();
        }, 1000);
      } catch (err) {
        window.showNotification(err.message || 'Login failed', 'error');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = signupForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Creating account...';
      btn.disabled = true;

      const formData = new FormData(signupForm);
      const data = Object.fromEntries(formData.entries());

      try {
        await window.authAPI.register(data);
        window.showNotification('Account created!', 'success');
        setTimeout(() => {
          window.closeModal();
          window.location.reload();
        }, 1000);
      } catch (err) {
        window.showNotification(err.message || 'Registration failed', 'error');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }
});

/**
 * Handle logout
 */
async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await window.authAPI.logout();
    } catch (error) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('Logout failed:', error);
      }
      // Clear local state anyway
      window.authAPI.clearAuthState();
      window.location.href = '/';
    }
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  if (typeof amount === 'string') return amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Handle API errors
 */
function handleAPIError(error) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.error('API Error:', error);
  }

  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    showNotification('Session expired. Please login again.', 'error');
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  } else {
    showNotification(error.message || 'An error occurred', 'error');
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Expose utilities to window
window.showNotification = showNotification;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.handleAPIError = handleAPIError;
window.handleLogout = handleLogout;

// Namespace for specific page calls
window.BraineX = {
  showNotification,
  formatDate,
  formatCurrency,
  handleAPIError,
  handleLogout,
  // Add modal helpers that pages might expect
  closeModal: function () {
    document.querySelectorAll('.modal').forEach((m) => m.classList.remove('show'));
    // Also support plain style display
    document.querySelectorAll('.modal').forEach((m) => (m.style.display = 'none'));
  },
  openModal: function (id) {
    const m = document.getElementById(id);
    if (m) {
      m.classList.add('show');
      m.style.display = 'block'; // Fallback
    }
  },
  togglePassword: function (id) {
    const input = document.getElementById(id);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  },
  switchToSignup: function () {
    this.closeModal();
    this.openModal('signupModal');
  },
  forgotPassword: function () {
    alert('Forgot password flow not implemented in this demo.');
  },
  socialLogin: function (provider) {
    alert(`Login with ${provider} is not configured.`);
  },
};

// Global shorthand for closing modals if used directly
window.closeModal = window.BraineX.closeModal;
window.openModal = window.BraineX.openModal;
