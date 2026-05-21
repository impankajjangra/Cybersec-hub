/**
 * axiosConfig.js
 * 
 * Shared axios instance that automatically attaches the Authorization
 * header from localStorage on every request.
 * 
 * Import this instead of plain axios in all pages that call /api/* endpoints.
 * Usage:  import api from '@/axiosConfig';
 *         const res = await api.get('/api/history');
 */

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// If backend returns 401, clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
