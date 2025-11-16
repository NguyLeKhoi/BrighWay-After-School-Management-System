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
   * Get students of current logged-in user (Parent)
   * @param {Object} params - { pageIndex, pageSize }
   * @returns {Promise} Paged list of students
   */
  getCurrentUserStudents: async (params = {}) => {
    const {
      pageIndex = 1,
      pageSize = 10
    } = params;

    const queryParams = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString()
    });

    try {
      const response = await axiosInstance.get(`/Student/paged/current-user?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get current logged-in user's children (simplified API)
   * @returns {Promise} Array of student objects
   */
  getMyChildren: async () => {
    try {
      const response = await axiosInstance.get('/Student/my-children');
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

