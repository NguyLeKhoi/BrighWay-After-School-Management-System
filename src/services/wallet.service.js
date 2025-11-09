import axiosInstance from '../config/axios.config';

/**
 * Wallet Service
 * Quản lý API liên quan tới ví người dùng
 */
const walletService = {
  /**
   * Lấy thông tin ví của người dùng hiện tại
   * @returns {Promise<any>} Thông tin ví
   */
  getCurrentWallet: async () => {
    try {
      const response = await axiosInstance.get('/Wallet/curent-user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get allowance wallet of specific student
   * @param {string} studentId - Student ID
   * @returns {Promise<any>} Student wallet information
   */
  getStudentWallet: async (studentId) => {
    try {
      const response = await axiosInstance.get(`/Wallet/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Transfer from parent main wallet to student's allowance wallet
   * @param {Object} payload - { toStudentId, amount, note }
   * @returns {Promise<any>} Transfer result
   */
  transferToStudent: async ({ toStudentId, amount, note }) => {
    try {
      const response = await axiosInstance.post('/Wallet/transfer-smart', {
        toStudentId,
        amount,
        note
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default walletService;

