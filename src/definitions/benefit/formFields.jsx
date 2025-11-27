export const createBenefitFormFields = (actionLoading) => [
  {
    section: 'Thông tin lợi ích',
    sectionDescription:
      'Tên và mô tả sẽ hiển thị với quản trị viên khi chọn lợi ích cho chi nhánh.',
    name: 'name',
    label: 'Tên Lợi Ích',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Giảm giá học phí, Tặng đồ dùng học tập',
    disabled: actionLoading,
    gridSize: 6
  },
  {
    name: 'description',
    label: 'Mô Tả',
    type: 'textarea',
    required: false,
    placeholder: 'Mô tả chi tiết về lợi ích...',
    disabled: actionLoading,
    rows: 3,
    gridSize: 12
  },
  {
    section: 'Trạng thái',
    sectionDescription: 'Bật để lợi ích xuất hiện trong danh sách lựa chọn.',
    name: 'status',
    label: 'Trạng thái hoạt động',
    type: 'switch',
    required: false,
    disabled: actionLoading,
    gridSize: 12
  }
];


