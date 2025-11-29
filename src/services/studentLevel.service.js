import axiosInstance from '../config/axios.config';

/**
 * Student Level Service
 * Handles all student level-related API calls
 */
const studentLevelService = {
  /**
   * Get all student levels
   * @param {string} branchId - Optional branch ID to filter student levels by branch
   * @returns {Promise} List of all student levels
   */
  getAllStudentLevels: async (branchId = null) => {
    try {
      const params = branchId ? `?branchId=${String(branchId)}` : '';
      const response = await axiosInstance.get(`/StudentLevel/all${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get student level by ID
   * @param {string} studentLevelId - Student Level ID
   * @returns {Promise} Student Level details
   */
  getStudentLevelById: async (studentLevelId) => {
    try {
      const response = await axiosInstance.get(`/StudentLevel/${studentLevelId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new student level
   * @param {Object} studentLevelData - Student Level data { name, description }
   * @returns {Promise} Created student level
   */
  createStudentLevel: async (studentLevelData) => {
    try {
      const response = await axiosInstance.post('/StudentLevel', studentLevelData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update existing student level
   * @param {string} studentLevelId - Student Level ID
   * @param {Object} studentLevelData - Updated student level data { name, description }
   * @returns {Promise} Updated student level
   */
  updateStudentLevel: async (studentLevelId, studentLevelData) => {
    try {
      const response = await axiosInstance.put(`/StudentLevel/${studentLevelId}`, studentLevelData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Soft delete student level by ID
   * @param {string} studentLevelId - Student Level ID
   * @returns {Promise} Deletion result
   */
  deleteStudentLevel: async (studentLevelId) => {
    try {
      const response = await axiosInstance.delete(`/StudentLevel/${studentLevelId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated student levels with optional keyword filter
   * @param {Object} params - Pagination parameters { page, pageSize, keyword }
   * @returns {Promise} Paginated student level list
   */
  getStudentLevelsPaged: async (params = {}) => {
    try {
      const { pageIndex = 1, pageSize = 10, keyword = '' } = params;
      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });
      
      if (keyword) {
        queryParams.append('filter.Keyword', keyword);
      }
      
      const response = await axiosInstance.get(`/StudentLevel/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default studentLevelService;
