import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

const SessionEndedDialog = ({ open, onClose, message }) => {
  const handleGoToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LogoutIcon sx={{ color: 'error.main', fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Phiên đăng nhập đã kết thúc
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {message || 'Tài khoản của bạn đã được đăng nhập từ một thiết bị khác. Phiên đăng nhập hiện tại đã bị kết thúc.'}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default SessionEndedDialog;

