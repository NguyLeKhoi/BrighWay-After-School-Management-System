import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import userService from '../../../services/user.service.js';
import { useAuth } from '../../../contexts/AuthContext';

const ManagerStaffHeader = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setUserInfo(user);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    // Navigate based on role
    if (user?.role === 'Staff' || user?.role === 2) {
      navigate('/staff/profile');
    } else if (user?.role === 'Manager' || user?.role === 1) {
      navigate('/manager/profile');
    }
  };

  const handleChangePassword = () => {
    handleClose();
    // Navigate based on role
    if (user?.role === 'Staff' || user?.role === 2) {
      navigate('/staff/change-password');
    } else if (user?.role === 'Manager' || user?.role === 1) {
      navigate('/manager/change-password');
    }
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
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
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 600,
                color: 'white',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {userInfo.name}
            </Typography>
          )}

          {/* Avatar with Menu */}
          <IconButton
            onClick={handleClick}
            sx={{ 
              p: 0,
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            <Avatar
              src={userInfo?.profilePictureUrl || ''}
              alt={userInfo?.name || userInfo?.fullName || 'User'}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 36,
                height: 36,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.5)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              {!userInfo?.profilePictureUrl && getInitials(userInfo?.name || userInfo?.fullName)}
            </Avatar>
          </IconButton>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                minWidth: 200,
                borderRadius: 'var(--radius-lg)',
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Hồ sơ</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleChangePassword}>
              <ListItemIcon>
                <LockIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Đổi mật khẩu</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Đăng xuất</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ManagerStaffHeader;

