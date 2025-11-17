import React from 'react';
import { Chip, Typography } from '@mui/material';

export const createStaffStudentLevelColumns = () => [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Tên cấp độ' },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (value) => (
      <Chip
        label={value ? 'Hoạt động' : 'Không hoạt động'}
        color={value ? 'success' : 'default'}
        size="small"
      />
    )
  },
  {
    key: 'createdTime',
    header: 'Ngày tạo',
    render: (value) => (
      <Typography variant="body2" color="text.secondary">
        {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
      </Typography>
    )
  }
];


