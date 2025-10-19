/**
 * Storage Utilities
 * Helpers for localStorage operations
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

const storageUtils = {
  /**
   * Clear all app-related data from localStorage
   */
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {}
  },

  /**
   * Get all stored keys (for debugging)
   */
  getAllKeys: () => {
    try {
      const keys = Object.keys(localStorage);return keys;
    } catch (error) {return [];
    }
  },

  /**
   * Check if user is authenticated
   */
  hasToken: () => {
    return !!(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) && localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN));
  },

  /**
   * Get refresh token
   */
  getRefreshToken: () => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Get user data
   */
  getUser: () => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {return null;
    }
  },

  /**
   * Get access token
   */
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
};

export default storageUtils;
export { STORAGE_KEYS };
