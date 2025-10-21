import * as yup from 'yup';

// Teacher account validation schema (for creating teacher with profile)
export const createTeacherAccountSchema = yup.object({
  user: yup.object({
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
      .max(50, 'Mật khẩu không được quá 50 ký tự')
  }),
  profile: yup.object({
    teacherName: yup
      .string()
      .required('Tên giáo viên là bắt buộc')
      .min(2, 'Tên giáo viên phải có ít nhất 2 ký tự')
      .max(100, 'Tên giáo viên không được quá 100 ký tự')
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên giáo viên chỉ được chứa chữ cái và khoảng trắng'),
    specialization: yup
      .string()
      .required('Chuyên môn là bắt buộc')
      .min(2, 'Chuyên môn phải có ít nhất 2 ký tự')
      .max(100, 'Chuyên môn không được quá 100 ký tự'),
    experienceYears: yup
      .number()
      .required('Số năm kinh nghiệm là bắt buộc')
      .min(0, 'Số năm kinh nghiệm không được âm')
      .max(50, 'Số năm kinh nghiệm không được quá 50 năm')
      .integer('Số năm kinh nghiệm phải là số nguyên')
      .typeError('Số năm kinh nghiệm phải là số'),
    qualifications: yup
      .string()
      .required('Bằng cấp là bắt buộc')
      .min(2, 'Bằng cấp phải có ít nhất 2 ký tự')
      .max(200, 'Bằng cấp không được quá 200 ký tự'),
    bio: yup
      .string()
      .required('Tiểu sử là bắt buộc')
      .min(10, 'Tiểu sử phải có ít nhất 10 ký tự')
      .max(500, 'Tiểu sử không được quá 500 ký tự')
  })
});

// Teacher account update validation schema (for updating teacher with profile)
export const updateTeacherAccountSchema = yup.object({
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
  specialization: yup
    .string()
    .required('Chuyên môn là bắt buộc')
    .min(2, 'Chuyên môn phải có ít nhất 2 ký tự')
    .max(100, 'Chuyên môn không được quá 100 ký tự'),
  experienceYears: yup
    .number()
    .required('Số năm kinh nghiệm là bắt buộc')
    .min(0, 'Số năm kinh nghiệm không được âm')
    .max(50, 'Số năm kinh nghiệm không được quá 50 năm')
    .integer('Số năm kinh nghiệm phải là số nguyên')
    .typeError('Số năm kinh nghiệm phải là số'),
  qualifications: yup
    .string()
    .required('Bằng cấp là bắt buộc')
    .min(2, 'Bằng cấp phải có ít nhất 2 ký tự')
    .max(200, 'Bằng cấp không được quá 200 ký tự'),
  bio: yup
    .string()
    .required('Tiểu sử là bắt buộc')
    .min(10, 'Tiểu sử phải có ít nhất 10 ký tự')
    .max(500, 'Tiểu sử không được quá 500 ký tự'),
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
