import axiosInstance from '../config/axios.config';

/**
 * Role Service
 * Handles all role-related API calls
 */
const roleService = {
  /**
   * Get all roles
   * @returns {Promise} List of all roles
   */
  getAllRoles: async () => {
    try {
      const response = await axiosInstance.get('/Role');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get role by ID
   * @param {string} roleId - Role ID
   * @returns {Promise} Role details
   */
  getRoleById: async (roleId) => {
    try {
      const response = await axiosInstance.get(`/Role/${roleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default roleService;
