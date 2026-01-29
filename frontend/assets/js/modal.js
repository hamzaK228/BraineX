/**
 * BraineX Modal System
 * Handles site-wide modal functionality across all pages
 */

(function () {
    'use strict';

    // Wait for DOM to load
    document.addEventListener('DOMContentLoaded', function () {
        initModalSystem();
    });

    function initModalSystem() {
        // Initialize all modal features
        setupModalTriggers();
        setupModalClose();
        setupOutsideClick();
        setupEscapeKey();
        setupFormSubmissions();
        setupBackdrop();
    }

    // ===========================================
    // 1. Modal Triggers - Open Modal
    // ===========================================
    function setupModalTriggers() {
        // Find all modal trigger buttons/links
        const triggers = document.querySelectorAll(
            '[data-modal], [data-target], .js-open-modal, [href^="#"][href*="modal"], ' +
            '.js-open-goal-modal, .js-open-university-modal, .js-open-program-modal, .js-open-project-modal, .js-open-note-modal'
        );

        triggers.forEach(trigger => {
            trigger.addEventListener('click', function (e) {
                e.preventDefault();

                // Determine which modal to open
                let modalId = this.getAttribute('data-modal') ||
                    this.getAttribute('data-target') ||
                    this.getAttribute('href');

                // Handle class-based triggers (notion.html pattern)
                if (this.classList.contains('js-open-goal-modal')) modalId = '#goalModal';
                if (this.classList.contains('js-open-university-modal')) modalId = '#universityModal';
                if (this.classList.contains('js-open-program-modal')) modalId = '#programModal';
                if (this.classList.contains('js-open-project-modal')) modalId = '#projectModal';
                if (this.classList.contains('js-open-note-modal')) modalId = '#noteModal';
                if (this.classList.contains('js-open-universal-modal')) modalId = '#universalAddModal';

                // Remove # if present
                if (modalId && modalId.startsWith('#')) {
                    modalId = modalId.substring(1);
                }

                if (modalId) {
                    openModal(modalId);
                }
            });
        });
    }

    // ===========================================
    // 2. Close Button (X) - Close Modal
    // ===========================================
    function setupModalClose() {
        // Find all close buttons
        const closeButtons = document.querySelectorAll(
            '.close-modal, .modal-close, [data-dismiss="modal"], .js-close-modal, ' +
            '.js-close-goal-modal, .js-close-university-modal, .js-close-program-modal, .js-close-project-modal, .js-close-note-modal, ' +
            '#closeNoteModalBtn'
        );

        closeButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const modal = this.closest('.modal, .add-item-modal');
                if (modal) {
                    closeModal(modal.id || modal);
                }
            });
        });

        // Also handle cancel buttons
        const cancelButtons = document.querySelectorAll('.btn-secondary[type="button"]');
        cancelButtons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes('cancel')) {
                btn.addEventListener('click', function (e) {
                    const modal = this.closest('.modal, .add-item-modal');
                    if (modal) {
                        e.preventDefault();
                        closeModal(modal.id || modal);
                    }
                });
            }
        });
    }

    // ===========================================
    // 3. Outside Click - Close Modal
    // ===========================================
    function setupOutsideClick() {
        document.addEventListener('click', function (e) {
            // Check if click target is a modal backdrop (not content)
            if (e.target.classList.contains('modal') || e.target.classList.contains('add-item-modal')) {
                // Clicked on the backdrop itself, not the content
                closeModal(e.target.id || e.target);
            }
        });
    }

    // ===========================================
    // 4. ESC Key - Close Modal
    // ===========================================
    function setupEscapeKey() {
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                // Find currently open modal
                const openModals = document.querySelectorAll('.modal.active, .modal[style*="display: flex"], .modal[style*="display: block"], .add-item-modal[style*="display: flex"]');

                openModals.forEach(modal => {
                    closeModal(modal.id || modal);
                });
            }
        });
    }

    // ===========================================
    // 5. Form Submissions - Validate and Process
    // ===========================================
    function setupFormSubmissions() {
        // Find all forms within modals
        const modalForms = document.querySelectorAll('.modal form, .add-item-modal form');

        modalForms.forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                // Validate form
                const isValid = validateModalForm(this);

                if (isValid) {
                    // Process form
                    processModalForm(this);
                } else {
                    // Show error message in modal
                    showModalMessage(this, 'Please fill in all required fields', 'error');
                }
            });
        });
    }

    // ===========================================
    // 6. Backdrop - Prevent Body Scroll
    // ===========================================
    function setupBackdrop() {
        // Add CSS for body scroll prevention if not present
        if (!document.getElementById('modal-scroll-lock-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-scroll-lock-styles';
            style.textContent = `
        body.modal-open {
          overflow: hidden;
          padding-right: var(--scrollbar-width, 0);
        }
        .modal,
        .add-item-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: none;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          overflow-y: auto;
          padding: 1rem;
        }
        .modal.active,
        .add-item-modal.active {
          display: flex !important;
        }
        .modal-content,
        .add-modal-content,
        .goal-modal-content,
        .note-modal-content {
          background: #fff;
          border-radius: 8px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: modalSlideIn 0.3s ease-out;
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .close-modal,
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0.25rem;
          line-height: 1;
          transition: color 0.2s;
        }
        .close-modal:hover,
        .modal-close:hover {
          color: #1f2937;
        }
        .modal-message {
          padding: 0.75rem 1rem;
          margin: 1rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          animation: slideIn 0.3s ease;
        }
        .modal-message.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }
        .modal-message.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }
        .modal-message.info {
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }
      `;
            document.head.appendChild(style);
        }
    }

    // ===========================================
    // CORE FUNCTIONS
    // ===========================================

    /**
     * Open a modal
     * @param {string|Element} modalIdOrElement - Modal ID or element
     */
    function openModal(modalIdOrElement) {
        let modal;

        if (typeof modalIdOrElement === 'string') {
            modal = document.getElementById(modalIdOrElement);
        } else {
            modal = modalIdOrElement;
        }

        if (!modal) {
            console.warn('Modal not found:', modalIdOrElement);
            return;
        }

        // Show modal
        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');

        // Prevent body scroll
        preventBodyScroll(true);

        // Focus first input if available
        setTimeout(() => {
            const firstInput = modal.querySelector('input:not([type="hidden"]), textarea, select');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);

        // Clear previous messages
        clearModalMessages(modal);
    }

    /**
     * Close a modal
     * @param {string|Element} modalIdOrElement - Modal ID or element
     */
    function closeModal(modalIdOrElement) {
        let modal;

        if (typeof modalIdOrElement === 'string') {
            modal = document.getElementById(modalIdOrElement);
        } else {
            modal = modalIdOrElement;
        }

        if (!modal) return;

        // Hide modal
        modal.classList.remove('active');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');

        // Allow body scroll if no other modals are open
        const openModals = document.querySelectorAll('.modal.active, .add-item-modal.active');
        if (openModals.length === 0) {
            preventBodyScroll(false);
        }

        // Reset form if present
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }

        // Clear messages
        clearModalMessages(modal);
    }

    /**
     * Validate modal form
     * @param {HTMLFormElement} form - Form element
     * @returns {boolean} - Is form valid
     */
    function validateModalForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                // Remove error class on input
                field.addEventListener('input', function () {
                    this.classList.remove('error');
                }, { once: true });
            }
        });

        // Email validation
        const emailFields = form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            if (field.value && !validateEmail(field.value)) {
                isValid = false;
                field.classList.add('error');
            }
        });

        return isValid;
    }

    /**
     * Process modal form
     * @param {HTMLFormElement} form - Form element
     */
    function processModalForm(form) {
        const modal = form.closest('.modal, .add-item-modal');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';

        // Disable button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        }

        // Simulate processing (replace with actual logic)
        setTimeout(() => {
            // Show success message
            showModalMessage(modal, 'Successfully saved!', 'success');

            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }

            // Close modal after delay
            setTimeout(() => {
                closeModal(modal);
            }, 1500);
        }, 500);
    }

    /**
     * Show message in modal
     * @param {Element} modalOrForm - Modal or form element
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, info)
     */
    function showModalMessage(modalOrForm, message, type = 'info') {
        const modal = modalOrForm.closest('.modal, .add-item-modal') || modalOrForm;

        // Remove existing messages
        clearModalMessages(modal);

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `modal-message ${type}`;
        messageEl.textContent = message;

        // Insert after header or at top of content
        const header = modal.querySelector('.modal-header, .add-modal-header');
        if (header) {
            header.after(messageEl);
        } else {
            const content = modal.querySelector('.modal-content, .add-modal-content');
            if (content) {
                content.prepend(messageEl);
            }
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }

    /**
     * Clear modal messages
     * @param {Element} modal - Modal element
     */
    function clearModalMessages(modal) {
        const messages = modal.querySelectorAll('.modal-message');
        messages.forEach(msg => msg.remove());
    }

    /**
     * Prevent or allow body scroll
     * @param {boolean} prevent - True to prevent, false to allow
     */
    function preventBodyScroll(prevent) {
        if (prevent) {
            // Calculate scrollbar width
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
            document.documentElement.style.removeProperty('--scrollbar-width');
        }
    }

    /**
     * Validate email format
     * @param {string} email - Email address
     * @returns {boolean} - Is email valid
     */
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ===========================================
    // EXPORT GLOBAL FUNCTIONS
    // ===========================================

    window.BraineXModal = {
        open: openModal,
        close: closeModal,
        showMessage: showModalMessage,
        validateForm: validateModalForm
    };

    // Backwards compatibility with global.js
    window.openModal = openModal;
    window.closeModal = closeModal;

})();
