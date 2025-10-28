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
        districtId: branchData.districtId
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
      const { page = 1, pageSize = 10, searchTerm = '' } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      
      if (searchTerm) {
        queryParams.append('searchTerm', searchTerm);
      }
      
      const response = await axiosInstance.get(`/Branch/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default branchService;
