import * as yup from 'yup';

// User validation schema for creating new user
export const createUserSchema = yup.object({
  fullName: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  phoneNumber: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được quá 15 số'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được quá 50 ký tự'),
  role: yup
    .number()
    .required('Vai trò là bắt buộc')
    .oneOf([0, 1], 'Vai trò không hợp lệ (chỉ cho phép Staff hoặc Teacher)')
});

// User validation schema for admin creating Manager and Staff accounts
export const createUserByAdminSchema = yup.object({
  fullName: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  phoneNumber: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được quá 15 số'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được quá 50 ký tự'),
  role: yup
    .number()
    .required('Vai trò là bắt buộc')
    .oneOf([1, 2], 'Vai trò không hợp lệ (chỉ cho phép Manager hoặc Staff)')
});

// User validation schema for updating existing user (Admin updates Manager/Staff)
export const updateUserSchema = yup.object({
  fullName: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  phoneNumber: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được quá 15 số'),
  changeRoleTo: yup
    .number()
    .required('Vai trò là bắt buộc')
    .oneOf([1, 2], 'Vai trò không hợp lệ (chỉ cho phép Manager hoặc Staff)'),
  isActive: yup
    .boolean()
    .default(true),
  password: yup
    .string()
    .optional()
    .test('password-length', 'Mật khẩu phải có ít nhất 6 ký tự', function(value) {
      if (!value || value.trim() === '') return true; // Allow empty
      return value.length >= 6;
    })
    .test('password-max', 'Mật khẩu không được quá 50 ký tự', function(value) {
      if (!value || value.trim() === '') return true; // Allow empty
      return value.length <= 50;
    })
});

// Manager update validation schema (for Manager updating Staff/Teacher)
export const updateManagerUserSchema = yup.object({
  fullName: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  phoneNumber: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được quá 15 số'),
  changeRoleTo: yup
    .number()
    .required('Vai trò là bắt buộc')
    .oneOf([2, 3], 'Vai trò không hợp lệ (chỉ cho phép Staff hoặc Teacher)'),
  isActive: yup
    .boolean()
    .default(true),
  password: yup
    .string()
    .optional()
    .test('password-length', 'Mật khẩu phải có ít nhất 6 ký tự', function(value) {
      if (!value || value.trim() === '') return true; // Allow empty
      return value.length >= 6;
    })
    .test('password-max', 'Mật khẩu không được quá 50 ký tự', function(value) {
      if (!value || value.trim() === '') return true; // Allow empty
      return value.length <= 50;
    })
});
