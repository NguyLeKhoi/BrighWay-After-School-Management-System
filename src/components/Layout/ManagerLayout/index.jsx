import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import GenericDrawer from '../../Common/Drawer/GenericDrawer';
import ManagerStaffHeader from '../../Headers/ManagerStaffHeader';
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

const ManagerLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/manager/dashboard',
      label: 'Dashboard',
      icon: DashboardIcon
    },
    {
      path: '/manager/staffAndParent',
      label: 'Nhân Viên & ParentParent',
      icon: UserIcon
    },
    {
      path: '/manager/rooms',
      label: 'Phòng Học',
      icon: RoomIcon
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <ManagerStaffHeader />

      <Box sx={{ display: 'flex' }}>
        {/* Generic Drawer */}
        <GenericDrawer
          title="BRIGHWAY"
          subtitle="Manager Portal"
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

export default ManagerLayout;
