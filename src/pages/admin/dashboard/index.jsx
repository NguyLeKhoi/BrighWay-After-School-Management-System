import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import styles from './Dashboard.module.css';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Tổng User',
      value: '1,234',
      icon: PeopleIcon,
      color: 'primary'
    },
    {
      title: 'Khóa học',
      value: '56',
      icon: SchoolIcon,
      color: 'success'
    },
    {
      title: 'Báo cáo',
      value: '12',
      icon: AssessmentIcon,
      color: 'info'
    },
    {
      title: 'Tăng trưởng',
      value: '+12%',
      icon: TrendingUpIcon,
      color: 'warning'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Dashboard Admin
        </h1>
        <p className={styles.subtitle}>
          Tổng quan hệ thống quản lý
        </p>
      </div>

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
              <div className={`${styles.statChange} ${styles.positive}`}>
                <TrendingUpIcon fontSize="small" />
                +12% so với tháng trước
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            Thống kê User theo tháng
          </h3>
          <div className={styles.chartContent}>
            Biểu đồ sẽ được thêm vào đây
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            User mới nhất
          </h3>
          <div className={styles.chartContent}>
            Danh sách user mới sẽ được thêm vào đây
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
