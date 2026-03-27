import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }
};

// Problem Service
export const problemService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/problems', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },

  create: async (problemData) => {
    const response = await api.post('/problems', problemData);
    return response.data;
  },

  update: async (id, problemData) => {
    const response = await api.put(`/problems/${id}`, problemData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/problems/${id}`);
    return response.data;
  },

  search: async (query) => {
    const response = await api.get('/problems/search', { params: { q: query } });
    return response.data;
  },

  upvote: async (id) => {
    const response = await api.post(`/problems/${id}/upvote`);
    return response.data;
  },

  addSolution: async (problemId, solution) => {
    const response = await api.post(`/problems/${problemId}/solutions`, { solution });
    return response.data;
  }
};

// Category Service
export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getBySlug: async (slug) => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },

  getProblems: async (slug, filters = {}) => {
    const response = await api.get(`/categories/${slug}/problems`, { params: filters });
    return response.data;
  }
};

// Admin Service
export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (filters = {}) => {
    const response = await api.get('/admin/users', { params: filters });
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getProblems: async (filters = {}) => {
    const response = await api.get('/admin/problems', { params: filters });
    return response.data;
  },

  approveProblem: async (id) => {
    const response = await api.put(`/admin/problems/${id}/approve`);
    return response.data;
  },

  rejectProblem: async (id) => {
    const response = await api.put(`/admin/problems/${id}/reject`);
    return response.data;
  },

  deleteProblem: async (id) => {
    const response = await api.delete(`/admin/problems/${id}`);
    return response.data;
  },

  featureProblem: async (id, featured) => {
    const response = await api.put(`/admin/problems/${id}/feature`, { featured });
    return response.data;
  }
};

export default api;
