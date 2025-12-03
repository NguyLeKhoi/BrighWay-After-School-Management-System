import * as yup from 'yup';

// SlotType validation schema
export const slotTypeSchema = yup.object({
  name: yup
    .string()
    .required('Tên loại ca là bắt buộc')
    .min(2, 'Tên loại ca phải có ít nhất 2 ký tự')
    .max(100, 'Tên loại ca không được quá 100 ký tự'),
  description: yup
    .string()
    .max(500, 'Mô tả không được quá 500 ký tự')
});
