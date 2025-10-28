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
   * Get current logged-in user info
   * @returns {Promise} Current user details
   */
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/User/current-user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @param {boolean} expandRoleDetails - Whether to expand role-specific details (Family/TeacherProfile)
   * @returns {Promise} User details
   */
  getUserById: async (userId, expandRoleDetails = false) => {
    try {
      const params = new URLSearchParams();
      if (expandRoleDetails) {
        params.append('expandRoleDetails', 'true');
      }
      
      const url = `/User/${userId}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

   /**
    * Create new staff account
    * @param {Object} userData - User data { name, email, password }
    * @returns {Promise} Created staff user
    */
   createStaff: async (userData) => {
     try {
       // Backend expects { name, email, password }
       const payload = {
         name: userData.fullName || userData.name,
         email: userData.email,
         password: userData.password
       };
       const response = await axiosInstance.post('/User/staff', payload);
       return response.data;
     } catch (error) {
       throw error.response?.data || error.message;
     }
   },

   /**
    * Create new manager account
    * @param {Object} userData - User data { name, email, password, branchId? }
    * @returns {Promise} Created manager user
    */
   createManager: async (userData) => {
     try {
       // Backend expects { name, email, password, branchId }
       const payload = {
         name: userData.name,
         email: userData.email,
         password: userData.password
       };
       
       // Add branchId if provided
       if (userData.branchId) {
         payload.branchId = userData.branchId;
       }
       
       const response = await axiosInstance.post('/User/manager', payload);
       return response.data;
     } catch (error) {
       throw error.response?.data || error.message;
     }
   },

   /**
    * Create new user (Admin creates account for user) - DEPRECATED: Use createStaff or createManager
    * @param {Object} userData - User data { fullName, email, phoneNumber, password }
    * @param {number} role - Role ID (0=Staff, 1=Manager)
    * @returns {Promise} Created user
    */
   createUser: async (userData, role) => {
     try {
       // Role must be sent as query parameter (0=Staff, 1=Manager only)
       const response = await axiosInstance.post('/User/admin-create', userData, {
         params: { role }
       });
       return response.data;
     } catch (error) {
       throw error.response?.data || error.message;
     }
   },

  /**
   * Create new user (Manager creates account for staff/teacher)
   * @param {Object} userData - User data { fullName, email, phoneNumber, password }
   * @param {number} role - Role ID (0=Staff, 1=Teacher)
   * @returns {Promise} Created user
   */
  createUserByManager: async (userData, role) => {
    try {
      // Role must be sent as query parameter (0=Staff, 1=Teacher only)
      const response = await axiosInstance.post('/User/manager-create', userData, {
        params: { role }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update user (Admin updates Manager/Staff users)
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data { name, email, password?, isActive }
   * @returns {Promise} Updated user
   */
  updateUser: async (userId, userData) => {
    try {
      const updateData = {
        name: userData.fullName || userData.name,
        email: userData.email,
        isActive: userData.isActive !== undefined ? userData.isActive : true
      };
      
      // Add password if provided
      if (userData.password && userData.password.trim()) {
        updateData.password = userData.password;
      }
      
      const response = await axiosInstance.put(`/User/admin-update/${userId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete user (Admin soft deletes Manager/Staff users)
   * @param {string} userId - User ID
   * @returns {Promise} Deletion result
   */
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/User/admin-delete/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create teacher account (Manager/Staff creates teacher with profile)
   * @param {Object} teacherData - Teacher data { user: { fullName, email, phoneNumber, password }, profile: { teacherName, specialization, experienceYears, qualifications, bio } }
   * @returns {Promise} Created teacher with user and profile
   */
  createTeacherAccount: async (teacherData) => {
    try {
      const response = await axiosInstance.post('/User/teacher-account', teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update user (Manager updates Staff/Teacher users)
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data { targetUserId, fullName, email, phoneNumber, changeRoleTo, isActive }
   * @returns {Promise} Updated user
   */
  updateUserByManager: async (userId, userData) => {
    try {
      const updateData = {
        targetUserId: userId,
        fullName: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        changeRoleTo: userData.changeRoleTo || 0,
        isActive: userData.isActive !== undefined ? userData.isActive : true
      };
      
      // Add password if provided
      if (userData.password && userData.password.trim()) {
        updateData.password = userData.password;
      }
      
      const response = await axiosInstance.put(`/User/manager-update/${userId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete user (Manager soft deletes Staff/Teacher users)
   * @param {string} userId - User ID
   * @returns {Promise} Deletion result
   */
  deleteUserByManager: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/User/manager-delete/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update teacher account (Manager/Staff updates teacher with profile)
   * @param {string} teacherId - Teacher ID
   * @param {Object} teacherData - Teacher data { teacherUserId, fullName, email, phoneNumber, teacherName, specialization, experienceYears, qualifications, bio, isActive }
   * @returns {Promise} Updated teacher with user and profile
   */
  updateTeacherAccount: async (teacherId, teacherData) => {
    try {
      const updateData = {
        teacherUserId: teacherId,
        fullName: teacherData.fullName,
        email: teacherData.email,
        phoneNumber: teacherData.phoneNumber,
        teacherName: teacherData.teacherName,
        specialization: teacherData.specialization,
        experienceYears: teacherData.experienceYears,
        qualifications: teacherData.qualifications,
        bio: teacherData.bio,
        isActive: teacherData.isActive !== undefined ? teacherData.isActive : true
      };
      
      // Add password if provided
      if (teacherData.password && teacherData.password.trim()) {
        updateData.password = teacherData.password;
      }
      
      const response = await axiosInstance.put(`/User/teacher-account/${teacherId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete teacher account (Manager/Staff soft deletes teacher)
   * @param {string} teacherId - Teacher ID
   * @returns {Promise} Deletion result
   */
  deleteTeacherAccount: async (teacherId) => {
    try {
      const response = await axiosInstance.delete(`/User/teacher-account/${teacherId}`);
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
      const { pageIndex = 1, pageSize = 10, Keyword = '', Role = null, expandRoleDetails = false } = params;
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
      
      if (expandRoleDetails) {
        queryParams.append('expandRoleDetails', 'true');
      }
      
      const response = await axiosInstance.get(`/User/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ===== FAMILY ACCOUNT METHODS (for Staff) =====

  /**
   * Create new family account (Staff creates User + Family + Parents)
   * @param {Object} familyData - Family account data
   * @returns {Promise} Created family account
   */
  createFamilyAccount: async (familyData) => {
    try {
      const response = await axiosInstance.post('/User/family-account', familyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update family account
   * @param {string} id - Family account ID
   * @param {Object} familyData - Updated family account data
   * @returns {Promise} Updated family account
   */
  updateFamilyAccount: async (id, familyData) => {
    try {
      const response = await axiosInstance.put(`/User/family-account/${id}`, familyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete family account
   * @param {string} id - Family account ID
   * @returns {Promise} Deletion result
   */
  deleteFamilyAccount: async (id) => {
    try {
      const response = await axiosInstance.delete(`/User/family-account/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get family account by ID
   * @param {string} id - Family account ID
   * @returns {Promise} Family account data
   */
  getFamilyAccountById: async (id) => {
    try {
      const response = await axiosInstance.get(`/User/family-account/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paged family accounts
   * @param {Object} params - Query parameters
   * @returns {Promise} Paged family accounts
   */
  getFamilyAccountsPaged: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.PageNumber !== undefined) {
        queryParams.append('PageNumber', params.PageNumber.toString());
      }
      
      if (params.PageSize !== undefined) {
        queryParams.append('PageSize', params.PageSize.toString());
      }
      
      if (params.Keyword) {
        queryParams.append('Keyword', params.Keyword);
      }
      
      const response = await axiosInstance.get(`/User/family-accounts/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default userService;
