import * as yup from 'yup';

export const assignStaffSchema = yup.object({
  userId: yup
    .string()
    .required('Vui lòng chọn nhân viên'),
  roomId: yup
    .string()
    .nullable(),
  name: yup
    .string()
    .nullable()
    .max(100, 'Tên không được vượt quá 100 ký tự')
});

