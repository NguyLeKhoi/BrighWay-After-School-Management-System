import { useState } from 'react';
import { toast } from 'react-toastify';
import branchService from '../services/branch.service';
import studentLevelService from '../services/studentLevel.service';

/**
 * Custom hook to manage assign student levels dialog and operations
 */
export const useAssignStudentLevels = (expandedRows, updateRowStudentLevels, loadData) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [availableStudentLevels, setAvailableStudentLevels] = useState([]);
  const [assignedStudentLevels, setAssignedStudentLevels] = useState([]);
  const [selectedStudentLevels, setSelectedStudentLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async (branch) => {
    setSelectedBranch(branch);
    setLoading(true);
    setOpenDialog(true);
    
    try {
      const [allStudentLevels, branchData] = await Promise.all([
        studentLevelService.getAllStudentLevels(),
        branchService.getBranchById(branch.id).catch(() => null)
      ]);
      
      setAvailableStudentLevels(allStudentLevels);
      
      const assigned = branchData?.studentLevels && Array.isArray(branchData.studentLevels)
        ? branchData.studentLevels
        : [];
      
      setAssignedStudentLevels(assigned);
      const assignedIds = assigned
        .map(sl => sl.id || sl.studentLevelId)
        .filter(id => id != null && id !== '');
      setSelectedStudentLevels(assignedIds);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải danh sách cấp độ học sinh');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBranch) return;
    
    try {
      const currentAssigned = assignedStudentLevels
        .map(sl => sl.id || sl.studentLevelId)
        .filter(id => id != null && id !== '');
      
      const toAdd = selectedStudentLevels.filter(id => id && !currentAssigned.includes(id));
      
      for (const studentLevelId of toAdd) {
        if (!studentLevelId) continue;
        await branchService.addStudentLevel({
          branchId: selectedBranch.id,
          studentLevelId: studentLevelId
        });
      }
      
      toast.success(`Gán cấp độ học sinh cho "${selectedBranch.branchName}" thành công!`);
      
      const updatedBranch = await branchService.getBranchById(selectedBranch.id);
      const updated = updatedBranch?.studentLevels && Array.isArray(updatedBranch.studentLevels)
        ? updatedBranch.studentLevels
        : [];
      
      setAssignedStudentLevels(updated);
      
      if (expandedRows.has(selectedBranch.id)) {
        updateRowStudentLevels(selectedBranch.id, updated);
      }
      
      if (loadData) {
        await loadData(false);
      }
      
      setOpenDialog(false);
      setSelectedBranch(null);
      setSelectedStudentLevels([]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gán cấp độ học sinh');
    }
  };

  return {
    openDialog,
    setOpenDialog,
    selectedBranch,
    availableStudentLevels,
    assignedStudentLevels,
    selectedStudentLevels,
    setSelectedStudentLevels,
    loading,
    handleOpen,
    handleSubmit
  };
};

