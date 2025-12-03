import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { AccessTime as SlotTypeIcon } from '@mui/icons-material';

export const createSlotTypeColumns = () => [
  {
    key: 'name',
    header: 'Tên Loại Ca',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <SlotTypeIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight="medium">
          {value || 'N/A'}
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
  }
];
