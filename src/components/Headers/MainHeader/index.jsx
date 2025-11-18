import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MainHeader.module.css';

const MainHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.headerLogo}>
          <Link to="/" className={styles.logoLink}>
            <h1>BRIGHWAY</h1>
          </Link>
        </div>
        
        <nav className={styles.headerNav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link to="/" className={styles.navLink}>Trang Chủ</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/packages" className={styles.navLink}>Gói Dịch Vụ</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/facilities" className={styles.navLink}>Cơ Sở Vật Chất</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/contact" className={styles.navLink}>Liên Hệ</Link>
            </li>
          </ul>
        </nav>
        
        <div className={styles.headerActions}>
          <Link to="/login" className={`${styles.btn} ${styles.btnOutline}`}>Đăng Nhập</Link>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;