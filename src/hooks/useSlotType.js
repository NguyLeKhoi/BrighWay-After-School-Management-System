import { useState, useEffect, useCallback } from 'react';
import slotTypeService from '../services/slotType.service';

/**
 * Custom hook to fetch and manage slot types
 * Specifically designed to get slotType IDs for creating branch slots
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch automatically on mount (default: false)
 * @returns {Object} Slot type data with loading states and helper functions
 */
const useSlotType = (options = {}) => {
  const { autoFetch = false } = options;

  const [slotTypes, setSlotTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all slot types
   */
  const fetchSlotTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await slotTypeService.getAllSlotTypes();
      setSlotTypes(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching slot types:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách loại ca học';
      setError(errorMessage);
      setSlotTypes([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchSlotTypes();
    }
  }, [autoFetch, fetchSlotTypes]);

  /**
   * Get slot type options formatted for select dropdowns
   * Returns array of { value: id, label: name } objects
   */
  const slotTypeSelectOptions = slotTypes.map(slotType => ({
    value: slotType.id,
    label: slotType.name,
    description: slotType.description
  }));

  /**
   * Get slot type by ID
   */
  const getSlotTypeById = useCallback((id) => {
    return slotTypes.find(st => st.id === id);
  }, [slotTypes]);

  /**
   * Get slot type ID by name (case-insensitive)
   */
  const getSlotTypeIdByName = useCallback((name) => {
    const slotType = slotTypes.find(st => 
      st.name?.toLowerCase() === name?.toLowerCase()
    );
    return slotType?.id || null;
  }, [slotTypes]);

  /**
   * Check if a slot type exists by ID
   */
  const hasSlotType = useCallback((id) => {
    return slotTypes.some(st => st.id === id);
  }, [slotTypes]);

  return {
    // Raw data
    slotTypes,
    
    // Formatted options for dropdowns
    slotTypeSelectOptions,
    
    // State
    loading,
    error,
    
    // Helper functions
    getSlotTypeById,
    getSlotTypeIdByName,
    hasSlotType,
    
    // Actions
    fetchSlotTypes,
    refresh: fetchSlotTypes
  };
};

export default useSlotType;

