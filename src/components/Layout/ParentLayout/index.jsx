import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import GenericDrawer from '../../Common/Drawer/GenericDrawer';
import {
  Person as PersonIcon,
  ChildCare as ChildIcon,
  AccountBalanceWallet as WalletIcon,
  School as BookIcon,
  Notifications as BellIcon
} from '@mui/icons-material';

const drawerWidth = 250;

const ParentLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/parent/profile',
      label: 'Hồ sơ',
      icon: PersonIcon
    },
    {
      path: '/parent/children',
      label: 'Con cái',
      icon: ChildIcon
    },
    {
      path: '/parent/wallet',
      label: 'Ví',
      icon: WalletIcon
    },
    {
      path: '/parent/courses',
      label: 'Khóa học',
      icon: BookIcon
    },
    {
      path: '/parent/notifications',
      label: 'Thông báo',
      icon: BellIcon
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { xs: 'block', sm: 'none' }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            BASE Parent Portal
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Generic Drawer */}
      <GenericDrawer
        title="BASE"
        subtitle="Parent Portal"
        menuItems={menuItems}
        onLogout={handleLogout}
        open={mobileOpen}
        onToggle={handleDrawerToggle}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: { xs: '64px', sm: 0 },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default ParentLayout;
