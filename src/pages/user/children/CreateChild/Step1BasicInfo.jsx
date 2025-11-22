import React, { useImperativeHandle, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { userChildStep1Schema } from '../../../../utils/validationSchemas/userChildSchemas';

const Step1BasicInfo = React.forwardRef(
  ({ data, updateData, stepIndex, totalSteps, dependenciesLoading = false }, ref) => {
    const formRef = React.useRef(null);

    const fields = useMemo(
      () => [
        {
          section: 'Thông tin học sinh',
          sectionDescription: 'Điền thông tin cơ bản của con bạn.',
          name: 'name',
          label: 'Họ và tên',
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
        },
        {
          name: 'note',
          label: 'Ghi chú (tùy chọn)',
          type: 'textarea',
          placeholder: 'Nhập ghi chú cho con (nếu có)',
          rows: 4,
          gridSize: 12,
          disabled: dependenciesLoading
        },
        {
          name: 'image',
          label: 'Ảnh đại diện (URL - tùy chọn)',
          type: 'text',
          placeholder: 'Nhập đường dẫn ảnh (ví dụ: https://...)',
          gridSize: 12,
          disabled: dependenciesLoading
        }
      ],
      [dependenciesLoading]
    );

    const defaultValues = useMemo(
      () => ({
        name: data.name || '',
        dateOfBirth: data.dateOfBirth || '',
        note: data.note || '',
        image: data.image || ''
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
          Bước {stepIndex + 1}/{totalSteps}: Thông tin cơ bản
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          Nhập tên và ngày sinh của con bạn. Đây là các thông tin bắt buộc để đăng ký.
        </Typography>

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={userChildStep1Schema}
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

Step1BasicInfo.displayName = 'CreateChildStep1BasicInfo';

export default Step1BasicInfo;

