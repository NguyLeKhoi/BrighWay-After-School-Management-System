import axios from 'axios';
import authService from '../services/auth.service';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

// Process failed requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally and refresh token
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle different error status codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - try to refresh token
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            if (isRefreshing) {
              // If already refreshing, queue this request
              return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosInstance(originalRequest);
              }).catch(err => {
                return Promise.reject(err);
              });
            }
            
            isRefreshing = true;
            
            try {
              // Try to refresh token
              const response = await authService.refreshToken();
              const newToken = response.accessToken;
              
              // Update the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              // Process queued requests
              processQueue(null, newToken);
              
              // Retry the original request
              return axiosInstance(originalRequest);
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect to login
              processQueue(refreshError, null);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            // Already retried, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
        
        case 403:
          // Forbidden
          break;
        
        case 404:
          // Not found
          break;
        
        case 500:
          // Server error
          break;
        
        default:
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
    } else {
      // Something else happened
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

