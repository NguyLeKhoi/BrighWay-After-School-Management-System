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
  },

  /**
   * Lấy tất cả Add-on service theo branch của một học sinh (student).
   * Parent chỉ gọi được với student thuộc tài khoản của mình.
   * @param {string} studentId - UUID của student
   * @returns {Promise<Array>} Danh sách add-on services
   */
  getAddOnsForStudent: async (studentId) => {
    try {
      const response = await axiosInstance.get(`/Service/student/${studentId}/add-ons`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Lấy tất cả Course service cho một slot cụ thể,
   * dựa trên branch của student (student phải thuộc về user hiện tại).
   * @param {string} studentId - UUID của student
   * @param {string} branchSlotId - UUID của branch slot
   * @returns {Promise<Array>} Danh sách course services
   */
  getCoursesForStudentInSlot: async (studentId, branchSlotId) => {
    try {
      const response = await axiosInstance.get(`/Service/student/${studentId}/slots/${branchSlotId}/courses`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default serviceService;

