/**
 * BraineX Navigation System
 * Handles site-wide navigation features across all pages
 */

(function () {
    'use strict';

    // Wait for DOM to load
    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
    });

    function initNavigation() {
        // Initialize all navigation features
        setupHamburgerMenu();
        setupActivePageHighlighting();
        setupLogoHomeLink();
        setupMobileMenuClose();
        setupDarkModeToggle();
        setupNavLinks();
    }

    // ===========================================
    // 1. Hamburger Menu Toggle
    // ===========================================
    function setupHamburgerMenu() {
        const hamburger = document.querySelector('.mobile-menu-btn, .hamburger-btn, button[data-action="toggle-menu"]');
        const navMenu = document.querySelector('.nav-menu, #navMenu, nav ul');

        if (!hamburger || !navMenu) return;

        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = navMenu.classList.contains('active') || navMenu.style.display === 'flex';

            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        function openMenu() {
            navMenu.classList.add('active');
            navMenu.style.display = 'flex';
            hamburger.setAttribute('aria-expanded', 'true');
            hamburger.innerHTML = '✕'; // Close icon

            // Add overlay for mobile
            const overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 999;
        display: block;
      `;
            document.body.appendChild(overlay);

            // Close on overlay click
            overlay.addEventListener('click', closeMenu);
        }

        function closeMenu() {
            navMenu.classList.remove('active');
            navMenu.style.display = '';
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.innerHTML = '☰'; // Menu icon

            // Remove overlay
            const overlay = document.querySelector('.nav-overlay');
            if (overlay) {
                overlay.remove();
            }
        }

        // Store close function globally for external use
        window.closeNavMenu = closeMenu;
    }

    // ===========================================
    // 2. Active Page Highlighting
    // ===========================================
    function setupActivePageHighlighting() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'main.html';

        // Find all nav links
        const navLinks = document.querySelectorAll('.nav-menu a, nav a, .nav-link');

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');

            // Check if link matches current page
            if (linkPath) {
                const linkPage = linkPath.split('/').pop();

                // Match exact page or home page variants  
                if (linkPage === currentPage ||
                    (currentPage === 'main.html' && (linkPage === '/' || linkPage === 'index.html' || linkPage === '')) ||
                    (linkPage === 'main.html' && (currentPage === '/' || currentPage === 'index.html' || currentPage === ''))) {

                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');

                    // Also highlight parent li if exists
                    const parentLi = link.closest('li');
                    if (parentLi) {
                        parentLi.classList.add('active');
                    }
                }
            }
        });

        // Add active page indicator styles if not present
        if (!document.getElementById('nav-active-styles')) {
            const style = document.createElement('style');
            style.id = 'nav-active-styles';
            style.textContent = `
        .nav-menu a.active {
          font-weight: 600;
          border-bottom: 2px solid currentColor;
          padding-bottom: 2px;
        }
        .nav-menu li.active {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        @media(max-width: 768px) {
          .nav-menu a.active {
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            border-bottom: none;
          }
        }
      `;
            document.head.appendChild(style);
        }
    }

    // ===========================================
    // 3. Logo Home Link
    // ===========================================
    function setupLogoHomeLink() {
        const logos = document.querySelectorAll('.logo, .site-logo, .brand-logo');

        logos.forEach(logo => {
            // Convert to clickable if not already a link
            if (logo.tagName !== 'A') {
                logo.style.cursor = 'pointer';
                logo.addEventListener('click', function (e) {
                    e.preventDefault();
                    window.location.href = '/main.html';
                });
            } else if (!logo.getAttribute('href')) {
                logo.setAttribute('href', '/main.html');
            }
        });
    }

    // ===========================================
    // 4. Mobile Menu Close Behaviors
    // ===========================================
    function setupMobileMenuClose() {
        const navMenu = document.querySelector('.nav-menu, #navMenu, nav ul');
        if (!navMenu) return;

        // Close on nav link click (mobile only)
        navMenu.addEventListener('click', function (e) {
            const link = e.target.closest('a');
            if (link && window.innerWidth <= 768) {
                // Small delay to allow navigation to complete
                setTimeout(() => {
                    if (window.closeNavMenu) {
                        window.closeNavMenu();
                    }
                }, 100);
            }
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            const isMenuOpen = navMenu.classList.contains('active') || navMenu.style.display === 'flex';
            const clickedInsideMenu = navMenu.contains(e.target);
            const clickedHamburger = e.target.closest('.mobile-menu-btn, .hamburger-btn');

            if (isMenuOpen && !clickedInsideMenu && !clickedHamburger && window.innerWidth <= 768) {
                if (window.closeNavMenu) {
                    window.closeNavMenu();
                }
            }
        });

        // Close on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                const isMenuOpen = navMenu.classList.contains('active') || navMenu.style.display === 'flex';
                if (isMenuOpen && window.closeNavMenu) {
                    window.closeNavMenu();
                }
            }
        });
    }

    // ===========================================
    // 5. Dark Mode Toggle
    // ===========================================
    function setupDarkModeToggle() {
        const darkModeToggle = document.querySelector('.dark-mode-toggle, #darkModeToggle, button[data-theme-toggle]');

        if (!darkModeToggle) return;

        // Check saved preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

        // Apply saved theme
        applyTheme(currentTheme);

        // Toggle on click
        darkModeToggle.addEventListener('click', function () {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';

            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);

            // Show notification if available
            if (window.BraineX && window.BraineX.showNotification) {
                BraineX.showNotification(`Switched to ${newTheme} mode`, 'success');
            }
        });

        function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            document.body.classList.toggle('dark-mode', theme === 'dark');

            // Update toggle button text/icon if needed
            if (darkModeToggle.textContent) {
                darkModeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            }

            // Update aria label
            darkModeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        }
    }

    // ===========================================
    // 6. Nav Links Setup
    // ===========================================
    function setupNavLinks() {
        const navLinks = document.querySelectorAll('.nav-menu a, nav a');

        navLinks.forEach(link => {
            // Ensure proper attributes
            if (!link.getAttribute('role')) {
                link.setAttribute('role', 'link');
            }

            // Add smooth scroll for anchor links
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                link.addEventListener('click', function (e) {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                        // Close mobile menu if open
                        if (window.closeNavMenu && window.innerWidth <= 768) {
                            window.closeNavMenu();
                        }
                    }
                });
            }
        });
    }

    // ===========================================
    // HELPER FUNCTIONS
    // ===========================================

    // Check if mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Handle window resize
    window.addEventListener('resize', function () {
        const navMenu = document.querySelector('.nav-menu, #navMenu, nav ul');
        if (!navMenu) return;

        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            navMenu.style.display = '';

            const hamburger = document.querySelector('.mobile-menu-btn, .hamburger-btn');
            if (hamburger) {
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.innerHTML = '☰';
            }

            const overlay = document.querySelector('.nav-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    });

    // Export helper functions globally
    window.BraineXNavigation = {
        closeMenu: function () {
            if (window.closeNavMenu) window.closeNavMenu();
        },
        isMobile: isMobile
    };

})();
