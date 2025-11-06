import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import ManagerStaffHeader from '../../Headers/ManagerStaffHeader';

const StaffLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <ManagerStaffHeader />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          p: 3
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default StaffLayout;
