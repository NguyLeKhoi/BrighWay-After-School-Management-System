export const createFacilityFormFields = (actionLoading) => [
  {
    section: 'Thông tin cơ bản',
    sectionDescription: 'Tên hiển thị cho cơ sở vật chất trong các bảng quản lý.',
    name: 'facilityName',
    label: 'Tên Cơ Sở Vật Chất',
    type: 'text',
    required: true,
    placeholder: 'Ví dụ: Phòng học A1, Thư viện, Sân thể thao',
    disabled: actionLoading,
    gridSize: 6
  },
  {
    name: 'description',
    label: 'Mô Tả',
    type: 'text',
    required: true,
    placeholder: 'Mô tả chi tiết về cơ sở vật chất',
    disabled: actionLoading,
    gridSize: 12
  }
];


