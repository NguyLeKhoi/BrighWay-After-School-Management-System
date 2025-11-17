import React from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box } from '@mui/material';

const ManagementFormDialog = ({
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
          borderRadius: '12px',
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
          padding: '18px 24px'
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
      <DialogContent sx={{ padding: '28px !important' }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default ManagementFormDialog;

