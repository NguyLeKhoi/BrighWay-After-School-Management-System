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
  Person as PersonIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import userService from '../../../services/user.service.js';
import { useApp } from '../../../contexts/AppContext';

const UserHeader = ({ onToggleDrawer, isDrawerOpen }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showGlobalError } = useApp();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setUserInfo(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
        showGlobalError('Không thể tải thông tin người dùng.');
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [showGlobalError]);

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
        boxShadow: 'var(--shadow-md)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: `calc(100% - ${isDrawerOpen ? 250 : 64}px)`,
        ml: isDrawerOpen ? '250px' : '64px',
        transition: (theme) => theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', pr: 2 }}>
        {onToggleDrawer && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onToggleDrawer}
            edge="start"
            sx={{
              mr: 2,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          {userInfo?.fullName && (
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: 'white',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {userInfo.fullName}
            </Typography>
          )}
          <Tooltip title="Xem hồ sơ">
            <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
              <Avatar
                src={userInfo?.profilePictureUrl || ''}
                alt={userInfo?.fullName || 'User'}
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

