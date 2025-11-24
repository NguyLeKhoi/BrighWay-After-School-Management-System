import React, { useImperativeHandle, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { studentStep3Schema } from '../../../../utils/validationSchemas/studentSchemas';

const Step3AdditionalInfo = React.forwardRef(
  ({ data, updateData, stepIndex, totalSteps, dependenciesLoading = false }, ref) => {
    const formRef = React.useRef(null);

    const fields = useMemo(
      () => [
        {
          section: 'Thông tin bổ sung',
          sectionDescription: 'Thêm ảnh đại diện hoặc ghi chú cho trẻ em (nếu có).',
          name: 'image',
          label: 'Ảnh đại diện (URL)',
          type: 'text',
          placeholder: 'Nhập đường dẫn ảnh (ví dụ: https://...)',
          gridSize: 12,
          disabled: dependenciesLoading
        },
        {
          name: 'note',
          label: 'Ghi chú',
          type: 'textarea',
          placeholder: 'Nhập ghi chú cho trẻ em (tối đa 500 ký tự)',
          rows: 4,
          gridSize: 12,
          disabled: dependenciesLoading
        }
      ],
      [dependenciesLoading]
    );

    const defaultValues = useMemo(
      () => ({
        image: data.image || '',
        note: data.note || ''
      }),
      [data]
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
          Bước {stepIndex + 1}/{totalSteps}: Thông tin bổ sung
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          Bạn có thể thêm ảnh đại diện hoặc ghi chú để hoàn thiện hồ sơ trẻ em. Đây là bước tùy chọn.
        </Typography>

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={studentStep3Schema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            fields={fields}
            hideSubmitButton
            disabled={dependenciesLoading}
          />
        </Box>
      </Box>
    );
  }
);

Step3AdditionalInfo.displayName = 'CreateStudentStep3AdditionalInfo';

export default Step3AdditionalInfo;



