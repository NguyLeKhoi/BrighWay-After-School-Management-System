import * as yup from 'yup';

// Role validation schema
export const roleSchema = yup.object({
  name: yup
    .string()
    .required('Tên role là bắt buộc')
    .min(2, 'Tên role phải có ít nhất 2 ký tự')
    .max(50, 'Tên role không được quá 50 ký tự')
    .matches(/^[a-zA-Z0-9\s]+$/, 'Tên role chỉ được chứa chữ cái, số và khoảng trắng'),
  description: yup
    .string()
    .max(200, 'Mô tả không được quá 200 ký tự')
    .nullable()
});

// Login validation schema
export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});

// User validation schema
export const userSchema = yup.object({
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  firstName: yup
    .string()
    .required('Họ là bắt buộc')
    .min(2, 'Họ phải có ít nhất 2 ký tự')
    .max(50, 'Họ không được quá 50 ký tự'),
  lastName: yup
    .string()
    .required('Tên là bắt buộc')
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được quá 50 ký tự'),
  phoneNumber: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .nullable(),
  role: yup
    .string()
    .required('Role là bắt buộc')
});

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

// Children validation schema
export const childSchema = yup.object({
  name: yup
    .string()
    .required('Tên con là bắt buộc')
    .min(2, 'Tên con phải có ít nhất 2 ký tự')
    .max(50, 'Tên con không được quá 50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên con chỉ được chứa chữ cái và khoảng trắng'),
  age: yup
    .number()
    .required('Tuổi là bắt buộc')
    .min(1, 'Tuổi phải lớn hơn 0')
    .max(18, 'Tuổi phải nhỏ hơn 18')
    .typeError('Tuổi phải là số'),
  grade: yup
    .string()
    .required('Lớp là bắt buộc')
    .matches(/^Lớp\s+\d+$/, 'Lớp phải có định dạng "Lớp X" (ví dụ: Lớp 3)'),
  gender: yup
    .string()
    .required('Giới tính là bắt buộc')
    .oneOf(['male', 'female'], 'Giới tính không hợp lệ'),
  dateOfBirth: yup
    .date()
    .nullable()
    .max(new Date(), 'Ngày sinh không được là tương lai')
    .test('age-consistency', 'Ngày sinh không khớp với tuổi', function(value) {
      if (!value || !this.parent.age) return true;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      return Math.abs(age - this.parent.age) <= 1;
    })
});

// Generic validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9+\-\s()]+$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
