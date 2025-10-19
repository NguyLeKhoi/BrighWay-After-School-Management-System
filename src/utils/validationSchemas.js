import * as yup from 'yup';

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

// Branch validation schema
export const branchSchema = yup.object({
  branchName: yup
    .string()
    .required('Tên chi nhánh là bắt buộc')
    .min(2, 'Tên chi nhánh phải có ít nhất 2 ký tự')
    .max(100, 'Tên chi nhánh không được quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ0-9\s\-.,()]+$/, 'Tên chi nhánh chỉ được chứa chữ cái, số, khoảng trắng và ký tự đặc biệt cơ bản'),
  address: yup
    .string()
    .required('Địa chỉ là bắt buộc')
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(200, 'Địa chỉ không được quá 200 ký tự'),
  phone: yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được quá 15 số')
});

// Facility validation schema
export const facilitySchema = yup.object({
  facilityName: yup
    .string()
    .required('Tên cơ sở vật chất là bắt buộc')
    .min(2, 'Tên cơ sở vật chất phải có ít nhất 2 ký tự')
    .max(100, 'Tên cơ sở vật chất không được quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ0-9\s\-.,()]+$/, 'Tên cơ sở vật chất chỉ được chứa chữ cái, số, khoảng trắng và ký tự đặc biệt cơ bản'),
  description: yup
    .string()
    .required('Mô tả là bắt buộc')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(500, 'Mô tả không được quá 500 ký tự')
});

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

// Room validation schema
export const roomSchema = yup.object({
  roomName: yup
    .string()
    .required('Tên phòng là bắt buộc')
    .min(2, 'Tên phòng phải có ít nhất 2 ký tự')
    .max(100, 'Tên phòng không được quá 100 ký tự'),
  facilityId: yup
    .string()
    .required('Cơ sở vật chất là bắt buộc'),
  branchId: yup
    .string()
    .required('Chi nhánh là bắt buộc'),
  capacity: yup
    .number()
    .required('Sức chứa là bắt buộc')
    .min(1, 'Sức chứa phải lớn hơn 0')
    .max(1000, 'Sức chứa không được quá 1000')
    .integer('Sức chứa phải là số nguyên')
});

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
