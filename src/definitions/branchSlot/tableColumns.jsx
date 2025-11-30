import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { AccessTime as TimeframeIcon, Category as SlotTypeIcon, CalendarToday as WeekDateIcon } from '@mui/icons-material';

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
    key: 'timeframe',
    header: <Typography className={styles?.noWrap}>Khung giờ</Typography>,
    render: (_, item) => (
      <Box display="flex" alignItems="center" gap={1}>
        <TimeframeIcon fontSize="small" color="primary" />
        <Box>
          <Typography variant="subtitle2" fontWeight="medium">
            {item?.timeframe?.name || 'N/A'}
          </Typography>
          {item?.timeframe?.startTime && item?.timeframe?.endTime && (
            <Typography variant="body2" color="text.secondary">
              {item.timeframe.startTime} - {item.timeframe.endTime}
            </Typography>
          )}
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
    key: 'weekDate',
    header: <Typography className={styles?.noWrap}>Ngày trong tuần</Typography>,
    render: (_, item) => (
      <Box display="flex" alignItems="center" gap={1}>
        <WeekDateIcon fontSize="small" color="primary" />
        <Typography variant="body2">
          {WEEK_DAYS[item?.weekDate] || `Ngày ${item?.weekDate || 'N/A'}`}
        </Typography>
      </Box>
    )
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

