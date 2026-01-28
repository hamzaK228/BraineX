/**
 * BraineX Forms - Comprehensive Form Validation & Submission Handler
 * Provides site-wide consistent form validation with inline error messages
 */

(function () {
    'use strict';

    // ============================================================================
    // VALIDATION RULES
    // ============================================================================

    const ValidationRules = {
        // 1. Required field validation
        required: (value, fieldName = 'This field') => {
            const trimmed = typeof value === 'string' ? value.trim() : value;
            if (!trimmed && trimmed !== 0) {
                return `${fieldName} is required`;
            }
            return null;
        },

        // 2. Email format validation
        email: (value) => {
            if (!value) return null; // Only validate if has value
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return 'Please enter a valid email address';
            }
            return null;
        },

        // 3. Password strength validation
        password: (value) => {
            if (!value) return null;

            const errors = [];
            if (value.length < 8) {
                errors.push('at least 8 characters');
            }
            if (!/[A-Z]/.test(value)) {
                errors.push('one uppercase letter');
            }
            if (!/[a-z]/.test(value)) {
                errors.push('one lowercase letter');
            }
            if (!/[0-9]/.test(value)) {
                errors.push('one number');
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                errors.push('one special character');
            }

            if (errors.length > 0) {
                return `Password must contain ${errors.join(', ')}`;
            }
            return null;
        },

        // 4. Confirm password matching
        confirmPassword: (value, formData, passwordFieldName = 'password') => {
            if (!value) return null;
            const password = formData.get(passwordFieldName);
            if (value !== password) {
                return 'Passwords do not match';
            }
            return null;
        },

        // Min length validation
        minLength: (value, min) => {
            if (!value) return null;
            if (value.length < min) {
                return `Must be at least ${min} characters`;
            }
            return null;
        },

        // Max length validation
        maxLength: (value, max) => {
            if (!value) return null;
            if (value.length > max) {
                return `Must be no more than ${max} characters`;
            }
            return null;
        },

        // URL validation
        url: (value) => {
            if (!value) return null;
            try {
                new URL(value);
                return null;
            } catch {
                return 'Please enter a valid URL';
            }
        },

        // Number validation
        number: (value) => {
            if (!value) return null;
            if (isNaN(value)) {
                return 'Please enter a valid number';
            }
            return null;
        },
    };

    // ============================================================================
    // FORM VALIDATOR CLASS
    // ============================================================================

    class FormValidator {
        constructor(form, options = {}) {
            this.form = form;
            this.options = {
                validateOnBlur: true,
                validateOnInput: true,
                showSuccessStates: false,
                onSubmit: null,
                customValidators: {},
                ...options,
            };

            this.isSubmitting = false;
            this.init();
        }

        init() {
            this.injectStyles();
            this.setupEventListeners();
        }

        injectStyles() {
            if (document.getElementById('brainex-forms-styles')) return;

            const styles = `
        <style id="brainex-forms-styles">
          .form-field-error {
            border-color: #ef4444 !important;
            background-color: #fef2f2 !important;
          }

          html[data-theme="dark"] .form-field-error {
            border-color: #f87171 !important;
            background-color: #7f1d1d !important;
          }

          .form-field-success {
            border-color: #10b981 !important;
          }

          .form-error-message {
            display: block;
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: slideDown 0.2s ease-out;
          }

          html[data-theme="dark"] .form-error-message {
            color: #fca5a5;
          }

          .form-success-message {
            display: block;
            color: #10b981;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .btn-loading {
            position: relative;
            pointer-events: none;
            opacity: 0.7;
          }

          .btn-loading::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            top: 50%;
            left: 50%;
            margin-left: -8px;
            margin-top: -8px;
            border: 2px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.6s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .form-message {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            animation: slideDown 0.3s ease-out;
          }

          .form-message-success {
            background-color: #d1fae5;
            color: #065f46;
            border: 1px solid #10b981;
          }

          html[data-theme="dark"] .form-message-success {
            background-color: #064e3b;
            color: #6ee7b7;
            border-color: #059669;
          }

          .form-message-error {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #ef4444;
          }

          html[data-theme="dark"] .form-message-error {
            background-color: #7f1d1d;
            color: #fca5a5;
            border-color: #dc2626;
          }

          .form-message-info {
            background-color: #dbeafe;
            color: #1e3a8a;
            border: 1px solid #3b82f6;
          }

          html[data-theme="dark"] .form-message-info {
            background-color: #1e3a8a;
            color: #93c5fd;
            border-color: #2563eb;
          }
        </style>
      `;

            document.head.insertAdjacentHTML('beforeend', styles);
        }

        setupEventListeners() {
            // Form submission
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Field validation on blur and input
            const fields = this.form.querySelectorAll('input, textarea, select');
            fields.forEach((field) => {
                if (this.options.validateOnBlur) {
                    field.addEventListener('blur', () => this.validateField(field));
                }

                if (this.options.validateOnInput) {
                    // Clear errors on input change
                    field.addEventListener('input', () => this.clearFieldError(field));
                }
            });
        }

        getFieldValidators(field) {
            const validators = [];
            const fieldName = field.getAttribute('data-label') ||
                field.getAttribute('placeholder') ||
                field.name ||
                'This field';

            // Required validation
            if (field.hasAttribute('required') || field.getAttribute('data-required') === 'true') {
                validators.push({
                    rule: 'required',
                    params: [fieldName],
                });
            }

            // Type-based validation
            const type = field.type || field.getAttribute('data-validate');

            if (type === 'email') {
                validators.push({ rule: 'email' });
            }

            if (type === 'password' && field.getAttribute('data-validate-strength') === 'true') {
                validators.push({ rule: 'password' });
            }

            if (field.getAttribute('data-confirm-password')) {
                const passwordField = field.getAttribute('data-confirm-password');
                validators.push({
                    rule: 'confirmPassword',
                    params: [passwordField],
                });
            }

            if (type === 'url') {
                validators.push({ rule: 'url' });
            }

            if (type === 'number') {
                validators.push({ rule: 'number' });
            }

            // Min/Max length
            const minLength = field.getAttribute('minlength') || field.getAttribute('data-minlength');
            if (minLength) {
                validators.push({
                    rule: 'minLength',
                    params: [parseInt(minLength)],
                });
            }

            const maxLength = field.getAttribute('maxlength') || field.getAttribute('data-maxlength');
            if (maxLength) {
                validators.push({
                    rule: 'maxLength',
                    params: [parseInt(maxLength)],
                });
            }

            // Custom validators
            const customRule = field.getAttribute('data-custom-validate');
            if (customRule && this.options.customValidators[customRule]) {
                validators.push({
                    rule: 'custom',
                    validator: this.options.customValidators[customRule],
                });
            }

            return validators;
        }

        validateField(field) {
            const validators = this.getFieldValidators(field);
            const value = field.value;
            const formData = new FormData(this.form);

            for (const validator of validators) {
                let error = null;

                if (validator.rule === 'custom') {
                    error = validator.validator(value, formData);
                } else if (validator.rule === 'confirmPassword') {
                    error = ValidationRules.confirmPassword(value, formData, validator.params[0]);
                } else {
                    const validationFn = ValidationRules[validator.rule];
                    if (validationFn) {
                        error = validationFn(value, ...(validator.params || []));
                    }
                }

                if (error) {
                    this.showFieldError(field, error);
                    return false;
                }
            }

            this.clearFieldError(field);
            if (this.options.showSuccessStates && value) {
                this.showFieldSuccess(field);
            }
            return true;
        }

        showFieldError(field, message) {
            this.clearFieldError(field);

            field.classList.add('form-field-error');
            field.classList.remove('form-field-success');

            const errorEl = document.createElement('span');
            errorEl.className = 'form-error-message';
            errorEl.textContent = message;
            errorEl.setAttribute('role', 'alert');

            // Insert after field or after parent if in form-group
            const parent = field.closest('.form-group') || field.parentElement;
            parent.appendChild(errorEl);

            // Accessibility
            field.setAttribute('aria-invalid', 'true');
            field.setAttribute('aria-describedby', `error-${field.name}`);
            errorEl.id = `error-${field.name}`;
        }

        clearFieldError(field) {
            field.classList.remove('form-field-error');
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');

            const parent = field.closest('.form-group') || field.parentElement;
            const errorEl = parent.querySelector('.form-error-message');
            if (errorEl) {
                errorEl.remove();
            }
        }

        showFieldSuccess(field) {
            field.classList.add('form-field-success');
        }

        validateForm() {
            let isValid = true;
            const fields = this.form.querySelectorAll('input, textarea, select');

            fields.forEach((field) => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        showFormMessage(message, type = 'info') {
            this.clearFormMessage();

            const messageEl = document.createElement('div');
            messageEl.className = `form-message form-message-${type}`;
            messageEl.textContent = message;
            messageEl.setAttribute('role', type === 'error' ? 'alert' : 'status');

            this.form.insertAdjacentElement('afterbegin', messageEl);

            // Auto-remove after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => messageEl.remove(), 5000);
            }
        }

        clearFormMessage() {
            const existingMessage = this.form.querySelector('.form-message');
            if (existingMessage) {
                existingMessage.remove();
            }
        }

        setSubmitButton(loading = false) {
            const submitBtn = this.form.querySelector('button[type="submit"]');
            if (!submitBtn) return;

            if (loading) {
                submitBtn.disabled = true;
                submitBtn.classList.add('btn-loading');
                submitBtn.setAttribute('data-original-text', submitBtn.textContent);
                submitBtn.textContent = 'Processing...';
            } else {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                const originalText = submitBtn.getAttribute('data-original-text');
                if (originalText) {
                    submitBtn.textContent = originalText;
                    submitBtn.removeAttribute('data-original-text');
                }
            }
        }

        async handleSubmit(e) {
            e.preventDefault();

            // Prevent double submission
            if (this.isSubmitting) {
                return;
            }

            // Validate form
            if (!this.validateForm()) {
                this.showFormMessage('Please fix the errors before submitting', 'error');
                return;
            }

            this.isSubmitting = true;
            this.setSubmitButton(true);
            this.clearFormMessage();

            try {
                const formData = new FormData(this.form);

                // Call custom submit handler if provided
                if (this.options.onSubmit) {
                    await this.options.onSubmit(formData, this.form);
                } else {
                    // Default behavior: show success
                    this.showFormMessage('Form submitted successfully!', 'success');
                    this.form.reset();
                }
            } catch (error) {
                console.error('Form submission error:', error);
                this.showFormMessage(
                    error.message || 'An error occurred. Please try again.',
                    'error'
                );
            } finally {
                this.isSubmitting = false;
                this.setSubmitButton(false);
            }
        }

        reset() {
            this.form.reset();
            this.clearFormMessage();
            const fields = this.form.querySelectorAll('input, textarea, select');
            fields.forEach((field) => {
                this.clearFieldError(field);
                field.classList.remove('form-field-success');
            });
        }
    }

    // ============================================================================
    // GLOBAL API
    // ============================================================================

    const BraineXForms = {
        instances: new Map(),

        init(options = {}) {
            // Auto-enhance all forms on the page
            document.addEventListener('DOMContentLoaded', () => {
                const forms = document.querySelectorAll('form[data-validate="true"], form.validate-form');
                forms.forEach((form) => {
                    if (!this.instances.has(form)) {
                        this.enhanceForm(form, options);
                    }
                });
            });
        },

        enhanceForm(form, options = {}) {
            if (typeof form === 'string') {
                form = document.querySelector(form);
            }

            if (!form) {
                console.warn('BraineXForms: Form not found');
                return null;
            }

            const validator = new FormValidator(form, options);
            this.instances.set(form, validator);
            return validator;
        },

        getValidator(form) {
            if (typeof form === 'string') {
                form = document.querySelector(form);
            }
            return this.instances.get(form);
        },

        validateForm(form) {
            const validator = this.getValidator(form);
            return validator ? validator.validateForm() : false;
        },

        resetForm(form) {
            const validator = this.getValidator(form);
            if (validator) {
                validator.reset();
            }
        },

        // Utility to add custom validators
        addValidator(name, validatorFn) {
            ValidationRules[name] = validatorFn;
        },
    };

    // Export to global scope
    window.BraineXForms = BraineXForms;

    // Auto-initialize with default settings
    BraineXForms.init();
})();
