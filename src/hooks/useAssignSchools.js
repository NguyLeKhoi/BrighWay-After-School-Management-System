import { useState } from 'react';
import { toast } from 'react-toastify';
import branchService from '../services/branch.service';
import schoolService from '../services/school.service';

/**
 * Custom hook to manage assign schools dialog and operations
 */
export const useAssignSchools = (expandedRows, updateRowSchools, loadData) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [availableSchools, setAvailableSchools] = useState([]);
  const [assignedSchools, setAssignedSchools] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async (branch) => {
    setSelectedBranch(branch);
    setLoading(true);
    setOpenDialog(true);
    
    try {
      const [allSchools, branchData] = await Promise.all([
        schoolService.getAllSchools(),
        branchService.getBranchById(branch.id).catch(() => null)
      ]);
      
      setAvailableSchools(allSchools);
      
      const assigned = branchData?.schools && Array.isArray(branchData.schools)
        ? branchData.schools
        : [];
      
      setAssignedSchools(assigned);
      const assignedIds = assigned
        .map(s => s.id || s.schoolId)
        .filter(id => id != null && id !== '');
      setSelectedSchools(assignedIds);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải danh sách trường');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBranch) return;
    
    try {
      const currentAssigned = assignedSchools
        .map(s => s.id || s.schoolId)
        .filter(id => id != null && id !== '');
      
      const toAdd = selectedSchools.filter(id => id && !currentAssigned.includes(id));
      const toRemove = currentAssigned.filter(id => id && !selectedSchools.includes(id));
      
      for (const schoolId of toAdd) {
        if (!schoolId) continue;
        await branchService.connectSchool({
          branchId: selectedBranch.id,
          schoolId: schoolId
        });
      }
      
      for (const schoolId of toRemove) {
        if (!schoolId) continue;
        await branchService.disconnectSchool({
          branchId: selectedBranch.id,
          schoolId: schoolId
        });
      }
      
      toast.success(`Gán trường cho "${selectedBranch.branchName}" thành công!`);
      
      const updatedBranch = await branchService.getBranchById(selectedBranch.id);
      const updated = updatedBranch?.schools && Array.isArray(updatedBranch.schools)
        ? updatedBranch.schools
        : [];
      
      setAssignedSchools(updated);
      
      if (expandedRows.has(selectedBranch.id)) {
        updateRowSchools(selectedBranch.id, updated);
      }
      
      if (loadData) {
        await loadData(false);
      }
      
      setOpenDialog(false);
      setSelectedBranch(null);
      setSelectedSchools([]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gán trường');
    }
  };

  const handleRemove = async (branchId, schoolId, schoolName, setConfirmDialog) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận gỡ trường',
      description: `Bạn có chắc chắn muốn gỡ trường "${schoolName}" khỏi chi nhánh này không?`,
      onConfirm: async () => {
        try {
          await branchService.disconnectSchool({
            branchId: branchId,
            schoolId: schoolId
          });
          toast.success(`Đã gỡ trường "${schoolName}" khỏi chi nhánh thành công!`);
          
          const updatedBranch = await branchService.getBranchById(branchId);
          const updated = updatedBranch?.schools && Array.isArray(updatedBranch.schools)
            ? updatedBranch.schools
            : [];
          
          updateRowSchools(branchId, updated);
          
          if (selectedBranch?.id === branchId) {
            setAssignedSchools(updated);
          }
          
          if (loadData) {
            await loadData(false);
          }
          
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (err) {
          toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gỡ trường');
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  return {
    openDialog,
    setOpenDialog,
    selectedBranch,
    availableSchools,
    assignedSchools,
    selectedSchools,
    setSelectedSchools,
    loading,
    handleOpen,
    handleSubmit,
    handleRemove
  };
};

