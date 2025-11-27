import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

export const createStaffActivityColumns = () => [
  {
    key: 'title',
    header: 'Tiêu đề',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <EventIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight="medium">
          {value || 'N/A'}
        </Typography>
      </Box>
    )
  },
  {
    key: 'description',
    header: 'Mô tả',
    render: (value) => (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {value || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'activityTypeName',
    header: 'Loại hoạt động',
    render: (value) => (
      <Chip
        label={value || 'N/A'}
        color="primary"
        size="small"
        variant="outlined"
      />
    )
  },
  {
    key: 'createdBy',
    header: 'Người tạo',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={0.5}>
        <PersonIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {value || 'N/A'}
        </Typography>
      </Box>
    )
  },
  {
    key: 'startDate',
    header: 'Ngày bắt đầu',
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
    key: 'endDate',
    header: 'Ngày kết thúc',
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


