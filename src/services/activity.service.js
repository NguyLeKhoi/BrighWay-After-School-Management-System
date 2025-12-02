import axiosInstance from '../config/axios.config';

/**
 * Activity Service
 * Handles all activity-related API calls
 */
const activityService = {
  /**
   * Get all activities
   * @returns {Promise} List of all activities
   */
  getAllActivities: async () => {
    try {
      const response = await axiosInstance.get('/Activity');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get paginated activities
   * @param {Object} params - Pagination and filter parameters 
   * { pageIndex, pageSize, StudentSlotId, ActivityTypeId, CreatedById, FromDate, ToDate, IsViewed, Keyword }
   * @returns {Promise} Paginated activity list with structure: { items, pageIndex, totalPages, totalCount, pageSize, hasPreviousPage, hasNextPage }
   */
  getActivitiesPaged: async (params = {}) => {
    try {
      const {
        pageIndex = 1,
        pageSize = 10,
        StudentSlotId = null,
        ActivityTypeId = null,
        CreatedById = null,
        FromDate = null,
        ToDate = null,
        IsViewed = null,
        Keyword = null
      } = params;

      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString()
      });

      if (StudentSlotId) {
        queryParams.append('StudentSlotId', StudentSlotId);
      }
      if (ActivityTypeId) {
        queryParams.append('ActivityTypeId', ActivityTypeId);
      }
      if (CreatedById) {
        queryParams.append('CreatedById', CreatedById);
      }
      if (FromDate) {
        queryParams.append('FromDate', FromDate);
      }
      if (ToDate) {
        queryParams.append('ToDate', ToDate);
      }
      if (IsViewed !== null && IsViewed !== undefined) {
        queryParams.append('IsViewed', IsViewed.toString());
      }
      if (Keyword) {
        queryParams.append('Keyword', Keyword);
      }

      const response = await axiosInstance.get(`/Activity/paged?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get activity by ID
   * @param {string} id - Activity ID
   * @returns {Promise} Activity details
   */
  getActivityById: async (id) => {
    try {
      const response = await axiosInstance.get(`/Activity/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get my activities (current user's activities)
   * @returns {Promise} List of current user's activities
   */
  getMyActivities: async () => {
    try {
      const response = await axiosInstance.get('/Activity/my-activities');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new activity
   * @param {Object} activityData - Activity data
   * @returns {Promise} Created activity
   */
  createActivity: async (activityData) => {
    try {
      const response = await axiosInstance.post('/Activity', activityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update an existing activity
   * @param {string} id - Activity ID
   * @param {Object} activityData - Updated activity data
   * @returns {Promise} Updated activity
   */
  updateActivity: async (id, activityData) => {
    try {
      const response = await axiosInstance.put(`/Activity/${id}`, activityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete an activity
   * @param {string} id - Activity ID
   * @returns {Promise} Deletion confirmation
   */
  deleteActivity: async (id) => {
    try {
      const response = await axiosInstance.delete(`/Activity/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mark activity as viewed
   * @param {string} id - Activity ID
   * @returns {Promise} Updated activity
   */
  markActivityAsViewed: async (id) => {
    try {
      const response = await axiosInstance.post(`/Activity/${id}/mark-viewed`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Check in student (staff checkin)
   * @param {string} studentId - Student ID
   * @returns {Promise} Created activity for checkin
   */
  checkinStaff: async (studentId) => {
    try {
      const response = await axiosInstance.post(`/Activity/checkin/staff/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get my children's activities (paginated)
   * @param {Object} params - Query parameters { studentId, pageIndex, pageSize, studentSlotId }
   * @returns {Promise} Paginated list of children's activities
   */
  getMyChildrenActivities: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      const url = queryString ? `/Activity/my-children-activities?${queryString}` : '/Activity/my-children-activities';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Load all activities for a student slot (handles pagination automatically)
   * @param {Object} params - Parameters including StudentSlotId, pageSize (optional, default 100), and other filters
   * @returns {Promise<Array>} Array of all activities across all pages
   */
  getAllActivitiesForStudentSlot: async function(params = {}) {
    const allActivities = [];
    let pageIndex = 1;
    const pageSize = params.pageSize || 100;
    let hasMore = true;
    let totalCount = 0;
    let totalPages = 0;

    while (hasMore) {
      const response = await this.getActivitiesPaged({
        ...params,
        pageIndex: pageIndex,
        pageSize: pageSize
      });

      const items = Array.isArray(response?.items) ? response.items : [];
      
      if (pageIndex === 1) {
        totalCount = response?.totalCount || 0;
        totalPages = response?.totalPages;
        
        if (!totalPages && totalCount > 0) {
          totalPages = Math.ceil(totalCount / pageSize);
        }
      }

      if (items.length > 0) {
        allActivities.push(...items);
      }

      if (totalPages > 0) {
        if (pageIndex >= totalPages) {
          hasMore = false;
        } else {
          pageIndex++;
        }
      } else {
        if (items.length < pageSize) {
          hasMore = false;
        } else {
          pageIndex++;
        }
      }
    }

    return allActivities;
  },
};

export default activityService;

