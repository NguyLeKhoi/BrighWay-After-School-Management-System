import axiosInstance from '../config/axios.config';

/**
 * Student Service
 * Handles all student-related API calls
 */
const studentService = {
  /**
   * Get all students
   * @returns {Promise} List of all students
   */
  getAllStudents: async () => {
    try {
      const response = await axiosInstance.get('/Student');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get student by ID
   * @param {string} studentId - Student ID
   * @returns {Promise} Student details
   */
  getStudentById: async (studentId) => {
    try {
      const response = await axiosInstance.get(`/Student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new student
   * @param {Object} studentData - Student data
   * @returns {Promise} Created student
   */
  createStudent: async (studentData) => {
    try {
      const response = await axiosInstance.post('/Student', studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update student
   * @param {string} studentId - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise} Updated student
   */
  updateStudent: async (studentId, studentData) => {
    try {
      const response = await axiosInstance.put(`/Student/${studentId}`, studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete student
   * @param {string} studentId - Student ID
   * @returns {Promise} Deletion result
   */
  deleteStudent: async (studentId) => {
    try {
      const response = await axiosInstance.delete(`/Student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default studentService;

