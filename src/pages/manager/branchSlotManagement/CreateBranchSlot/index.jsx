import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box } from '@mui/material';
import StepperForm from '../../../../components/Common/StepperForm';
import { AccessTime as BranchSlotIcon } from '@mui/icons-material';
import branchSlotService from '../../../../services/branchSlot.service';
import useBranchSlotDependencies from '../../../../hooks/useBranchSlotDependencies';
import Step1BasicInfo from './Step1BasicInfo';
import Step2AssignRooms from './Step2AssignRooms';
import Step3AssignStaff from './Step3AssignStaff';

const WEEK_DAYS = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' }
];

const CreateBranchSlot = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const {
    timeframeOptions,
    slotTypeOptions,
    roomOptions,
    staffOptions,
    loading: dependenciesLoading,
    fetchDependencies
  } = useBranchSlotDependencies();

  const [loading, setLoading] = useState(false);
  
  // Get IDs from URL params
  const timeframeIdFromUrl = searchParams.get('timeframeId') || '';
  const slotTypeIdFromUrl = searchParams.get('slotTypeId') || '';
  const weekDateFromUrl = searchParams.get('weekDate') || '';
  
  const [formData, setFormData] = useState({
    timeframeId: timeframeIdFromUrl,
    slotTypeId: slotTypeIdFromUrl,
    weekDate: weekDateFromUrl,
    status: 'Available',
    roomIds: [],
    userId: '',
    roomId: '',
    name: ''
  });

  // Ref to keep latest formData for handleComplete
  const formDataRef = React.useRef(formData);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Fetch dependencies on mount
  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  // Auto-fill form data when dependencies are loaded and URL params exist
  useEffect(() => {
    if (!dependenciesLoading && (timeframeIdFromUrl || slotTypeIdFromUrl || weekDateFromUrl)) {
      setFormData(prevData => {
        const updatedData = { ...prevData };
        
        // Validate and set timeframeId if provided in URL
        if (timeframeIdFromUrl) {
          const timeframeExists = timeframeOptions.some(tf => tf.id === timeframeIdFromUrl);
          if (timeframeExists) {
            updatedData.timeframeId = timeframeIdFromUrl;
          }
        }
        
        // Validate and set slotTypeId if provided in URL
        if (slotTypeIdFromUrl) {
          const slotTypeExists = slotTypeOptions.some(st => st.id === slotTypeIdFromUrl);
          if (slotTypeExists) {
            updatedData.slotTypeId = slotTypeIdFromUrl;
          }
        }
        
        // Set weekDate if provided in URL
        if (weekDateFromUrl) {
          const weekDateNum = Number(weekDateFromUrl);
          if (!isNaN(weekDateNum) && weekDateNum >= 0 && weekDateNum <= 6) {
            updatedData.weekDate = weekDateNum.toString();
          }
        }
        
        return updatedData;
      });
    }
  }, [dependenciesLoading, timeframeOptions, slotTypeOptions, timeframeIdFromUrl, slotTypeIdFromUrl, weekDateFromUrl]);

  const timeframeSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn khung giờ' },
      ...timeframeOptions.map((tf) => ({
        value: tf.id,
        label: `${tf.name} (${tf.startTime} - ${tf.endTime})`
      }))
    ],
    [timeframeOptions]
  );

  const slotTypeSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn loại ca học' },
      ...slotTypeOptions.map((st) => ({
        value: st.id,
        label: st.name
      }))
    ],
    [slotTypeOptions]
  );

  const weekDateSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn ngày trong tuần' },
      ...WEEK_DAYS.map((day) => ({
        value: day.value,
        label: day.label
      }))
    ],
    []
  );

  // Update formData function
  const updateFormData = useCallback((newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  // Step 1: Validate basic info only (no API call)
  const handleStep1Complete = useCallback(async (data) => {
    // Use the latest formData
    const currentData = { ...formData, ...data };
    
    // Only validate, don't create branch slot yet
    if (!currentData.timeframeId || !currentData.slotTypeId || currentData.weekDate === '' || currentData.weekDate === undefined) {
      toast.error('Vui lòng điền đầy đủ thông tin!', {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }

    // Just update formData, don't call API
    setFormData(prev => ({ ...prev, ...currentData }));
    return true; // Validation passed
  }, [formData]);

  // Step 2: Validate room assignment only (no API call)
  const handleStep2Complete = useCallback(async (data) => {
    // Use the latest formData
    const currentData = { ...formData, ...data };
    
    // Just update formData, don't call API
    setFormData(prev => ({ ...prev, ...currentData }));
    
    // Validation passed (rooms are optional)
    return true;
  }, [formData]);

  // Step 3: Validate staff assignment only (no API call)
  const handleStep3Complete = useCallback(async (data) => {
    // Use the latest formData
    const currentData = { ...formData, ...data };
    
    // Just update formData, don't call API
    setFormData(prev => ({ ...prev, ...currentData }));
    
    // Validation passed (staff is optional)
    return true;
  }, [formData]);

  // Final completion - Execute all API calls in sequence
  const handleComplete = useCallback(async () => {
    const finalData = formDataRef.current || formData;
    
    // Validate required fields
    if (!finalData.timeframeId || !finalData.slotTypeId || finalData.weekDate === '' || finalData.weekDate === undefined) {
      toast.error('Vui lòng điền đầy đủ thông tin cơ bản!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create Branch Slot
      const submitData = {
        timeframeId: finalData.timeframeId,
        slotTypeId: finalData.slotTypeId,
        weekDate: Number(finalData.weekDate),
        status: finalData.status || 'Available'
      };

      const result = await branchSlotService.createMyBranchSlot(submitData);
      const newBranchSlotId = result?.id;
      
      if (!newBranchSlotId) {
        throw new Error('Không thể tạo ca học');
      }

      toast.success('Tạo ca học thành công!', {
        position: "top-right",
        autoClose: 2000,
      });

      // Step 2: Assign Rooms (if any)
      if (finalData.roomIds && finalData.roomIds.length > 0) {
        try {
          await branchSlotService.assignRooms({
            branchSlotId: newBranchSlotId,
            roomIds: finalData.roomIds
          });
          toast.success('Gán phòng thành công!', {
            position: "top-right",
            autoClose: 2000,
          });
        } catch (err) {
          console.error('Error assigning rooms:', err);
          toast.warning('Tạo ca học thành công nhưng gán phòng thất bại. Bạn có thể gán phòng sau.', {
            position: "top-right",
            autoClose: 4000,
          });
        }
      }

      // Step 3: Assign Staff (if any)
      if (finalData.userId) {
        try {
          await branchSlotService.assignStaff({
            branchSlotId: newBranchSlotId,
            userId: finalData.userId,
            roomId: finalData.roomId || null,
            name: finalData.name || null
          });
          toast.success('Gán nhân viên thành công!', {
            position: "top-right",
            autoClose: 2000,
          });
        } catch (err) {
          console.error('Error assigning staff:', err);
          toast.warning('Tạo ca học thành công nhưng gán nhân viên thất bại. Bạn có thể gán nhân viên sau.', {
            position: "top-right",
            autoClose: 4000,
          });
        }
      }

      // All done
      toast.success('Tạo ca học hoàn tất!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      navigate('/manager/branch-slots');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo ca học';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [formData, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/manager/branch-slots');
  }, [navigate]);

  const steps = useMemo(() => [
    {
      label: 'Thông tin cơ bản',
      component: Step1BasicInfo,
      validation: async (data) => {
        // First update formData, then validate
        // The form submit will have already updated the data via updateData
        return await handleStep1Complete(data);
      }
    },
    {
      label: 'Gán phòng',
      component: Step2AssignRooms,
      validation: async (data) => {
        return await handleStep2Complete(data);
      }
    },
    {
      label: 'Gán nhân viên',
      component: Step3AssignStaff,
      validation: async (data) => {
        return await handleStep3Complete(data);
      }
    }
  ], [handleStep1Complete, handleStep2Complete, handleStep3Complete]);

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px - 48px)', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
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
          dependenciesLoading
        }}
      />
    </Box>
  );
};

export default CreateBranchSlot;

