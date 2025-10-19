import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import styles from './dashboard.module.css';

const ManagerDashboard = () => {
  const stats = [
    {
      title: 'Tổng Nhân Viên',
      value: '24',
      icon: <PersonIcon />,
      color: '#1976d2'
    },
    {
      title: 'Tổng Giáo Viên',
      value: '12',
      icon: <SchoolIcon />,
      color: '#2e7d32'
    },
    {
      title: 'Báo Cáo Tháng',
      value: '8',
      icon: <ReportIcon />,
      color: '#f57c00'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Dashboard Manager
        </h1>
        <p className={styles.subtitle}>
          Chào mừng đến với trang quản lý của Manager
        </p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statValue}>
              {stat.value}
            </div>
            <div className={styles.statLabel}>
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.infoCard}>
        <h2 className={styles.infoTitle}>
          Thông tin hệ thống
        </h2>
        <p className={styles.infoText}>
          Đây là trang dashboard dành cho Manager. Tại đây bạn có thể quản lý nhân viên và giáo viên,
          xem báo cáo và thực hiện các tác vụ quản lý khác.
        </p>
      </div>
    </div>
  );
};

export default ManagerDashboard;
