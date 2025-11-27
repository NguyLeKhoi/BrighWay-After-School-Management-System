import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import GenericDrawer from '../../Common/Drawer/GenericDrawer';
import UserHeader from '../../Headers/UserHeader';
import PageTransition from '../../Common/PageTransition';
import {
  Person as PersonIcon,
  ChildCare as ChildIcon,
  EventAvailable as ScheduleIcon,
  AccountBalanceWallet as WalletIcon,
  School as BookIcon,
  Notifications as BellIcon
} from '@mui/icons-material';

const FamilyLayout = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);

  const handleToggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/family/children',
      label: 'Con cái',
      icon: ChildIcon
    },
    {
      path: '/family/wallet',
      label: 'Ví',
      icon: WalletIcon
    },
    {
      path: '/family/packages',
      label: 'Các gói',
      icon: BookIcon
    },
    {
      path: '/family/notifications',
      label: 'Thông báo',
      icon: BellIcon
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', paddingTop: '64px' }}>
      {/* Header */}
      <UserHeader onToggleDrawer={handleToggleDrawer} isDrawerOpen={isDrawerOpen} />

      <Box sx={{ display: 'flex' }}>
        {/* Generic Drawer */}
        <GenericDrawer
          title="BRIGHWAY"
          subtitle="Family Portal"
          menuItems={menuItems}
          onLogout={handleLogout}
          isOpen={isDrawerOpen}
          onToggle={handleToggleDrawer}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: 'var(--bg-secondary)',
            minHeight: 'calc(100vh - 64px)',
            transition: 'background-color 0.3s ease'
          }}
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Box>
      </Box>
    </Box>
  );
};

export default FamilyLayout;