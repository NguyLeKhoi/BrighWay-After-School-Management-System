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
  EventAvailable as ScheduleIcon,
  CalendarToday,
  AccessTime,
  MeetingRoom,
  Business
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
import studentSlotService from '../../../services/studentSlot.service';
import { extractDateString, formatDateOnlyUTC7 } from '../../../utils/dateHelper';
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

  const [upcomingSchedules, setUpcomingSchedules] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Xác định loại lịch: past, current, upcoming
  const getSlotTimeType = (slot) => {
    const dateValue = slot.branchSlot?.date || slot.date;
    const timeframe = slot.timeframe || slot.timeFrame;
    
    if (!dateValue || !timeframe) return 'upcoming';
    
    try {
      const dateStr = extractDateString(dateValue);
      const startTime = timeframe.startTime || '00:00:00';
      const endTime = timeframe.endTime || '00:00:00';
      
      const formatTime = (time) => {
        if (!time) return '00:00:00';
        if (time.length === 5) return time + ':00';
        return time;
      };
      
      const formattedStartTime = formatTime(startTime);
      const formattedEndTime = formatTime(endTime);
      
      const startDateTime = new Date(`${dateStr}T${formattedStartTime}+07:00`);
      const endDateTime = new Date(`${dateStr}T${formattedEndTime}+07:00`);
      const now = new Date();
      
      if (endDateTime < now) {
        return 'past';
      } else if (startDateTime <= now && now <= endDateTime) {
        return 'current';
      } else {
        return 'upcoming';
      }
    } catch (error) {
      return 'upcoming';
    }
  };

  const loadUpcomingSchedules = async (children) => {
    if (!children || children.length === 0) {
      setUpcomingSchedules([]);
      return;
    }
    
    try {
      const allUpcomingSlots = [];
      
      for (const child of children) {
        try {
          // Load tất cả các trang
          let pageIndex = 1;
          const pageSize = 100;
          let hasMore = true;
          
          while (hasMore) {
            const response = await studentSlotService.getStudentSlots({
              StudentId: child.id,
              pageIndex: pageIndex,
              pageSize: pageSize
            });
            
            const items = response?.items || [];
            const totalCount = response?.totalCount || 0;
            const totalPages = response?.totalPages || Math.ceil(totalCount / pageSize);
            
            // Lọc lấy lịch đang diễn ra và sắp tới (không lấy lịch đã qua)
            const upcomingItems = items.filter(slot => {
              const timeType = getSlotTimeType(slot);
              const isUpcoming = timeType === 'upcoming' || timeType === 'current';
              return isUpcoming;
            });
            
            // Thêm thông tin child vào mỗi slot
            upcomingItems.forEach(slot => {
              allUpcomingSlots.push({
                ...slot,
                childName: child.name || child.userName || 'Chưa có tên',
                childId: child.id
              });
            });
            
            if (pageIndex >= totalPages || items.length < pageSize) {
              hasMore = false;
            } else {
              pageIndex++;
            }
          }
        } catch (error) {
          // Skip this child if error loading schedules
        }
      }
      
      // Sắp xếp theo thời gian (sớm nhất trước)
      allUpcomingSlots.sort((a, b) => {
        const dateA = new Date(a.branchSlot?.date || a.date || 0);
        const dateB = new Date(b.branchSlot?.date || b.date || 0);
        return dateA - dateB;
      });
      
      // Chỉ lấy 5 lịch sắp tới gần nhất
      setUpcomingSchedules(allUpcomingSlots.slice(0, 5));
    } catch (error) {
      setUpcomingSchedules([]);
    }
  };

  const loadDashboardData = async () => {
    showLoading();
    try {
      // Load children
      const childrenResponse = await studentService.getMyChildren();
      const children = Array.isArray(childrenResponse) 
        ? childrenResponse 
        : (Array.isArray(childrenResponse?.items) ? childrenResponse.items : []);
      
      setStats(prev => ({ ...prev, childrenCount: children.length }));

      // Load wallet balance
      try {
        const wallet = await walletService.getCurrentWallet();
        const balance = wallet?.balance ?? 0;
        setStats(prev => ({ ...prev, walletBalance: balance }));
      } catch (error) {
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
            // Skip this child if error loading packages
          }
        }
        setStats(prev => ({ ...prev, packagesCount: totalPackages }));
      } catch (error) {
        // Silent fail
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
        // Silent fail
      }

      // Load upcoming schedules for all children
      if (children && children.length > 0) {
        await loadUpcomingSchedules(children);
      } else {
        setUpcomingSchedules([]);
      }
    } catch (error) {
      showGlobalError('Không thể tải dữ liệu dashboard');
    } finally {
      hideLoading();
    }
  };

  // Format số tiền ngắn gọn
  const formatCurrencyShort = (amount) => {
    if (amount === 0) return '0 VNĐ';
    
    const billions = amount / 1000000000;
    const millions = amount / 1000000;
    const thousands = amount / 1000;
    
    if (billions >= 1) {
      // Hiển thị tỷ
      if (billions >= 10) {
        return `${Math.floor(billions)} tỷ VNĐ`;
      } else {
        return `${billions.toFixed(1)} tỷ VNĐ`;
      }
    } else if (millions >= 1) {
      // Hiển thị triệu
      if (millions >= 10) {
        return `${Math.floor(millions)} triệu VNĐ`;
      } else {
        return `${millions.toFixed(1)} triệu VNĐ`;
      }
    } else if (thousands >= 1) {
      // Hiển thị nghìn
      return `${Math.floor(thousands)}K VNĐ`;
    } else {
      return `${amount.toLocaleString('vi-VN')} VNĐ`;
    }
  };

  const statCards = [
    {
      title: 'Con cái',
      value: stats.childrenCount,
      icon: ChildIcon,
      color: 'primary',
      onClick: () => navigate('/user/management/children')
    },
    {
      title: 'Gói dịch vụ',
      value: stats.packagesCount,
      icon: PackageIcon,
      color: 'success',
      onClick: () => navigate('/user/management/packages')
    },
    {
      title: 'Số dư ví',
      value: formatCurrencyShort(stats.walletBalance),
      icon: WalletIcon,
      color: 'warning',
      onClick: () => navigate('/user/finance/main-wallet')
    },
    {
      title: 'Thông báo',
      value: stats.unreadNotifications,
      icon: NotificationIcon,
      color: 'info',
      onClick: () => navigate('/user/notifications')
    }
  ];

  const quickActions = [
    {
      text: 'Thêm con mới',
      icon: <AddIcon />,
      primary: true,
      onClick: () => navigate('/user/management/children/create')
    },
    {
      text: 'Mua gói dịch vụ',
      icon: <ShoppingIcon />,
      primary: false,
      onClick: () => navigate('/user/management/packages')
    },
    {
      text: 'Nạp tiền ví',
      icon: <WalletIcon />,
      primary: false,
      onClick: () => navigate('/user/finance/main-wallet')
    },
    {
      text: 'Xem lịch giữ trẻ',
      icon: <ScheduleIcon />,
      primary: false,
      onClick: () => navigate('/user/management/children')
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
            Tổng quan
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

        {/* Upcoming Schedules */}
        <AnimatedCard delay={0.5} className={styles.infoCard}>
          <div className={styles.infoHeader}>
            <h2 className={styles.infoTitle}>
              Lịch giữ trẻ sắp tới
            </h2>
            <button
              className={styles.viewAllButton}
              onClick={() => navigate('/user/management/schedule')}
            >
              Xem tất cả
            </button>
          </div>
          {upcomingSchedules.length > 0 ? (
            <div className={styles.schedulesList}>
              {upcomingSchedules.map((slot) => {
                const dateValue = slot.branchSlot?.date || slot.date;
                const timeframe = slot.timeframe || slot.timeFrame;
                const roomName = slot.room?.roomName || slot.roomName || slot.branchSlot?.roomName || 'Chưa xác định';
                const branchName = slot.branchSlot?.branchName || slot.branchName || 'Chưa xác định';
                const startTime = timeframe?.startTime || '';
                const endTime = timeframe?.endTime || '';
                
                return (
                  <Paper
                    key={slot.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'var(--color-primary)',
                        boxShadow: 'var(--shadow-sm)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => navigate(`/user/management/schedule/${slot.childId}/${slot.id}`)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.125rem', minWidth: '180px' }}>
                        {slot.childName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.9375rem' }}>
                          {dateValue ? formatDateOnlyUTC7(dateValue) : 'Chưa xác định'}
                        </Typography>
                      </Box>
                      {startTime && endTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
                          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.9375rem' }}>
                            {startTime.substring(0, 5)} - {endTime.substring(0, 5)}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MeetingRoom sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.9375rem' }}>
                          {roomName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ fontSize: 20, color: 'var(--text-secondary)' }} />
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.9375rem' }}>
                          {branchName}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            </div>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 48, color: 'var(--text-secondary)', mb: 2, opacity: 0.5 }} />
              <Typography variant="body1" color="text.secondary" fontWeight="medium">
                Chưa có lịch giữ trẻ sắp tới
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Hiện tại không có lịch giữ trẻ nào đang diễn ra hoặc sắp tới
              </Typography>
            </Box>
          )}
        </AnimatedCard>


        {/* Empty State */}
        {stats.childrenCount === 0 && (
          <AnimatedCard delay={0.7} className={styles.infoCard}>
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
                onClick={() => navigate('/user/management/children/create')}
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
