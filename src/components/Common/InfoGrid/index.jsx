import React from 'react';
import styles from './InfoGrid.module.css';

const InfoGrid = ({ items, columns = 3, className = '' }) => {
  return (
    <div className={`${styles.infoGrid} ${className}`} style={{ '--columns': columns }}>
      {items.map((item, index) => (
        <div key={index} className={styles.infoItem}>
          <div className={styles.infoLabel}>{item.label}</div>
          <div className={styles.infoValue}>{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default InfoGrid;

