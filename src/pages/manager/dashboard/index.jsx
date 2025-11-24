import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Paper, Grid } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import AnimatedCard from '../../../components/Common/AnimatedCard';
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
      title: 'Tổng Nhân Viên',
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
          Dashboard Manager
        </h1>
        <p className={styles.subtitle}>
          Chào mừng đến với trang quản lý của Manager
        </p>
      </motion.div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <AnimatedCard key={index} delay={index * 0.1} className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statValue}>
              {stat.value}
            </div>
            <div className={styles.statLabel}>
              {stat.title}
            </div>
          </AnimatedCard>
        ))}
      </div>

      <AnimatedCard delay={0.4} className={styles.infoCard}>
        <h2 className={styles.infoTitle}>
          Thông tin hệ thống
        </h2>
        <p className={styles.infoText}>
          Đây là trang dashboard dành cho Manager. Tại đây bạn có thể quản lý nhân viên chăm sóc,
          xem báo cáo và thực hiện các tác vụ quản lý khác.
        </p>
      </AnimatedCard>
    </motion.div>
  );
};

export default ManagerDashboard;
