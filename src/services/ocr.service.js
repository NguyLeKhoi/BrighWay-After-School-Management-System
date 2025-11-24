import axiosInstance from '../config/axios.config';

/**
 * OCR Service
 * Handles OCR-related API calls for CCCD extraction
 */
const ocrService = {
  /**
   * Extract CCCD data from image and store image privately on Cloudinary
   * @param {File} file - CCCD image file
   * @returns {Promise} Extracted CCCD data
   */
  extractAndStoreCCCD: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/ocr/extract-and-store-cccd', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default ocrService;








