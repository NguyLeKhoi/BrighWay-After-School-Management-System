import * as yup from 'yup';

// Benefit validation schema
export const benefitSchema = yup.object({
  name: yup
    .string()
    .required('Tên lợi ích là bắt buộc')
    .min(2, 'Tên lợi ích phải có ít nhất 2 ký tự')
    .max(100, 'Tên lợi ích không được quá 100 ký tự'),
  description: yup
    .string()
    .max(500, 'Mô tả không được quá 500 ký tự'),
  status: yup
    .boolean()
    .default(true)
});

