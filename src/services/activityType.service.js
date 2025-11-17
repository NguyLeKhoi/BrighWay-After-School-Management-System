import axiosInstance from '../config/axios.config';

/**
 * ActivityType Service
 * Handles all activity type-related API calls
 */
const activityTypeService = {
  /**
   * Get all activity types
   * @returns {Promise} List of all activity types
   */
  getAllActivityTypes: async () => {
    try {
      const response = await axiosInstance.get('/ActivityType');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get activity type by ID
   * @param {string} id - Activity Type ID
   * @returns {Promise} Activity Type details
   */
  getActivityTypeById: async (id) => {
    try {
      const response = await axiosInstance.get(`/ActivityType/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new activity type
   * @param {Object} activityTypeData - Activity Type data
   * @returns {Promise} Created activity type
   */
  createActivityType: async (activityTypeData) => {
    try {
      const response = await axiosInstance.post('/ActivityType', activityTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update an existing activity type
   * @param {string} id - Activity Type ID
   * @param {Object} activityTypeData - Updated activity type data
   * @returns {Promise} Updated activity type
   */
  updateActivityType: async (id, activityTypeData) => {
    try {
      const response = await axiosInstance.put(`/ActivityType/${id}`, activityTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete an activity type
   * @param {string} id - Activity Type ID
   * @returns {Promise} Deletion confirmation
   */
  deleteActivityType: async (id) => {
    try {
      const response = await axiosInstance.delete(`/ActivityType/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default activityTypeService;

