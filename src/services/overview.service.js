import axiosInstance from '../config/axios.config';

/**
 * Overview Service
 * Handles all overview/dashboard-related API calls
 */
const overviewService = {
  /**
   * Get manager overview data for current manager's branch
   * @param {Object} params - Query parameters { month, year }
   * @returns {Promise} Manager overview data
   */
  getManagerOverview: async (params = {}) => {
    try {
      const { month = null, year = null } = params;
      const queryParams = new URLSearchParams();
      
      if (month !== null && month !== undefined) {
        queryParams.append('month', month.toString());
      }
      if (year !== null && year !== undefined) {
        queryParams.append('year', year.toString());
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/Overview/manager?${queryString}` : '/Overview/manager';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get admin overview data
   * @param {Object} params - Query parameters { month, year }
   * @returns {Promise} Admin overview data
   */
  getAdminOverview: async (params = {}) => {
    try {
      const { month = null, year = null } = params;
      const queryParams = new URLSearchParams();
      
      if (month !== null && month !== undefined) {
        queryParams.append('month', month.toString());
      }
      if (year !== null && year !== undefined) {
        queryParams.append('year', year.toString());
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/Overview/admin?${queryString}` : '/Overview/admin';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default overviewService;

