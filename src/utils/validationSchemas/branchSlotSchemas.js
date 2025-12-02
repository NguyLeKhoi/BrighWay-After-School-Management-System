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
  date: yup
    .date()
    .required('Vui lòng chọn ngày')
    .typeError('Ngày không hợp lệ'),
  status: yup
    .string()
    .required('Vui lòng chọn trạng thái')
    .oneOf(['Available', 'Occupied', 'Cancelled', 'Maintenance'], 'Trạng thái không hợp lệ')
});

