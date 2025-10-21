import * as yup from 'yup';

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
