import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles from './ParentHeader.module.css';

const ParentHeader = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const parentTabs = [
    {
      path: '/parent/profile',
      label: 'Hồ sơ'
    },
    {
      path: '/parent/children',
      label: 'Con cái'
    },
    {
      path: '/parent/wallet',
      label: 'Ví'
    },
    {
      path: '/parent/courses',
      label: 'Khóa học'
    },
    {
      path: '/parent/notifications',
      label: 'Thông báo'
    }
  ];

  const isActiveTab = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {parentTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`${styles.navItem} ${isActiveTab(tab.path) ? styles.active : ''}`}
            >
              <span className={styles.navLabel}>{tab.label}</span>
            </Link>
          ))}
        </nav>

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

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
        >
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={styles.mobileNav}>
          {parentTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`${styles.mobileNavItem} ${isActiveTab(tab.path) ? styles.active : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className={styles.navLabel}>{tab.label}</span>
            </Link>
          ))}
          <div className={styles.mobileUserActions}>
            <button className={styles.mobileLogoutButton}>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default ParentHeader;