import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import userService from '../../../services/user.service.js';

const UserHeader = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleProfileClick = () => {
    navigate('/family/profile');
  };

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
          {/* User Name */}
          {userInfo && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600,
                  color: 'white'
                }}
              >
                {userInfo.fullName || userInfo.name || 'Người dùng'}
              </Typography>
            </Box>
          )}
          
          {/* Profile Avatar */}
          <Tooltip title="Xem hồ sơ">
            <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
              <Avatar
                src={userInfo?.profilePictureUrl || ''}
                alt={userInfo?.fullName || userInfo?.name || 'User'}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: 36,
                  height: 36,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.5)'
                  }
                }}
              >
                {!userInfo?.profilePictureUrl && <PersonIcon />}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserHeader;

