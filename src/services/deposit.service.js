import axiosInstance from '../config/axios.config';

/**
 * Deposit Service
 * Quản lý các yêu cầu liên quan đến nạp tiền ví
 */
const depositService = {
  /**
   * Tạo yêu cầu nạp tiền
   * @param {number} amount - Số tiền cần nạp
   * @returns {Promise<any>} Kết quả từ API
   */
  createDeposit: async (amount) => {
    try {
      const payload = { amount };
      const response = await axiosInstance.post('/Deposit/create', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Trigger PayOS webhook manually (useful sau khi thanh toán thành công)
   * @returns {Promise<any>} Kết quả đồng bộ
   */
  triggerPayosWebhook: async () => {
    try {
      const response = await axiosInstance.post('/Deposit/webhook/payos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default depositService;

