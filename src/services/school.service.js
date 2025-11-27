import axiosInstance from '../config/axios.config';

/**
 * School Service
 * Handles all school-related API calls
 * Note: Uses soft delete (DELETE /api/School/{id}/soft) instead of permanent delete
 */
const schoolService = {
  /**
   * Get all schools
   * @param {boolean} includeDeleted - Whether to include soft-deleted records
   * @param {string} branchId - Optional branch ID to filter schools by branch
   * @returns {Promise} List of all schools
   */
  getAllSchools: async (includeDeleted = false, branchId = null) => {
    try {
      const params = new URLSearchParams();
      if (includeDeleted) {
        params.append('includeDeleted', 'true');
      }
      if (branchId) {
        params.append('branchId', String(branchId));
      }
      const queryString = params.toString();
      const response = await axiosInstance.get(`/School${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get school by ID
   * @param {string} schoolId - School ID
   * @returns {Promise} School details
   */
  getSchoolById: async (schoolId) => {
    try {
      const response = await axiosInstance.get(`/School/${schoolId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new school
   * @param {Object} schoolData - School data { name, address, phoneNumber, email }
   * @returns {Promise} Created school
   */
  createSchool: async (schoolData) => {
    try {
      const response = await axiosInstance.post('/School', schoolData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update school
   * @param {string} schoolId - School ID
   * @param {Object} schoolData - Updated school data { name, address, phoneNumber, email }
   * @returns {Promise} Updated school
   */
  updateSchool: async (schoolId, schoolData) => {
    try {
      const response = await axiosInstance.put(`/School/${schoolId}`, schoolData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Soft delete school (marks as deleted without removing data)
   * @param {string} schoolId - School ID
   * @returns {Promise} Deletion result
   */
  softDeleteSchool: async (schoolId) => {
    try {
      const response = await axiosInstance.delete(`/School/${schoolId}/soft`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Restore a previously soft-deleted school
   * @param {string} schoolId - School ID
   * @returns {Promise} Restored school
   */
  restoreSchool: async (schoolId) => {
    try {
      const response = await axiosInstance.post(`/School/${schoolId}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated schools with optional name filter
   * @param {Object} params - Pagination parameters { page, pageSize, name, includeDeleted }
   * @returns {Promise} Paginated school list
   */
  getSchoolsPaged: async (params = {}) => {
    try {
      const { page = 1, pageSize = 10, name = '', includeDeleted = false } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      
      if (name) {
        queryParams.append('filter.Name', name);
      }
      
      if (includeDeleted) {
        queryParams.append('includeDeleted', 'true');
      }
      
      const response = await axiosInstance.get(`/School/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default schoolService;

