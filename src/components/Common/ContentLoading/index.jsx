import React from 'react';
import { Box } from '@mui/material';
import styles from './ContentLoading.module.css';

const ContentLoading = ({ 
  isLoading = false,
  text = 'Đang tải...'
}) => {
  if (!isLoading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: '250px', // Sidebar width from GenericDrawer
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--bg-secondary)', // Match main content background - solid color
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className={styles.loadingContainer}>
        {/* Logo/Icon */}
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>B</div>
          </div>
          <h1 className={styles.logoText}>BRIGHTWAY</h1>
        </div>

        {/* Loading Animation */}
        <div className={styles.loadingAnimation}>
          <div className={styles.spinner}>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className={styles.loadingText}>
          <h2 className={styles.loadingTitle}>{text}</h2>
          <p className={styles.loadingSubtitle}>Vui lòng chờ trong giây lát</p>
        </div>

        {/* Dots Animation */}
        <div className={styles.dotsContainer}>
          <div className={styles.dots}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default ContentLoading;
