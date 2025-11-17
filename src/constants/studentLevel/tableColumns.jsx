import React from 'react';
import { Box, Typography } from '@mui/material';
import { School as StudentLevelIcon } from '@mui/icons-material';

export const createStudentLevelColumns = () => [
  {
    key: 'name',
    header: 'Tên Cấp Độ',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <StudentLevelIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight="medium">
          {value}
        </Typography>
      </Box>
    )
  },
  {
    key: 'description',
    header: 'Mô Tả',
    render: (value) => (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {value || 'Không có mô tả'}
      </Typography>
    )
  },
  {
    key: 'createdTime',
    header: 'Ngày Tạo',
    render: (value) => (
      <Typography variant="body2">
        {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
      </Typography>
    )
  }
];


