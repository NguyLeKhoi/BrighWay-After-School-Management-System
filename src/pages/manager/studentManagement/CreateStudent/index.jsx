import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { School as StudentIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import StepperForm from '../../../../components/Common/StepperForm';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Associations from './Step2Associations';
import Step3AdditionalInfo from './Step3AdditionalInfo';
import useStudentDependencies from '../../../../hooks/useStudentDependencies';
import { useAuth } from '../../../../contexts/AuthContext';
import userService from '../../../../services/user.service';
import studentService from '../../../../services/student.service';
import { STUDENT_DEFAULT_VALUES, transformStudentPayload } from '../../../../utils/studentForm.utils';

const CreateStudent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    parentOptions,
    schoolOptions,
    studentLevelOptions,
    loading: dependenciesLoading,
    error: dependenciesError,
    fetchDependencies
  } = useStudentDependencies();

  const [branchInfo, setBranchInfo] = useState({
    id: user?.branchId || '',
    name: user?.branchName || 'Chi nhánh của bạn'
  });
  const [formData, setFormData] = useState({
    ...STUDENT_DEFAULT_VALUES,
    branchId: user?.branchId || ''
  });
  const [loading, setLoading] = useState(false);

  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    const ensureBranchInfo = async () => {
      if (branchInfo.id) return;
      try {
        const currentUser = await userService.getCurrentUser();
        const managerBranchId =
          currentUser?.managerProfile?.branchId ||
          currentUser?.branchId ||
          currentUser?.managerBranchId ||
          '';
        const managerBranchName =
          currentUser?.managerProfile?.branchName ||
          currentUser?.branchName ||
          currentUser?.managerBranchName ||
          branchInfo.name;

        if (managerBranchId) {
          setBranchInfo({ id: managerBranchId, name: managerBranchName });
          setFormData((prev) => ({ ...prev, branchId: managerBranchId }));
        }
      } catch (err) {
      }
    };

    ensureBranchInfo();
  }, [branchInfo.id, branchInfo.name]);

  const handleStep1Complete = useCallback(
    async (data) => {
      if (!data.name?.trim() || !data.dateOfBirth) {
        toast.error('Vui lòng nhập đầy đủ thông tin học sinh');
        return false;
      }
      setFormData((prev) => ({ ...prev, ...data }));
      return true;
    },
    []
  );

  const handleStep2Complete = useCallback(
    async (data) => {
      if (!data.userId || !data.schoolId || !data.studentLevelId) {
        toast.error('Vui lòng chọn phụ huynh, trường học và cấp độ');
        return false;
      }
      setFormData((prev) => ({ ...prev, ...data }));
      return true;
    },
    []
  );

  const handleStep3Complete = useCallback(async (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    return true;
  }, []);

  const handleComplete = useCallback(async (latestData) => {
    const finalData = latestData || formDataRef.current;
    const resolvedBranchId = branchInfo.id || finalData.branchId;

    if (!resolvedBranchId) {
      toast.error('Không xác định được chi nhánh quản lý');
      return;
    }

    if (!finalData.name || !finalData.dateOfBirth || !finalData.userId || !finalData.schoolId || !finalData.studentLevelId) {
      toast.error('Vui lòng hoàn thành đầy đủ thông tin trước khi tạo');
      return;
    }

    const payload = transformStudentPayload({
      ...finalData,
      branchId: resolvedBranchId
    });

    setLoading(true);
    try {
      await studentService.createStudent(payload);
      toast.success('Tạo học sinh thành công!', { position: 'top-right', autoClose: 2000 });
      navigate('/manager/students');
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Không thể tạo học sinh';
      toast.error(message, { position: 'top-right', autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  }, [branchInfo.id, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/manager/students');
  }, [navigate]);

  const steps = useMemo(
    () => [
      {
        label: 'Thông tin học sinh',
        component: Step1BasicInfo,
        validation: handleStep1Complete
      },
      {
        label: 'Liên kết phụ huynh & trường',
        component: Step2Associations,
        validation: handleStep2Complete
      },
      {
        label: 'Thông tin bổ sung',
        component: Step3AdditionalInfo,
        validation: handleStep3Complete
      }
    ],
    [handleStep1Complete, handleStep2Complete, handleStep3Complete]
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
        title="Thêm Học Sinh"
        icon={<StudentIcon />}
        initialData={formData}
        stepProps={{
          parentOptions,
          schoolOptions,
          studentLevelOptions,
          dependenciesLoading: dependenciesLoading || loading,
          branchInfo
        }}
      />
    </Box>
  );
};

export default CreateStudent;


