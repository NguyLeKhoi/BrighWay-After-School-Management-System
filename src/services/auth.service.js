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
   * @returns {Promise} Response with token and decoded user data
   */
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/Auth/login', credentials);
      
      if (response.data.token) {
        // Save token
        localStorage.setItem('accessToken', response.data.token);
        
        // Decode JWT to extract user info
        const decoded = jwtDecode(response.data.token);
        
        // Extract user info from JWT claims
        const userInfo = {
          id: decoded[JWT_CLAIMS.USER_ID],
          email: decoded[JWT_CLAIMS.EMAIL],
          role: decoded[JWT_CLAIMS.ROLE] || 'User'
        };
        
        // Save user info
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        return { token: response.data.token, user: userInfo };
      }
      
      return response.data;
    } catch (error) {
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
   * @returns {boolean} True if user has valid token
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

};

export default authService;

