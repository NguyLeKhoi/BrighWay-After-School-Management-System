export const createManagerUserFormFields = (actionLoading) => [
  {
    section: 'Thông tin cơ bản',
    sectionDescription: 'Tên và email hiển thị trong hệ thống.',
    name: 'name',
    label: 'Họ và Tên',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Nguyễn Văn A',
    disabled: actionLoading,
    gridSize: 6
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'Ví dụ: email@example.com',
    disabled: actionLoading,
    gridSize: 6
  },
  {
    section: 'Bảo mật & Trạng thái',
    sectionDescription: 'Bạn có thể đổi mật khẩu hoặc kích hoạt/ngưng hoạt động tài khoản.',
    name: 'password',
    label: 'Mật Khẩu Mới',
    type: 'password',
    required: false,
    placeholder: 'Để trống nếu không muốn thay đổi mật khẩu',
    helperText: 'Lưu ý: Mật khẩu sẽ được thay đổi ngay lập tức, không cần xác nhận từ người dùng',
    disabled: actionLoading,
    gridSize: 6
  },
  {
    name: 'isActive',
    label: 'Trạng thái hoạt động',
    type: 'switch',
    required: true,
    disabled: actionLoading,
    gridSize: 12
  }
];


