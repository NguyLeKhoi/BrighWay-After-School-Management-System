import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import GenericDrawer from '../../Common/Drawer/GenericDrawer';
import {
  Person as PersonIcon,
  ChildCare as ChildIcon,
  AccountBalanceWallet as WalletIcon,
  School as BookIcon,
  Notifications as BellIcon
} from '@mui/icons-material';

const ParentLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
      {/* Generic Drawer */}
      <GenericDrawer
        title="BRIGHWAY"
        subtitle="Parent Portal"
        menuItems={menuItems}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
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