import React, { useImperativeHandle, useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { packageStep3Schema } from '../../../../utils/validationSchemas/packageSchemas';

const Step3Benefits = React.forwardRef(
  ({ data, updateData, stepIndex, totalSteps, benefitOptions = [] }, ref) => {
    const formRef = useRef(null);

    const defaultValues = useMemo(
      () => ({
        benefitIds: Array.isArray(data.benefitIds) ? data.benefitIds : []
      }),
      [data.benefitIds]
    );

    const fields = useMemo(
      () => [
        {
          name: 'benefitIds',
          label: 'Lợi ích trong gói',
          type: 'multiselect',
          options: benefitOptions.length
            ? benefitOptions
            : [{ value: '', label: 'Không có lợi ích khả dụng' }],
          helperText: 'Chọn ít nhất một lợi ích để gán cho gói bán.'
        }
      ],
      [benefitOptions]
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
          Bước {stepIndex + 1}/{totalSteps}: Chọn lợi ích
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          Chọn các lợi ích áp dụng cho gói. Những lợi ích này sẽ hiển thị cho nhân viên khi tư vấn.
        </Typography>

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={packageStep3Schema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            fields={fields}
            hideSubmitButton
          />
        </Box>
      </Box>
    );
  }
);

Step3Benefits.displayName = 'PackageStep3Benefits';

export default Step3Benefits;


