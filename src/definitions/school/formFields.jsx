export const createSchoolFormFields = (actionLoading) => [
  {
    name: 'name',
    label: 'Tên Trường',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Trường Tiểu học ABC',
    disabled: actionLoading
  },
  {
    name: 'address',
    label: 'Địa Chỉ',
    type: 'text',
    required: true,
    placeholder: 'Địa chỉ đầy đủ của trường',
    disabled: actionLoading
  },
  {
    name: 'phoneNumber',
    label: 'Số Điện Thoại',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: 0123456789',
    disabled: actionLoading
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'Ví dụ: contact@school.edu.vn',
    disabled: actionLoading
  }
];


