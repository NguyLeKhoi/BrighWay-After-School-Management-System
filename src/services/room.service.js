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
  getRoomsPaged: async (pageIndex = 1, pageSize = 10, keyword = '', facilityId = '', branchId = '') => {
    try {
      const params = {
        pageIndex,
        pageSize,
        ...(keyword && { keyword }),
        ...(facilityId && { facilityId }),
        ...(branchId && { branchId })
      };
      
      const response = await axiosInstance.get('/Room/paged', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default roomService;
