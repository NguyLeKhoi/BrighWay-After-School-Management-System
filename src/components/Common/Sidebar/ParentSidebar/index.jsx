import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faChild, 
  faWallet, 
  faBook, 
  faBell,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import styles from './ParentSidebar.module.css';

const ParentSidebar = () => {
  const location = useLocation();

  const parentMenuItems = [
    {
      path: '/parent/profile',
      label: 'Hồ sơ',
      icon: faUser
    },
    {
      path: '/parent/children',
      label: 'Con cái',
      icon: faChild
    },
    {
      path: '/parent/wallet',
      label: 'Ví',
      icon: faWallet
    },
    {
      path: '/parent/courses',
      label: 'Khóa học',
      icon: faBook
    },
    {
      path: '/parent/notifications',
      label: 'Thông báo',
      icon: faBell
    }
  ];

  const isActiveItem = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoText}>BASE</span>
            <span className={styles.logoSubtext}>Parent Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <ul className={styles.menuList}>
            {parentMenuItems.map((item) => (
              <li key={item.path} className={styles.menuItem}>
                <Link
                  to={item.path}
                  className={`${styles.menuLink} ${isActiveItem(item.path) ? styles.active : ''}`}
                >
                  <span className={styles.menuIcon}>
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerInfo}>
            <div className={styles.footerTitle}>BASE Parent Portal</div>
            <div className={styles.footerVersion}>v1.0.0</div>
          </div>
          <div className={styles.footerActions}>
            <button className={styles.logoutButton}>
              <span className={styles.logoutIcon}>
                <FontAwesomeIcon icon={faSignOutAlt} />
              </span>
              <span className={styles.logoutText}>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ParentSidebar;
