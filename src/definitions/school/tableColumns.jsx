import React from 'react';
import { Box, Typography } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

export const createSchoolColumns = () => [
  {
    key: 'name',
    header: 'Tên Trường',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <SchoolIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight="medium">
          {value}
        </Typography>
      </Box>
    )
  },
  {
    key: 'address',
    header: 'Địa Chỉ',
    render: (value) => (
      <Typography variant="body2" color="text.secondary">
        {value}
      </Typography>
    )
  },
  {
    key: 'phoneNumber',
    header: 'Số Điện Thoại',
    render: (value) => (
      <Typography variant="body2">
        {value}
      </Typography>
    )
  },
  {
    key: 'email',
    header: 'Email',
    render: (value) => (
      <Typography variant="body2" color="text.secondary">
        {value}
      </Typography>
    )
  },
];


