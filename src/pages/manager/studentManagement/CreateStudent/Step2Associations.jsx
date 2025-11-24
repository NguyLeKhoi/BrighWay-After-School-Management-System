import React, { useImperativeHandle, useMemo } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { studentStep2Schema } from '../../../../utils/validationSchemas/studentSchemas';

const Step2Associations = React.forwardRef(
  (
    {
      data,
      updateData,
      stepIndex,
      totalSteps,
      parentOptions = [],
      schoolOptions = [],
      studentLevelOptions = [],
      dependenciesLoading = false,
      branchInfo
    },
    ref
  ) => {
    const formRef = React.useRef(null);

    const fields = useMemo(
      () => [
        {
          section: 'Thông tin liên kết',
          sectionDescription: 'Liên kết trẻ em với phụ huynh, trường học và cấp độ.',
          name: 'userId',
          label: 'Phụ huynh',
          type: 'select',
          required: true,
          options: parentOptions,
          disabled: dependenciesLoading || parentOptions.length === 0,
          helperText: parentOptions.length === 0 ? 'Chưa có phụ huynh khả dụng' : undefined,
          gridSize: 6
        },
        {
          name: 'schoolId',
          label: 'Trường học',
          type: 'select',
          required: true,
          options: schoolOptions,
          disabled: dependenciesLoading || schoolOptions.length === 0,
          helperText: schoolOptions.length === 0 ? 'Chưa có trường học khả dụng' : undefined,
          gridSize: 6
        },
        {
          name: 'studentLevelId',
          label: 'Cấp độ',
          type: 'select',
          required: true,
          options: studentLevelOptions,
          disabled: dependenciesLoading || studentLevelOptions.length === 0,
          helperText: studentLevelOptions.length === 0 ? 'Chưa có cấp độ khả dụng' : undefined,
          gridSize: 6
        }
      ],
      [dependenciesLoading, parentOptions, schoolOptions, studentLevelOptions]
    );

    const defaultValues = useMemo(
      () => ({
        userId: data.userId || '',
        schoolId: data.schoolId || '',
        studentLevelId: data.studentLevelId || ''
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
          Bước {stepIndex + 1}/{totalSteps}: Liên kết phụ huynh & trường học
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          Chọn phụ huynh, trường học và cấp độ tương ứng cho trẻ em. Chi nhánh hiện tại:{' '}
          <strong>{branchInfo?.name || 'Chưa xác định'}</strong>
        </Typography>

        {(parentOptions.length === 0 || schoolOptions.length === 0 || studentLevelOptions.length === 0) && (
          <Alert severity="info" sx={{ mb: 1 }}>
            Vui lòng đảm bảo đã thiết lập đầy đủ phụ huynh, trường học và cấp độ trước khi tạo trẻ em.
          </Alert>
        )}

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={studentStep2Schema}
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

Step2Associations.displayName = 'CreateStudentStep2Associations';

export default Step2Associations;



