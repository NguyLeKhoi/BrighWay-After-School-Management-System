import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { PersonAdd as AddChildIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import StepperForm from '../../../../components/Common/StepperForm';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Associations from './Step2Associations';
import useUserChildDependencies from '../../../../hooks/useUserChildDependencies';
import studentService from '../../../../services/student.service';
import userService from '../../../../services/user.service';

const CHILD_DEFAULT_VALUES = {
  name: '',
  dateOfBirth: '',
  note: '',
  image: '',
  branchId: '',
  schoolId: '',
  studentLevelId: ''
};

const CreateChild = () => {
  const navigate = useNavigate();

  const {
    branchOptions,
    schoolOptions,
    studentLevelOptions,
    loading: dependenciesLoading,
    error: dependenciesError,
    fetchDependencies
  } = useUserChildDependencies();

  const [formData, setFormData] = useState(CHILD_DEFAULT_VALUES);
  const [loading, setLoading] = useState(false);
  const [userBranchId, setUserBranchId] = useState(null);
  const [userBranchName, setUserBranchName] = useState('');

  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  // Lấy branchId từ user hiện tại - chạy ngay khi component mount
  useEffect(() => {
    const loadUserBranch = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        const branchId = currentUser?.branchId || currentUser?.branch?.id || null;
        const branchName = currentUser?.branchName || currentUser?.branch?.branchName || '';
        
        if (branchId) {
          setUserBranchId(branchId);
          setUserBranchName(branchName);
          // Đảm bảo branchId được set vào formData ngay lập tức
          setFormData((prev) => ({ ...prev, branchId }));
        }
      } catch (err) {
        console.error('Không thể lấy thông tin chi nhánh của user:', err);
      }
    };

    loadUserBranch();
  }, []);

  const handleStep1Complete = useCallback(
    async (data) => {
      if (!data.name?.trim() || !data.dateOfBirth) {
        toast.error('Vui lòng nhập đầy đủ tên và ngày sinh');
        return false;
      }
      setFormData((prev) => ({ ...prev, ...data }));
      return true;
    },
    []
  );

  const handleStep2Complete = useCallback(
    async (data) => {
      // branchId đã được set tự động từ user, chỉ cần kiểm tra schoolId và studentLevelId
      const finalBranchId = data.branchId || userBranchId || formData.branchId;
      if (!finalBranchId || !data.schoolId || !data.studentLevelId) {
        toast.error('Vui lòng chọn đầy đủ trường học và cấp độ');
        return false;
      }
      setFormData((prev) => ({ ...prev, ...data, branchId: finalBranchId }));
      return true;
    },
    [userBranchId, formData.branchId]
  );

  const handleComplete = useCallback(async (latestData) => {
    const finalData = latestData || formDataRef.current;
    
    if (!finalData.name || !finalData.dateOfBirth || !finalData.branchId || !finalData.schoolId || !finalData.studentLevelId) {
      toast.error('Vui lòng hoàn thành đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      
      // Basic info
      formDataToSend.append('Name', finalData.name);
      formDataToSend.append('DateOfBirth', finalData.dateOfBirth);
      if (finalData.note) {
        formDataToSend.append('Note', finalData.note);
      }
      if (finalData.image) {
        formDataToSend.append('Image', finalData.image);
      }
      
      // Associations
      formDataToSend.append('BranchId', finalData.branchId);
      formDataToSend.append('SchoolId', finalData.schoolId);
      formDataToSend.append('StudentLevelId', finalData.studentLevelId);

      await studentService.registerChild(formDataToSend);
      toast.success('Đăng ký con thành công! Hồ sơ sẽ được xem xét và duyệt bởi quản lý.', {
        position: 'top-right',
        autoClose: 3000
      });
      navigate('/family/children');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Không thể đăng ký con';
      toast.error(message, { position: 'top-right', autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate('/family/children');
  }, [navigate]);

  const steps = useMemo(
    () => [
      {
        label: 'Thông tin cơ bản',
        component: Step1BasicInfo,
        validation: handleStep1Complete
      },
      {
        label: 'Chi nhánh & Trường học',
        component: Step2Associations,
        validation: handleStep2Complete
      }
    ],
    [handleStep1Complete, handleStep2Complete]
  );

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px - 48px)', display: 'flex', flexDirection: 'column' }}>
      {dependenciesError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {dependenciesError}
        </Typography>
      )}
      <StepperForm
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        title="Đăng ký con"
        icon={<AddChildIcon />}
        initialData={formData}
        stepProps={{
          branchOptions,
          schoolOptions,
          studentLevelOptions,
          dependenciesLoading: dependenciesLoading || loading,
          userBranchId,
          userBranchName
        }}
      />
    </Box>
  );
};

export default CreateChild;

