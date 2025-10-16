import axiosInstance from '../config/axios.config';

/**
 * User Service
 * Handles all user-related API calls
 */
const userService = {
  /**
   * Get all users
   * @returns {Promise} List of all users
   */
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get('/User');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} User details
   */
  getUserById: async (userId) => {
    try {
      const response = await axiosInstance.get(`/User/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new user (Admin creates account for user)
   * @param {Object} userData - User data { fullName, email, phoneNumber, password }
   * @param {number} role - Role ID (0, 1, 2, 3, 4)
   * @returns {Promise} Created user
   */
  createUser: async (userData, role) => {
    try {
      // Role must be sent as query parameter (0=Manager, 1=Staff only)
      const response = await axiosInstance.post('/User/admin-create', userData, {
        params: { role }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data (only fullName and phoneNumber)
   * @returns {Promise} Updated user
   */
  updateUser: async (userId, userData) => {
    try {
      // API only allows updating fullName and phoneNumber
      const updateData = {
        id: userId,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber
      };
      
      const response = await axiosInstance.put(`/User/${userId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise} Deletion result
   */
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/User/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated users
   * @param {Object} params - Pagination parameters { page, pageSize, searchTerm }
   * @returns {Promise} Paginated user list
   */
  getUsersPaged: async (params = {}) => {
    try {
      const { pageIndex = 1, pageSize = 10, Keyword = '', Role = null } = params;
      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });
      
      if (Keyword) {
        queryParams.append('Keyword', Keyword);
      }
      
      if (Role !== null && Role !== undefined) {
        queryParams.append('Role', Role.toString());
      }
      
      const response = await axiosInstance.get(`/User/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default userService;
