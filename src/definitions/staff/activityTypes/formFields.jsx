export const createActivityTypeFormFields = (actionLoading) => [
  {
    section: 'Thông tin loại hoạt động',
    sectionDescription: 'Nhập thông tin về loại hoạt động mới.',
    name: 'name',
    label: 'Tên Loại Hoạt Động',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Điểm danh vào, Điểm danh ra, Nghỉ giải lao',
    disabled: actionLoading,
    gridSize: 12
  },
  {
    name: 'description',
    label: 'Mô Tả',
    type: 'textarea',
    required: false,
    placeholder: 'Mô tả chi tiết về loại hoạt động...',
    disabled: actionLoading,
    rows: 4,
    gridSize: 12
  }
];

