import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (data) => api.post('/auth/register/', data),
  profile: () => api.get('/auth/profile/'),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
};

// Bus APIs
export const busAPI = {
  list: () => api.get('/buses/'),
  get: (id) => api.get(`/buses/${id}/`),
  create: (data) => api.post('/buses/', data),
  update: (id, data) => api.put(`/buses/${id}/`, data),
  delete: (id) => api.delete(`/buses/${id}/`),
};

// Route APIs
export const routeAPI = {
  list: () => api.get('/routes/'),
  get: (id) => api.get(`/routes/${id}/`),
  create: (data) => api.post('/routes/', data),
  update: (id, data) => api.put(`/routes/${id}/`, data),
  delete: (id) => api.delete(`/routes/${id}/`),
};

// Trip APIs
export const tripAPI = {
  list: (params) => api.get('/trips/', { params }),
  get: (id) => api.get(`/trips/${id}/`),
  create: (data) => api.post('/trips/', data),
  update: (id, data) => api.put(`/trips/${id}/`, data),
  delete: (id) => api.delete(`/trips/${id}/`),
  seats: (tripId) => api.get(`/trips/${tripId}/seats/`),
};

// Booking APIs
export const bookingAPI = {
  list: () => api.get('/bookings/'),
  get: (id) => api.get(`/bookings/${id}/`),
  create: (data) => api.post('/bookings/create/', data),
  cancel: (id) => api.post(`/bookings/${id}/cancel/`),
};

// Payment APIs
export const paymentAPI = {
  list: () => api.get('/payments/'),
  get: (id) => api.get(`/payments/${id}/`),
  create: (data) => api.post('/payments/create/', data),
};

export default api;
