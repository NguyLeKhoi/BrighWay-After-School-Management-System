import * as yup from 'yup';

/**
 * Contact Request Schema
 * Validates contact form submission from public website
 */
export const contactRequestSchema = yup.object().shape({
  parentName: yup
    .string()
    .required('Họ và tên phụ huynh là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự'),
  
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ')
    .max(100, 'Email không được vượt quá 100 ký tự'),
  
  phoneNumber: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  
  childrenAgeRange: yup
    .string()
    .optional()
    .max(50, 'Độ tuổi không được vượt quá 50 ký tự'),
  
  message: yup
    .string()
    .required('Nội dung yêu cầu là bắt buộc')
    .min(10, 'Nội dung phải có ít nhất 10 ký tự')
    .max(1000, 'Nội dung không được vượt quá 1000 ký tự')
});

