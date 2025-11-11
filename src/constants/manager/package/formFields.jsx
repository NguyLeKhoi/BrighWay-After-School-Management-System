const formatCurrencyRange = (min, max) => {
  if (min == null && max == null) return 'theo khoảng mẫu gói';
  const formattedMin = min != null ? min.toLocaleString('vi-VN') : '-';
  const formattedMax = max != null ? max.toLocaleString('vi-VN') : '-';
  return `${formattedMin} - ${formattedMax} VNĐ`;
};

const formatRange = (min, max, unit = '') => {
  if (min == null && max == null) return `theo khoảng mẫu gói${unit ? ` (${unit})` : ''}`;
  const minLabel = min != null ? min : '-';
  const maxLabel = max != null ? max : '-';
  const unitLabel = unit ? ` ${unit}` : '';
  return `${minLabel}${unitLabel} - ${maxLabel}${unitLabel}`;
};

export const createManagerPackageFormFields = ({
  actionLoading,
  dependenciesLoading,
  studentLevelOptions = [],
  benefitOptions = [],
  selectedTemplate = null
}) => [
  {
    section: 'Thông tin cơ bản',
    sectionDescription: 'Tên và mô tả gói sẽ hiển thị cho nhân viên trong hệ thống.',
    name: 'name',
    label: 'Tên Gói',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Gói luyện tập kỹ năng 3 tháng',
    gridSize: 8,
    disabled: actionLoading || dependenciesLoading
  },
  {
    name: 'isActive',
    label: 'Trạng thái hoạt động',
    type: 'switch',
    gridSize: 6,
    disabled: actionLoading
  },
  {
    name: 'desc',
    label: 'Mô tả',
    type: 'textarea',
    rows: 3,
    placeholder: 'Mô tả chi tiết về gói áp dụng trong chi nhánh...',
    gridSize: 12,
    disabled: actionLoading
  },
  {
    section: 'Liên kết dữ liệu',
    name: 'studentLevelId',
    label: 'Cấp Độ Học Sinh',
    type: 'select',
    required: true,
    options: studentLevelOptions.length
      ? [{ value: '', label: 'Chọn cấp độ học sinh' }, ...studentLevelOptions]
      : [{ value: '', label: 'Không có cấp độ khả dụng' }],
    gridSize: 4,
    disabled: actionLoading || dependenciesLoading || studentLevelOptions.length === 0,
    selectProps: {
      MenuProps: {
        PaperProps: {
          style: {
            maxHeight: 48 * 4.5 + 8,
            width: 320
          }
        }
      }
    }
  },
  {
    name: 'benefitIds',
    label: 'Lợi Ích Áp Dụng',
    type: 'multiselect',
    gridSize: 6,
    disabled: actionLoading || dependenciesLoading || benefitOptions.length === 0,
    options: benefitOptions.length
      ? benefitOptions
      : [{ value: '', label: 'Không có lợi ích khả dụng' }],
    helperText: ''
  },
  {
    section: 'Thông số gói',
    sectionDescription: 'Thiết lập giá bán, thời hạn và số lượng slot của gói.',
    name: 'price',
    label: 'Giá (VNĐ)',
    type: 'number',
    required: true,
    placeholder: selectedTemplate
      ? `Chỉ nhập trong khoảng ${formatCurrencyRange(selectedTemplate.minPrice, selectedTemplate.maxPrice)}`
      : 'Nhập giá theo khoảng mẫu gói',
    gridSize: 4,
    disabled: actionLoading,
    helperText: selectedTemplate
      ? `Khoảng: ${selectedTemplate.minPrice?.toLocaleString('vi-VN') ?? '-'} - ${selectedTemplate.maxPrice?.toLocaleString('vi-VN') ?? '-'} VNĐ`
      : undefined,
    min: selectedTemplate?.minPrice ?? undefined,
    max: selectedTemplate?.maxPrice ?? undefined
  },
  {
    name: 'durationInMonths',
    label: 'Thời hạn (tháng)',
    type: 'number',
    required: true,
    placeholder: selectedTemplate
      ? `Chỉ nhập trong khoảng ${formatRange(selectedTemplate.minDurationInMonths, selectedTemplate.maxDurationInMonths, 'tháng')}`
      : 'Nhập thời hạn theo khoảng mẫu gói',
    gridSize: 4,
    disabled: actionLoading,
    helperText: selectedTemplate
      ? `Khoảng: ${selectedTemplate.minDurationInMonths ?? '-'} - ${selectedTemplate.maxDurationInMonths ?? '-'} tháng`
      : undefined,
    min: selectedTemplate?.minDurationInMonths ?? undefined,
    max: selectedTemplate?.maxDurationInMonths ?? undefined
  },
  {
    name: 'totalSlots',
    label: 'Tổng số slot',
    type: 'number',
    required: true,
    placeholder: selectedTemplate
      ? `Chỉ nhập trong khoảng ${formatRange(selectedTemplate.minSlots, selectedTemplate.maxSlots, 'slot')}`
      : 'Nhập số slot theo khoảng mẫu gói',
    gridSize: 4,
    disabled: actionLoading,
    helperText: selectedTemplate
      ? `Khoảng: ${selectedTemplate.minSlots ?? '-'} - ${selectedTemplate.maxSlots ?? '-'} slot`
      : undefined,
    min: selectedTemplate?.minSlots ?? undefined,
    max: selectedTemplate?.maxSlots ?? undefined
  }
];


