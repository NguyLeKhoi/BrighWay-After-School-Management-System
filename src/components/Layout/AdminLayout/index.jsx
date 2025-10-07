import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import GenericDrawer from '../../Common/Drawer/GenericDrawer';
import {
  People as UsersIcon,
  School as CoursesIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: DashboardIcon
    },
    {
      path: '/admin/roles',
      label: 'Quản lý Role',
      icon: UsersIcon
    },
    {
      path: '/admin/courses',
      label: 'Quản lý Khóa học',
      icon: CoursesIcon
    },
    {
      path: '/admin/reports',
      label: 'Báo cáo',
      icon: ReportsIcon
    },
    {
      path: '/admin/settings',
      label: 'Cài đặt',
      icon: SettingsIcon
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Generic Drawer */}
      <GenericDrawer
        title="BASE"
        subtitle="Admin Portal"
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

export default AdminLayout;
