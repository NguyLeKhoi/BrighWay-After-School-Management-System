export const createBranchSlotFormFields = ({
  actionLoading,
  dependenciesLoading,
  timeframeSelectOptions,
  slotTypeSelectOptions,
  weekDateOptions
}) => [
  {
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
    name: 'date',
    label: 'Ngày',
    type: 'date',
    required: true,
    gridSize: 6,
    disabled: actionLoading || dependenciesLoading,
    helperText: 'Chọn ngày cho ca giữ trẻ. Thứ trong tuần sẽ được tự động tính từ ngày này.'
  },
  {
    name: 'status',
    label: 'Trạng thái',
    type: 'select',
    required: true,
    options: [
      { value: 'Available', label: 'Có sẵn' },
      { value: 'Occupied', label: 'Đã đầy' },
      { value: 'Cancelled', label: 'Đã hủy' },
      { value: 'Maintenance', label: 'Bảo trì' }
    ],
    gridSize: 6,
    disabled: actionLoading || dependenciesLoading
  }
];

