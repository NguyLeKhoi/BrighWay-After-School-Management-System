export const createStudentLevelFormFields = (actionLoading) => [
  {
    section: 'Thông tin cấp độ',
    sectionDescription: 'Tên và mô tả giúp phân biệt các cấp độ học sinh.',
    name: 'name',
    label: 'Tên Cấp Độ',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Mầm Non, Tiểu Học, Trung Học Cơ Sở',
    disabled: actionLoading,
    gridSize: 6
  },
  {
    name: 'description',
    label: 'Mô Tả',
    type: 'textarea',
    required: false,
    placeholder: 'Mô tả chi tiết về cấp độ học sinh...',
    disabled: actionLoading,
    rows: 3,
    gridSize: 12
  }
];


