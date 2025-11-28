export const createBranchSlotFormFields = ({
  actionLoading,
  dependenciesLoading,
  timeframeSelectOptions,
  slotTypeSelectOptions,
  weekDateOptions
}) => [
  {
    section: 'Thông tin cơ bản',
    sectionDescription: 'Thông tin về ca giữ trẻ trong chi nhánh. Sau khi tạo, bạn có thể gán phòng và nhân viên.',
    name: 'timeframeId',
    label: 'Khung giờ',
    type: 'select',
    required: true,
    options: timeframeSelectOptions,
    gridSize: 6,
    disabled: actionLoading || dependenciesLoading || timeframeSelectOptions.length === 0,
    helperText: 'Chọn khung giờ cho ca giữ trẻ'
  },
  {
    name: 'slotTypeId',
    label: 'Loại ca giữ trẻ',
    type: 'select',
    required: true,
    options: slotTypeSelectOptions,
    gridSize: 6,
    disabled: actionLoading || dependenciesLoading || slotTypeSelectOptions.length === 0,
    helperText: 'Chọn loại ca giữ trẻ'
  },
  {
    name: 'weekDate',
    label: 'Ngày trong tuần',
    type: 'select',
    required: true,
    options: weekDateOptions,
    gridSize: 6,
    disabled: actionLoading || dependenciesLoading
  },
  {
    name: 'status',
    label: 'Trạng thái',
    type: 'select',
    required: true,
    options: [
      { value: 'Available', label: 'Có sẵn' },
      { value: 'Full', label: 'Đã đầy' },
      { value: 'Cancelled', label: 'Đã hủy' }
    ],
    gridSize: 6,
    disabled: actionLoading || dependenciesLoading
  }
];

