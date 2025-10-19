import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import GenericDrawer from '../../Common/Drawer/GenericDrawer';
import {
  Dashboard as DashboardIcon,
  Class as ClassIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Upload as UploadIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const TeacherLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/teacher/dashboard',
      label: 'Dashboard',
      icon: DashboardIcon
    },
    {
      path: '/teacher/schedule',
      label: 'Lịch dạy',
      icon: ScheduleIcon
    },
    {
      path: '/teacher/classes',
      label: 'Quản lý lớp',
      icon: ClassIcon
    },
    {
      path: '/teacher/students',
      label: 'Danh sách học sinh',
      icon: PeopleIcon
    },
    {
      path: '/teacher/attendance',
      label: 'Điểm danh',
      icon: AssignmentIcon
    },
    {
      path: '/teacher/performance',
      label: 'Đánh giá học sinh',
      icon: AssessmentIcon
    },
    {
      path: '/teacher/materials',
      label: 'Tài liệu học tập',
      icon: UploadIcon
    }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Generic Drawer */}
      <GenericDrawer
        title="BRIGHWAY"
        subtitle="Teacher Portal"
        menuItems={menuItems}
        onLogout={handleLogout}
        user={user}
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

export default TeacherLayout;
