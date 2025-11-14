import axiosInstance from '../config/axios.config';

/**
 * Timeframe Service
 * Handles all timeframe-related API calls
 */
const timeframeService = {
  /**
   * Get all timeframes
   * @returns {Promise} List of all timeframes
   */
  getAllTimeframes: async () => {
    try {
      const response = await axiosInstance.get('/Timeframe');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated timeframes with optional filter
   * @param {Object} params - Pagination parameters { page, pageSize, searchTerm }
   * @returns {Promise} Paginated timeframe list
   */
  getTimeframesPaged: async (params = {}) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        searchTerm = ''
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (searchTerm) {
        queryParams.append('filter.Name', searchTerm);
      }

      const response = await axiosInstance.get(`/Timeframe/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get timeframe by ID
   * @param {string} timeframeId - Timeframe ID
   * @returns {Promise} Timeframe details
   */
  getTimeframeById: async (timeframeId) => {
    try {
      const response = await axiosInstance.get(`/Timeframe/${timeframeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new timeframe
   * @param {Object} timeframeData - Timeframe data { name, description, startTime, endTime }
   * @returns {Promise} Created timeframe
   */
  createTimeframe: async (timeframeData) => {
    try {
      const response = await axiosInstance.post('/Timeframe', timeframeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update existing timeframe
   * @param {string} timeframeId - Timeframe ID
   * @param {Object} timeframeData - Updated timeframe data { name, description, startTime, endTime }
   * @returns {Promise} Updated timeframe
   */
  updateTimeframe: async (timeframeId, timeframeData) => {
    try {
      const response = await axiosInstance.put(`/Timeframe/${timeframeId}`, timeframeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Soft delete timeframe
   * @param {string} timeframeId - Timeframe ID
   * @returns {Promise} Deletion result
   */
  deleteTimeframe: async (timeframeId) => {
    try {
      const response = await axiosInstance.delete(`/Timeframe/${timeframeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default timeframeService;

