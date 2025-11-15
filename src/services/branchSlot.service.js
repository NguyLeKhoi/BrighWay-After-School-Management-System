import axiosInstance from '../config/axios.config';

const branchSlotService = {
  getAvailableSlotsForStudent: async (studentId, params = {}) => {
    try {
      const { pageIndex = 1, pageSize = 10 } = params;
      const query = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });
      const response = await axiosInstance.get(
        `/BranchSlot/available-for-student/${studentId}?${query.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRoomsByBranchSlot: async (branchSlotId, params = {}) => {
    try {
      const { pageIndex = 1, pageSize = 10 } = params;
      const query = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });
      const response = await axiosInstance.get(
        `/BranchSlot/${branchSlotId}/rooms?${query.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default branchSlotService;

