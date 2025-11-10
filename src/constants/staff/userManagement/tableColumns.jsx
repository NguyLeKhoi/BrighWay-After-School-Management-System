import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AssignmentInd as RoleIcon
} from '@mui/icons-material';

export const createStaffUserColumns = () => [
  {
    key: 'name',
    header: 'Họ và Tên',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <PersonIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight="medium">
          {value}
        </Typography>
      </Box>
    )
  },
  {
    key: 'email',
    header: 'Email',
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <EmailIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      </Box>
    )
  },
  {
    key: 'roles',
    header: 'Vai Trò',
    render: (value) => {
      const roles = Array.isArray(value)
        ? value
        : value !== undefined && value !== null
          ? [value]
          : [];

      const getRoleDisplayName = (roleString) => {
        switch (roleString) {
          case 'Admin':
            return 'Admin';
          case 'Staff':
            return 'Staff';
          case 'Manager':
            return 'Manager';
          case 'User':
            return 'User';
          default:
            return roleString || 'Unknown';
        }
      };

      const getRoleColor = (roleString) => {
        switch (roleString) {
          case 'Admin':
            return 'error';
          case 'Manager':
            return 'warning';
          case 'Staff':
            return 'info';
          case 'User':
            return 'primary';
          default:
            return 'default';
        }
      };

      return (
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {roles.map((role, index) => (
            <Chip
              key={`${role}-${index}`}
              label={getRoleDisplayName(role)}
              color={getRoleColor(role)}
              size="small"
              variant="outlined"
              icon={<RoleIcon fontSize="small" />}
            />
          ))}
        </Box>
      );
    }
  },
  {
    key: 'createdAt',
    header: 'Ngày Tạo',
    render: (value) => (
      <Typography variant="body2" color="text.secondary">
        {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
      </Typography>
    )
  }
];


