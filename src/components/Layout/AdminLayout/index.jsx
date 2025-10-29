import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import GenericDrawer from '../../Common/Drawer/GenericDrawer';
import ManagerStaffHeader from '../../Common/Headers/ManagerStaffHeader';
import {
  Business as BranchIcon,
  Room as FacilityIcon,
  Person as UserIcon,
  School as CoursesIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  MeetingRoom as RoomIcon,
  CardGiftcard as BenefitIcon,
  School as StudentLevelIcon
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
      path: '/admin/benefits',
      label: 'Lợi Ích',
      icon: BenefitIcon
    },
    {
      path: '/admin/student-levels',
      label: 'Cấp Độ Học Sinh',
      icon: StudentLevelIcon
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
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
