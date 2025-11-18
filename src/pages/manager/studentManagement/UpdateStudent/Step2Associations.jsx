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
          sectionDescription: 'Liên kết học sinh với phụ huynh, trường học và cấp độ.',
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
      [data.userId, data.schoolId, data.studentLevelId, parentOptions.length, schoolOptions.length, studentLevelOptions.length]
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
          Kiểm tra hoặc cập nhật phụ huynh, trường học và cấp độ của học sinh.
        </Typography>

        {(parentOptions.length === 0 || schoolOptions.length === 0 || studentLevelOptions.length === 0) && (
          <Alert severity="info" sx={{ mb: 1 }}>
            Vui lòng đảm bảo đã thiết lập đầy đủ phụ huynh, trường học và cấp độ trước khi cập nhật học sinh.
          </Alert>
        )}

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            key={`step2-${data.userId}-${parentOptions.length}-${schoolOptions.length}-${studentLevelOptions.length}`}
            ref={formRef}
            schema={studentStep2Schema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            fields={fields}
            showReset={false}
            hideSubmitButton
            disabled={dependenciesLoading}
          />
        </Box>
      </Box>
    );
  }
);

Step2Associations.displayName = 'UpdateStudentStep2Associations';

export default Step2Associations;



