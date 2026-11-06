import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Menambahkan Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gizita_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Penanganan Lisensi & Token Kedaluwarsa
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 423 || error.response.data?.isLicenseLocked)) {
      const msg = error.response.data?.message || 'Masa lisensi evaluasi telah berakhir atau dinonaktifkan oleh pengembang.';
      window.dispatchEvent(new CustomEvent('gizita:license-locked', { detail: msg }));
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('gizita_token');
      localStorage.removeItem('gizita_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

