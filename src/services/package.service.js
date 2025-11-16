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
   * Get paginated packages with filters
   * @param {Object} params - Pagination parameters { page, pageSize, searchTerm, status }
   * @returns {Promise} Paginated package list
   */
  getPackagesPaged: async (params = {}) => {
    try {
      const { 
        page = 1, 
        pageSize = 10, 
        searchTerm = '', 
        status = null
      } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      
      if (searchTerm) {
        queryParams.append('filter.Name', searchTerm);
      }
      
      if (status !== null && status !== undefined) {
        queryParams.append('filter.IsActive', status.toString());
      }
      
      const response = await axiosInstance.get(`/Package/paged?${queryParams}`);
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
  }
};

export default packageService;
