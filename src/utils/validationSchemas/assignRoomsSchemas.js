import * as yup from 'yup';

export const assignRoomsSchema = yup.object({
  roomIds: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Vui lòng chọn ít nhất một phòng')
    .required('Vui lòng chọn phòng')
});

