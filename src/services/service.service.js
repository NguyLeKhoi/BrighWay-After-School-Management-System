import axiosInstance from '../config/axios.config';

const serviceService = {
  /**
   * Get all services in the system (Admin only)
   * @returns {Promise<Array>} List of all services
   */
  getAllServices: async () => {
    try {
      const response = await axiosInstance.get('/Service');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new service (Admin only)
   * @param {FormData|Object} serviceData - Service data as FormData (multipart/form-data) or Object
   * FormData should include: Name, Description, Price, Status, ServiceType, imageFile (optional), SlotTypeIds (optional, send empty)
   * @returns {Promise} Created service
   */
  createService: async (serviceData) => {
    try {
      let formData;
      
      // If serviceData is already FormData, use it directly
      if (serviceData instanceof FormData) {
        formData = serviceData;
      } else {
        // Otherwise, create FormData from object
        formData = new FormData();
        formData.append('Name', serviceData.name || '');
        formData.append('Description', serviceData.description || '');
        formData.append('Price', serviceData.price ? String(serviceData.price) : '0');
        formData.append('Status', serviceData.status !== undefined ? String(serviceData.status) : 'true');
        formData.append('ServiceType', serviceData.serviceType || 'AddOn');
        
        // Image file (optional)
        if (serviceData.imageFile && serviceData.imageFile instanceof File) {
          formData.append('imageFile', serviceData.imageFile);
        }
        
        // SlotTypeIds - send empty as per user requirement
        // Don't append if empty or null
      }
      
      const response = await axiosInstance.post('/Service', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

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

