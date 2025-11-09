import React from 'react';
import { Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import styles from './ManagementPageHeader.module.css';

/**
 * Shared management page header for admin/manager roles.
 */
const ManagementPageHeader = ({
  title,
  createButtonText = 'Thêm mới',
  onCreateClick,
  children
}) => (
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

export default ManagementPageHeader;

