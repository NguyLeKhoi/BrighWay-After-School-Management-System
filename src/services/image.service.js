import axiosInstance from '../config/axios.config';

/**
 * Image Service
 * Handles image upload operations
 */
const imageService = {
  /**
   * Upload an image file
   * @param {File} file - The image file to upload
   * @returns {Promise<string>} The URL of the uploaded image
   */
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/Image/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // API trả về URL của ảnh đã upload
      // Có thể là response.data.url hoặc response.data hoặc response.data.imageUrl
      // Tùy vào format response của backend
      return response.data?.url || response.data?.imageUrl || response.data || '';
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default imageService;

