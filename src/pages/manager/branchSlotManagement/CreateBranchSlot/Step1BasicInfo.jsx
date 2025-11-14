import React, { useMemo, useImperativeHandle, forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { createBranchSlotFormFields } from '../../../../constants/branchSlot/formFields';
import { branchSlotSchema } from '../../../../utils/validationSchemas/branchSlotSchemas';

const WEEK_DAYS = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' }
];

const Step1BasicInfo = forwardRef(({ data, updateData, stepIndex, totalSteps, timeframeOptions = [], slotTypeOptions = [], dependenciesLoading = false }, ref) => {

  const timeframeSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn khung giờ' },
      ...timeframeOptions.map((tf) => ({
        value: tf.id,
        label: `${tf.name} (${tf.startTime} - ${tf.endTime})`
      }))
    ],
    [timeframeOptions]
  );

  const slotTypeSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn loại ca học' },
      ...slotTypeOptions.map((st) => ({
        value: st.id,
        label: st.name
      }))
    ],
    [slotTypeOptions]
  );

  const weekDateSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn ngày trong tuần' },
      ...WEEK_DAYS.map((day) => ({
        value: String(day.value), // Ensure value is string for consistency
        label: day.label
      }))
    ],
    []
  );

  const formFields = useMemo(
    () =>
      createBranchSlotFormFields({
        actionLoading: false,
        dependenciesLoading,
        timeframeSelectOptions,
        slotTypeSelectOptions,
        weekDateOptions: weekDateSelectOptions
      }),
    [dependenciesLoading, timeframeSelectOptions, slotTypeSelectOptions, weekDateSelectOptions]
  );

  const defaultValues = useMemo(
    () => ({
      timeframeId: data.timeframeId || '',
      slotTypeId: data.slotTypeId || '',
      weekDate: data.weekDate || '',
      status: data.status || 'Available'
    }),
    [data]
  );

  const formRef = React.useRef(null);

  const handleSubmit = async (formData) => {
    updateData({
      timeframeId: formData.timeframeId,
      slotTypeId: formData.slotTypeId,
      weekDate: formData.weekDate,
      status: formData.status
    });
    return true;
  };

  // Expose submit function to parent (StepperForm)
  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (formRef.current && formRef.current.submit) {
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
        Điền thông tin cơ bản về ca học. Sau khi hoàn thành, bạn sẽ có thể gán phòng và nhân viên.
      </Typography>
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Form
        ref={formRef}
        schema={branchSlotSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        fields={formFields}
        showReset={false}
        hideSubmitButton={true}
        disabled={dependenciesLoading}
      />
      </Box>
    </Box>
  );
});

Step1BasicInfo.displayName = 'Step1BasicInfo';

export default Step1BasicInfo;

