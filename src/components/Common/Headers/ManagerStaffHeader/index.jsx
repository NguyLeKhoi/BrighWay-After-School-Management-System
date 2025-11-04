import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Chip,
  Avatar
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import userService from '../../../../services/user.service';

const ManagerStaffHeader = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setUserInfo(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
        // Don't show error in header - it's not critical for page functionality
        // Just set userInfo to null so header still renders
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  if (loading) {
    return (
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Đang tải...
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
      <Toolbar>
        {/* Logo/Title */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Quản Lý Hệ Thống
        </Typography>

        {/* User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Branch Info */}
          {userInfo?.branchName && (
            <Chip
              icon={<BusinessIcon />}
              label={userInfo.branchName}
              color="secondary"
              variant="outlined"
              sx={{
                borderColor: 'white',
                color: 'white',
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            />
          )}

          {/* User Name */}
          {userInfo?.name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#ffffff22', width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {userInfo.name}
              </Typography>
              {userInfo?.roleName && (
                <Chip
                  label={userInfo.roleName}
                  size="small"
                  sx={{
                    bgcolor: '#ffffff22',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ManagerStaffHeader;

