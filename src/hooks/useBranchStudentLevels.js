import { useState, useEffect, useCallback } from 'react';
import branchService from '../services/branch.service';

/**
 * Hook to fetch student levels for a specific branch
 * @param {string} branchId - Branch ID
 * @returns {Object} { studentLevels, loading, error, refetch }
 */
const useBranchStudentLevels = (branchId) => {
  const [studentLevels, setStudentLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudentLevels = useCallback(async () => {
    if (!branchId || branchId === '' || branchId === null || branchId === undefined) {
      setStudentLevels([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const branch = await branchService.getBranchById(branchId);
      console.log('Branch data for studentLevels:', branch);
      // Branch response should contain studentLevels array directly
      const levels = branch?.studentLevels || branch?.branchLevels?.map(bl => bl.studentLevel || bl) || [];
      console.log('Extracted studentLevels:', levels);
      setStudentLevels(Array.isArray(levels) ? levels : []);
    } catch (err) {
      console.error('Error fetching branch studentLevels:', err);
      const message = err?.response?.data?.message || err?.message || 'Không thể tải cấp độ học sinh';
      setError(message);
      setStudentLevels([]);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchStudentLevels();
  }, [fetchStudentLevels]);

  return {
    studentLevels,
    loading,
    error,
    refetch: fetchStudentLevels
  };
};

export default useBranchStudentLevels;

