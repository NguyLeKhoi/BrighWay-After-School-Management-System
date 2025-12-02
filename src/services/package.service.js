import axiosInstance from '../config/axios.config';

/**
 * Package Service
 * Handles all package-related API calls
 */
const packageService = {
  /**
   * Get all active packages
   * @returns {Promise} List of all active packages
   */
  getAllPackages: async () => {
    try {
      const response = await axiosInstance.get('/Package');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get package by ID
   * @param {string} packageId - Package ID
   * @returns {Promise} Package details
   */
  getPackageById: async (packageId) => {
    try {
      const response = await axiosInstance.get(`/Package/${packageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new package
   * @param {Object} packageData - Package data { name, desc, durationInMonths, totalSlots, price, studentLevelId, branchId, benefitIds }
   * @returns {Promise} Created package
   */
  createPackage: async (packageData) => {
    try {
      const response = await axiosInstance.post('/Package', packageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update existing package
   * @param {string} packageId - Package ID
   * @param {Object} packageData - Updated package data { name, desc, durationInMonths, totalSlots, price, studentLevelId, branchId, benefitIds }
   * @returns {Promise} Updated package
   */
  updatePackage: async (packageId, packageData) => {
    try {
      const response = await axiosInstance.put(`/Package/${packageId}`, packageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Soft delete package by ID
   * @param {string} packageId - Package ID
   * @returns {Promise} Deletion result
   */
  deletePackage: async (packageId) => {
    try {
      const response = await axiosInstance.delete(`/Package/${packageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Assign one or more benefits to a specific package
   * @param {Object} assignmentData - Assignment data { packageId, benefitIds }
   * @returns {Promise} Assignment result
   */
  assignBenefitsToPackage: async (assignmentData) => {
    try {
      const response = await axiosInstance.post('/Package/assign-benefits', assignmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Assign slot types to a package (replace existing) — Admin/Manager only
   * @param {string} packageId - Package ID
   * @param {Object} assignmentData - Assignment data { slotTypeIds: [Guid] }
   * @returns {Promise} Assignment result
   */
  assignSlotTypesToPackage: async (packageId, assignmentData) => {
    try {
      const response = await axiosInstance.post(`/Package/${packageId}/assign-slot-types`, assignmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated packages with filters
   * @param {Object} params - Pagination parameters { page, pageSize, searchTerm, status }
   * @returns {Promise} Paginated package list
   */
  getPackagesPaged: async (params = {}) => {
    try {
      const { 
        pageIndex = 1,
        pageSize = 10, 
        searchTerm = '', 
        status = null,
        branchId = '',
        date = null
      } = params;
      
      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });
      
      if (searchTerm) {
        queryParams.append('filter.Name', searchTerm);
      }
      
      if (status !== null && status !== undefined) {
        queryParams.append('filter.IsActive', status.toString());
      }

      if (branchId) {
        queryParams.append('filter.BranchId', branchId);
      }

      if (date) {
        // Format date to ISO string for backend
        const dateStr = date instanceof Date 
          ? date.toISOString().split('T')[0] 
          : typeof date === 'string' 
            ? date.split('T')[0] 
            : date;
        queryParams.append('filter.CreatedTime', dateStr);
      }
      
      const response = await axiosInstance.get(`/Package/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated packages for the current manager's branch
   * @param {Object} params - Pagination parameters { page, pageSize, searchTerm, status }
   * @returns {Promise} Paginated package list for branch
   */
  getMyBranchPackagesPaged: async (params = {}) => {
    try {
      const {
        pageIndex = 1,
        pageSize = 10,
        searchTerm = '',
        status = null,
        branchId = '',
        date = null
      } = params;

      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });

      if (searchTerm) {
        queryParams.append('filter.Name', searchTerm);
      }

      if (status !== null && status !== undefined && status !== '') {
        queryParams.append('filter.IsActive', status.toString());
      }

      if (branchId) {
        queryParams.append('filter.BranchId', branchId);
      }

      if (date) {
        // Format date to ISO string for backend
        const dateStr = date instanceof Date 
          ? date.toISOString().split('T')[0] 
          : typeof date === 'string' 
            ? date.split('T')[0] 
            : date;
        queryParams.append('filter.CreatedTime', dateStr);
      }

      const response = await axiosInstance.get(`/Package/paged/my-branch?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all package subscriptions for a specific student
   * @param {string} studentId - Student ID
   * @returns {Promise} List of package subscriptions
   */
  getSubscriptionsByStudent: async (studentId) => {
    try {
      const response = await axiosInstance.get(`/PackageSubscription/by-student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get benefits of a specific package
   * @param {string} packageId
   * @returns {Promise} Benefit list
   */
  getPackageBenefits: async (packageId) => {
    try {
      const response = await axiosInstance.get(`/Package/${packageId}/benefits`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get packages suitable for a specific student
   * @param {string} studentId - Student ID
   * @returns {Promise} List of suitable packages
   */
  getSuitablePackages: async (studentId) => {
    try {
      const response = await axiosInstance.get(`/Package/student/${studentId}/suitable-packages`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new package for the current manager's branch
   * @param {Object} packageData
   * @returns {Promise} Created package
   */
  createMyBranchPackage: async (packageData) => {
    try {
      const response = await axiosInstance.post('/Package/my-branch', packageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update an existing package in the current manager's branch
   * @param {string} packageId
   * @param {Object} packageData
   * @returns {Promise} Updated package
   */
  updateMyBranchPackage: async (packageId, packageData) => {
    try {
      const response = await axiosInstance.put(`/Package/my-branch/${packageId}`, packageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Buy package for child
   * @param {Object} purchaseData - Purchase data { packageId, studentId, startDate }
   * @returns {Promise} Purchase result
   */
  buyPackageForChild: async (purchaseData) => {
    try {
      const response = await axiosInstance.post('/PackageSubscription/buy-for-child', purchaseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all packages (public endpoint - no authentication required)
   * @returns {Promise} List of all active packages for public display
   */
  getPublicPackages: async () => {
    try {
      const response = await axiosInstance.get('/Package/public');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get package by ID (public endpoint - no authentication required)
   * @param {string} packageId - Package ID
   * @returns {Promise} Package details
   */
  getPublicPackageById: async (packageId) => {
    try {
      const response = await axiosInstance.get(`/Package/public/${packageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Refund a package subscription
   * @param {string} subscriptionId - Package subscription ID
   * @returns {Promise} Refund result
   */
  refundPackageSubscription: async (subscriptionId) => {
    try {
      const response = await axiosInstance.post(`/PackageSubscription/${subscriptionId}/refund`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Renew a student's current active subscription
   * @param {string} studentId - Student ID
   * @returns {Promise} Renewed subscription
   */
  renewSubscription: async (studentId) => {
    try {
      const response = await axiosInstance.post(`/PackageSubscription/renew/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Upgrade a student's current active subscription to a higher package
   * @param {string} studentId - Student ID
   * @param {string} newPackageId - New package ID to upgrade to
   * @returns {Promise} Upgraded subscription
   */
  upgradeSubscription: async (studentId, newPackageId) => {
    try {
      const response = await axiosInstance.post(`/PackageSubscription/upgrade/${studentId}/${newPackageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default packageService;
