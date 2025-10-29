import axiosInstance from '../config/axios.config';

/**
 * Benefit Service
 * Handles all benefit-related API calls
 */
const benefitService = {
  /**
   * Get all active benefits
   * @returns {Promise} List of all active benefits
   */
  getAllBenefits: async () => {
    try {
      const response = await axiosInstance.get('/Benefit');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get benefit by ID
   * @param {string} benefitId - Benefit ID
   * @returns {Promise} Benefit details
   */
  getBenefitById: async (benefitId) => {
    try {
      const response = await axiosInstance.get(`/Benefit/${benefitId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new benefit
   * @param {Object} benefitData - Benefit data { name, description, status }
   * @returns {Promise} Created benefit
   */
  createBenefit: async (benefitData) => {
    try {
      const response = await axiosInstance.post('/Benefit', benefitData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update existing benefit
   * @param {string} benefitId - Benefit ID
   * @param {Object} benefitData - Updated benefit data { name, description, status }
   * @returns {Promise} Updated benefit
   */
  updateBenefit: async (benefitId, benefitData) => {
    try {
      const response = await axiosInstance.put(`/Benefit/${benefitId}`, benefitData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Soft delete benefit by ID
   * @param {string} benefitId - Benefit ID
   * @returns {Promise} Deletion result
   */
  deleteBenefit: async (benefitId) => {
    try {
      const response = await axiosInstance.delete(`/Benefit/${benefitId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated benefits with filters
   * @param {Object} params - Pagination parameters { page, pageSize, searchTerm, status }
   * @returns {Promise} Paginated benefit list
   */
  getBenefitsPaged: async (params = {}) => {
    try {
      const { page = 1, pageSize = 10, searchTerm = '', status = null } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      
      if (searchTerm) {
        queryParams.append('searchTerm', searchTerm);
      }
      
      if (status !== null && status !== undefined) {
        queryParams.append('status', status.toString());
      }
      
      const response = await axiosInstance.get(`/Benefit/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default benefitService;
