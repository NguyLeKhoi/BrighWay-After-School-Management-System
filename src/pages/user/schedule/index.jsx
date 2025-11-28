import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarToday as ScheduleIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import StepperForm from '../../../components/Common/StepperForm';
import Step1SelectStudent from './Step1SelectStudent';
import Step2SelectSlot from './Step2SelectSlot';
import Step3SelectDate from './Step3SelectDate';
import Step4SelectPackage from './Step4SelectPackage';
import Step5Confirm from './Step5Confirm';
import studentSlotService from '../../../services/studentSlot.service';
import studentService from '../../../services/student.service';
import packageService from '../../../services/package.service';
import { useApp } from '../../../contexts/AppContext';

const WEEKDAY_LABELS = {
  0: 'Chủ nhật',
  1: 'Thứ hai',
  2: 'Thứ ba',
  3: 'Thứ tư',
  4: 'Thứ năm',
  5: 'Thứ sáu',
  6: 'Thứ bảy'
};

const MySchedule = () => {
  const navigate = useNavigate();
  const { childId } = useParams(); // Get childId from URL if coming from child schedule page
  const { addNotification } = useApp();
  const [isBooking, setIsBooking] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);

  // Load child data if childId is provided in URL
  useEffect(() => {
    const loadChildData = async () => {
      if (childId) {
        setIsLoadingInitialData(true);
        try {
          const child = await studentService.getMyChildById(childId);
          setInitialData({
            studentId: childId,
            studentName: child?.name || child?.userName || ''
          });
        } catch (err) {
          // If child not found or no permission, navigate back
          navigate(`/user/management/schedule/${childId}`);
        } finally {
          setIsLoadingInitialData(false);
        }
      }
    };
    loadChildData();
  }, [childId, navigate]);

  const getNextSlotDate = (slot) => {
    const now = new Date();
    if (!slot) {
      return now;
    }

    const targetWeekDay = typeof slot.weekDay === 'number' ? slot.weekDay : now.getDay();
    const todayWeekDay = now.getDay();
    let diff = targetWeekDay - todayWeekDay;
    if (diff < 0) diff += 7;

    const result = new Date(now);
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() + diff);

    const time = slot.startTime || '08:00';
    const [hours = '8', minutes = '0'] = time.split(':');
    result.setHours(Number(hours), Number(minutes), 0, 0);

    // Nếu slot đã trôi qua trong ngày hôm nay, chuyển sang tuần sau
    if (diff === 0 && result <= now) {
      result.setDate(result.getDate() + 7);
    }

    return result;
  };

  const handleComplete = useCallback(async (formData) => {
    if (!formData.studentId || !formData.slotId || !formData.subscriptionId || !formData.selectedDate) {
      addNotification({
        message: 'Vui lòng hoàn thành đầy đủ thông tin',
        severity: 'warning'
      });
      return;
    }
    
    // RoomId is optional - backend will auto-assign if not provided
    // But we'll try to use it if available

    setIsBooking(true);
    try {
      // Get student name for display
      let studentName = '';
      try {
        const student = await studentService.getMyChildById(formData.studentId);
        studentName = student?.name || '';
      } catch (err) {
      }

      // Get subscription name for display
      let subscriptionName = '';
      try {
        const subscriptions = await packageService.getSubscriptionsByStudent(formData.studentId);
        const items = Array.isArray(subscriptions) 
          ? subscriptions 
          : Array.isArray(subscriptions?.items) 
            ? subscriptions.items 
            : [];
        const selectedSub = items.find(s => s.id === formData.subscriptionId);
        subscriptionName = selectedSub?.packageName || '';
      } catch (err) {
      }

      // Use selected date from formData, or fallback to calculated date
      let selectedDate = formData.selectedDate instanceof Date 
        ? new Date(formData.selectedDate) 
        : new Date(formData.selectedDate);
      
      // Validate that selected date matches slot's weekday
      if (formData.slot?.weekDay !== undefined) {
        const selectedWeekDay = selectedDate.getDay();
        const slotWeekDay = formData.slot.weekDay;
        
        if (selectedWeekDay !== slotWeekDay) {
          addNotification({
            message: `Ngày đã chọn không khớp với lịch học của slot. Slot này chỉ có vào ${WEEKDAY_LABELS[slotWeekDay] || 'ngày phù hợp'}.`,
            severity: 'error'
          });
          setIsBooking(false);
          return;
        }
      }
      
      // Ensure date has time from slot
      if (formData.slot?.startTime) {
        const time = formData.slot.startTime;
        const [hours = '8', minutes = '0'] = time.split(':');
        selectedDate.setHours(Number(hours), Number(minutes), 0, 0);
      }
      
      // Convert to ISO string for API
      const isoDate = selectedDate.toISOString();

      await studentSlotService.bookSlot({
        studentId: formData.studentId,
        branchSlotId: formData.slotId,
        packageSubscriptionId: formData.subscriptionId,
        roomId: formData.roomId || null, // Optional - backend will auto-assign if null
        date: isoDate,
        parentNote: formData.parentNote || ''
      });

      addNotification({
        message: 'Đặt lịch học thành công!',
        severity: 'success'
      });

      toast.success('Đặt lịch học thành công!', {
        position: 'top-right',
        autoClose: 3000
      });

      // Navigate back - if came from child schedule, go back there
      if (childId) {
        navigate(`/user/management/schedule/${childId}`);
      } else {
        navigate('/user/management/children');
      }
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể đặt lịch học';
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
    } finally {
      setIsBooking(false);
    }
  }, [navigate, addNotification]);

  const handleCancel = useCallback(() => {
    // Navigate back - if came from child schedule, go back there
    if (childId) {
      navigate(`/user/management/schedule/${childId}`);
    } else {
      navigate('/user/management/children');
    }
  }, [navigate, childId]);

  // Filter steps - skip step 1 (chọn trẻ em) if childId is provided
  const allSteps = [
    {
      label: 'Chọn trẻ em',
      component: Step1SelectStudent,
      validation: async (data) => {
        if (!data.studentId) {
          addNotification({
            message: 'Vui lòng chọn trẻ em',
            severity: 'warning'
          });
          return false;
        }
        return true;
      }
    },
    {
      label: 'Chọn slot',
      component: Step2SelectSlot,
      validation: async (data) => {
        if (!data.slotId) {
          addNotification({
            message: 'Vui lòng chọn slot phù hợp',
            severity: 'warning'
          });
          return false;
        }
        return true;
      }
    },
    {
      label: 'Chọn ngày',
      component: Step3SelectDate,
      validation: async (data) => {
        if (!data.selectedDate) {
          addNotification({
            message: 'Vui lòng chọn ngày học',
            severity: 'warning'
          });
          return false;
        }
        return true;
      }
    },
    {
      label: 'Chọn gói',
      component: Step4SelectPackage,
      validation: async (data) => {
        if (!data.subscriptionId) {
          addNotification({
            message: 'Vui lòng chọn gói đã mua',
            severity: 'warning'
          });
          return false;
        }
        return true;
      }
    },
    {
      label: 'Xác nhận',
      component: Step5Confirm,
      validation: async () => true
    }
  ];

  // Skip step 1 if childId is provided (student already selected)
  const steps = childId ? allSteps.slice(1) : allSteps;

  // Show loading while loading initial data
  if (childId && isLoadingInitialData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div>Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <StepperForm
      steps={steps}
      onComplete={handleComplete}
      onCancel={handleCancel}
      initialData={initialData}
      title={childId ? `Đăng ký ca chăm sóc cho ${initialData.studentName || 'con'}` : 'Đăng ký ca chăm sóc'}
      icon={<ScheduleIcon />}
    />
  );
};

export default MySchedule;
