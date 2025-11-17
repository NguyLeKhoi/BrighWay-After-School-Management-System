import * as yup from 'yup';

// Schema for Admin creating Manager (POST /User/manager)
export const createManagerSchema = yup.object({
  name: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được quá 50 ký tự'),
  branchId: yup
    .string()
    .optional()
});

// Schema for Manager creating Staff (POST /User/staff)
export const createStaffSchema = yup.object({
  name: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được quá 50 ký tự')
});

// Schema for updating user (Admin updates Manager)
export const updateUserSchema = yup.object({
  name: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
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

// Deprecated schemas for backward compatibility
export const createUserByAdminSchema = createManagerSchema;
export const createUserSchema = createStaffSchema;
export const updateManagerUserSchema = updateUserSchema;
