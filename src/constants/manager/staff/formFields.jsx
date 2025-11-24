export const createManagerUserFormFields = (actionLoading, branchOptions = []) => [
  {
    section: 'Thông tin cơ bản',
    sectionDescription: 'Thông tin hiển thị trong hệ thống.',
    name: 'name',
    label: 'Họ và Tên',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Nguyễn Văn A',
    disabled: actionLoading,
    gridSize: 6
  },
  {
    name: 'branchId',
    label: 'Chi Nhánh',
    type: 'select',
    required: false,
    options: branchOptions,
    disabled: actionLoading || branchOptions.length === 0,
    helperText: branchOptions.length === 0 ? 'Chưa có chi nhánh khả dụng' : undefined,
    gridSize: 6
  }
];


