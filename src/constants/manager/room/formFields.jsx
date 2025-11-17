export const createManagerRoomFormFields = ({
  actionLoading,
  facilityOptions,
  managerBranchId,
  branchOptions
}) => [
  {
    section: 'Thông tin phòng',
    sectionDescription: 'Tên phòng học và cơ sở vật chất đi kèm.',
    name: 'roomName',
    label: 'Tên Phòng',
    type: 'text',
    placeholder: 'Nhập tên phòng học',
    required: true,
    gridSize: 6,
    disabled: actionLoading
  },
  {
    name: 'facilityId',
    label: 'Cơ Sở Vật Chất',
    type: 'select',
    required: true,
    options: facilityOptions,
    gridSize: 6,
    disabled: actionLoading
  },
  {
    section: 'Phạm vi áp dụng',
    sectionDescription: 'Quản lý chỉ được gán phòng vào chi nhánh mình phụ trách.',
    name: 'branchId',
    label: 'Chi Nhánh',
    type: 'select',
    required: true,
    gridSize: 6,
    disabled: true,
    options: managerBranchId
      ? branchOptions.filter((option) => option.value === managerBranchId)
      : branchOptions
  },
  {
    name: 'capacity',
    label: 'Sức Chứa',
    type: 'number',
    placeholder: 'Sức chứa: 10',
    required: true,
    gridSize: 6,
    disabled: actionLoading
  }
];


