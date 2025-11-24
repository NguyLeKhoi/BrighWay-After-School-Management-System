import React from 'react';
import { motion } from 'framer-motion';
import styles from './InfoGrid.module.css';

const InfoGrid = ({ items, columns = 3, className = '' }) => {
  return (
    <div className={`${styles.infoGrid} ${className}`} style={{ '--columns': columns }}>
      {items.map((item, index) => (
        <motion.div 
          key={index} 
          className={styles.infoItem}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <div className={styles.infoLabel}>{item.label}</div>
          <div className={styles.infoValue}>{item.value}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default InfoGrid;

