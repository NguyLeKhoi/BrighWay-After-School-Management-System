import { useState, useEffect } from 'react';
import benefitService from '../services/benefit.service';
import studentLevelService from '../services/studentLevel.service';
import branchService from '../services/branch.service';

/**
 * Custom hook to fetch package dependencies
 * Returns lists of benefits, student levels, and branches with their IDs and names
 * for use in package creation/editing forms
 */
const usePackageDependencies = () => {
  const [benefits, setBenefits] = useState([]);
  const [studentLevels, setStudentLevels] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dependencies in parallel
        const [benefitsData, studentLevelsData, branchesData] = await Promise.all([
          benefitService.getAllBenefits(),
          studentLevelService.getAllStudentLevels(),
          branchService.getAllBranches()
        ]);

        setBenefits(benefitsData || []);
        setStudentLevels(studentLevelsData || []);
        setBranches(branchesData || []);
      } catch (err) {
        console.error('Error fetching package dependencies:', err);
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, []);

  // Transform data for easier use in forms
  const benefitOptions = benefits.map(benefit => ({
    id: benefit.id,
    name: benefit.name,
    description: benefit.description,
    isActive: benefit.isActive || benefit.status
  }));

  const studentLevelOptions = studentLevels.map(level => ({
    id: level.id,
    name: level.name,
    description: level.description
  }));

  const branchOptions = branches.map(branch => ({
    id: branch.id,
    name: branch.branchName,
    address: branch.address,
    phone: branch.phone
  }));

  return {
    // Raw data
    benefits,
    studentLevels,
    branches,
    
    // Formatted options for dropdowns
    benefitOptions,
    studentLevelOptions,
    branchOptions,
    
    // State
    loading,
    error,
    
    // Helper functions
    getBenefitById: (id) => benefits.find(b => b.id === id),
    getStudentLevelById: (id) => studentLevels.find(sl => sl.id === id),
    getBranchById: (id) => branches.find(b => b.id === id),
    
    // Refresh function
    refresh: () => {
      setLoading(true);
      setError(null);
      // Re-run the effect
      const fetchDependencies = async () => {
        try {
          const [benefitsData, studentLevelsData, branchesData] = await Promise.all([
            benefitService.getAllBenefits(),
            studentLevelService.getAllStudentLevels(),
            branchService.getAllBranches()
          ]);

          setBenefits(benefitsData || []);
          setStudentLevels(studentLevelsData || []);
          setBranches(branchesData || []);
        } catch (err) {
          console.error('Error refreshing package dependencies:', err);
          setError(err.message || 'Có lỗi xảy ra khi tải lại dữ liệu');
        } finally {
          setLoading(false);
        }
      };
      fetchDependencies();
    }
  };
};

export default usePackageDependencies;
