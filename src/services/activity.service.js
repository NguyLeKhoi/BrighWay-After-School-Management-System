import axiosInstance from '../config/axios.config';

/**
 * Activity Service
 * Handles all activity-related API calls
 */
const activityService = {
  /**
   * Get all activities
   * @returns {Promise} List of all activities
   */
  getAllActivities: async () => {
    try {
      const response = await axiosInstance.get('/Activity');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated activities
   * @param {Object} params - Pagination parameters { page, pageSize, keyword }
   * @returns {Promise} Paginated activity list
   */
  getActivitiesPaged: async (params = {}) => {
    try {
      const { page = 1, pageSize = 10, keyword = '' } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      
      if (keyword) {
        queryParams.append('keyword', keyword);
      }
      
      const response = await axiosInstance.get(`/Activity/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get activity by ID
   * @param {string} id - Activity ID
   * @returns {Promise} Activity details
   */
  getActivityById: async (id) => {
    try {
      const response = await axiosInstance.get(`/Activity/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get my activities (current user's activities)
   * @returns {Promise} List of current user's activities
   */
  getMyActivities: async () => {
    try {
      const response = await axiosInstance.get('/Activity/my-activities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new activity
   * @param {Object} activityData - Activity data
   * @returns {Promise} Created activity
   */
  createActivity: async (activityData) => {
    try {
      const response = await axiosInstance.post('/Activity', activityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update an existing activity
   * @param {string} id - Activity ID
   * @param {Object} activityData - Updated activity data
   * @returns {Promise} Updated activity
   */
  updateActivity: async (id, activityData) => {
    try {
      const response = await axiosInstance.put(`/Activity/${id}`, activityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete an activity
   * @param {string} id - Activity ID
   * @returns {Promise} Deletion confirmation
   */
  deleteActivity: async (id) => {
    try {
      const response = await axiosInstance.delete(`/Activity/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mark activity as viewed
   * @param {string} id - Activity ID
   * @returns {Promise} Updated activity
   */
  markActivityAsViewed: async (id) => {
    try {
      const response = await axiosInstance.post(`/Activity/${id}/mark-viewed`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Check in student (staff checkin)
   * @param {string} studentId - Student ID
   * @returns {Promise} Created activity for checkin
   */
  checkinStaff: async (studentId) => {
    try {
      const response = await axiosInstance.post(`/Activity/checkin/staff/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get my children's activities (paginated)
   * @param {Object} params - Query parameters { studentId, pageIndex, pageSize, studentSlotId }
   * @returns {Promise} Paginated list of children's activities
   */
  getMyChildrenActivities: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      const url = queryString ? `/Activity/my-children-activities?${queryString}` : '/Activity/my-children-activities';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default activityService;

