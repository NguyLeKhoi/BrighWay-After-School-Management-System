import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { CardGiftcard as BenefitIcon } from '@mui/icons-material';

export const createBenefitColumns = () => [
  {
    key: 'name',
    header: 'Tên Lợi Ích',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <BenefitIcon fontSize="small" color="primary" />
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
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
        {value || 'Không có mô tả'}
      </Typography>
    )
  },
  {
    key: 'status',
    header: 'Trạng Thái',
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
    header: 'Ngày Tạo',
    render: (value) => (
      <Typography variant="body2">
        {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
      </Typography>
    )
  }
];


