import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { School as SchoolIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

export const createSchoolColumns = ({ onEdit, onDelete }) => [
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
  {
    key: 'actions',
    header: 'Thao tác',
    align: 'center',
    render: (_, item) => (
      <Box display="flex" gap={0.5} justifyContent="center">
        <Tooltip title="Sửa">
          <IconButton size="small" color="primary" onClick={() => onEdit(item)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa (Soft Delete)">
          <IconButton size="small" color="error" onClick={() => onDelete(item)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }
];


