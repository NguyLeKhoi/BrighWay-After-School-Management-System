import axiosInstance from '../config/axios.config';

/**
 * Slot Type Service
 * Handles all slot type-related API calls
 */
const slotTypeService = {
  /**
   * Get all slot types
   * @returns {Promise} List of all slot types
   */
  getAllSlotTypes: async () => {
    try {
      const response = await axiosInstance.get('/SlotType/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated slot types with optional filter
   * @param {Object} params - Pagination parameters { page, pageSize, searchTerm, branchId }
   * @returns {Promise} Paginated slot type list
   */
  getSlotTypesPaged: async (params = {}) => {
    try {
      const {
        pageIndex = 1,
        pageSize = 10,
        searchTerm = '',
        branchId = null
      } = params;

      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });

      if (searchTerm) {
        queryParams.append('filter.Name', searchTerm);
      }

      if (branchId) {
        queryParams.append('filter.branchId', branchId);
      }

      const response = await axiosInstance.get(`/SlotType/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get slot type by ID
   * @param {string} slotTypeId - Slot type ID
   * @returns {Promise} Slot type details
   */
  getSlotTypeById: async (slotTypeId) => {
    try {
      const response = await axiosInstance.get(`/SlotType/${slotTypeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new slot type
   * @param {Object} slotTypeData - Slot type data { name, description }
   * @returns {Promise} Created slot type
   */
  createSlotType: async (slotTypeData) => {
    try {
      const response = await axiosInstance.post('/SlotType', slotTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update existing slot type
   * @param {string} slotTypeId - Slot type ID
   * @param {Object} slotTypeData - Updated slot type data { name, description }
   * @returns {Promise} Updated slot type
   */
  updateSlotType: async (slotTypeId, slotTypeData) => {
    try {
      const response = await axiosInstance.put(`/SlotType/${slotTypeId}`, slotTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Soft delete slot type
   * @param {string} slotTypeId - Slot type ID
   * @returns {Promise} Deletion result
   */
  deleteSlotType: async (slotTypeId) => {
    try {
      const response = await axiosInstance.delete(`/SlotType/${slotTypeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default slotTypeService;

