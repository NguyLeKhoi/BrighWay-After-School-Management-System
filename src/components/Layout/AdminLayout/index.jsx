import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import GenericDrawer from '../../Common/Drawer/GenericDrawer';
import {
  Business as BranchIcon,
  Room as FacilityIcon,
  Person as UserIcon,
  School as CoursesIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  MeetingRoom as RoomIcon
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
      path: '/admin/staffAndManager',
      label: 'Nhân Viên',
      icon: UserIcon
    },
    {
      path: '/admin/branches',
      label: 'Chi Nhánh',
      icon: BranchIcon
    },
    {
      path: '/admin/facilities',
      label: 'Cơ Sở Vật Chất',
      icon: FacilityIcon
    },
    {
      path: '/admin/rooms',
      label: 'Phòng Học',
      icon: RoomIcon
    },
    {
      path: '/admin/courses',
      label: 'Khóa học',
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
        title="BRIGHWAY"
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
