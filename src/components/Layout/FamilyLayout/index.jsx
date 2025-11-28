import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import GenericDrawer from '../../Common/Drawer/GenericDrawer';
import UserHeader from '../../Headers/UserHeader';
import PageTransition from '../../Common/PageTransition';
import {
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  ChildCare as ChildIcon,
  EventAvailable as ScheduleIcon,
  AccountBalanceWallet as WalletIcon,
  School as BookIcon,
  Notifications as BellIcon,
  Person as ProfileIcon,
  Lock as LockIcon,
  AccountBalance as FinanceIcon,
  Wallet as MainWalletIcon,
  ChildCare as ChildrenWalletIcon,
  History as TransactionHistoryIcon
} from '@mui/icons-material';

const FamilyLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/family/dashboard',
      label: 'Bảng điều kiển',
      icon: DashboardIcon
    },
    {
      path: '/family/children',
      label: 'Con cái',
      icon: ChildIcon
    },
    {
      groupKey: 'finance',
      label: 'Tài chính',
      icon: FinanceIcon,
      children: [
        {
          path: '/family/finance/main-wallet',
          label: 'Ví chính',
          icon: MainWalletIcon
        },
        {
          path: '/family/finance/children-wallet',
          label: 'Ví con',
          icon: ChildrenWalletIcon
        },
        {
          path: '/family/finance/transaction-history',
          label: 'Lịch sử giao dịch',
          icon: TransactionHistoryIcon
        }
      ]
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
      <UserHeader />

      <Box sx={{ display: 'flex' }}>
        {/* Generic Drawer */}
        <GenericDrawer
          title="BRIGHWAY"
          subtitle="Family Portal"
          menuItems={menuItems}
          onLogout={handleLogout}
          profilePath="/family/profile"
          changePasswordPath="/family/change-password"
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