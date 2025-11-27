import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const SessionEndedDialog = ({ 
  open, 
  onClose, 
  message = 'Phiên đăng nhập của bạn đã bị kết thúc do tài khoản được đăng nhập trên thiết bị khác.'
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="session-ended-dialog-title"
      aria-describedby="session-ended-dialog-description"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-2xl)',
          fontFamily: 'var(--font-family)'
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          backgroundColor: 'var(--color-warning-50)',
          padding: '24px 24px 16px 24px'
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-warning-light) 0%, var(--color-warning) 100%)',
              color: 'var(--bg-primary)',
              flexShrink: 0,
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <LogoutIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography
            id="session-ended-dialog-title"
            variant="h6"
            sx={{
              fontWeight: 'var(--font-weight-semibold)',
              fontFamily: 'var(--font-family)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-2xl)',
              flex: 1
            }}
          >
            Phiên đăng nhập đã kết thúc
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ 
        padding: '24px', 
        paddingTop: '16px',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <Typography
          id="session-ended-dialog-description"
          variant="body1"
          component="div"
          sx={{
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-family)',
            lineHeight: 'var(--line-height-relaxed)',
            fontSize: 'var(--font-size-base)'
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          padding: '16px 24px',
          gap: 2,
          backgroundColor: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border-light)'
        }}
      >
      </DialogActions>
    </Dialog>
  );
};

export default SessionEndedDialog;

