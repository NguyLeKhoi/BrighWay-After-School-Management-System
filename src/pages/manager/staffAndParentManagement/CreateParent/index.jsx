import React, { useCallback, useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { FamilyRestroom as FamilyIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import StepperForm from '../../../../components/Common/StepperForm';
import ConfirmDialog from '../../../../components/Common/ConfirmDialog';
import Step1OCR from './Step1OCR';
import Step1BasicInfo from './Step1BasicInfo';
import Step2CCCDInfo from './Step2CCCDInfo';
import userService from '../../../../services/user.service';

const CreateParent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'manual'; // 'ocr' or 'manual'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    identityCardNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    issuedDate: '',
    issuedPlace: '',
    identityCardPublicId: ''
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const formDataRef = useRef(formData);

  React.useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const handleStep1Complete = useCallback(
    async (data) => {
      if (mode === 'ocr') {
        // For OCR mode, just need to have extracted data
        if (!data.identityCardPublicId && !data.name) {
          toast.error('Vui lòng trích xuất thông tin từ ảnh CCCD');
          return false;
        }
      } else {
        // For manual mode, need email and password
        if (!data.email || !data.password || !data.name) {
          toast.error('Vui lòng nhập đầy đủ thông tin cơ bản');
          return false;
        }
      }
      setFormData((prev) => ({ ...prev, ...data }));
      return true;
    },
    [mode]
  );

  const handleStep2Complete = useCallback(
    async (data) => {
      setFormData((prev) => ({ ...prev, ...data }));
      return true;
    },
    []
  );

  const handleComplete = useCallback(
    async (latestData) => {
      const finalData = latestData || formDataRef.current;

      // Validate required fields
      if (!finalData.name || !finalData.email || !finalData.password) {
        toast.error('Vui lòng hoàn thành đầy đủ thông tin bắt buộc');
        return;
      }

      // Show confirm dialog
      setConfirmData(finalData);
      setShowConfirmDialog(true);
    },
    []
  );

  const handleConfirm = useCallback(async () => {
    if (!confirmData) return;

    setShowConfirmDialog(false);
    setLoading(true);

    try {
      // Helper function to convert dd/mm/yyyy or YYYY-MM-DD to ISO string for API
      const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        
        let date;
        // If in dd/mm/yyyy format
        if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
          const [day, month, year] = dateString.split('/');
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        // If in YYYY-MM-DD format
        else if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          date = new Date(dateString + 'T00:00:00');
        }
        // If already ISO string, return as is
        else if (typeof dateString === 'string' && dateString.includes('T')) {
          return dateString;
        }
        // Try to parse as Date
        else {
          try {
            date = new Date(dateString);
          } catch {
            return null;
          }
        }
        
        if (!date || isNaN(date.getTime())) return null;
        return date.toISOString();
      };

      // If has CCCD data, use with CCCD endpoint
      if (confirmData.identityCardNumber || confirmData.identityCardPublicId) {
        const payload = {
          ...confirmData,
          dateOfBirth: formatDateForAPI(confirmData.dateOfBirth),
          issuedDate: formatDateForAPI(confirmData.issuedDate)
        };
        await userService.createParentWithCCCD(payload);
      } else {
        // Otherwise use regular endpoint
        const parentData = {
          email: confirmData.email,
          password: confirmData.password,
          name: confirmData.name
        };
        await userService.createParent(parentData);
      }

      toast.success(`Tạo tài khoản User (Parent) "${confirmData.name}" thành công!`);
      navigate('/manager/staffAndParent');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản User (Parent)';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [confirmData, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/manager/staffAndParent');
  }, [navigate]);

  const steps = useMemo(
    () => {
      if (mode === 'ocr') {
        return [
          {
            label: 'Chụp ảnh CCCD',
            component: Step1OCR,
            validation: handleStep1Complete
          },
          {
            label: 'Thông tin CCCD & Tài khoản',
            component: Step2CCCDInfo,
            validation: handleStep2Complete
          }
        ];
      } else {
        return [
          {
            label: 'Thông tin cơ bản',
            component: Step1BasicInfo,
            validation: handleStep1Complete
          },
          {
            label: 'Thông tin CCCD',
            component: Step2CCCDInfo,
            validation: handleStep2Complete
          }
        ];
      }
    },
    [mode, handleStep1Complete, handleStep2Complete]
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    try {
      // If in dd/mm/yyyy format, return as is
      if (typeof dateString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
      }
      // If in YYYY-MM-DD format, convert to dd/mm/yyyy
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
      // Otherwise try to parse as Date
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getConfirmDescription = () => {
    if (!confirmData) return '';
    
    const parts = [
      `Họ và tên: ${confirmData.name || 'Chưa có'}`,
      `Email: ${confirmData.email || 'Chưa có'}`,
      `Số CCCD: ${confirmData.identityCardNumber || 'Chưa có'}`,
      `Ngày sinh: ${formatDate(confirmData.dateOfBirth)}`,
      `Giới tính: ${confirmData.gender || 'Chưa có'}`,
      `Địa chỉ: ${confirmData.address || 'Chưa có'}`,
      `Ngày cấp: ${formatDate(confirmData.issuedDate)}`,
      `Nơi cấp: ${confirmData.issuedPlace || 'Chưa có'}`
    ];

    return parts.join('\n');
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px - 48px)', display: 'flex', flexDirection: 'column' }}>
      <StepperForm
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        title={mode === 'ocr' ? 'Tạo tài khoản Phụ huynh (OCR)' : 'Tạo tài khoản Phụ huynh'}
        icon={<FamilyIcon />}
        initialData={formData}
        stepProps={{
          mode
        }}
      />

      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirm}
        title="Xác nhận tạo tài khoản Phụ huynh"
        description={getConfirmDescription()}
        confirmText="Xác nhận tạo"
        cancelText="Hủy"
        confirmColor="primary"
        showWarningIcon={true}
      />
    </Box>
  );
};

export default CreateParent;

