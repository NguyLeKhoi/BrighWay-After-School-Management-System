import { useState, useEffect, useCallback } from 'react';
import branchService from '../services/branch.service';

/**
 * Hook to fetch schools for a specific branch
 * @param {string} branchId - Branch ID
 * @returns {Object} { schools, loading, error, refetch }
 */
const useBranchSchools = (branchId) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchools = useCallback(async () => {
    if (!branchId || branchId === '' || branchId === null || branchId === undefined) {
      setSchools([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const branch = await branchService.getBranchById(branchId);
      console.log('Branch data for schools:', branch);
      // Branch response should contain schools array directly
      const branchSchools = branch?.schools || branch?.branchSchools?.map(bs => bs.school || bs) || [];
      console.log('Extracted schools:', branchSchools);
      setSchools(Array.isArray(branchSchools) ? branchSchools : []);
    } catch (err) {
      console.error('Error fetching branch schools:', err);
      const message = err?.response?.data?.message || err?.message || 'Không thể tải danh sách trường học';
      setError(message);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return {
    schools,
    loading,
    error,
    refetch: fetchSchools
  };
};

export default useBranchSchools;

