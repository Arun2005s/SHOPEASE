import axios from 'axios';

// Support both VITE_API_URL and VITE_BACKEND_URL for flexibility
let API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// Clean up the URL (remove trailing slash, ensure /api is included)
API_URL = API_URL.trim().replace(/\/$/, ''); // Remove trailing slash
if (!API_URL.endsWith('/api')) {
  API_URL = API_URL + '/api';
}

// Log API URL to help debug
console.log('🔗 API URL:', API_URL);
console.log('🌍 Environment:', import.meta.env.MODE);

// Warn if using localhost in production
if (import.meta.env.PROD && API_URL.includes('localhost')) {
  console.error('⚠️ WARNING: Using localhost API URL in production!');
  console.error('Please set VITE_API_URL or VITE_BACKEND_URL environment variable in Vercel.');
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

