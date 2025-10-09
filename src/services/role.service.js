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
  },

  /**
   * Create new role
   * @param {Object} roleData - Role data { name, description }
   * @returns {Promise} Created role
   */
  createRole: async (roleData) => {
    try {
      const response = await axiosInstance.post('/Role', roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update role
   * @param {string} roleId - Role ID
   * @param {Object} roleData - Updated role data
   * @returns {Promise} Updated role
   */
  updateRole: async (roleId, roleData) => {
    try {
      // Prepare data in the format expected by the API
      const updateData = {
        id: roleId,
        name: roleData.name,
        description: roleData.description || null
      };const response = await axiosInstance.put(`/Role/${roleId}`, updateData);return response.data;
    } catch (error) {throw error.response?.data || error.message;
    }
  },

  /**
   * Delete role
   * @param {string} roleId - Role ID
   * @returns {Promise} Deletion result
   */
  deleteRole: async (roleId) => {
    try {
      const response = await axiosInstance.delete(`/Role/${roleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default roleService;

