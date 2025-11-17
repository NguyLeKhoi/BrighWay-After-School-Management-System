import React from 'react';
import { Box, Typography } from '@mui/material';
import { MeetingRoom as RoomIcon } from '@mui/icons-material';

export const createManagerRoomColumns = (styles) => [
  {
    key: 'roomName',
    header: 'Tên Phòng',
    render: (_, item) => (
      <Typography variant="body2" fontWeight="medium">
        {item.roomName || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'facilityName',
    header: 'Cơ Sở Vật Chất',
    render: (_, item) => (
      <div className={styles?.facilityCell}>
        <RoomIcon className={styles?.facilityIcon} fontSize="small" />
        <span className={styles?.facilityName}>
          {item.facilityName || 'N/A'}
        </span>
      </div>
    )
  },
  {
    key: 'branchName',
    header: 'Chi Nhánh',
    render: (_, item) => (
      <Typography variant="body2">
        {item.branchName || 'N/A'}
      </Typography>
    )
  },
  {
    key: 'capacity',
    header: 'Sức Chứa',
    render: (value) => (
      <span className={styles?.capacityText}>
        {value} người
      </span>
    )
  }
];


