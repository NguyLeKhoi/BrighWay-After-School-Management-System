export const createManagerStudentFormFields = ({
  parentOptions = [],
  schoolOptions = [],
  studentLevelOptions = [],
  actionLoading = false,
  defaultBranchName = ''
} = {}) => [
  {
    section: 'Thông tin học sinh',
    sectionDescription: 'Thông tin cơ bản về học sinh.',
    name: 'name',
    label: 'Họ và Tên học sinh',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Nguyễn Minh Anh',
    disabled: actionLoading,
    gridSize: 6
  },
  {
    name: 'dateOfBirth',
    label: 'Ngày sinh',
    type: 'date',
    required: true,
    placeholder: 'Chọn ngày sinh',
    disabled: actionLoading,
    gridSize: 6
  },
  {
    section: 'Thông tin liên kết',
    sectionDescription: 'Liên kết học sinh với phụ huynh, chi nhánh, trường học và cấp độ.',
    name: 'userId',
    label: 'Phụ huynh',
    type: 'select',
    required: true,
    placeholder: 'Chọn phụ huynh',
    options: parentOptions,
    allowClear: true,
    disabled: actionLoading || parentOptions.length === 0,
    helperText: parentOptions.length === 0 ? 'Chưa có phụ huynh khả dụng' : undefined,
    gridSize: 6
  },
  {
    name: 'schoolId',
    label: 'Trường học',
    type: 'select',
    required: true,
    placeholder: 'Chọn trường học',
    options: schoolOptions,
    allowClear: true,
    disabled: actionLoading || schoolOptions.length === 0,
    helperText: schoolOptions.length === 0 ? 'Chưa có trường học khả dụng' : undefined,
    gridSize: 6
  },
  {
    name: 'studentLevelId',
    label: 'Cấp độ học sinh',
    type: 'select',
    required: true,
    placeholder: 'Chọn cấp độ',
    options: studentLevelOptions,
    allowClear: true,
    disabled: actionLoading || studentLevelOptions.length === 0,
    helperText: studentLevelOptions.length === 0 ? 'Chưa có cấp độ khả dụng' : undefined,
    gridSize: 6
  },
  {
    section: 'Thông tin bổ sung',
    sectionDescription: 'Các thông tin thêm về học sinh.',
    name: 'image',
    label: 'Ảnh đại diện (URL)',
    type: 'text',
    required: false,
    placeholder: 'Nhập đường dẫn ảnh (nếu có)',
    disabled: actionLoading,
    gridSize: 6
  },
  {
    name: 'note',
    label: 'Ghi chú',
    type: 'textarea',
    required: false,
    placeholder: 'Nhập ghi chú cho học sinh (tối đa 500 ký tự)',
    rows: 4,
    disabled: actionLoading,
    gridSize: 12
  }
];


