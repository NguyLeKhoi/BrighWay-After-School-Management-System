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
  }
};

export default studentSlotService;

