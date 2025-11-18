import axiosInstance from '../config/axios.config';

/**
 * Facility Service
 * Handles all facility-related API calls
 */
const facilityService = {
  /**
   * Get all facilities
   * @returns {Promise} List of all facilities
   */
  getAllFacilities: async () => {
    try {
      const response = await axiosInstance.get('/Facility');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get facility by ID
   * @param {string} facilityId - Facility ID
   * @returns {Promise} Facility details
   */
  getFacilityById: async (facilityId) => {
    try {
      const response = await axiosInstance.get(`/Facility/${facilityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new facility
   * @param {Object} facilityData - Facility data { facilityName, description }
   * @returns {Promise} Created facility
   */
  createFacility: async (facilityData) => {
    try {
      const response = await axiosInstance.post('/Facility', facilityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update facility
   * @param {string} facilityId - Facility ID
   * @param {Object} facilityData - Updated facility data
   * @returns {Promise} Updated facility
   */
  updateFacility: async (facilityId, facilityData) => {
    try {
      // Prepare data in the format expected by the API
      const updateData = {
        id: facilityId,
        facilityName: facilityData.facilityName,
        description: facilityData.description
      };
      
      const response = await axiosInstance.put(`/Facility/${facilityId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete facility
   * @param {string} facilityId - Facility ID
   * @returns {Promise} Deletion result
   */
  deleteFacility: async (facilityId) => {
    try {
      const response = await axiosInstance.delete(`/Facility/${facilityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated facilities
   * @param {Object} params - Pagination parameters { page, pageSize, searchTerm }
   * @returns {Promise} Paginated facility list
   */
  getFacilitiesPaged: async (params = {}) => {
    try {
      const { page = 1, pageSize = 10, searchTerm = '' } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      
      if (searchTerm) {
        queryParams.append('filter.Keyword', searchTerm);
      }
      
      const response = await axiosInstance.get(`/Facility/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all facilities (public endpoint - no authentication required)
   * @returns {Promise} List of all facilities for public display
   */
  getPublicFacilities: async () => {
    try {
      const response = await axiosInstance.get('/Facility/public');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get facility by ID (public endpoint - no authentication required)
   * @param {string} facilityId - Facility ID
   * @returns {Promise} Facility details
   */
  getPublicFacilityById: async (facilityId) => {
    try {
      const response = await axiosInstance.get(`/Facility/public/${facilityId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default facilityService;
