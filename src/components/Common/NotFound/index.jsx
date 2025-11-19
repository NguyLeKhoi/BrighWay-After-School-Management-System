import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Threads from '../../Animation/Background/Threads';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.notfoundPage}>
      <div className={styles.threadsBackground}>
        <Threads
          amplitude={2.5}
          distance={0}
          enableMouseInteraction={true}
        />
      </div>
      <motion.div 
        className={styles.notfoundContainer}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className={styles.notfoundContent}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div 
            className={styles.errorCode}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            404
          </motion.div>
          <motion.h1 
            className={styles.errorTitle}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Page Not Found
          </motion.h1>
          <motion.p 
            className={styles.errorDescription}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Sorry, the page you are looking for doesn't exist or has been moved.
          </motion.p>

          <motion.div 
            className={styles.errorActions}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/" className={styles.homeButton}>
                Go Home
              </Link>
            </motion.div>
            <motion.button
              onClick={() => window.history.back()}
              className={styles.backButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go Back
            </motion.button>
          </motion.div>

          <motion.div 
            className={styles.helpLinks}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <p className={styles.helpText}>Maybe you were looking for:</p>
            <ul className={styles.helpList}>
              {['/login', '/register', '/', '/contact'].map((path, index) => (
                <motion.li
                  key={path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to={path} 
                      className={styles.helpLink}
                    >
                      {path === '/' ? 'Home' : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div 
          className={styles.notfoundIllustration}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div 
            className={styles.illustrationContainer}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
          >
            <div className={styles.illustrationIcon}>🔍</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
