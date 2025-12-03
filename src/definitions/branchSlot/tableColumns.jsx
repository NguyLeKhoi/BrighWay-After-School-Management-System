import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { AccessTime as TimeframeIcon, Category as SlotTypeIcon, MeetingRoom as RoomIcon, Person as StaffIcon } from '@mui/icons-material';
import { formatDateOnlyUTC7 } from '../../utils/dateHelper';

/**
 * Week Date Mapping:
 * 0 = Chủ nhật (Sunday)
 * 1 = Thứ 2 (Monday)
 * 2 = Thứ 3 (Tuesday)
 * 3 = Thứ 4 (Wednesday)
 * 4 = Thứ 5 (Thursday)
 * 5 = Thứ 6 (Friday)
 * 6 = Thứ 7 (Saturday)
 */
const WEEK_DAYS = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7'
};

const STATUS_COLORS = {
  Available: 'success',
  Occupied: 'warning',
  Cancelled: 'error',
  Maintenance: 'default'
};

const STATUS_LABELS = {
  Available: 'Có sẵn',
  Occupied: 'Đã đầy',
  Cancelled: 'Đã hủy',
  Maintenance: 'Bảo trì'
};

export const createBranchSlotColumns = (styles) => [
  {
    key: 'scheduleInfo',
    header: <Typography className={styles?.noWrap}>Thông tin lịch</Typography>,
    render: (_, item) => (
      <Box display="flex" alignItems="center" gap={1}>
        <TimeframeIcon fontSize="small" color="primary" sx={{ flexShrink: 0 }} />
        <Box display="flex" flexDirection="column" gap={0.25}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.3 }}>
            {item?.timeframe?.name || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
            {item?.timeframe?.startTime && item?.timeframe?.endTime 
              ? `${item.timeframe.startTime} - ${item.timeframe.endTime}`
              : 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
            <strong>{WEEK_DAYS[item?.weekDate] || `Ngày ${item?.weekDate || 'N/A'}`}</strong>
            {item?.date && (
              <>, {formatDateOnlyUTC7(item.date)}</>
            )}
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    key: 'slotType',
    header: <Typography className={styles?.noWrap}>Loại ca giữ trẻ</Typography>,
    render: (_, item) => (
      <Box display="flex" alignItems="center" gap={1}>
        <SlotTypeIcon fontSize="small" color="primary" />
        <Box>
          <Typography variant="subtitle2" fontWeight="medium">
            {item?.slotType?.name || 'N/A'}
          </Typography>
          {item?.slotType?.description && (
            <Typography variant="body2" color="text.secondary">
              {item.slotType.description}
            </Typography>
          )}
        </Box>
      </Box>
    )
  },
  {
    key: 'resources',
    header: <Typography className={styles?.noWrap}>Phòng & Nhân viên</Typography>,
    render: (_, item) => {
      const roomCount = item?.roomSlots?.length || item?.rooms?.length || 0;
      const staffCount = item?.staffSlots?.length || item?.staffs?.length || 0;
      
      return (
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <RoomIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>{roomCount}</strong> phòng
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <StaffIcon fontSize="small" color="primary" />
            <Typography variant="body2">
              <strong>{staffCount}</strong> nhân viên
            </Typography>
          </Box>
        </Box>
      );
    }
  },
  {
    key: 'status',
    header: <Typography className={styles?.noWrap}>Trạng thái</Typography>,
    render: (_, item) => (
      <Chip
        label={STATUS_LABELS[item?.status] || item?.status || 'N/A'}
        color={STATUS_COLORS[item?.status] || 'default'}
        size="small"
        variant="filled"
      />
    )
  }
];

