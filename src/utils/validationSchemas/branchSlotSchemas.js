import * as yup from 'yup';

export const branchSlotSchema = yup.object({
  timeframeId: yup
    .string()
    .required('Vui lòng chọn khung giờ')
    .test('not-empty', 'Vui lòng chọn khung giờ', (value) => value !== '' && value != null),
  slotTypeId: yup
    .string()
    .required('Vui lòng chọn loại ca giữ trẻ')
    .test('not-empty', 'Vui lòng chọn loại ca giữ trẻ', (value) => value !== '' && value != null),
  weekDate: yup
    .mixed()
    .required('Vui lòng chọn ngày trong tuần')
    .test('not-empty', 'Vui lòng chọn ngày trong tuần', (value) => {
      if (value === '' || value == null || value === undefined) return false;
      const numValue = Number(value);
      return !isNaN(numValue) && numValue >= 0 && numValue <= 6;
    })
    .test('valid-range', 'Ngày trong tuần phải từ 0 (Chủ nhật) đến 6 (Thứ 7)', (value) => {
      if (value === '' || value == null || value === undefined) return true; // Let required handle this
      const numValue = Number(value);
      return !isNaN(numValue) && numValue >= 0 && numValue <= 6;
    }),
  status: yup
    .string()
    .required('Vui lòng chọn trạng thái')
    .oneOf(['Available', 'Full', 'Cancelled'], 'Trạng thái không hợp lệ')
});

