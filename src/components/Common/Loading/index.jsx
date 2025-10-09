import React from 'react';
import styles from './Loading.module.css';

const Loading = () => {
  return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingContainer}>
        {/* Logo/Icon */}
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>B</div>
          </div>
          <h1 className={styles.logoText}>Brightway</h1>
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
          <h2 className={styles.loadingTitle}>Đang tải...</h2>
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
    </div>
  );
};

export default Loading;
