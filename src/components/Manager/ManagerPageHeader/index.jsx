import React from 'react';
import { Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import styles from './ManagerPageHeader.module.css';

/**
 * Reusable Manager Page Header Component
 * @param {string} title - Page title
 * @param {string} createButtonText - Text for create button
 * @param {Function} onCreateClick - Handler for create button click
 * @param {React.ReactNode} children - Optional additional content
 */
const ManagerPageHeader = ({ 
  title, 
  createButtonText = 'Thêm mới',
  onCreateClick,
  children 
}) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        {onCreateClick && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateClick}
            className={styles.addButton}
          >
            {createButtonText}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
};

export default ManagerPageHeader;

