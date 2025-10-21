import React from 'react';
import Form from '../Form';
import { addParentSchema } from '../../../utils/validationSchemas/familySchemas';

const ParentForm = ({ 
  isSubmitting, 
  onParentSubmit,
  defaultValues = {}
}) => {
  const parentFields = [
    {
      name: 'parentName',
      label: 'Họ và tên',
      type: 'text',
      required: true,
      placeholder: 'Nhập họ và tên phụ huynh',
      gridSize: 12
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'Nhập email phụ huynh',
      gridSize: 12
    },
    {
      name: 'phone',
      label: 'Số điện thoại',
      type: 'tel',
      required: false,
      placeholder: 'Nhập số điện thoại',
      gridSize: 6
    },
    {
      name: 'relationshipToStudent',
      label: 'Mối quan hệ *',
      type: 'select',
      required: true,
      options: [
        { value: 'father', label: 'Bố' },
        { value: 'mother', label: 'Mẹ' },
        { value: 'guardian', label: 'Người giám hộ' },
        { value: 'other', label: 'Khác' }
      ],
      gridSize: 6,
      helperText: 'Chọn mối quan hệ với học sinh',
      className: 'highlight-field'
    },
    {
      name: 'address',
      label: 'Địa chỉ',
      type: 'textarea',
      required: false,
      placeholder: 'Nhập địa chỉ phụ huynh',
      rows: 3,
      gridSize: 12
    },
    {
      name: 'note',
      label: 'Ghi chú',
      type: 'textarea',
      required: false,
      placeholder: 'Nhập ghi chú (nếu có)',
      rows: 2,
      gridSize: 12
    }
  ];

  return (
    <Form
      schema={addParentSchema}
      defaultValues={defaultValues}
      onSubmit={onParentSubmit}
      submitText="Thêm Phụ Huynh"
      loading={isSubmitting}
      fields={parentFields}
      showReset={true}
      resetText="Làm Mới"
    />
  );
};

export default ParentForm;
