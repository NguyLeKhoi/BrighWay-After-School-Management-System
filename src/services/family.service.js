import axiosInstance from '../config/axios.config';

/**
 * Family Service
 * Handles all family-related API calls for current user
 */
const familyService = {
  /**
   * Get current family aggregate form data
   * Returns form data for current user (user + family + parents)
   * Password is always empty for FE binding
   * @returns {Promise} Current family aggregate data
   */
  getCurrentFamilyForm: async () => {
    try {
      const response = await axiosInstance.get('/Family/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update current family aggregate
   * Updates user + family + parents (replace-all by email)
   * Null/empty fields => skip (partial update)
   * @param {Object} familyData - Family aggregate data to update
   * @returns {Promise} Updated family data
   */
  updateCurrentFamily: async (familyData) => {
    try {
      const response = await axiosInstance.put('/Family/current', familyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Add a parent to current user's family
   * @param {Object} parentData - Parent data to add
   * @returns {Promise} Added parent data
   */
  addParentToFamily: async (parentData) => {
    try {
      const response = await axiosInstance.post('/Family/current/parents', parentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a parent from current user's family
   * Soft-delete according to policy
   * @param {string} parentId - Parent ID to delete
   * @returns {Promise} Deletion result
   */
  deleteParentFromFamily: async (parentId) => {
    try {
      const response = await axiosInstance.delete(`/Family/current/parents/${parentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default familyService;
