import React, { useImperativeHandle, useMemo, useRef } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
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
          section: 'Thiết lập thông số gói',
          sectionDescription: 'Nhập giá bán, thời hạn sử dụng và tổng số slot của gói.',
          name: 'price',
          label: 'Giá (VNĐ)',
          type: 'number',
          required: true,
          placeholder: 'Nhập giá bán',
          helperText: selectedTemplate
            ? `Khoảng cho phép: ${selectedTemplate.minPrice?.toLocaleString('vi-VN') ?? '-'} - ${selectedTemplate.maxPrice?.toLocaleString('vi-VN') ?? '-'} VNĐ`
            : 'Nhập giá bán của gói'
        },
        {
          name: 'durationInMonths',
          label: 'Thời hạn (tháng)',
          type: 'number',
          required: true,
          placeholder: 'Nhập số tháng áp dụng',
          helperText: selectedTemplate
            ? `Khoảng cho phép: ${selectedTemplate.minDurationInMonths ?? '-'} - ${selectedTemplate.maxDurationInMonths ?? '-'} tháng`
            : 'Nhập thời hạn áp dụng của gói'
        },
        {
          name: 'totalSlots',
          label: 'Tổng số slot',
          type: 'number',
          required: true,
          placeholder: 'Nhập số slot',
          helperText: selectedTemplate
            ? `Khoảng cho phép: ${selectedTemplate.minSlots ?? '-'} - ${selectedTemplate.maxSlots ?? '-'} slot`
            : 'Nhập tổng số slot của gói'
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
          Thiết lập giá bán, thời hạn áp dụng và tổng số slot theo yêu cầu chi nhánh.
        </Typography>

        {selectedTemplate && (
          <Alert 
            severity="info" 
            icon={<InfoIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
              Khoảng giá trị cho phép theo mẫu gói "{selectedTemplate.name}":
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>Giá:</strong> {selectedTemplate.minPrice?.toLocaleString('vi-VN') ?? '-'} - {selectedTemplate.maxPrice?.toLocaleString('vi-VN') ?? '-'} VNĐ
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Thời hạn:</strong> {selectedTemplate.minDurationInMonths ?? '-'} - {selectedTemplate.maxDurationInMonths ?? '-'} tháng
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Số slot:</strong> {selectedTemplate.minSlots ?? '-'} - {selectedTemplate.maxSlots ?? '-'} slot
                </Typography>
              </li>
            </Box>
          </Alert>
        )}

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

Step2Pricing.displayName = 'PackageStep2Pricing';

export default Step2Pricing;


