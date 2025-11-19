import React from 'react';
import { motion } from 'framer-motion';
import styles from './Tabs.module.css';

const Tabs = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <motion.div 
      className={`${styles.tabContainer} ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {tabs.map((tab) => (
        <motion.button 
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {tab.label}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default Tabs;

