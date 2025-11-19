import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './MainHeader.module.css';

const MainHeader = () => {
  const navItems = [
    { path: '/', label: 'Trang Chủ' },
    { path: '/packages', label: 'Gói Dịch Vụ' },
    { path: '/facilities', label: 'Cơ Sở Vật Chất' },
    { path: '/contact', label: 'Liên Hệ' }
  ];

  return (
    <motion.header 
      className={styles.header}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className={styles.headerContainer}>
        <motion.div 
          className={styles.headerLogo}
          whileHover={{ scale: 1.05 }}
        >
          <Link to="/" className={styles.logoLink}>
            <h1>BRIGHWAY</h1>
          </Link>
        </motion.div>
        
        <nav className={styles.headerNav}>
          <ul className={styles.navList}>
            {navItems.map((item, index) => (
              <motion.li 
                key={item.path}
                className={styles.navItem}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <Link to={item.path} className={styles.navLink}>
                    {item.label}
                  </Link>
                </motion.div>
              </motion.li>
            ))}
          </ul>
        </nav>
        
        <motion.div 
          className={styles.headerActions}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/login" className={`${styles.btn} ${styles.btnOutline}`}>
              Đăng Nhập
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default MainHeader;