import axiosInstance from '../config/axios.config';

const studentSlotService = {
  bookSlot: async (payload) => {
    try {
      const response = await axiosInstance.post('/StudentSlot/book', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStudentSlots: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      const url = queryString ? `/StudentSlot/paged?${queryString}` : '/StudentSlot/paged';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get student slots that the current staff is assigned to work with
   * @param {Object} params - Query parameters { pageIndex, pageSize, branchSlotId, date, upcomingOnly }
   * @returns {Promise} Paginated list of student slots assigned to current staff
   */
  getStaffSlots: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      const url = queryString ? `/StudentSlot/staff-slots?${queryString}` : '/StudentSlot/staff-slots';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  cancelSlot: async (slotId, studentId) => {
    try {
      const queryParams = new URLSearchParams();
      if (slotId) queryParams.append('slotId', slotId);
      if (studentId) queryParams.append('studentId', studentId);
      const queryString = queryParams.toString();
      const url = queryString ? `/StudentSlot/cancel?${queryString}` : '/StudentSlot/cancel';
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Load all staff slots (handles pagination automatically)
   * @param {Object} params - Parameters including pageSize (optional, default 100), branchSlotId, date, upcomingOnly
   * @returns {Promise<Array>} Array of all staff slots across all pages
   */
  getAllStaffSlots: async function(params = {}) {
    const allSlots = [];
    let pageIndex = 1;
    const pageSize = params.pageSize || 100;
    let hasMore = true;
    let totalCount = 0;
    let totalPages = 0;

    while (hasMore) {
      const response = await this.getStaffSlots({
        ...params,
        pageIndex: pageIndex,
        pageSize: pageSize
      });

      const items = response?.items || [];
      
      if (pageIndex === 1) {
        totalCount = response?.totalCount || 0;
        totalPages = response?.totalPages;
        
        if (!totalPages && totalCount > 0) {
          totalPages = Math.ceil(totalCount / pageSize);
        }
      }

      if (items.length > 0) {
        allSlots.push(...items);
      }

      if (totalPages > 0) {
        if (pageIndex >= totalPages) {
          hasMore = false;
        } else {
          pageIndex++;
        }
      } else {
        if (items.length < pageSize) {
          hasMore = false;
        } else {
          pageIndex++;
        }
      }
    }

    return allSlots;
  },

  /**
   * Get student slots for a specific branch slot and room (Manager only)
   * @param {Object} params - Query parameters { branchSlotId (required), roomId (required), pageIndex, pageSize, date, upcomingOnly }
   * @returns {Promise} Paginated list of student slots
   */
  getManagerSlots: async (params = {}) => {
    try {
      const {
        branchSlotId,
        roomId,
        pageIndex = 1,
        pageSize = 10,
        date = null,
        upcomingOnly = false
      } = params;

      if (!branchSlotId || !roomId) {
        throw new Error('branchSlotId and roomId are required');
      }

      const queryParams = new URLSearchParams({
        branchSlotId: branchSlotId.toString(),
        roomId: roomId.toString(),
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
        upcomingOnly: upcomingOnly.toString()
      });

      if (date) {
        // Format date to ISO string for backend
        const dateStr = date instanceof Date 
          ? date.toISOString() 
          : typeof date === 'string' 
            ? date 
            : date;
        queryParams.append('date', dateStr);
      }

      const response = await axiosInstance.get(`/StudentSlot/manager-slots?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default studentSlotService;

