import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './ParentHeader.module.css';

const ParentHeader = () => {
  return (
    <motion.header 
      className={styles.header}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.headerContainer}>
        {/* Logo */}
        <motion.div 
          className={styles.logo}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link to="/" className={styles.logoLink}>
            <span className={styles.logoText}>BRIGHWAY</span>
            <span className={styles.logoSubtext}>Parent Portal</span>
          </Link>
        </motion.div>

        {/* User Menu */}
        <motion.div 
          className={styles.userMenu}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className={styles.userInfo}>
            <span className={styles.userName}>Phụ huynh</span>
            <span className={styles.userRole}>Parent</span>
          </div>
          <div className={styles.userActions}>
            <motion.button 
              className={styles.logoutButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Đăng xuất
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default ParentHeader;