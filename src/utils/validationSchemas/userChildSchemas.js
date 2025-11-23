import * as yup from 'yup';

export const userChildStep1Schema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Tên là bắt buộc')
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự'),
  dateOfBirth: yup
    .date()
    .typeError('Ngày sinh không hợp lệ')
    .max(new Date(), 'Ngày sinh không được trong tương lai')
    .required('Ngày sinh là bắt buộc'),
  note: yup
    .string()
    .trim()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  image: yup
    .mixed()
    .nullable()
    .notRequired()
    .test('is-file-or-null', 'Ảnh phải là file hợp lệ', (value) => {
      if (!value || value === '') return true; // null/undefined/empty string is allowed
      if (value instanceof File) {
        // Validate file type
        return value.type.startsWith('image/');
      }
      // Allow string URL for backward compatibility
      if (typeof value === 'string') {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    })
});

export const userChildStep2Schema = yup.object({
  branchId: yup
    .string()
    .trim()
    .nullable()
    .notRequired() // branchId sẽ được set tự động từ user, không bắt buộc chọn
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  schoolId: yup
    .string()
    .trim()
    .required('Vui lòng chọn trường học'),
  studentLevelId: yup
    .string()
    .trim()
    .required('Vui lòng chọn cấp độ học sinh')
});

export const userChildStep3Schema = yup.object({
  documentType: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  issuedBy: yup
    .string()
    .trim()
    .max(200, 'Nơi cấp không được vượt quá 200 ký tự')
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  issuedDate: yup
    .date()
    .typeError('Ngày cấp không hợp lệ')
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  expirationDate: yup
    .date()
    .typeError('Ngày hết hạn không hợp lệ')
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  documentFile: yup
    .mixed()
    .nullable()
    .notRequired()
});

