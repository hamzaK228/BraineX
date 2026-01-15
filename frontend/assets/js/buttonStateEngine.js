/**
 * BUTTON STATE ENGINE v2.0 - Production Ready
 * Mandatory implementation - NO placeholders
 */

class ButtonStateEngine {
    constructor(button, options = {}) {
        if (!button) throw new Error('ButtonStateEngine: Valid button element required');

        this.button = button;
        this.originalHTML = button.innerHTML;
        this.originalDisabled = button.disabled;
        this.originalAriaLabel = button.getAttribute('aria-label') || '';
        this.originalClasses = button.className;

        // State tracking
        this.currentState = 'idle';
        this.states = {
            IDLE: 'idle',
            LOADING: 'loading',
            SUCCESS: 'success',
            ERROR: 'error',
            DISABLED: 'disabled'
        };

        // Configuration
        this.options = {
            loadingText: options.loadingText || 'Processing...',
            successDuration: options.successDuration || 2000,
            errorDuration: options.errorDuration || 5000,
            preventDoubleClick: options.preventDoubleClick !== false,
            spinnerTemplate: options.spinnerTemplate || '<span class="bse-spinner" aria-hidden="true"></span>'
        };

        this.lastClickTime = 0;
        this.init();
    }

    init() {
        // IMPLEMENT: Set initial aria attributes
        if (!this.button.getAttribute('aria-live')) {
            this.button.setAttribute('aria-live', 'polite');
        }

        // IMPLEMENT: Add event listeners for state transitions
        if (this.options.preventDoubleClick) {
            this.button.addEventListener('click', (e) => this.handleClick(e), { capture: true });
        }
    }

    handleClick(e) {
        // Prevent clicks if not idle
        if (this.currentState !== this.states.IDLE) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return;
        }

        // Debounce check
        const now = Date.now();
        if (now - this.lastClickTime < 500) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return;
        }
        this.lastClickTime = now;
    }

    setLoading(customText) {
        if (this.currentState === this.states.LOADING) return;

        // REQUIRED IMPLEMENTATION:
        // 1. Set button disabled
        this.button.disabled = true;

        // 2. Add spinner HTML
        const text = customText || this.options.loadingText;
        this.button.innerHTML = `${this.options.spinnerTemplate} ${text}`;

        // 3. Set aria-busy="true"
        this.button.setAttribute('aria-busy', 'true');
        this.button.setAttribute('aria-label', text);

        // 4. Store click timestamp (handled in handleClick, but updated here for good measure)
        this.lastClickTime = Date.now();

        // 5. Update currentState
        this.currentState = this.states.LOADING;

        // 6. Add loading CSS class
        this.button.classList.add('bse-loading');
    }

    setSuccess(message = 'Success!') {
        // REQUIRED IMPLEMENTATION:
        this.button.disabled = true; // Keep disabled during success message

        // 1. Show checkmark icon
        this.button.innerHTML = `<span class="bse-icon-success">✓</span> ${message}`;

        // 2. Update aria-label to message
        this.button.setAttribute('aria-label', message);
        this.button.removeAttribute('aria-busy');

        // 3. Add success CSS class
        this.button.classList.remove('bse-loading', 'bse-error');
        this.button.classList.add('bse-success');

        this.currentState = this.states.SUCCESS;

        // 4. Wait successDuration
        // 5. Auto-restore to idle
        if (this.successTimer) clearTimeout(this.successTimer);
        this.successTimer = setTimeout(() => {
            if (this.currentState === this.states.SUCCESS) {
                this.restore();
            }
        }, this.options.successDuration);
    }

    setError(message = 'An error occurred', retryCallback = null) {
        // REQUIRED IMPLEMENTATION:
        this.button.disabled = false; // Allow interaction (e.g. retry)

        // 1. Show error icon
        this.button.innerHTML = `<span class="bse-icon-error">⚠️</span> ${message}`;

        // 2. Update aria-label to error message
        this.button.setAttribute('aria-label', message);
        this.button.removeAttribute('aria-busy');

        // 3. Add error CSS class
        this.button.classList.remove('bse-loading', 'bse-success');
        this.button.classList.add('bse-error');

        this.currentState = this.states.ERROR;

        // 4. If retryCallback provided, add retry button logic (simplified: clicking again retries)
        if (typeof retryCallback === 'function') {
            const retryHandler = (e) => {
                this.button.removeEventListener('click', retryHandler);
                retryCallback(e);
            };
            this.button.addEventListener('click', retryHandler, { once: true });
        } else {
            // Auto restore if no retry callback after error duration
            if (this.errorTimer) clearTimeout(this.errorTimer);
            this.errorTimer = setTimeout(() => {
                if (this.currentState === this.states.ERROR) {
                    this.restore();
                }
            }, this.options.errorDuration);
        }

        // 5. Maintain focus for accessibility
        this.button.focus();
    }

    restore() {
        // REQUIRED IMPLEMENTATION:
        // 1. Restore original HTML
        this.button.innerHTML = this.originalHTML;

        // 2. Restore disabled state
        this.button.disabled = this.originalDisabled;

        // 3. Restore aria-label
        if (this.originalAriaLabel) {
            this.button.setAttribute('aria-label', this.originalAriaLabel);
        } else {
            this.button.removeAttribute('aria-label');
        }
        this.button.removeAttribute('aria-busy');

        // 4. Remove all state CSS classes
        this.button.classList.remove('bse-loading', 'bse-success', 'bse-error');

        // 5. Set currentState = 'idle'
        this.currentState = this.states.IDLE;

        // 6. Re-enable event listeners (Implicit by removing blocking states)

        // Clear timers
        if (this.successTimer) clearTimeout(this.successTimer);
        if (this.errorTimer) clearTimeout(this.errorTimer);
    }

    isProcessing() {
        return this.currentState === this.states.LOADING;
    }
}

