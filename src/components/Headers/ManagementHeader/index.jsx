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
import userService from '../../../services/user.service.js';

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
      <AppBar position="fixed" sx={{ bgcolor: 'var(--color-primary)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Đang tải...
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', pr: 2 }}>
        {/* User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          {/* Branch Info */}
          {userInfo?.branchName && (
            <Chip
              icon={<BusinessIcon />}
              label={userInfo.branchName}
              color="secondary"
              variant="outlined"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.8)',
                color: 'white',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                },
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            />
          )}

          {/* User Name */}
          {userInfo?.name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  width: 36, 
                  height: 36,
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <PersonIcon />
              </Avatar>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600,
                  color: 'white'
                }}
              >
                {userInfo.name}
              </Typography>
              {userInfo?.roleName && (
                <Chip
                  label={userInfo.roleName}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.3)'
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

