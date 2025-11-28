import axiosInstance from '../config/axios.config';

/**
 * Transaction Service
 * Quản lý các yêu cầu liên quan đến lịch sử giao dịch
 */
const transactionService = {
  /**
   * Lấy lịch sử giao dịch của user hiện tại với pagination và filters
   * @param {Object} params - { pageIndex, pageSize, type, fromDate, toDate }
   * @returns {Promise<any>} Danh sách transactions với pagination info
   */
  getMyTransactions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.pageIndex !== undefined && params.pageIndex !== null) {
        queryParams.append('pageIndex', params.pageIndex.toString());
      }
      if (params.pageSize !== undefined && params.pageSize !== null) {
        queryParams.append('pageSize', params.pageSize.toString());
      }
      if (params.type !== undefined && params.type !== null && params.type !== '') {
        queryParams.append('type', params.type);
      }
      if (params.fromDate !== undefined && params.fromDate !== null && params.fromDate !== '') {
        queryParams.append('fromDate', params.fromDate);
      }
      if (params.toDate !== undefined && params.toDate !== null && params.toDate !== '') {
        queryParams.append('toDate', params.toDate);
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/Transaction/me?${queryString}` : '/Transaction/me';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default transactionService;

