import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Typography, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Business as BusinessIcon,
  Assignment as AssignIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

export const createBranchColumns = ({
  expandedRows,
  onToggleExpand,
  onAssignBenefits,
  onAssignSchools,
  onAssignStudentLevels,
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
    render: (_, item) => {
      // Create a component for action menu
      const ActionMenu = ({ item }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        const open = Boolean(anchorEl);

        const handleClick = (event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
          setAnchorEl(null);
        };

        const handleMenuAction = (action) => {
          handleClose();
          action();
        };

        return (
          <>
            <Tooltip title="Thao tác">
              <IconButton
                size="small"
                onClick={handleClick}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={(e) => e.stopPropagation()}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => handleMenuAction(() => onAssignBenefits(item))}>
                <ListItemIcon>
                  <AssignIcon fontSize="small" color="info" />
                </ListItemIcon>
                <ListItemText>Gán lợi ích</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleMenuAction(() => onAssignSchools(item))}>
                <ListItemIcon>
                  <SchoolIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText>Gán trường</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleMenuAction(() => onAssignStudentLevels(item))}>
                <ListItemIcon>
                  <ClassIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText>Gán cấp độ học sinh</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleMenuAction(() => onEditBranch(item))}>
                <ListItemIcon>
                  <EditIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText>Sửa</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={() => handleMenuAction(() => onDeleteBranch(item))}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.dark'
                  }
                }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Xóa</ListItemText>
              </MenuItem>
            </Menu>
          </>
        );
      };

      return (
        <Box display="flex" justifyContent="center">
          <ActionMenu item={item} />
        </Box>
      );
    }
  }
];


