import axiosInstance from '../config/axios.config';

/**
 * Branch Service
 * Handles all branch-related API calls
 */
const branchService = {
  /**
   * Get all branches
   * @returns {Promise} List of all branches
   */
  getAllBranches: async () => {
    try {
      const response = await axiosInstance.get('/Branch');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get branch by ID
   * @param {string} branchId - Branch ID
   * @returns {Promise} Branch details
   */
  getBranchById: async (branchId) => {
    try {
      const response = await axiosInstance.get(`/Branch/${branchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new branch
   * @param {Object} branchData - Branch data { branchName, address, phone, districtId }
   * @returns {Promise} Created branch
   */
  createBranch: async (branchData) => {
    try {
      const response = await axiosInstance.post('/Branch', branchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update branch
   * @param {string} branchId - Branch ID
   * @param {Object} branchData - Updated branch data { branchName, address, phone, districtId }
   * @returns {Promise} Updated branch
   */
  updateBranch: async (branchId, branchData) => {
    try {
      // Prepare data in the format expected by the API
      const updateData = {
        id: branchId,
        branchName: branchData.branchName,
        address: branchData.address,
        phone: branchData.phone,
        districtId: branchData.districtId,
        status: branchData.status
      };
      
      const response = await axiosInstance.put(`/Branch/${branchId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete branch
   * @param {string} branchId - Branch ID
   * @returns {Promise} Deletion result
   */
  deleteBranch: async (branchId) => {
    try {
      const response = await axiosInstance.delete(`/Branch/${branchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated branches
   * @param {Object} params - Pagination parameters { page, pageSize, searchTerm }
   * @returns {Promise} Paginated branch list
   */
  getBranchesPaged: async (params = {}) => {
    try {
      const { pageIndex = 1, pageSize = 10, searchTerm = '' } = params;
      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });
      
      if (searchTerm) {
        queryParams.append('filter.Keyword', searchTerm);
      }
      
      const response = await axiosInstance.get(`/Branch/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Connect a school to a branch
   * @param {Object} data - Connection data { branchId, schoolId }
   * @returns {Promise} Connection result
   */
  connectSchool: async (data) => {
    try {
      const { branchId, schoolId } = data;
      const queryParams = new URLSearchParams({
        branchId: branchId.toString(),
        schoolId: schoolId.toString()
      });
      const response = await axiosInstance.post(`/Branch/connect-school?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Disconnect a school from a branch
   * @param {Object} data - Disconnection data { branchId, schoolId }
   * @returns {Promise} Disconnection result
   */
  disconnectSchool: async (data) => {
    try {
      const { branchId, schoolId } = data;
      const queryParams = new URLSearchParams({
        branchId: branchId.toString(),
        schoolId: schoolId.toString()
      });
      const response = await axiosInstance.delete(`/Branch/disconnect-school?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Add a student level to a branch
   * @param {Object} data - Connection data { branchId, studentLevelId }
   * @returns {Promise} Connection result
   */
  addStudentLevel: async (data) => {
    try {
      const { branchId, studentLevelId } = data;
      const queryParams = new URLSearchParams({
        branchId: branchId.toString(),
        studentLevelId: studentLevelId.toString()
      });
      const response = await axiosInstance.post(`/Branch/add-student-level?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Remove a student level from a branch
   * @param {Object} data - Removal data { branchId, studentLevelId }
   * @returns {Promise} Removal result
   */
  removeStudentLevel: async (data) => {
    try {
      const { branchId, studentLevelId } = data;
      const queryParams = new URLSearchParams({
        branchId: branchId.toString(),
        studentLevelId: studentLevelId.toString()
      });
      const response = await axiosInstance.delete(`/Branch/remove-student-level?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default branchService;
