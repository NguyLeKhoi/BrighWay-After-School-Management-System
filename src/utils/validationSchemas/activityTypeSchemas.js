import * as yup from 'yup';

// ActivityType validation schema
export const activityTypeSchema = yup.object({
  name: yup
    .string()
    .required('Tên loại hoạt động là bắt buộc')
    .min(2, 'Tên loại hoạt động phải có ít nhất 2 ký tự')
    .max(100, 'Tên loại hoạt động không được quá 100 ký tự'),
  description: yup
    .string()
    .max(500, 'Mô tả không được quá 500 ký tự')
});

