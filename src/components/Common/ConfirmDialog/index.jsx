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
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const ConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmColor = 'error',
  showWarningIcon = true,
  highlightText = null
}) => {
  const isDeleteAction = confirmColor === 'error' || title?.toLowerCase().includes('xóa');
  const IconComponent = isDeleteAction ? DeleteIcon : CheckCircleIcon;

  // Function to highlight text in description
  const renderHighlightedDescription = () => {
    if (!highlightText || !description) {
      return description;
    }

    // Try to find text in quotes first (most common pattern)
    const quotedMatch = description.match(/"([^"]+)"/);
    if (quotedMatch && quotedMatch[1]) {
      const highlightedName = quotedMatch[1];
      const beforeQuote = description.substring(0, description.indexOf('"'));
      const afterQuote = description.substring(description.indexOf('"') + `"${highlightedName}"`.length);
      
      return (
        <>
          {beforeQuote}
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              color: isDeleteAction ? '#dc2626' : '#2563eb',
              backgroundColor: isDeleteAction ? '#fee2e2' : '#dbeafe',
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'inline-block',
              margin: '0 2px'
            }}
          >
            "{highlightedName}"
          </Box>
          {afterQuote}
        </>
      );
    }

    // If no quoted text found, try to highlight the highlightText directly
    if (description.includes(highlightText)) {
      const index = description.indexOf(highlightText);
      const before = description.substring(0, index);
      const after = description.substring(index + highlightText.length);
      
      return (
        <>
          {before}
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              color: isDeleteAction ? '#dc2626' : '#2563eb',
              backgroundColor: isDeleteAction ? '#fee2e2' : '#dbeafe',
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'inline-block',
              margin: '0 2px'
            }}
          >
            {highlightText}
          </Box>
          {after}
        </>
      );
    }

    return description;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          backgroundColor: isDeleteAction ? '#fff5f5' : '#f5f9ff',
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
          {showWarningIcon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: isDeleteAction ? '#fee2e2' : '#dbeafe',
                color: isDeleteAction ? '#dc2626' : '#2563eb',
                flexShrink: 0
              }}
            >
              <IconComponent sx={{ fontSize: 32 }} />
            </Box>
          )}
          <Typography
            id="dialog-title"
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '1.5rem',
              flex: 1
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>

      <DialogContent sx={{ padding: '24px', paddingTop: '16px' }}>
        <Typography
          id="dialog-description"
          variant="body1"
          component="div"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.6,
            fontSize: '0.95rem'
          }}
        >
          {renderHighlightedDescription()}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          padding: '16px 24px',
          gap: 1,
          backgroundColor: '#fafafa',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            minWidth: 100,
            textTransform: 'none',
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: 500,
            borderColor: 'grey.300',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'grey.400',
              backgroundColor: 'grey.50'
            }
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          autoFocus
          sx={{
            minWidth: 100,
            textTransform: 'none',
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: 500,
            boxShadow: isDeleteAction 
              ? '0 2px 8px rgba(220, 38, 38, 0.3)' 
              : '0 2px 8px rgba(37, 99, 235, 0.3)',
            '&:hover': {
              boxShadow: isDeleteAction 
                ? '0 4px 12px rgba(220, 38, 38, 0.4)' 
                : '0 4px 12px rgba(37, 99, 235, 0.4)'
            }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

