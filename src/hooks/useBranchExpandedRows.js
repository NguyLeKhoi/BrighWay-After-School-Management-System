import { useState } from 'react';
import benefitService from '../services/benefit.service';

/**
 * Custom hook to manage expanded rows and their data in Branch Management
 */
export const useBranchExpandedRows = (branches) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [rowBenefits, setRowBenefits] = useState({});
  const [rowSchools, setRowSchools] = useState({});
  const [rowStudentLevels, setRowStudentLevels] = useState({});

  const handleToggleExpand = async (branchId) => {
    const newExpanded = new Set(expandedRows);
    const isCurrentlyExpanded = expandedRows.has(branchId);
    
    if (isCurrentlyExpanded) {
      newExpanded.delete(branchId);
    } else {
      newExpanded.add(branchId);
      // Load benefits if not loaded
      if (!rowBenefits[branchId]) {
        try {
          const benefits = await benefitService.getBenefitsByBranchId(branchId);
          setRowBenefits(prev => ({ ...prev, [branchId]: benefits }));
        } catch {
          setRowBenefits(prev => ({ ...prev, [branchId]: [] }));
        }
      }
      // Load schools if not loaded - get from branch data
      if (!rowSchools[branchId]) {
        try {
          const branch = branches.find(b => b.id === branchId);
          if (branch?.schools && Array.isArray(branch.schools)) {
            setRowSchools(prev => ({ ...prev, [branchId]: branch.schools }));
          } else {
            setRowSchools(prev => ({ ...prev, [branchId]: [] }));
          }
        } catch {
          setRowSchools(prev => ({ ...prev, [branchId]: [] }));
        }
      }
      // Load student levels if not loaded - get from branch data
      if (!rowStudentLevels[branchId]) {
        try {
          const branch = branches.find(b => b.id === branchId);
          if (branch?.studentLevels && Array.isArray(branch.studentLevels)) {
            setRowStudentLevels(prev => ({ ...prev, [branchId]: branch.studentLevels }));
          } else {
            setRowStudentLevels(prev => ({ ...prev, [branchId]: [] }));
          }
        } catch {
          setRowStudentLevels(prev => ({ ...prev, [branchId]: [] }));
        }
      }
    }
    setExpandedRows(newExpanded);
  };

  const updateRowBenefits = (branchId, benefits) => {
    setRowBenefits(prev => ({ ...prev, [branchId]: benefits }));
  };

  const updateRowSchools = (branchId, schools) => {
    setRowSchools(prev => ({ ...prev, [branchId]: schools }));
  };

  const updateRowStudentLevels = (branchId, studentLevels) => {
    setRowStudentLevels(prev => ({ ...prev, [branchId]: studentLevels }));
  };

  return {
    expandedRows,
    rowBenefits,
    rowSchools,
    rowStudentLevels,
    handleToggleExpand,
    updateRowBenefits,
    updateRowSchools,
    updateRowStudentLevels
  };
};

