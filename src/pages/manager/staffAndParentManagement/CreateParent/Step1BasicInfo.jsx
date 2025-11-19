import React, { useImperativeHandle, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { createParentBasicInfoSchema } from '../../../../utils/validationSchemas/parentSchemas';

const Step1BasicInfo = React.forwardRef(
  ({ data, updateData, stepIndex, totalSteps }, ref) => {
    const formRef = React.useRef(null);

    const fields = useMemo(
      () => [
        {
          section: 'Thông tin cơ bản',
          sectionDescription: 'Nhập thông tin cơ bản của phụ huynh.',
          name: 'name',
          label: 'Họ và tên',
          type: 'text',
          required: true,
          placeholder: 'Ví dụ: Nguyễn Văn A',
          gridSize: 12
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: 'Ví dụ: email@example.com',
          gridSize: 6
        },
        {
          name: 'password',
          label: 'Mật khẩu',
          type: 'password',
          required: true,
          placeholder: 'Nhập mật khẩu (tối thiểu 6 ký tự)',
          gridSize: 6
        }
      ],
      []
    );

    const defaultValues = useMemo(
      () => ({
        name: data.name || '',
        email: data.email || '',
        password: data.password || ''
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
          Nhập thông tin cơ bản của phụ huynh. Email và mật khẩu sẽ được dùng để đăng nhập.
        </Typography>

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={createParentBasicInfoSchema}
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

Step1BasicInfo.displayName = 'CreateParentStep1BasicInfo';

export default Step1BasicInfo;





