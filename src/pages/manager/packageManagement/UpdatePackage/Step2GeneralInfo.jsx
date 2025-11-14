import React, { useImperativeHandle, useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { packageStepGeneralSchema } from '../../../../utils/validationSchemas/packageSchemas';

const Step2GeneralInfo = React.forwardRef(
  ({ data, updateData, stepIndex, totalSteps, studentLevelOptions = [], dependenciesLoading = false }, ref) => {
    const formRef = useRef(null);

    const defaultValues = useMemo(
      () => ({
        name: data.name || '',
        desc: data.desc || '',
        studentLevelId: data.studentLevelId || '',
        isActive: data.isActive ?? true
      }),
      [data]
    );

    const fields = useMemo(
      () => [
        {
          name: 'name',
          label: 'Tên gói',
          type: 'text',
          required: true,
          placeholder: 'Nhập tên gói bán',
          gridSize: 8
        },
        {
          name: 'isActive',
          label: 'Trạng thái hoạt động',
          type: 'switch',
          gridSize: 4
        },
        {
          name: 'desc',
          label: 'Mô tả',
          type: 'textarea',
          rows: 3,
          gridSize: 12,
          placeholder: 'Cập nhật mô tả nếu cần thiết'
        },
        {
          section: 'Liên kết dữ liệu',
          name: 'studentLevelId',
          label: 'Cấp độ học sinh',
          type: 'select',
          required: true,
          gridSize: 6,
          disabled: dependenciesLoading || studentLevelOptions.length === 0,
          options: studentLevelOptions.length
            ? [{ value: '', label: 'Chọn cấp độ' }, ...studentLevelOptions]
            : [{ value: '', label: 'Không có cấp độ khả dụng' }]
        }
      ],
      [dependenciesLoading, studentLevelOptions]
    );

    const handleSubmit = async (formValues) => {
      updateData(formValues);
      return true;
    };

    useImperativeHandle(ref, () => ({
      submit: async () => {
        if (formRef.current?.submit) {
          return await formRef.current.submit();
        }
        return false;
      }
    }));

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0.75, fontWeight: 600, fontSize: '1.1rem' }}>
          Bước {stepIndex + 1}/{totalSteps}: Thông tin chung
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          Kiểm tra và cập nhật tên gói, mô tả cũng như cấp độ học sinh áp dụng.
        </Typography>

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={packageStepGeneralSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            fields={fields}
            showReset={false}
            hideSubmitButton
          />
        </Box>
      </Box>
    );
  }
);

Step2GeneralInfo.displayName = 'UpdatePackageStep2GeneralInfo';

export default Step2GeneralInfo;


