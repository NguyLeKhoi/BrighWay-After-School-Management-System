import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Visibility as ViewIcon } from '@mui/icons-material';

export const createStaffAndParentColumns = (onViewDetail) => [
  {
    key: 'name',
    header: 'Họ và Tên',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <PersonIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight="medium">
          {value}
        </Typography>
      </Box>
    )
  },
  {
    key: 'email',
    header: 'Email',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <EmailIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      </Box>
    )
  },
  {
    key: 'createdAt',
    header: 'Ngày Tạo',
    render: (value) => (
      <Typography variant="body2" color="text.secondary">
        {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
      </Typography>
    )
  }
];


