import axiosInstance from '../config/axios.config';

/**
 * Package Template Service
 * Provides CRUD helpers for package template endpoints
 */
const packageTemplateService = {
  /**
   * Get all active templates
   * @returns {Promise<Array>}
   */
  getAllTemplates: async () => {
    try {
      const response = await axiosInstance.get('/PackageTemplate');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get template details by id
   * @param {string} templateId
   * @returns {Promise<Object>}
   */
  getTemplateById: async (templateId) => {
    try {
      const response = await axiosInstance.get(`/PackageTemplate/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create a new template
   * @param {Object} templateData
   * @returns {Promise<Object>}
   */
  createTemplate: async (templateData) => {
    try {
      const response = await axiosInstance.post('/PackageTemplate', templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update an existing template
   * @param {string} templateId
   * @param {Object} templateData
   * @returns {Promise<Object>}
   */
  updateTemplate: async (templateId, templateData) => {
    try {
      const response = await axiosInstance.put(`/PackageTemplate/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Soft delete a template by id
   * @param {string} templateId
   * @returns {Promise<Object>}
   */
  deleteTemplate: async (templateId) => {
    try {
      const response = await axiosInstance.delete(`/PackageTemplate/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated templates with optional filters
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getTemplatesPaged: async (params = {}) => {
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

      const response = await axiosInstance.get(`/PackageTemplate/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default packageTemplateService;


