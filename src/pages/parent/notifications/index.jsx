import React, { useState } from 'react';
import styles from './Notifications.module.css';

const Notifications = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'attendance',
      title: 'Điểm danh thành công',
      message: 'Con Nguyễn Văn B đã điểm danh vào lúc 14:05',
      time: '2024-01-15T14:05:00',
      isRead: false,
      childName: 'Nguyễn Văn B'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Thanh toán thành công',
      message: 'Học phí tháng 1 đã được thanh toán thành công',
      time: '2024-01-10T09:30:00',
      isRead: true,
      amount: 1500000
    },
    {
      id: 3,
      type: 'schedule',
      title: 'Thay đổi lịch học',
      message: 'Lớp Toán học nâng cao ngày mai sẽ chuyển sang phòng 205',
      time: '2024-01-14T16:20:00',
      isRead: false,
      courseName: 'Toán học nâng cao'
    },
    {
      id: 4,
      type: 'allowance',
      title: 'Chi tiêu tiêu vặt',
      message: 'Con Nguyễn Thị C đã mua đồ ăn vặt với số tiền 25,000 VND',
      time: '2024-01-13T15:45:00',
      isRead: true,
      childName: 'Nguyễn Thị C',
      amount: 25000
    },
    {
      id: 5,
      type: 'announcement',
      title: 'Thông báo từ trung tâm',
      message: 'Trung tâm sẽ nghỉ lễ Tết từ 8/2 đến 16/2. Các lớp học sẽ tiếp tục từ 17/2',
      time: '2024-01-12T10:00:00',
      isRead: false
    },
    {
      id: 6,
      type: 'evaluation',
      title: 'Báo cáo tiến độ học tập',
      message: 'Báo cáo tiến độ học tập tháng 12 của con đã có sẵn',
      time: '2024-01-05T14:00:00',
      isRead: true,
      childName: 'Nguyễn Văn B'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [unreadCount] = useState(notifications.filter(n => !n.isRead).length);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'attendance':
        return '✅';
      case 'payment':
        return '💳';
      case 'schedule':
        return '📅';
      case 'allowance':
        return '💰';
      case 'announcement':
        return '📢';
      case 'evaluation':
        return '📊';
      default:
        return '🔔';
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

  const markAsRead = (notificationId) => {
    console.log('Mark as read:', notificationId);
    // Handle mark as read
  };

  const markAllAsRead = () => {
    console.log('Mark all as read');
    // Handle mark all as read
  };

  return (
    <div className={styles.notificationsPage}>
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
            Lịch học
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
                onClick={() => markAsRead(notification.id)}
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
              <div className={styles.emptyIcon}>🔔</div>
              <h3>Không có thông báo</h3>
              <p>Bạn sẽ nhận được thông báo khi có hoạt động mới</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
