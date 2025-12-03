export const createSlotTypeFormFields = (actionLoading) => [
  {
    section: 'Thông tin loại ca',
    sectionDescription: 'Tên và mô tả loại ca giữ trẻ.',
    name: 'name',
    label: 'Tên Loại Ca',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Ca Sáng, Ca Chiều, Ca Tối',
    disabled: actionLoading,
    gridSize: 12
  },
  {
    name: 'description',
    label: 'Mô Tả',
    type: 'textarea',
    required: false,
    placeholder: 'Mô tả chi tiết về loại ca giữ trẻ...',
    disabled: actionLoading,
    rows: 3,
    gridSize: 12
  }
];
