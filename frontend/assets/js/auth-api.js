// BraineX Auth API Module
// Handles all authentication-related API calls

class AuthAPI {
    constructor() {
        this.baseURL = window.location.origin + '/api/auth';
        this.accessToken = localStorage.getItem('brainex_access_token');
        this.refreshToken = localStorage.getItem('brainex_refresh_token');
        this.user = JSON.parse(localStorage.getItem('brainex_user') || 'null');
        this.isRefreshing = false;
        this.refreshSubscribers = [];
    }

    // Get authorization headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        return headers;
    }

    // Store tokens and user data
    setAuthData(tokens, user) {
        if (tokens) {
            this.accessToken = tokens.accessToken;
            this.refreshToken = tokens.refreshToken;
            localStorage.setItem('brainex_access_token', tokens.accessToken);
            localStorage.setItem('brainex_refresh_token', tokens.refreshToken);
        }

        if (user) {
            this.user = user;
            localStorage.setItem('brainex_user', JSON.stringify(user));
        }
    }

    // Clear auth data
    clearAuthData() {
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        localStorage.removeItem('brainex_access_token');
        localStorage.removeItem('brainex_refresh_token');
        localStorage.removeItem('brainex_user');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.accessToken && !!this.user;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole('admin');
    }

    // Refresh access token
    async refreshAccessToken() {
        if (this.isRefreshing) {
            // Wait for existing refresh to complete
            return new Promise((resolve) => {
                this.refreshSubscribers.push(resolve);
            });
        }

        this.isRefreshing = true;

        try {
            const response = await fetch(`${this.baseURL}/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            const data = await response.json();

            if (data.success) {
                this.accessToken = data.data.accessToken;
                localStorage.setItem('brainex_access_token', data.data.accessToken);

                // Notify all waiting requests
                this.refreshSubscribers.forEach(callback => callback(true));
                this.refreshSubscribers = [];

                return true;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.clearAuthData();
            this.refreshSubscribers.forEach(callback => callback(false));
            this.refreshSubscribers = [];
            return false;
        } finally {
            this.isRefreshing = false;
        }
    }

    // Make authenticated API request with auto-refresh
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

        try {
            let response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(options.auth !== false),
                    ...options.headers
                }
            });

            // If token expired, try to refresh
            if (response.status === 401) {
                const data = await response.json();

                if (data.code === 'TOKEN_EXPIRED' && this.refreshToken) {
                    const refreshed = await this.refreshAccessToken();

                    if (refreshed) {
                        // Retry the request with new token
                        response = await fetch(url, {
                            ...options,
                            headers: {
                                ...this.getHeaders(true),
                                ...options.headers
                            }
                        });
                    } else {
                        // Refresh failed, redirect to login
                        this.handleAuthError();
                        throw new Error('Session expired. Please login again.');
                    }
                }
            }

            return response;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Handle authentication errors
    handleAuthError() {
        this.clearAuthData();

        // Dispatch event for UI to handle
        window.dispatchEvent(new CustomEvent('auth:logout', {
            detail: { reason: 'session_expired' }
        }));
    }

    // ==================== AUTH METHODS ====================

    // Register new user
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                this.setAuthData(data.tokens, data.data);
                window.dispatchEvent(new CustomEvent('auth:login', { detail: data.data }));
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Registration failed. Please try again.' };
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.setAuthData(data.tokens, data.data);
                window.dispatchEvent(new CustomEvent('auth:login', { detail: data.data }));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    }

    // Logout user
    async logout() {
        try {
            await this.request('/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuthData();
            window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'user_initiated' } }));
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const response = await this.request('/me');
            const data = await response.json();

            if (data.success) {
                this.user = data.data;
                localStorage.setItem('brainex_user', JSON.stringify(data.data));
            }

            return data;
        } catch (error) {
            console.error('Get user error:', error);
            return { success: false, error: 'Failed to get user data' };
        }
    }

    // Update profile
    async updateProfile(profileData) {
        try {
            const response = await this.request('/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (data.success) {
                this.user = data.data;
                localStorage.setItem('brainex_user', JSON.stringify(data.data));
            }

            return data;
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: 'Failed to update profile' };
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await this.request('/change-password', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (data.success && data.tokens) {
                this.setAuthData(data.tokens);
            }

            return data;
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, error: 'Failed to change password' };
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await fetch(`${this.baseURL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            return await response.json();
        } catch (error) {
            console.error('Forgot password error:', error);
            return { success: false, error: 'Failed to process request' };
        }
    }
}

// Create global instance
window.authAPI = new AuthAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthAPI;
}
