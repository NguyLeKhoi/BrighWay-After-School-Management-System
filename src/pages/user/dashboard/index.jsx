import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper
} from '@mui/material';
import {
  ChildCare as ChildIcon,
  AccountBalanceWallet as WalletIcon,
  School as PackageIcon,
  Notifications as NotificationIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingIcon,
  EventAvailable as ScheduleIcon
} from '@mui/icons-material';
import AnimatedCard from '../../../components/Common/AnimatedCard';
import Card from '../../../components/Common/Card';
import ContentLoading from '../../../components/Common/ContentLoading';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import studentService from '../../../services/student.service';
import walletService from '../../../services/wallet.service';
import packageService from '../../../services/package.service';
import notificationService from '../../../services/notification.service';
import styles from './Dashboard.module.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { showGlobalError } = useApp();
  const { isLoading, loadingText, showLoading, hideLoading } = useContentLoading();

  const [stats, setStats] = useState({
    childrenCount: 0,
    packagesCount: 0,
    walletBalance: 0,
    unreadNotifications: 0
  });

  const [recentChildren, setRecentChildren] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    showLoading();
    try {
      // Load children
      const childrenResponse = await studentService.getMyChildren();
      const children = Array.isArray(childrenResponse) 
        ? childrenResponse 
        : (Array.isArray(childrenResponse?.items) ? childrenResponse.items : []);
      
      setStats(prev => ({ ...prev, childrenCount: children.length }));
      setRecentChildren(children.slice(0, 3));

      // Load wallet balance
      try {
        const wallet = await walletService.getMyWallet();
        const balance = wallet?.balance ?? 0;
        setStats(prev => ({ ...prev, walletBalance: balance }));
      } catch (error) {
        console.error('Error loading wallet:', error);
        setStats(prev => ({ ...prev, walletBalance: 0 }));
      }

      // Load packages count
      try {
        let totalPackages = 0;
        for (const child of children) {
          try {
            const subscriptions = await packageService.getSubscriptionsByStudent(child.id);
            const subs = Array.isArray(subscriptions) ? subscriptions : (subscriptions?.items || []);
            totalPackages += subs.length;
          } catch (error) {
            console.error(`Error loading packages for child ${child.id}:`, error);
          }
        }
        setStats(prev => ({ ...prev, packagesCount: totalPackages }));
      } catch (error) {
        console.error('Error loading packages:', error);
      }

      // Load unread notifications count
      try {
        const notifications = await notificationService.getNotifications();
        const notifs = Array.isArray(notifications) 
          ? notifications 
          : (Array.isArray(notifications?.items) ? notifications.items : []);
        const unreadCount = notifs.filter(n => !n.isRead).length;
        setStats(prev => ({ ...prev, unreadNotifications: unreadCount }));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showGlobalError('Không thể tải dữ liệu dashboard');
    } finally {
      hideLoading();
    }
  };

  const statCards = [
    {
      title: 'Con cái',
      value: stats.childrenCount,
      icon: ChildIcon,
      color: 'primary',
      onClick: () => navigate('/family/children')
    },
    {
      title: 'Gói dịch vụ',
      value: stats.packagesCount,
      icon: PackageIcon,
      color: 'success',
      onClick: () => navigate('/family/packages')
    },
    {
      title: 'Số dư ví',
      value: `${stats.walletBalance.toLocaleString('vi-VN')} VNĐ`,
      icon: WalletIcon,
      color: 'warning',
      onClick: () => navigate('/family/wallet')
    },
    {
      title: 'Thông báo',
      value: stats.unreadNotifications,
      icon: NotificationIcon,
      color: 'info',
      onClick: () => navigate('/family/notifications')
    }
  ];

  const quickActions = [
    {
      text: 'Thêm con mới',
      icon: <AddIcon />,
      primary: true,
      onClick: () => navigate('/family/children/create')
    },
    {
      text: 'Mua gói dịch vụ',
      icon: <ShoppingIcon />,
      primary: false,
      onClick: () => navigate('/family/packages')
    },
    {
      text: 'Nạp tiền ví',
      icon: <WalletIcon />,
      primary: false,
      onClick: () => navigate('/family/wallet')
    },
    {
      text: 'Xem lịch học',
      icon: <ScheduleIcon />,
      primary: false,
      onClick: () => navigate('/family/children')
    }
  ];

  return (
    <>
      {isLoading && <ContentLoading isLoading={isLoading} text={loadingText} />}
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={styles.title}>
            Bảng điều khiển
          </h1>
          <p className={styles.subtitle}>
            Tổng quan tài khoản của bạn
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedCard key={index} delay={index * 0.1} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span className={styles.statTitle}>
                    {stat.title}
                  </span>
                  <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                    <Icon />
                  </div>
                </div>
                <p className={styles.statValue} onClick={stat.onClick} style={{ cursor: 'pointer' }}>
                  {stat.value}
                </p>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Quick Actions */}
        <AnimatedCard delay={0.4} className={styles.quickActionsCard}>
          <h3 className={styles.quickActionsTitle}>
            Thao tác nhanh
          </h3>
          <div className={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={styles.quickActionButton}
                onClick={action.onClick}
                style={{
                  background: action.primary ? 'var(--color-primary)' : 'var(--bg-primary)',
                  color: action.primary ? 'white' : 'var(--text-primary)',
                  borderColor: action.primary ? 'var(--color-primary)' : 'var(--border-light)'
                }}
              >
                <span className={styles.quickActionIcon}>
                  {action.icon}
                </span>
                <span className={styles.quickActionText}>
                  {action.text}
                </span>
              </button>
            ))}
          </div>
        </AnimatedCard>

        {/* Recent Children */}
        {recentChildren.length > 0 && (
          <AnimatedCard delay={0.5} className={styles.infoCard}>
            <div className={styles.infoHeader}>
              <h2 className={styles.infoTitle}>
                Con cái gần đây
              </h2>
              <button
                className={styles.viewAllButton}
                onClick={() => navigate('/family/children')}
              >
                Xem tất cả
              </button>
            </div>
            <div className={styles.childrenGrid}>
              {recentChildren.map((child) => (
                <Card
                  key={child.id}
                  title={child.name || child.userName || 'Chưa có tên'}
                  subtitle={child.branchName || ''}
                  description={`Cấp độ: ${child.studentLevelName || 'Chưa xác định'}`}
                  actions={[
                    {
                      text: 'Xem chi tiết',
                      primary: false,
                      onClick: () => navigate(`/family/children/${child.id}/profile`)
                    }
                  ]}
                />
              ))}
            </div>
          </AnimatedCard>
        )}

        {/* Empty State */}
        {stats.childrenCount === 0 && (
          <AnimatedCard delay={0.6} className={styles.infoCard}>
            <div className={styles.emptyState}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <ChildIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
              </Box>
              <h3 className={styles.emptyTitle}>
                Chưa có con nào được đăng ký
              </h3>
              <p className={styles.emptyText}>
                Bắt đầu bằng cách thêm con của bạn vào hệ thống
              </p>
              <button
                className={styles.emptyButton}
                onClick={() => navigate('/family/children/create')}
              >
                <AddIcon sx={{ fontSize: 20 }} />
                Thêm con mới
              </button>
            </div>
          </AnimatedCard>
        )}
      </motion.div>
    </>
  );
};

export default UserDashboard;
