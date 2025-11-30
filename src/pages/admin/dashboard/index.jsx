import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
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
import AnimatedCard from '../../../components/Common/AnimatedCard';
import styles from './Dashboard.module.css';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Tổng Người Dùng',
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
          Tổng quan Quản Trị
        </h1>
        <p className={styles.subtitle}>
          Tổng quan hệ thống quản lý
        </p>
      </motion.div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => {
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
              <p className={styles.statValue}>
                {stat.value}
              </p>
              <div className={`${styles.statChange} ${styles.positive}`}>
                <TrendingUpIcon fontSize="small" />
                +12% so với tháng trước
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      <div className={styles.chartsSection}>
        <AnimatedCard delay={0.4} className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            Thống kê Người Dùng theo tháng
          </h3>
          <div className={styles.chartContent}>
            Biểu đồ sẽ được thêm vào đây
          </div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.5} className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            Người Dùng mới nhất
          </h3>
          <div className={styles.chartContent}>
            Danh sách người dùng mới sẽ được thêm vào đây
          </div>
        </AnimatedCard>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
