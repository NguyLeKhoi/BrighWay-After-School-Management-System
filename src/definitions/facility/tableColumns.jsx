import React from 'react';
import { Box, Typography } from '@mui/material';
import { Room as RoomIcon } from '@mui/icons-material';

export const createFacilityColumns = () => [
  {
    key: 'facilityName',
    header: 'Tên Cơ Sở Vật Chất',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <RoomIcon fontSize="small" color="primary" />
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
      <Typography variant="body2" color="text.secondary">
        {value}
      </Typography>
    )
  }
];


