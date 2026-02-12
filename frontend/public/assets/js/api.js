window.api = {
    // Base URL
    baseUrl: 'http://localhost:3000/api',

    // Generic fetch wrapper with auth header
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem('accessToken');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            // Use window.fetch to avoid shadowing issues
            const response = await window.fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle token expiration
                if (response.status === 401) {
                    this.logout();
                }
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    // Auth methods
    async login(email, password) {
        const result = await this.fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (result.success) {
            localStorage.setItem('accessToken', result.data.accessToken);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            return result.data.user;
        }
    },

    async register(userData) {
        return await this.fetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/';
    },

    // Helper to get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};
