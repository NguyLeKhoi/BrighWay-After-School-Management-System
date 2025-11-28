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

  /**
   * Lấy lịch sử nạp tiền của user hiện tại với pagination
   * @param {Object} params - Pagination parameters { pageIndex, pageSize }
   * @returns {Promise<any>} Danh sách deposits với pagination info
   */
  getMyDeposits: async (params = {}) => {
    try {
      const { pageIndex = 1, pageSize = 20 } = params;
      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });
      
      const response = await axiosInstance.get(`/Deposit/me?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy chi tiết deposit theo ID
   * @param {string} depositId - Deposit ID
   * @returns {Promise<any>} Chi tiết deposit
   */
  getDepositById: async (depositId) => {
    try {
      const response = await axiosInstance.get(`/Deposit/${depositId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Hủy deposit theo ID
   * @param {string} depositId - Deposit ID
   * @returns {Promise<any>} Kết quả hủy deposit
   */
  cancelDeposit: async (depositId) => {
    try {
      const response = await axiosInstance.post(`/Deposit/${depositId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default depositService;

