import axiosInstance from '../config/axios.config';

const roomService = {
  // Get all rooms
  getAllRooms: async () => {
    try {
      const response = await axiosInstance.get('/Room');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get room by ID
  getRoomById: async (roomId) => {
    try {
      const response = await axiosInstance.get(`/Room/${roomId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new room
  createRoom: async (roomData) => {
    try {
      const response = await axiosInstance.post('/Room', roomData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update room
  updateRoom: async (roomId, roomData) => {
    try {
      const response = await axiosInstance.put(`/Room/${roomId}`, roomData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete room
  deleteRoom: async (roomId) => {
    try {
      const response = await axiosInstance.delete(`/Room/${roomId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get paginated rooms
  getRoomsPaged: async (pageIndex = 1, pageSize = 10, roomName = '', facilityId = '', branchId = '') => {
    try {
      const params = {
        pageIndex,
        pageSize,
        ...(roomName && { roomName }),
        ...(facilityId && { facilityId }),
        ...(branchId && { branchId })
      };
      
      const response = await axiosInstance.get('/Room/paged', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get paginated rooms in current manager's branch
  getRoomsInMyBranch: async (pageIndex = 1, pageSize = 1000, filter = {}) => {
    try {
      const params = {
        pageIndex,
        pageSize,
        ...(filter.facilityId && { facilityId: filter.facilityId }),
        ...(filter.branchId && { branchId: filter.branchId }),
        ...(filter.keyword && { keyword: filter.keyword })
      };
      
      const response = await axiosInstance.get('/Room/paged/my-branch', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default roomService;
