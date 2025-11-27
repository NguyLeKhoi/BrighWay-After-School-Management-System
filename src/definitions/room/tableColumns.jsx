import React from 'react';
import { Box, Typography } from '@mui/material';
import { MeetingRoom as RoomIcon } from '@mui/icons-material';

export const createRoomColumns = () => [
  {
    key: 'roomName',
    header: 'Tên Phòng',
    render: (_, row) => (
      <Typography variant="body2" fontWeight="medium">
        {row.roomName || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'facilityName',
    header: 'Cơ Sở Vật Chất',
    render: (_, row) => (
      <Box display="flex" alignItems="center" gap={1}>
        <RoomIcon fontSize="small" color="primary" />
        <Typography variant="body2">
          {row.facilityName || 'N/A'}
        </Typography>
      </Box>
    )
  },
  {
    key: 'branchName',
    header: 'Chi Nhánh',
    render: (_, row) => (
      <Typography variant="body2">
        {row.branchName || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'capacity',
    header: 'Sức Chứa',
    render: (value) => (
      <Typography variant="body2">
        {value} người
      </Typography>
    )
  }
];