// GLOBAL HELPER FUNCTIONS (IMPLEMENT ALL)
const ButtonStateManager = {
    engines: new Map(),

    initAll: (selector = '[data-button-state]') => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(btn => {
            if (!ButtonStateManager.engines.has(btn)) {
                ButtonStateManager.engines.set(btn, new ButtonStateEngine(btn));
            }
        });
    },

    getEngine: (button) => {
        if (!ButtonStateManager.engines.has(button)) {
            ButtonStateManager.engines.set(button, new ButtonStateEngine(button));
        }
        return ButtonStateManager.engines.get(button);
    },

    debounceClick: (button, callback, delay = 2000) => {
        let lastClick = 0;
        button.addEventListener('click', (e) => {
            const now = Date.now();
            if (now - lastClick >= delay) {
                lastClick = now;
                callback(e);
            } else {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        });
    },

    createToast: (message, type = 'info') => {
        // Use existing showNotification if available, or fallback
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            // Fallback implementation
            const container = document.getElementById('bse-toasts') || (() => {
                const c = document.createElement('div');
                c.id = 'bse-toasts';
                c.style.cssText = 'position:Fixed;top:20px;right:20px;z-index:9999;';
                document.body.appendChild(c);
                return c;
            })();

            const toast = document.createElement('div');
            toast.textContent = message;
            toast.style.cssText = `
                background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
                color:white;padding:12px;margin-bottom:10px;border-radius:6px;box-shadow:0 4px 6px rgba(0,0,0,0.1);
            `;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
        }
    }
};

// Export to window
window.ButtonStateEngine = ButtonStateEngine;
window.ButtonStateManager = ButtonStateManager;

// Inject basic CSS for the engine
const style = document.createElement('style');
style.textContent = `
    .bse-loading { opacity: 0.8; cursor: wait; }
    .bse-success { background-color: var(--color-success, #10b981) !important; color: white !important; border-color: transparent !important; }
    .bse-error { background-color: var(--color-error, #ef4444) !important; color: white !important; border-color: transparent !important; animation: bse-shake 0.4s ease-in-out; }
    .bse-spinner { display: inline-block; width: 1em; height: 1em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: bse-spin 0.75s linear infinite; margin-right: 0.5em; vertical-align: text-bottom; }
    @keyframes bse-spin { to { transform: rotate(360deg); } }
    @keyframes bse-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
`;
document.head.appendChild(style);
