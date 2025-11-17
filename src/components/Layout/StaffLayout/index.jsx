import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import ManagerStaffHeader from '../../Headers/ManagerStaffHeader';
import GenericDrawer from '../../Common/Drawer/GenericDrawer';
import {
  Dashboard as DashboardIcon,
  Category as ActivityTypeIcon,
  Event as ActivityIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

const StaffLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/staff/dashboard',
      label: 'Dashboard',
      icon: DashboardIcon
    },
    {
      path: '/staff/activity-types',
      label: 'Loại Hoạt Động',
      icon: ActivityTypeIcon
    },
    {
      path: '/staff/activities',
      label: 'Hoạt Động',
      icon: ActivityIcon
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', paddingTop: '64px' }}>
      {/* Header */}
      <ManagerStaffHeader />

      <Box sx={{ display: 'flex' }}>
        {/* Sidebar */}
        <GenericDrawer
          title="BRIGHWAY"
          subtitle="Staff Portal"
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
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default StaffLayout;
