import axiosInstance from '../config/axios.config';

const serviceService = {
  /**
   * Lấy danh sách dịch vụ add-on dành cho phụ huynh (branch dựa trên claim)
   */
  getMyAddOns: async () => {
    try {
      const response = await axiosInstance.get('/Service/me/add-ons');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default serviceService;

