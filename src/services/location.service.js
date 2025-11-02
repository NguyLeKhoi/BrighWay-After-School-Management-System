import axiosInstance from '../config/axios.config';

/**
 * Location Service
 * Handles all location-related API calls (provinces, districts)
 */
const locationService = {
  /**
   * Get all provinces with their districts
   * @returns {Promise} List of all provinces with districts
   */
  getAllProvincesWithDistricts: async () => {
    try {
      const response = await axiosInstance.get('/Location/provinces');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get provinces that have branches
   * @returns {Promise} List of provinces that have at least one district containing branches
   */
  getProvincesWithBranches: async () => {
    try {
      const response = await axiosInstance.get('/Location/provinces/with-branches');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get districts for a specific province
   * @param {string} provinceId - Province ID
   * @returns {Promise} List of districts for the province
   */
  getDistrictsByProvinceId: async (provinceId) => {
    try {
      const response = await axiosInstance.get(`/Location/provinces/${provinceId}/districts`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default locationService;

