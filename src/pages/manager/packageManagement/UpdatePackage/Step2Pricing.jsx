import React, { useImperativeHandle, useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { packageStepPricingSchema } from '../../../../utils/validationSchemas/packageSchemas';

const Step2Pricing = React.forwardRef(
  ({ data, updateData, stepIndex, totalSteps, selectedTemplate = null }, ref) => {
    const formRef = useRef(null);

    const defaultValues = useMemo(
      () => ({
        price: data.price ?? '',
        durationInMonths: data.durationInMonths ?? '',
        totalSlots: data.totalSlots ?? ''
      }),
      [data]
    );

    const fields = useMemo(
      () => [
        {
          section: 'Điều chỉnh thông số gói',
          sectionDescription: 'Cập nhật giá bán, thời hạn và số slot theo nhu cầu mới.',
          name: 'price',
          label: 'Giá (VNĐ)',
          type: 'number',
          required: true,
          placeholder: selectedTemplate
            ? `Khoảng: ${selectedTemplate.minPrice?.toLocaleString('vi-VN') ?? '-'} - ${selectedTemplate.maxPrice?.toLocaleString('vi-VN') ?? '-'}`
            : 'Nhập giá bán'
        },
        {
          name: 'durationInMonths',
          label: 'Thời hạn (tháng)',
          type: 'number',
          required: true,
          placeholder: selectedTemplate
            ? `Khoảng: ${selectedTemplate.minDurationInMonths ?? '-'} - ${selectedTemplate.maxDurationInMonths ?? '-'}`
            : 'Nhập số tháng áp dụng'
        },
        {
          name: 'totalSlots',
          label: 'Tổng số slot',
          type: 'number',
          required: true,
          placeholder: selectedTemplate
            ? `Khoảng: ${selectedTemplate.minSlots ?? '-'} - ${selectedTemplate.maxSlots ?? '-'}`
            : 'Nhập số slot'
        }
      ],
      [selectedTemplate]
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
          Bước {stepIndex + 1}/{totalSteps}: Giá & thời hạn
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          Điều chỉnh các thông số tài chính để phù hợp với chính sách mới.
        </Typography>

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={packageStepPricingSchema(selectedTemplate)}
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

Step2Pricing.displayName = 'UpdatePackageStep2Pricing';

export default Step2Pricing;


