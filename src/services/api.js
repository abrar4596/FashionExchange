import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to inject Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fashion_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, could clear token if invalid
      if (error.response.data?.message?.includes('token invalid') || error.response.data?.message?.includes('User not found')) {
        localStorage.removeItem('fashion_token');
        localStorage.removeItem('fashion_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
