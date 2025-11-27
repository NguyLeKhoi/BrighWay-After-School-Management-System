import React from 'react';
import { Typography, Chip } from '@mui/material';

export const createStaffAssignmentColumns = () => [
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
    key: 'studentName',
    header: 'Tên Học Sinh',
    render: (value) => (
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {value || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'branchSlotName',
    header: 'Lớp/Ca',
    render: (value) => (
      <Typography variant="body2">
        {value || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'date',
    header: 'Ngày',
    render: (value) => (
      <Typography variant="body2" color="text.secondary">
        {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
      </Typography>
    )
  },
  {
    key: 'timeframe',
    header: 'Khung Giờ',
    render: (value) => (
      <Typography variant="body2" color="text.secondary">
        {value || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'roomName',
    header: 'Phòng',
    render: (value) => (
      <Typography variant="body2" color="text.secondary">
        {value || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'status',
    header: 'Trạng Thái',
    render: (value) => {
      const statusMap = {
        'booked': { label: 'Đã đăng ký', color: 'success' },
        'attended': { label: 'Đã tham gia', color: 'primary' },
        'absent': { label: 'Vắng mặt', color: 'error' },
        'cancelled': { label: 'Đã hủy', color: 'default' }
      };
      const status = statusMap[value] || { label: value || 'N/A', color: 'default' };
      return (
        <Chip
          label={status.label}
          color={status.color}
          size="small"
        />
      );
    }
  }
];

