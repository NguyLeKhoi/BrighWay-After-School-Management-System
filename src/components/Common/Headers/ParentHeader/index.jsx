import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ParentHeader.module.css';

const ParentHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <span className={styles.logoText}>BASE</span>
            <span className={styles.logoSubtext}>Parent Portal</span>
          </Link>
        </div>

        {/* User Menu */}
        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Phụ huynh</span>
            <span className={styles.userRole}>Parent</span>
          </div>
          <div className={styles.userActions}>
            <button className={styles.logoutButton}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ParentHeader;