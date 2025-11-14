import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Box, Typography } from '@mui/material';
import StepperForm from '../../../../components/Common/StepperForm';
import { AccessTime as BranchSlotIcon } from '@mui/icons-material';
import branchSlotService from '../../../../services/branchSlot.service';
import useBranchSlotDependencies from '../../../../hooks/useBranchSlotDependencies';
import Step1BasicInfo from './Step1BasicInfo';
import Step2AssignRooms from './Step2AssignRooms';
import Step3AssignStaff from './Step3AssignStaff';

const UpdateBranchSlot = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get branch slot ID from URL
  
  const {
    timeframeOptions,
    slotTypeOptions,
    roomOptions,
    staffOptions,
    loading: dependenciesLoading,
    fetchDependencies
  } = useBranchSlotDependencies();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [branchSlotData, setBranchSlotData] = useState(null);
  
  const [formData, setFormData] = useState({
    timeframeId: '',
    slotTypeId: '',
    weekDate: '',
    status: 'Available',
    roomIds: [],
    userId: '',
    roomId: '',
    name: ''
  });

  // Ref to keep latest formData for handleComplete
  const formDataRef = useRef(formData);
  
  // Keep ref in sync with state
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Fetch dependencies and branch slot data on mount
  // Chỉ gọi một endpoint GET /api/BranchSlot/{id} để lấy tất cả dữ liệu cho cả 3 step
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        await fetchDependencies();
        
        // Lấy dữ liệu ca học
        if (id) {
          const slotData = await branchSlotService.getBranchSlotById(id);
          console.log('Slot data from single endpoint:', slotData);
          setBranchSlotData(slotData);
          
          // Parse dữ liệu từ response cho Step 1: Basic Info
          const basicInfo = {
            timeframeId: slotData.timeframeId || '',
            slotTypeId: slotData.slotTypeId || '',
            weekDate: slotData.weekDate !== null && slotData.weekDate !== undefined ? slotData.weekDate.toString() : '',
            status: slotData.status || 'Available'
          };
          
          // Parse dữ liệu từ response cho Step 2: Rooms
          // Ưu tiên gọi endpoint rooms để lấy chính xác danh sách phòng đã gán
          let roomIds = [];
          try {
            const roomsResponse = await branchSlotService.getRoomsByBranchSlot(id);
            const rooms = roomsResponse?.items || roomsResponse || [];
            roomIds = rooms.map(room => room?.id || room?.roomId).filter(Boolean);
          } catch (roomError) {
            console.warn('Không thể lấy danh sách phòng, fallback từ slotData:', roomError);
            const deriveRoomIdsFromSlotData = () => {
              if (Array.isArray(slotData.roomIds)) {
                return slotData.roomIds.filter(Boolean);
              }
    
              if (Array.isArray(slotData.rooms)) {
                return slotData.rooms
                  .map(room => room?.id || room?.roomId || room?.roomID)
                  .filter(Boolean);
              }
    
              if (Array.isArray(slotData.roomSlots)) {
                return slotData.roomSlots
                  .map(roomSlot => roomSlot?.roomId || roomSlot?.room?.id)
                  .filter(Boolean);
              }
    
              if (Array.isArray(slotData.staff)) {
                return slotData.staff
                  .map(staff => staff?.roomId)
                  .filter(Boolean);
              }
    
              return [];
            };
    
            roomIds = Array.from(new Set(deriveRoomIdsFromSlotData()));
          }
          
          // Parse dữ liệu từ response cho Step 3: Staff
          const staffList = slotData?.staff || [];
          console.log('Staff list from response:', staffList);
          const firstStaff = staffList.length > 0 ? staffList[0] : null;
          console.log('First staff:', firstStaff);
          
          const staffInfo = {
            userId: firstStaff?.staffId || '',
            roomId: firstStaff?.roomId || '',
            name: firstStaff?.staffRole || firstStaff?.roleName || ''
          };
          
          // Kết hợp tất cả dữ liệu cho formData
          const formDataToSet = {
            ...basicInfo,
            roomIds: roomIds,
            ...staffInfo
          };
          
          console.log('Setting formData from single endpoint:', formDataToSet);
          setFormData(formDataToSet);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        toast.error('Không thể tải dữ liệu ca học', {
          position: "top-right",
          autoClose: 3000,
        });
        navigate('/manager/branch-slots');
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadData();
  }, [id, fetchDependencies, navigate]);

  // Step 1: Validate basic info only (no API call)
  const handleStep1Complete = useCallback(async (data) => {
    const currentData = { ...formData, ...data };
    
    if (!currentData.timeframeId || !currentData.slotTypeId || currentData.weekDate === '' || currentData.weekDate === undefined) {
      toast.error('Vui lòng điền đầy đủ thông tin!', {
        position: "top-right",
        autoClose: 3000,
      });
      return false;
    }

    setFormData(prev => ({ ...prev, ...currentData }));
    return true;
  }, [formData]);

  // Step 2: Validate room assignment only (no API call)
  const handleStep2Complete = useCallback(async (data) => {
    const currentData = { ...formData, ...data };
    setFormData(prev => ({ ...prev, ...currentData }));
    return true;
  }, [formData]);

  // Step 3: Validate staff assignment only (no API call)
  const handleStep3Complete = useCallback(async (data) => {
    const currentData = { ...formData, ...data };
    setFormData(prev => ({ ...prev, ...currentData }));
    return true;
  }, [formData]);

  // Final completion - Execute all API calls in sequence
  const handleComplete = useCallback(async () => {
    if (!id) {
      toast.error('Không tìm thấy ID ca học!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const finalData = formDataRef.current || formData;
    
    if (!finalData.timeframeId || !finalData.slotTypeId || finalData.weekDate === '' || finalData.weekDate === undefined) {
      toast.error('Vui lòng điền đầy đủ thông tin cơ bản!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Step 1: Update Branch Slot
      const submitData = {
        timeframeId: finalData.timeframeId,
        slotTypeId: finalData.slotTypeId,
        weekDate: Number(finalData.weekDate),
        status: finalData.status || 'Available'
      };

      await branchSlotService.updateBranchSlot(id, submitData);
      
      toast.success('Cập nhật ca học thành công!', {
        position: "top-right",
        autoClose: 2000,
      });

      // Step 2: Update Rooms (if changed)
      // Note: The API might need to handle replacing all rooms
      // For now, we'll assign rooms (API should handle duplicates)
      if (finalData.roomIds && finalData.roomIds.length > 0) {
        try {
          await branchSlotService.assignRooms({
            branchSlotId: id,
            roomIds: finalData.roomIds
          });
          toast.success('Cập nhật phòng thành công!', {
            position: "top-right",
            autoClose: 2000,
          });
        } catch (err) {
          console.error('Error updating rooms:', err);
          toast.warning('Cập nhật ca học thành công nhưng cập nhật phòng thất bại. Bạn có thể cập nhật phòng sau.', {
            position: "top-right",
            autoClose: 4000,
          });
        }
      }

      // Step 3: Update Staff (if provided)
      if (finalData.userId) {
        try {
          await branchSlotService.assignStaff({
            branchSlotId: id,
            userId: finalData.userId,
            roomId: finalData.roomId || null,
            name: finalData.name || null
          });
          toast.success('Cập nhật nhân viên thành công!', {
            position: "top-right",
            autoClose: 2000,
          });
        } catch (err) {
          console.error('Error updating staff:', err);
          toast.warning('Cập nhật ca học thành công nhưng cập nhật nhân viên thất bại. Bạn có thể cập nhật nhân viên sau.', {
            position: "top-right",
            autoClose: 4000,
          });
        }
      }

      toast.success('Cập nhật ca học hoàn tất!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      navigate('/manager/branch-slots');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật ca học';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [id, formData, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/manager/branch-slots');
  }, [navigate]);

  const steps = useMemo(() => [
    {
      label: 'Thông tin cơ bản',
      component: Step1BasicInfo,
      validation: async (data) => {
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

  if (initialLoading) {
    return (
      <Box sx={{ 
        height: 'calc(100vh - 64px - 48px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

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
        title="Cập nhật Ca Học"
        icon={<BranchSlotIcon />}
        initialData={formData}
        stepProps={{
          timeframeOptions,
          slotTypeOptions,
          roomOptions,
          staffOptions,
          dependenciesLoading,
          branchSlotId: id
        }}
      />
    </Box>
  );
};

export default UpdateBranchSlot;

