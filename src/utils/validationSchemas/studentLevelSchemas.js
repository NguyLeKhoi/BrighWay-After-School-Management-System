import * as yup from 'yup';

// Student Level validation schema
export const studentLevelSchema = yup.object({
  name: yup
    .string()
    .required('Tên cấp độ là bắt buộc')
    .min(2, 'Tên cấp độ phải có ít nhất 2 ký tự')
    .max(100, 'Tên cấp độ không được quá 100 ký tự'),
  description: yup
    .string()
    .max(500, 'Mô tả không được quá 500 ký tự')
});

