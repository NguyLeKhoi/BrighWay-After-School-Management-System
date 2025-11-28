import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle as AttendanceIcon,
  CreditCard as PaymentIcon,
  CalendarToday as ScheduleIcon,
  AccountBalanceWallet as AllowanceIcon,
  Campaign as AnnouncementIcon,
  Assessment as EvaluationIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import ContentLoading from '@components/Common/ContentLoading';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import notificationService from '../../../services/notification.service';
import AnimatedCard from '../../../components/Common/AnimatedCard';
import styles from './Notifications.module.css';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Map iconName từ API sang type để hiển thị icon
  const mapIconNameToType = (iconName) => {
    if (!iconName) return 'default';
    const lowerIconName = iconName.toLowerCase();
    
    // Map các loại thông báo thanh toán (bao gồm tất cả các loại liên quan đến tiền bạc)
    const paymentKeywords = [
      'payment', 'pay', 'paid', 'purchase', 'buy', 'order',
      'deposit', 'topup', 'refill', 'add_money', 'recharge', 'nạp tiền',
      'refund', 'money_back', 'return', 'hoàn tiền',
      'package_payment', 'subscription_payment', 'package', 'subscription',
      'wallet_payment', 'wallet', 'ví',
      'credit_card', 'card', 'card_payment',
      'transaction', 'billing', 'invoice', 'checkout',
      'shopping_cart', 'receipt'
    ];
    
    // Kiểm tra nếu iconName chứa từ khóa thanh toán
    const isPayment = paymentKeywords.some(keyword => lowerIconName.includes(keyword));
    
    const iconMap = {
      'check_circle': 'attendance',
      'schedule': 'schedule',
      'account_balance_wallet': 'allowance',
      'announcement': 'announcement',
      'assessment': 'evaluation',
    };
    
    // Nếu là thông báo thanh toán, trả về 'payment'
    if (isPayment) {
      return 'payment';
    }
    
    // Kiểm tra các loại khác
    return iconMap[lowerIconName] || 'default';
  };

  const loadNotifications = async () => {
    setError(null);
    setIsLoading(true);
    showLoading();

    try {
      const response = await notificationService.getNotifications();
      const notificationsArray = Array.isArray(response) ? response : [];

      // Map dữ liệu từ API sang format của component
      const mappedNotifications = notificationsArray.map((notif) => ({
        id: notif.id,
        type: mapIconNameToType(notif.iconName),
        title: notif.title || 'Thông báo',
        message: notif.message || '',
        time: notif.createdAt || new Date().toISOString(),
        isRead: notif.isRead || false,
        priority: notif.priority || 'Normal',
        channels: notif.channels || '',
        iconName: notif.iconName || '',
        imageUrl: notif.imageUrl,
        actionUrl: notif.actionUrl
      }));

      setNotifications(mappedNotifications);
    } catch (err) {
      const errorMessage = typeof err === 'string'
        ? err
        : err?.message || err?.error || 'Không thể tải thông báo';
      
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    const iconProps = { sx: { fontSize: 24 } };
    switch (type) {
      case 'attendance':
        return <AttendanceIcon {...iconProps} />;
      case 'payment':
        return <PaymentIcon {...iconProps} />;
      case 'schedule':
        return <ScheduleIcon {...iconProps} />;
      case 'allowance':
        return <AllowanceIcon {...iconProps} />;
      case 'announcement':
        return <AnnouncementIcon {...iconProps} />;
      case 'evaluation':
        return <EvaluationIcon {...iconProps} />;
      default:
        return <NotificationIcon {...iconProps} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'attendance':
        return '#28a745';
      case 'payment':
        return '#007bff';
      case 'schedule':
        return '#ffc107';
      case 'allowance':
        return '#17a2b8';
      case 'announcement':
        return '#dc3545';
      case 'evaluation':
        return '#6f42c1';
      default:
        return '#6c757d';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Vừa xong';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'attendance') return notification.type === 'attendance';
    if (filter === 'payment') return notification.type === 'payment';
    if (filter === 'schedule') return notification.type === 'schedule';
    if (filter === 'allowance') return notification.type === 'allowance';
    if (filter === 'announcement') return notification.type === 'announcement';
    if (filter === 'evaluation') return notification.type === 'evaluation';
    return true;
  });

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update state optimistically
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Không thể đánh dấu đã đọc';
      
      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Navigate to actionUrl if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update state optimistically
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      addNotification({
        message: 'Đã đánh dấu tất cả thông báo là đã đọc',
        severity: 'success'
      });
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Không thể đánh dấu tất cả đã đọc';
      
      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  if (isLoading) {
    return <ContentLoading isLoading={isLoading} text={loadingText || 'Đang tải thông báo...'} />;
  }

  return (
    <motion.div 
      className={styles.notificationsPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Thông báo</h1>
          <div className={styles.headerActions}>
            {unreadCount > 0 && (
              <button 
                className={styles.markAllButton}
                onClick={markAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
            <span className={styles.unreadCount}>
              {unreadCount} chưa đọc
            </span>
          </div>
        </div>

        {error && (
          <div className={styles.errorState}>
            <p className={styles.errorMessage}>{error}</p>
            <button className={styles.retryButton} onClick={loadNotifications}>
              Thử lại
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className={styles.filterContainer}>
          <button 
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({notifications.length})
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
            onClick={() => setFilter('unread')}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'attendance' ? styles.active : ''}`}
            onClick={() => setFilter('attendance')}
          >
            Điểm danh
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'payment' ? styles.active : ''}`}
            onClick={() => setFilter('payment')}
          >
            Thanh toán
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'schedule' ? styles.active : ''}`}
            onClick={() => setFilter('schedule')}
          >
            Lịch giữ trẻ
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'allowance' ? styles.active : ''}`}
            onClick={() => setFilter('allowance')}
          >
            Tiêu vặt
          </button>
        </div>

        {/* Notifications List */}
        <div className={styles.notificationsList}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div 
                  className={styles.notificationIcon}
                  style={{ backgroundColor: getNotificationColor(notification.type) }}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h3 className={styles.notificationTitle}>
                      {notification.title}
                    </h3>
                    <span className={styles.notificationTime}>
                      {formatTime(notification.time)}
                    </span>
                  </div>
                  
                  <p className={styles.notificationMessage}>
                    {notification.message}
                  </p>
                  
                  {notification.childName && (
                    <span className={styles.childTag}>
                      {notification.childName}
                    </span>
                  )}
                  
                  {notification.amount && (
                    <span className={styles.amountTag}>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(notification.amount)}
                    </span>
                  )}
                </div>
                
                {!notification.isRead && (
                  <div className={styles.unreadIndicator}></div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <NotificationIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
              </div>
              <h3>Không có thông báo</h3>
              <p>Bạn sẽ nhận được thông báo khi có hoạt động mới</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Notifications;
