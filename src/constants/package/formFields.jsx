export const createTemplateFormFields = ({ templateActionLoading }) => [
  {
    section: 'Thông tin cơ bản',
    sectionDescription: 'Các thông tin hiển thị khi quản trị chọn mẫu gói.',
    name: 'name',
    label: 'Tên Mẫu Gói',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Mẫu gói tiếng Anh cơ bản',
    gridSize: 8,
    disabled: templateActionLoading
  },
  {
    name: 'isActive',
    label: 'Trạng thái hoạt động',
    type: 'switch',
    gridSize: 4,
    disabled: templateActionLoading
  },
  {
    name: 'desc',
    label: 'Mô Tả',
    type: 'textarea',
    rows: 3,
    placeholder: 'Mô tả chi tiết về mẫu gói...',
    gridSize: 12,
    disabled: templateActionLoading
  },
  {
    section: 'Khoảng giá đề xuất',
    sectionDescription: 'Thiết lập khung giá khi tạo gói dựa trên mẫu.',
    name: 'minPrice',
    label: 'Giá thấp nhất (VNĐ)',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 500000',
    gridSize: 4,
    disabled: templateActionLoading
  },
  {
    name: 'defaultPrice',
    label: 'Giá mặc định (VNĐ)',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 1000000',
    gridSize: 4,
    disabled: templateActionLoading
  },
  {
    name: 'maxPrice',
    label: 'Giá cao nhất (VNĐ)',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 2000000',
    gridSize: 4,
    disabled: templateActionLoading
  },
  {
    section: 'Thời hạn & Slot',
    sectionDescription: 'Giới hạn thời lượng và số lượng slot cho mẫu gói.',
    name: 'minDurationInMonths',
    label: 'Thời hạn thấp nhất (tháng)',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 3',
    gridSize: 4,
    disabled: templateActionLoading
  },
  {
    name: 'defaultDurationInMonths',
    label: 'Thời hạn mặc định (tháng)',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 6',
    gridSize: 4,
    disabled: templateActionLoading
  },
  {
    name: 'maxDurationInMonths',
    label: 'Thời hạn cao nhất (tháng)',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 12',
    gridSize: 4,
    disabled: templateActionLoading
  },
  {
    name: 'minSlots',
    label: 'Slot thấp nhất',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 10',
    gridSize: 4,
    disabled: templateActionLoading
  },
  {
    name: 'defaultTotalSlots',
    label: 'Slot mặc định',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 20',
    gridSize: 4,
    disabled: templateActionLoading
  },
  {
    name: 'maxSlots',
    label: 'Slot cao nhất',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 30',
    gridSize: 4,
    disabled: templateActionLoading
  }
];

export const createPackageFormFields = ({
  packageActionLoading,
  dependenciesLoading,
  loadingTemplates,
  templateSelectOptions,
  branchSelectOptions,
  studentLevelSelectOptions
}) => [
  {
    section: 'Thông tin cơ bản',
    sectionDescription: 'Thông tin quản trị viên sẽ thấy khi quản lý gói bán.',
    name: 'name',
    label: 'Tên Gói Bán',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Gói bán tiếng Anh cơ bản',
    gridSize: 8,
    disabled: packageActionLoading || dependenciesLoading || loadingTemplates
  },
  {
    name: 'isActive',
    label: 'Trạng thái hoạt động',
    type: 'switch',
    gridSize: 4,
    disabled: packageActionLoading || dependenciesLoading
  },
  {
    name: 'desc',
    label: 'Mô Tả',
    type: 'textarea',
    rows: 3,
    placeholder: 'Mô tả chi tiết về gói bán...',
    gridSize: 12,
    disabled: packageActionLoading || dependenciesLoading
  },
  {
    section: 'Liên kết dữ liệu',
    sectionDescription: 'Xác định mẫu gói, chi nhánh và cấp độ học sinh áp dụng.',
    name: 'packageTemplateId',
    label: 'Mẫu Gói',
    type: 'select',
    required: true,
    options: templateSelectOptions,
    gridSize: 4,
    disabled: packageActionLoading || dependenciesLoading || loadingTemplates
  },
  {
    name: 'branchId',
    label: 'Chi Nhánh',
    type: 'select',
    required: true,
    options: branchSelectOptions,
    gridSize: 4,
    disabled: packageActionLoading || dependenciesLoading
  },
  {
    name: 'studentLevelId',
    label: 'Cấp Độ Học Sinh',
    type: 'select',
    required: true,
    options: studentLevelSelectOptions,
    gridSize: 4,
    disabled: packageActionLoading || dependenciesLoading
  },
  {
    section: 'Thông số gói',
    sectionDescription: 'Thiết lập giá bán và số slot mặc định của gói.',
    name: 'price',
    label: 'Giá (VNĐ)',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 1000000',
    gridSize: 4,
    disabled: packageActionLoading || dependenciesLoading
  },
  {
    name: 'durationInMonths',
    label: 'Thời hạn (tháng)',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 6',
    gridSize: 4,
    disabled: packageActionLoading || dependenciesLoading
  },
  {
    name: 'totalSlots',
    label: 'Tổng số slot',
    type: 'number',
    required: true,
    placeholder: 'Ví dụ: 20',
    gridSize: 4,
    disabled: packageActionLoading || dependenciesLoading
  }
];


