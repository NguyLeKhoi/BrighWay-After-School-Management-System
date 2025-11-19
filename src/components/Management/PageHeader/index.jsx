import React from 'react';
import { motion } from 'framer-motion';
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
  <motion.div 
    className={styles.header}
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <h1 className={styles.title}>{title}</h1>
    <div className={styles.actions}>
      {onCreateClick && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateClick}
            className={styles.addButton}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            {createButtonText}
          </Button>
        </motion.div>
      )}
      {children}
    </div>
  </motion.div>
);

export default ManagementPageHeader;

