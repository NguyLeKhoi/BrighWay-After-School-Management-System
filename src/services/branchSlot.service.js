import axiosInstance from '../config/axios.config';

/**
 * Branch Slot Service
 * Handles all branch slot-related API calls
 */
const branchSlotService = {
  /**
   * Get paginated branch slots for current manager's branch
   */
  getMyBranchSlotsPaged: async (params = {}) => {
    try {
      const {
        pageIndex = 1,
        pageSize = 10,
        status = null,
        weekDate = null,
        timeframeId = null,
        slotTypeId = null
      } = params;

      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });

      if (status !== null && status !== undefined && status !== '') {
        queryParams.append('status', status.toString());
      }

      if (weekDate !== null && weekDate !== undefined && weekDate !== '') {
        queryParams.append('weekDate', weekDate.toString());
      }

      if (timeframeId !== null && timeframeId !== undefined && timeframeId !== '') {
        queryParams.append('timeframeId', timeframeId.toString());
      }

      if (slotTypeId !== null && slotTypeId !== undefined && slotTypeId !== '') {
        queryParams.append('slotTypeId', slotTypeId.toString());
      }

      const response = await axiosInstance.get(`/BranchSlot/manager/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get available slots for a student (user side)
   */
  getAvailableSlotsForStudent: async (studentId, params = {}) => {
    try {
      const { pageIndex = 1, pageSize = 10, date = null } = params;
      const query = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });
      
      // Add date parameter if provided
      if (date) {
        // Convert date to ISO string if it's a Date object
        const dateString = date instanceof Date ? date.toISOString() : date;
        query.append('date', dateString);
      }
      
      const response = await axiosInstance.get(
        `/BranchSlot/available-for-student/${studentId}?${query.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get branch slot by ID
   * @param {string} branchSlotId - Branch slot ID
   * @returns {Promise} Branch slot details
   */
  getBranchSlotById: async (branchSlotId) => {
    try {
      const response = await axiosInstance.get(`/BranchSlot/${branchSlotId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new branch slot for current manager's branch
   * @param {Object} branchSlotData - Branch slot data { timeframeId, slotTypeId, weekDate, status }
   * @returns {Promise} Created branch slot
   */
  createMyBranchSlot: async (branchSlotData) => {
    try {
      const response = await axiosInstance.post('/BranchSlot/manager/create', branchSlotData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update an existing branch slot
   * @param {string} branchSlotId - Branch slot ID
   * @param {Object} branchSlotData - Updated branch slot data
   * @returns {Promise} Updated branch slot
   */
  updateBranchSlot: async (branchSlotId, branchSlotData) => {
    try {
      console.log('updateBranchSlot API call:', {
        url: `/BranchSlot/${branchSlotId}`,
        method: 'PUT',
        data: branchSlotData
      });
      const response = await axiosInstance.put(`/BranchSlot/${branchSlotId}`, branchSlotData);
      console.log('updateBranchSlot API response:', {
        status: response.status,
        data: response.data,
        slotTypeId: response.data?.slotTypeId,
        timeframeId: response.data?.timeframeId
      });
      return response.data;
    } catch (error) {
      console.error('updateBranchSlot API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error.response?.data || error.message;
    }
  },

  /**
   * Soft delete a branch slot
   * @param {string} branchSlotId - Branch slot ID
   * @returns {Promise} Deletion result
   */
  deleteBranchSlot: async (branchSlotId) => {
    try {
      const response = await axiosInstance.delete(`/BranchSlot/${branchSlotId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Assign a staff user to a specific branch slot
   * @param {Object} assignmentData - Assignment data { branchSlotId, userId, roomId, name }
   * @returns {Promise} Assignment result
   */
  assignStaff: async (assignmentData) => {
    try {
      const response = await axiosInstance.post('/BranchSlot/assign-staff', assignmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Assign rooms to a branch slot
   * @param {Object} assignmentData - Assignment data { branchSlotId, roomIds: [] }
   * @returns {Promise} Assignment result
   */
  assignRooms: async (assignmentData) => {
    try {
      console.log('assignRooms API call:', { 
        url: '/BranchSlot/assign-rooms', 
        data: assignmentData,
        branchSlotId: assignmentData.branchSlotId,
        roomIdsCount: assignmentData.roomIds?.length || 0
      });
      const response = await axiosInstance.post('/BranchSlot/assign-rooms', assignmentData);
      console.log('assignRooms API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('assignRooms API error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get rooms by branch slot ID (optionally paginated)
   */
  getRoomsByBranchSlot: async (branchSlotId, params = {}) => {
    try {
      const { pageIndex = 1, pageSize = 1000 } = params;
      let url = `/BranchSlot/${branchSlotId}/rooms`;
      if (pageIndex !== undefined && pageSize !== undefined) {
        const query = new URLSearchParams({
          pageIndex: pageIndex.toString(),
          pageSize: pageSize.toString()
        });
        url = `${url}?${query.toString()}`;
      }
      console.log('getRoomsByBranchSlot API call:', { url, branchSlotId, pageIndex, pageSize });
      const response = await axiosInstance.get(url);
      console.log('getRoomsByBranchSlot API response:', { 
        branchSlotId, 
        items: response.data?.items?.length || 0,
        totalCount: response.data?.totalCount || 0,
        data: response.data
      });
      return response.data;
    } catch (error) {
      console.error('getRoomsByBranchSlot API error:', { branchSlotId, error: error.response?.data || error.message });
      throw error.response?.data || error.message;
    }
  }
};

export default branchSlotService;

