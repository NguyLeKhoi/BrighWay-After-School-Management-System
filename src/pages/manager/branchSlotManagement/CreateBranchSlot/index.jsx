import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box } from '@mui/material';
import { AccessTime as BranchSlotIcon } from '@mui/icons-material';
import StepperForm from '../../../../components/Common/StepperForm';
import branchSlotService from '../../../../services/branchSlot.service';
import userService from '../../../../services/user.service';
import useBranchSlotDependencies from '../../../../hooks/useBranchSlotDependencies';
import { useAuth } from '../../../../contexts/AuthContext';
import Step1BasicInfo from './Step1BasicInfo';
import Step2AssignRooms from './Step2AssignRooms';
import Step3AssignStaff from './Step3AssignStaff';

const CreateBranchSlot = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();

  const {
    timeframeOptions,
    slotTypeOptions,
    roomOptions,
    staffOptions,
    loading: dependenciesLoading,
    fetchDependencies
  } = useBranchSlotDependencies();

  const [actionLoading, setActionLoading] = useState(false);
  const [managerBranchId, setManagerBranchId] = useState('');
  const [formData, setFormData] = useState(() => {
    const timeframeId = searchParams.get('timeframeId') || '';
    const slotTypeId = searchParams.get('slotTypeId') || '';
    const weekDateParam = searchParams.get('weekDate');
    const parsedWeekDate =
      weekDateParam !== null && !isNaN(Number(weekDateParam)) ? String(Number(weekDateParam)) : '';

    return {
      timeframeId,
      slotTypeId,
      weekDate: parsedWeekDate,
      status: 'Available',
      roomIds: [],
      userId: '',
      roomId: '',
      name: '',
      branchSlotId: '',
      branchId: ''
    };
  });

  const formDataRef = React.useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    const extractBranchId = (userData) =>
      userData?.managerProfile?.branchId || userData?.branchId || userData?.managerBranchId || '';

    const existingBranchId = extractBranchId(authUser);
    if (existingBranchId) {
      setManagerBranchId(existingBranchId);
      setFormData((prev) => {
        if (prev.branchId) return prev;
        const updated = { ...prev, branchId: existingBranchId };
        formDataRef.current = updated;
        return updated;
      });
      return;
    }

    const fetchBranch = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        const branchId = extractBranchId(currentUser);
        if (branchId) {
          setManagerBranchId(branchId);
          setFormData((prev) => {
            if (prev.branchId) return prev;
            const updated = { ...prev, branchId };
            formDataRef.current = updated;
            return updated;
          });
        }
      } catch (err) {
        console.warn('Không thể lấy branchId của manager:', err);
      }
    };

    fetchBranch();
  }, [authUser]);

  const updateFormData = useCallback((newData) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      formDataRef.current = updated;
      return updated;
    });
  }, []);

  const ensureBranchSlotExists = useCallback(async (dataOverride = {}) => {
    const currentData = { ...formDataRef.current, ...dataOverride };

    if (
      !currentData.timeframeId ||
      !currentData.slotTypeId ||
      currentData.weekDate === '' ||
      currentData.weekDate === undefined
    ) {
      throw new Error('Vui lòng điền đầy đủ thông tin!');
    }

    const branchIdToUse = currentData.branchId || managerBranchId || currentData?.branch?.id || null;

    const payload = {
      branchId: branchIdToUse,
      timeframeId: currentData.timeframeId,
      slotTypeId: currentData.slotTypeId,
      weekDate: Number(currentData.weekDate),
      status: currentData.status || 'Available'
    };

    const updateState = (nextData) => {
      formDataRef.current = nextData;
      setFormData(nextData);
    };

    if (currentData.branchSlotId) {
      await branchSlotService.updateBranchSlot(currentData.branchSlotId, payload);
      updateState({ ...currentData, branchId: branchIdToUse || currentData.branchId });
      return currentData.branchSlotId;
    }

    const result = await branchSlotService.createMyBranchSlot(payload);
    if (!result?.id) {
      throw new Error('Không thể tạo ca học');
    }

    const updatedData = {
      ...currentData,
      branchSlotId: result.id,
      branchId: result.branchId || branchIdToUse || currentData.branchId
    };
    updateState(updatedData);
    return result.id;
  }, [managerBranchId]);

  const handleStep1Complete = useCallback(
    async (data) => {
      updateFormData(data);
      setActionLoading(true);
      try {
        const branchSlotId = await ensureBranchSlotExists(data);
        toast.success('Lưu thông tin ca học thành công! Tiếp tục gán phòng.', {
          position: 'top-right',
          autoClose: 2500
        });
        return !!branchSlotId;
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || 'Không thể lưu thông tin ca học';
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000
        });
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [ensureBranchSlotExists, updateFormData]
  );

  const handleStep2Complete = useCallback(
    async (data) => {
      const mergedRooms = Array.isArray(data.roomIds) ? data.roomIds : [];
      updateFormData({ roomIds: mergedRooms });

      if (!mergedRooms.length) {
        toast.info('Bạn có thể gán phòng sau.', {
          position: 'top-right',
          autoClose: 2500
        });
        return true;
      }

      setActionLoading(true);
      try {
        const branchSlotId = await ensureBranchSlotExists();

        await branchSlotService.assignRooms({
          branchSlotId,
          roomIds: mergedRooms
        });

        toast.success('Gán phòng thành công! Tiếp tục gán nhân viên.', {
          position: 'top-right',
          autoClose: 2500
        });
        return true;
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || 'Không thể gán phòng';
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000
        });
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [ensureBranchSlotExists, updateFormData]
  );

  const handleStep3Complete = useCallback(
    async (data) => {
      const mergedData = {
        userId: data.userId || '',
        roomId: data.roomId || '',
        name: data.name || ''
      };
      updateFormData(mergedData);

      const hasStaff = mergedData.userId;
      if (!hasStaff) {
        toast.info('Bạn có thể gán nhân viên sau.', {
          position: 'top-right',
          autoClose: 2500
        });
        return true;
      }

      setActionLoading(true);
      try {
        const branchSlotId = await ensureBranchSlotExists();

        await branchSlotService.assignStaff({
          branchSlotId,
          userId: mergedData.userId,
          roomId: mergedData.roomId || null,
          name: mergedData.name || null
        });

        toast.success('Gán nhân viên thành công!', {
          position: 'top-right',
          autoClose: 2500
        });
        return true;
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error.message || 'Không thể gán nhân viên';
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 4000
        });
        return false;
      } finally {
        setActionLoading(false);
      }
    },
    [ensureBranchSlotExists, updateFormData]
  );

  const handleComplete = useCallback(() => {
    toast.success('Hoàn tất tạo ca học!', {
      position: 'top-right',
      autoClose: 2500
    });
    navigate('/manager/branch-slots');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate('/manager/branch-slots');
  }, [navigate]);

  const steps = useMemo(
    () => [
      {
        label: 'Thông tin cơ bản',
        component: Step1BasicInfo,
        validation: handleStep1Complete
      },
      {
        label: 'Gán phòng',
        component: Step2AssignRooms,
        validation: handleStep2Complete
      },
      {
        label: 'Gán nhân viên',
        component: Step3AssignStaff,
        validation: handleStep3Complete
      }
    ],
    [handleStep1Complete, handleStep2Complete, handleStep3Complete]
  );

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px - 48px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <StepperForm
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        title="Tạo Ca Học Mới"
        icon={<BranchSlotIcon />}
        initialData={formData}
        stepProps={{
          timeframeOptions,
          slotTypeOptions,
          roomOptions,
          staffOptions,
          dependenciesLoading,
          actionLoading
        }}
      />
    </Box>
  );
};

export default CreateBranchSlot;

