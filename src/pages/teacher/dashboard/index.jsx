import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Class as ClassIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Upload as UploadIcon,
  Today as TodayIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import styles from './Dashboard.module.css';

const TeacherDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data for today's schedule
  const todaySchedule = [
    {
      id: 1,
      className: 'Toán lớp 3A',
      time: '08:00 - 09:00',
      room: 'Phòng 101',
      students: 25,
      status: 'upcoming',
      subject: 'Toán học'
    },
    {
      id: 2,
      className: 'Tiếng Anh lớp 3B',
      time: '09:30 - 10:30',
      room: 'Phòng 102',
      students: 23,
      status: 'current',
      subject: 'Tiếng Anh'
    },
    {
      id: 3,
      className: 'Khoa học lớp 4A',
      time: '14:00 - 15:00',
      room: 'Phòng 201',
      students: 28,
      status: 'upcoming',
      subject: 'Khoa học'
    }
  ];

  // Mock statistics
  const stats = [
    {
      title: 'Lớp hôm nay',
      value: '3',
      icon: ClassIcon,
      color: 'primary'
    },
    {
      title: 'Học sinh',
      value: '76',
      icon: PeopleIcon,
      color: 'success'
    },
    {
      title: 'Bài tập chưa chấm',
      value: '12',
      icon: AssignmentIcon,
      color: 'warning'
    },
    {
      title: 'Giờ dạy tuần này',
      value: '24h',
      icon: ScheduleIcon,
      color: 'info'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'current': return 'success';
      case 'upcoming': return 'primary';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'current': return 'Đang diễn ra';
      case 'upcoming': return 'Sắp tới';
      case 'completed': return 'Đã hoàn thành';
      default: return 'Chưa xác định';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Dashboard Giáo viên
        </h1>
        <p className={styles.subtitle}>
          Tổng quan lịch dạy và quản lý lớp học
        </p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>
                  {stat.title}
                </span>
                <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                  <Icon />
                </div>
              </div>
              <p className={styles.statValue}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Today's Schedule */}
      <div className={styles.scheduleSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <TodayIcon className={styles.sectionIcon} />
            Lịch dạy hôm nay
          </h2>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => window.location.href = '/teacher/schedule'}
          >
            Xem tất cả
          </Button>
        </div>

        <div className={styles.scheduleList}>
          {todaySchedule.map((classItem) => (
            <Card key={classItem.id} className={styles.scheduleCard}>
              <CardContent>
                <div className={styles.scheduleHeader}>
                  <div className={styles.classInfo}>
                    <Typography variant="h6" component="h3" className={styles.className}>
                      {classItem.className}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className={styles.subject}>
                      {classItem.subject}
                    </Typography>
                  </div>
                  <Chip 
                    label={getStatusText(classItem.status)}
                    color={getStatusColor(classItem.status)}
                    size="small"
                  />
                </div>

                <div className={styles.scheduleDetails}>
                  <div className={styles.detailItem}>
                    <TimeIcon fontSize="small" className={styles.detailIcon} />
                    <span>{classItem.time}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <LocationIcon fontSize="small" className={styles.detailIcon} />
                    <span>{classItem.room}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <PeopleIcon fontSize="small" className={styles.detailIcon} />
                    <span>{classItem.students} học sinh</span>
                  </div>
                </div>

                <div className={styles.scheduleActions}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => window.location.href = `/teacher/classes/${classItem.id}`}
                  >
                    Quản lý lớp
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => window.location.href = `/teacher/attendance/${classItem.id}`}
                  >
                    Điểm danh
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Thao tác nhanh</h2>
        <div className={styles.actionGrid}>
          <Button 
            variant="contained" 
            className={styles.actionButton}
            onClick={() => window.location.href = '/teacher/attendance'}
            startIcon={<AssignmentIcon />}
          >
            Điểm danh
          </Button>
          <Button 
            variant="contained" 
            className={styles.actionButton}
            onClick={() => window.location.href = '/teacher/performance'}
            startIcon={<AssessmentIcon />}
          >
            Đánh giá học sinh
          </Button>
          <Button 
            variant="contained" 
            className={styles.actionButton}
            onClick={() => window.location.href = '/teacher/materials'}
            startIcon={<UploadIcon />}
          >
            Upload tài liệu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
