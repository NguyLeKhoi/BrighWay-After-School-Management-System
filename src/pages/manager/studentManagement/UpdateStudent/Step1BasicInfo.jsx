import React, { useImperativeHandle, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { studentStep1Schema } from '../../../../utils/validationSchemas/studentSchemas';

const Step1BasicInfo = React.forwardRef(
  ({ data, updateData, stepIndex, totalSteps, dependenciesLoading = false }, ref) => {
    const formRef = React.useRef(null);

    const fields = useMemo(
      () => [
        {
          section: 'Thông tin học sinh',
          sectionDescription: 'Điền thông tin cơ bản của học sinh.',
          name: 'name',
          label: 'Họ và tên học sinh',
          type: 'text',
          required: true,
          placeholder: 'Ví dụ: Nguyễn Minh Anh',
          gridSize: 6,
          disabled: dependenciesLoading
        },
        {
          name: 'dateOfBirth',
          label: 'Ngày sinh',
          type: 'date',
          required: true,
          placeholder: 'Chọn ngày sinh',
          gridSize: 6,
          disabled: dependenciesLoading
        }
      ],
      [dependenciesLoading]
    );

    const defaultValues = useMemo(
      () => ({
        name: data.name || '',
        dateOfBirth: data.dateOfBirth || ''
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
          Bước {stepIndex + 1}/{totalSteps}: Thông tin học sinh
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          Cập nhật tên và ngày sinh của học sinh nếu cần.
        </Typography>

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={studentStep1Schema}
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

Step1BasicInfo.displayName = 'UpdateStudentStep1BasicInfo';

export default Step1BasicInfo;



