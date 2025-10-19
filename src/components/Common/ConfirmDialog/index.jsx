import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box
} from '@mui/material';

const ConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary'
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '8px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        id="dialog-title"
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          borderRadius: '8px 8px 0 0',
          padding: '16px 24px',
          fontSize: '1.25rem',
          fontWeight: 600
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          color="primary"
          variant="outlined"
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm}
          color={confirmColor}
          variant="contained"
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

