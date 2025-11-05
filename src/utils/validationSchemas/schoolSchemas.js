import * as yup from 'yup';

// School validation schema
export const schoolSchema = yup.object({
  name: yup
    .string()
    .required('Tên trường là bắt buộc')
    .min(2, 'Tên trường phải có ít nhất 2 ký tự')
    .max(100, 'Tên trường không được quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ0-9\s\-.,()]+$/, 'Tên trường chỉ được chứa chữ cái, số, khoảng trắng và ký tự đặc biệt cơ bản'),
  address: yup
    .string()
    .required('Địa chỉ là bắt buộc')
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(200, 'Địa chỉ không được quá 200 ký tự'),
  phoneNumber: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được quá 15 số'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ')
    .max(100, 'Email không được quá 100 ký tự')
});

