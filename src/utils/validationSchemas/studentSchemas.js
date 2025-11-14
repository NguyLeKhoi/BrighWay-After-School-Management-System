import * as yup from 'yup';

export const managerStudentSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Tên học sinh là bắt buộc')
    .min(2, 'Tên học sinh phải có ít nhất 2 ký tự')
    .max(100, 'Tên học sinh không được vượt quá 100 ký tự'),
  dateOfBirth: yup
    .date()
    .typeError('Ngày sinh không hợp lệ')
    .max(new Date(), 'Ngày sinh không được trong tương lai')
    .required('Ngày sinh là bắt buộc'),
  userId: yup
    .string()
    .trim()
    .required('Vui lòng chọn phụ huynh'),
  branchId: yup
    .string()
    .trim()
    .nullable()
    .notRequired(),
  schoolId: yup
    .string()
    .trim()
    .required('Vui lòng chọn trường học'),
  studentLevelId: yup
    .string()
    .trim()
    .required('Vui lòng chọn cấp độ'),
  image: yup
    .string()
    .trim()
    .url('Đường dẫn ảnh không hợp lệ')
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  note: yup
    .string()
    .trim()
    .max(500, 'Ghi chú không được vượt quá 500 ký tự')
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
});

export const studentStep1Schema = yup.object({
  name: managerStudentSchema.fields.name,
  dateOfBirth: managerStudentSchema.fields.dateOfBirth
});

export const studentStep2Schema = yup.object({
  userId: managerStudentSchema.fields.userId,
  schoolId: managerStudentSchema.fields.schoolId,
  studentLevelId: managerStudentSchema.fields.studentLevelId
});

export const studentStep3Schema = yup.object({
  image: managerStudentSchema.fields.image,
  note: managerStudentSchema.fields.note
});


