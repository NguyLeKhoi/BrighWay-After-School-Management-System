import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { AccessTime as SlotTypeIcon, Inventory as PackageIcon } from '@mui/icons-material';

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
  },
  {
    key: 'assignedPackages',
    header: 'Gói Đã Gán',
    render: (_, item) => {
      const packageCount = Array.isArray(item?.assignedPackages) ? item.assignedPackages.length : 0;
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <PackageIcon fontSize="small" color="primary" />
          <Chip
            label={`${packageCount} gói`}
            size="small"
            color={packageCount > 0 ? 'primary' : 'default'}
            variant="outlined"
          />
        </Box>
      );
    }
  }
];
