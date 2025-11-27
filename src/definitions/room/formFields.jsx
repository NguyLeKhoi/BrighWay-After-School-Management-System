export const createRoomFormFields = ({
  actionLoading,
  isDataLoading,
  facilityOptions,
  branchOptions
}) => [
  {
    section: 'Thông tin phòng',
    sectionDescription: 'Tên phòng học và cơ sở vật chất liên quan.',
    name: 'roomName',
    label: 'Tên Phòng',
    type: 'text',
    placeholder: 'Nhập tên phòng học',
    required: true,
    disabled: actionLoading,
    gridSize: 6
  },
  {
    name: 'facilityId',
    label: 'Cơ Sở Vật Chất',
    type: 'select',
    required: true,
    options: facilityOptions,
    disabled: actionLoading || isDataLoading,
    gridSize: 6
  },
  {
    name: 'branchId',
    label: 'Chi Nhánh',
    type: 'select',
    required: true,
    options: branchOptions,
    disabled: actionLoading || isDataLoading,
    gridSize: 6
  },
  {
    section: 'Thông số phòng',
    sectionDescription: 'Sức chứa ảnh hưởng đến việc xếp lịch lớp học.',
    name: 'capacity',
    label: 'Sức Chứa',
    type: 'number',
    placeholder: 'Sức chứa: 10',
    required: true,
    disabled: actionLoading,
    gridSize: 6
  }
];


