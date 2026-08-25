import axios from 'axios';

// In local dev, '/api' is proxied to localhost:5000 (see vite.config.js).
// In production, set VITE_API_URL to your deployed backend, e.g.
// https://nova-mobile-api.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nova_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('nova_admin_token');
    }
    return Promise.reject(err);
  }
);

export default api;
