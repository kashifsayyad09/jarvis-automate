// API utility functions
const API_BASE_URL = '/api';

class API {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static removeUser() {
        localStorage.removeItem('user');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }

    static async request(endpoint, options = {}) {
        const token = this.getToken();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...options
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Auth endpoints
    static async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (data.success && data.token) {
            this.setToken(data.token);
            this.setUser(data.user);
        }

        return data;
    }

    static async login(credentials) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (data.success && data.token) {
            this.setToken(data.token);
            this.setUser(data.user);
        }

        return data;
    }

    static async logout() {
        await this.request('/auth/logout', { method: 'POST' });
        this.removeToken();
        this.removeUser();
    }

    static async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // Problem endpoints
    static async getProblems(page = 1, limit = 20) {
        return await this.request(`/problems?page=${page}&limit=${limit}`);
    }

    static async getProblem(id) {
        return await this.request(`/problems/${id}`);
    }

    static async searchProblems(query, category = '', page = 1) {
        const categoryParam = category ? `&category=${category}` : '';
        return await this.request(`/problems/search?q=${encodeURIComponent(query)}${categoryParam}&page=${page}`);
    }

    static async getProblemsByCategory(category, page = 1) {
        return await this.request(`/problems/category/${category}?page=${page}`);
    }

    static async getTrendingProblems(limit = 10) {
        return await this.request(`/problems/trending?limit=${limit}`);
    }

    static async createProblem(problemData) {
        return await this.request('/problems', {
            method: 'POST',
            body: JSON.stringify(problemData)
        });
    }

    static async updateProblem(id, problemData) {
        return await this.request(`/problems/${id}`, {
            method: 'PUT',
            body: JSON.stringify(problemData)
        });
    }

    static async deleteProblem(id) {
        return await this.request(`/problems/${id}`, {
            method: 'DELETE'
        });
    }

    static async addComment(problemId, content) {
        return await this.request(`/problems/${problemId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    // Category endpoints
    static async getCategories() {
        return await this.request('/categories');
    }

    // Admin endpoints
    static async getDashboardStats() {
        return await this.request('/admin/dashboard');
    }

    static async getAllUsers(page = 1, limit = 50) {
        return await this.request(`/admin/users?page=${page}&limit=${limit}`);
    }

    static async updateUserRole(userId, role) {
        return await this.request(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    }

    static async deleteUser(userId) {
        return await this.request(`/admin/users/${userId}`, {
            method: 'DELETE'
        });
    }

    static async adminDeleteProblem(problemId) {
        return await this.request(`/admin/problems/${problemId}`, {
            method: 'DELETE'
        });
    }

    static async getCategoryStats() {
        return await this.request('/admin/stats/categories');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
