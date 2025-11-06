import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box
} from '@mui/material';

/**
 * Reusable Manager Form Dialog Component
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Handler for close
 * @param {string} mode - 'create' or 'edit'
 * @param {string} title - Dialog title
 * @param {React.ReactNode} icon - Icon component
 * @param {boolean} loading - Loading state
 * @param {React.ReactNode} children - Dialog content (usually Form component)
 * @param {string} maxWidth - Dialog max width ('sm', 'md', 'lg')
 */
const ManagerFormDialog = ({
  open,
  onClose,
  mode,
  title,
  icon: Icon,
  loading = false,
  children,
  maxWidth = 'sm'
}) => {
  const dialogTitle = mode === 'create' ? `Thêm ${title} mới` : `Chỉnh sửa ${title}`;
  
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth={maxWidth}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '8px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {Icon && <Icon />}
          <span>{dialogTitle}</span>
        </Box>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'white',
            minWidth: 'auto',
            padding: '8px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          ✕
        </Button>
      </DialogTitle>
      <DialogContent sx={{ padding: '24px !important', paddingTop: '32px !important' }}>
        <div style={{ paddingTop: '8px' }}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagerFormDialog;

