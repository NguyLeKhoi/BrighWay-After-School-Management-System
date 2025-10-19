import axiosInstance from '../config/axios.config';
import { jwtDecode } from 'jwt-decode';

// JWT Claim Types - Standard identifiers for user information
const JWT_CLAIMS = {
  USER_ID: import.meta.env.VITE_JWT_CLAIM_USER_ID,
  EMAIL: import.meta.env.VITE_JWT_CLAIM_EMAIL,
  ROLE: import.meta.env.VITE_JWT_CLAIM_ROLE
};

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with access_token, refresh_token and decoded user data
   */
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/Auth/login', credentials);
      
      if (response.data.access_token && response.data.refresh_token) {
        // Save tokens
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        
        // Decode JWT to extract user info
        const decoded = jwtDecode(response.data.access_token);
        
        // Extract user info from JWT claims
        const userInfo = {
          id: decoded[JWT_CLAIMS.USER_ID],
          email: decoded[JWT_CLAIMS.EMAIL],
          role: decoded[JWT_CLAIMS.ROLE] || 'User'
        };
        
        // Save user info
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        return { 
          accessToken: response.data.access_token, 
          refreshToken: response.data.refresh_token,
          user: userInfo 
        };
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Refresh access token using refresh token
   * @returns {Promise} New access and refresh tokens
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post('/Auth/refresh', {
        refreshToken: refreshToken
      });
      
      if (response.data.accessToken && response.data.refreshToken) {
        // Save new tokens
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        return {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken
        };
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw error.response?.data || error.message;
    }
  },

  /**
   * Logout user
   * Clear local storage and redirect to login
   */
  logout: () => {
    try {
      // Clear all auth data from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      // Force redirect even if error
      window.location.href = '/login';
    }
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} Current user object or null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has valid tokens
   */
  isAuthenticated: () => {
    return !!(localStorage.getItem('accessToken') && localStorage.getItem('refreshToken'));
  },

};

export default authService;

