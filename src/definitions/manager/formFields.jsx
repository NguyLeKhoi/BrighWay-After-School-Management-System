export const createManagerFormFields = ({
  dialogMode,
  actionLoading,
  branchOptions,
  branchLoading
}) => {
  if (dialogMode === 'create') {
    return [
      {
        section: 'Thông tin cá nhân',
        sectionDescription: 'Thông tin hiển thị của quản lý.',
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
        disabled: actionLoading || branchLoading,
        gridSize: 6
      },
      {
        section: 'Thông tin đăng nhập',
        sectionDescription: 'Email và mật khẩu sẽ được dùng để đăng nhập hệ thống.',
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'Ví dụ: email@example.com',
        disabled: actionLoading,
        gridSize: 6
      },
      {
        name: 'password',
        label: 'Mật Khẩu',
        type: 'password',
        required: true,
        placeholder: 'Nhập mật khẩu cho người dùng',
        disabled: actionLoading,
        gridSize: 6
      }
    ];
  }

  return [
    {
      section: 'Thông tin cá nhân',
      sectionDescription: 'Cập nhật thông tin hiển thị của quản lý.',
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
      disabled: actionLoading || branchLoading,
      gridSize: 6
    },
    {
      name: 'isActive',
      label: 'Trạng thái hoạt động',
      type: 'switch',
      disabled: actionLoading,
      gridSize: 6
    }
  ];
};


