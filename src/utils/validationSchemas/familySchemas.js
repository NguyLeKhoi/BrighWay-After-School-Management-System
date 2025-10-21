import * as yup from 'yup';

// Family Account validation schema (for creating family account)
export const createFamilyAccountSchema = yup.object({
  user: yup.object({
    fullName: yup
      .string()
      .required('Họ và tên là bắt buộc')
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên không được quá 100 ký tự')
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),
    password: yup
      .string()
      .required('Mật khẩu là bắt buộc')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu không được quá 50 ký tự'),
    email: yup
      .string()
      .required('Email là bắt buộc')
      .email('Email không hợp lệ'),
    phoneNumber: yup
      .string()
      .required('Số điện thoại là bắt buộc')
      .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
      .min(10, 'Số điện thoại phải có ít nhất 10 số')
      .max(15, 'Số điện thoại không được quá 15 số')
  }),
  family: yup.object({
    address: yup
      .string()
      .required('Địa chỉ gia đình là bắt buộc')
      .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
      .max(200, 'Địa chỉ không được quá 200 ký tự'),
    phone: yup
      .string()
      .required('Số điện thoại gia đình là bắt buộc')
      .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
      .min(10, 'Số điện thoại phải có ít nhất 10 số')
      .max(15, 'Số điện thoại không được quá 15 số'),
    emergencyContactName: yup
      .string()
      .required('Tên người liên hệ khẩn cấp là bắt buộc')
      .min(2, 'Tên phải có ít nhất 2 ký tự')
      .max(100, 'Tên không được quá 100 ký tự')
      .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng'),
    emergencyContactPhone: yup
      .string()
      .required('Số điện thoại liên hệ khẩn cấp là bắt buộc')
      .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
      .min(10, 'Số điện thoại phải có ít nhất 10 số')
      .max(15, 'Số điện thoại không được quá 15 số'),
    note: yup
      .string()
      .optional()
      .max(500, 'Ghi chú không được quá 500 ký tự')
  }),
  parents: yup.array().of(
    yup.object({
      parentName: yup
        .string()
        .required('Tên phụ huynh là bắt buộc')
        .min(2, 'Tên phải có ít nhất 2 ký tự')
        .max(100, 'Tên không được quá 100 ký tự')
        .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng'),
      email: yup
        .string()
        .required('Email phụ huynh là bắt buộc')
        .email('Email không hợp lệ'),
      address: yup
        .string()
        .required('Địa chỉ phụ huynh là bắt buộc')
        .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
        .max(200, 'Địa chỉ không được quá 200 ký tự'),
      phone: yup
        .string()
        .required('Số điện thoại phụ huynh là bắt buộc')
        .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
        .min(10, 'Số điện thoại phải có ít nhất 10 số')
        .max(15, 'Số điện thoại không được quá 15 số'),
      relationshipToStudent: yup
        .string()
        .required('Mối quan hệ với học sinh là bắt buộc')
        .oneOf(['father', 'mother', 'guardian', 'other'], 'Mối quan hệ không hợp lệ'),
      note: yup
        .string()
        .optional()
        .max(500, 'Ghi chú không được quá 500 ký tự')
    })
  ).min(1, 'Phải có ít nhất một phụ huynh').max(5, 'Không được quá 5 phụ huynh')
});

// Parent validation schema (for adding parent to family)
export const addParentSchema = yup.object().shape({
  parentName: yup
    .string()
    .required('Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được quá 100 ký tự'),
  
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ')
    .max(100, 'Email không được quá 100 ký tự'),
  
  phone: yup
    .string()
    .nullable()
    .max(20, 'Số điện thoại không được quá 20 ký tự')
    .matches(/^[\d\s\-\+\(\)]*$/, 'Số điện thoại chỉ được chứa số và ký tự đặc biệt'),
  
  address: yup
    .string()
    .nullable()
    .max(500, 'Địa chỉ không được quá 500 ký tự'),
  
  relationshipToStudent: yup
    .string()
    .required('Mối quan hệ là bắt buộc')
    .oneOf(['father', 'mother', 'guardian', 'other'], 'Mối quan hệ không hợp lệ'),
  
  note: yup
    .string()
    .nullable()
    .max(1000, 'Ghi chú không được quá 1000 ký tự')
});
