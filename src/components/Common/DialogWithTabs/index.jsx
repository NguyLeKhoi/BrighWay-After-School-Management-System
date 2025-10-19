import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const DialogWithTabs = ({ 
  open, 
  onClose, 
  onSuccess,
  title = "Dialog",
  tabs = [],
  tabContents = [],
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleClose = () => {
    if (!isSubmitting && !loading) {
      onClose();
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  // Get current tab content
  const currentTabContent = tabContents[activeTab];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
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
          gap: 1,
          padding: '16px 24px'
        }}
      >
        <PersonIcon sx={{ color: 'white' }} />
        <Typography variant="h6" component="span" sx={{ color: 'white' }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Tabs */}
        {tabs.length > 0 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab 
                  key={index}
                  icon={tab.icon} 
                  label={tab.label} 
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {currentTabContent && React.cloneElement(currentTabContent, {
            activeTab,
            isSubmitting,
            setIsSubmitting,
            onSuccess: handleSuccess,
            loading: loading || isSubmitting
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button 
          onClick={handleClose}
          disabled={isSubmitting || loading}
        >
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogWithTabs;
