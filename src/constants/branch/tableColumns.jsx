import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import {
  Business as BusinessIcon,
  Assignment as AssignIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export const createBranchColumns = ({
  expandedRows,
  onToggleExpand,
  onAssignBenefits,
  onEditBranch,
  onDeleteBranch
}) => [
  {
    key: 'branchName',
    header: 'Tên Chi Nhánh',
    render: (value, item) => (
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton
          size="small"
          onClick={() => onToggleExpand(item.id)}
          sx={{ padding: '4px', ml: -1 }}
        >
          {expandedRows.has(item.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <BusinessIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight="medium">
          {value}
        </Typography>
      </Box>
    )
  },
  {
    key: 'address',
    header: 'Địa Chỉ',
    render: (value, item) => {
      const fullAddress = [item.address, item.districtName, item.provinceName]
        .filter(Boolean)
        .join(', ');

      return (
        <Typography variant="body2" color="text.secondary">
          {fullAddress || value}
        </Typography>
      );
    }
  },
  {
    key: 'phone',
    header: 'Số Điện Thoại',
    render: (value) => (
      <Typography variant="body2">
        {value}
      </Typography>
    )
  },
  {
    key: 'actions',
    header: 'Thao tác',
    align: 'center',
    render: (_, item) => (
      <Box display="flex" gap={0.5} justifyContent="center">
        <IconButton
          size="small"
          color="info"
          onClick={() => onAssignBenefits(item)}
          title="Gán lợi ích"
        >
          <AssignIcon fontSize="small" />
        </IconButton>
        <Tooltip title="Sửa">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEditBranch(item)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Xóa">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDeleteBranch(item)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }
];


