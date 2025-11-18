import { useState } from 'react';
import { toast } from 'react-toastify';
import benefitService from '../services/benefit.service';

/**
 * Custom hook to manage assign benefits dialog and operations
 */
export const useAssignBenefits = (expandedRows, updateRowBenefits, loadData) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [availableBenefits, setAvailableBenefits] = useState([]);
  const [assignedBenefits, setAssignedBenefits] = useState([]);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async (branch) => {
    setSelectedBranch(branch);
    setLoading(true);
    setOpenDialog(true);
    
    try {
      const [allBenefits, assigned] = await Promise.all([
        benefitService.getAllBenefits(),
        benefitService.getBenefitsByBranchId(branch.id).catch(() => [])
      ]);
      
      setAvailableBenefits(allBenefits);
      setAssignedBenefits(assigned);
      setSelectedBenefits(assigned.map(b => b.id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải danh sách lợi ích');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBranch) return;
    
    try {
      await benefitService.assignBenefitsToBranch({
        branchId: selectedBranch.id,
        benefitIds: selectedBenefits
      });
      
      toast.success(`Gán lợi ích cho "${selectedBranch.branchName}" thành công!`);
      
      const updated = await benefitService.getBenefitsByBranchId(selectedBranch.id);
      setAssignedBenefits(updated);
      
      if (expandedRows.has(selectedBranch.id)) {
        updateRowBenefits(selectedBranch.id, updated);
      }
      
      if (loadData) {
        await loadData(false);
      }
      
      setOpenDialog(false);
      setSelectedBranch(null);
      setSelectedBenefits([]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gán lợi ích');
    }
  };

  const handleRemove = async (branchId, benefitId, benefitName, setConfirmDialog) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận gỡ lợi ích',
      description: `Bạn có chắc chắn muốn gỡ lợi ích "${benefitName}" khỏi chi nhánh này không?`,
      onConfirm: async () => {
        try {
          await benefitService.removeBenefitFromBranch(branchId, benefitId);
          toast.success(`Đã gỡ lợi ích "${benefitName}" khỏi chi nhánh thành công!`);
          
          const updated = await benefitService.getBenefitsByBranchId(branchId);
          updateRowBenefits(branchId, updated);
          
          if (selectedBranch?.id === branchId) {
            setAssignedBenefits(updated);
          }
          
          if (loadData) {
            await loadData(false);
          }
          
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (err) {
          toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gỡ lợi ích');
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  return {
    openDialog,
    setOpenDialog,
    selectedBranch,
    availableBenefits,
    assignedBenefits,
    selectedBenefits,
    setSelectedBenefits,
    loading,
    handleOpen,
    handleSubmit,
    handleRemove
  };
};

