import React from 'react';
import { Typography } from '@mui/material';

export const createStaffActivityTypeColumns = () => [
  {
    key: 'stt',
    header: 'STT',
    align: 'center',
    render: (value) => (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || '-'}
      </Typography>
    )
  },
  {
    key: 'name',
    header: 'Tên loại hoạt động',
    render: (value) => (
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {value || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'description',
    header: 'Mô tả',
    render: (value) => (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {value || 'Không có mô tả'}
      </Typography>
    )
  }
];


