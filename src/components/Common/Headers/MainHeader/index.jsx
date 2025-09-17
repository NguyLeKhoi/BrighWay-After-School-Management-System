import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MainHeader.module.css';

const MainHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.headerLogo}>
          <Link to="/" className={styles.logoLink}>
            <h1>BASE</h1>
          </Link>
        </div>
        
        <nav className={styles.headerNav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link to="/" className={styles.navLink}>Home</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/courses" className={styles.navLink}>Courses</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/facilities" className={styles.navLink}>Facilities</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/contact" className={styles.navLink}>Contact</Link>
            </li>
          </ul>
        </nav>
        
        <div className={styles.headerActions}>
          <Link to="/login" className={`${styles.btn} ${styles.btnOutline}`}>Login</Link>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;