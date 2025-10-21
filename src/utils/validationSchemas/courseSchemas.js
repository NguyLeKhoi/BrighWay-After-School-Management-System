import * as yup from 'yup';

// Course validation schema
export const courseSchema = yup.object({
  name: yup
    .string()
    .required('Tên khóa học là bắt buộc')
    .min(5, 'Tên khóa học phải có ít nhất 5 ký tự')
    .max(100, 'Tên khóa học không được quá 100 ký tự'),
  description: yup
    .string()
    .required('Mô tả là bắt buộc')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(500, 'Mô tả không được quá 500 ký tự'),
  duration: yup
    .string()
    .required('Thời lượng là bắt buộc'),
  price: yup
    .number()
    .required('Giá là bắt buộc')
    .min(0, 'Giá không được âm')
    .typeError('Giá phải là số')
});
