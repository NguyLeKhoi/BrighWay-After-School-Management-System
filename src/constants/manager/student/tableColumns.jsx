import React from 'react';
import { Avatar, Box, Chip, Typography } from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

export const createManagerStudentColumns = () => [
  {
    key: 'name',
    header: 'Tên Học Sinh',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {value?.charAt(0)?.toUpperCase() || 'H'}
        </Avatar>
        <Typography variant="subtitle2" fontWeight="medium">
          {value || 'N/A'}
        </Typography>
      </Box>
    )
  },
  {
    key: 'dateOfBirth',
    header: 'Ngày Sinh',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={0.5}>
        <CalendarIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
        </Typography>
      </Box>
    )
  },
  {
    key: 'userName',
    header: 'Phụ Huynh',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <PersonIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {value || 'N/A'}
        </Typography>
      </Box>
    )
  },
  {
    key: 'branchName',
    header: 'Chi Nhánh',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <BusinessIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {value || 'N/A'}
        </Typography>
      </Box>
    )
  },
  {
    key: 'schoolName',
    header: 'Trường Học',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <SchoolIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {value || 'N/A'}
        </Typography>
      </Box>
    )
  },
  {
    key: 'studentLevelName',
    header: 'Cấp Độ',
    render: (value) => (
      <Chip label={value || 'N/A'} color="primary" size="small" variant="outlined" />
    )
  },
  {
    key: 'status',
    header: 'Trạng Thái',
    render: (value) => (
      <Chip
        label={value ? 'Hoạt Động' : 'Không Hoạt Động'}
        color={value ? 'success' : 'default'}
        size="small"
      />
    )
  },
  {
    key: 'createdTime',
    header: 'Ngày Tạo',
    render: (value) => (
      <Typography variant="body2" color="text.secondary">
        {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
      </Typography>
    )
  }
];


