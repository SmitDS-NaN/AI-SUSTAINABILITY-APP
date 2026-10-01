import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecoledger_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Usage logs endpoints
export const usageAPI = {
  getLogs: (params) => api.get('/usage', { params }),
  createLog: (data) => api.post('/usage', data),
  uploadCSV: (data) => api.post('/usage/upload', data),
  deleteLog: (id) => api.delete(`/usage/${id}`)
};

// Dashboard endpoints
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary')
};

// AI endpoints
export const aiAPI = {
  explainAnomaly: (anomaly) => api.post('/ai/explain-anomaly', { anomaly }),
  getRecommendations: () => api.get('/ai/recommendations'),
  generateRecommendations: () => api.post('/ai/recommendations', {}),
  updateRecommendationStatus: (id, status) => api.put(`/ai/recommendations/${id}`, { status }),
  chat: (message, history) => api.post('/ai/chat', { message, history }),
  generateReport: () => api.post('/ai/report', {})
};

// Goals endpoints
export const goalsAPI = {
  getGoals: () => api.get('/goals'),
  createGoal: (data) => api.post('/goals', data),
  deleteGoal: (id) => api.delete(`/goals/${id}`)
};
