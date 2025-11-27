import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import userService from '../../../services/user.service.js';

const UserHeader = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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
          {userInfo?.name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 600,
                  color: 'white'
                }}
              >
                {userInfo.name}
              </Typography>
              <Tooltip title="Xem hồ sơ" placement="bottom">
                <IconButton
                  onClick={handleProfileClick}
                  sx={{
                    padding: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <Avatar 
                    src={userInfo.profilePictureUrl}
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      width: 40, 
                      height: 40,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'white',
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    {!userInfo.profilePictureUrl && <PersonIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default UserHeader;

