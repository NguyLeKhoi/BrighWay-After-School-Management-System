import axiosInstance from '../config/axios.config';

/**
 * Notification Service
 * Quản lý các API liên quan đến thông báo
 */
const notificationService = {
  /**
   * Lấy tất cả thông báo của user hiện tại
   * @returns {Promise<any>} Danh sách thông báo
   */
  getNotifications: async () => {
    try {
      const response = await axiosInstance.get('/Notification');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Đánh dấu một thông báo cụ thể là đã đọc
   * @param {string} notificationId - ID của thông báo
   * @returns {Promise<any>} Kết quả từ API
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.put(`/Notification/${notificationId}/mark-read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc cho user hiện tại
   * @returns {Promise<any>} Kết quả từ API
   */
  markAllAsRead: async () => {
    try {
      const response = await axiosInstance.put('/Notification/mark-all-read');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default notificationService;

