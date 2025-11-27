import axiosInstance from '../config/axios.config';

/**
 * Contact Service
 * Handles contact request submissions from the public website
 * Note: This endpoint is PUBLIC and does not require authentication
 */
const contactService = {
  /**
   * Submit a contact request from website
   * @param {Object} contactData - Contact data { parentName, email, phoneNumber, childrenAgeRange, message }
   * @returns {Promise} Response indicating success
   */
  submitContactRequest: async (contactData) => {
    try {
      const response = await axiosInstance.post('/ContactRequest/submit', {
        parentName: contactData.parentName,
        email: contactData.email,
        phoneNumber: contactData.phoneNumber,
        childrenAgeRange: contactData.childrenAgeRange || '',
        message: contactData.message
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default contactService;

