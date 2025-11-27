import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';

const drawerWidth = 250;
const collapsedDrawerWidth = 64;

const GenericDrawer = ({ 
  title = "BRIGHWAY",
  subtitle = "Portal",
  menuItems = [],
  onLogout = () => {},
  open: controlledOpen,
  onToggle
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [internalOpen, setInternalOpen] = useState(true);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (value) => {
    if (onToggle) {
      onToggle(value);
    } else {
      setInternalOpen(value);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Scroll to top when navigating
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    onLogout();
  };

  const currentWidth = isOpen ? drawerWidth : collapsedDrawerWidth;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: currentWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: currentWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ 
          minHeight: '64px',
          height: '64px',
          display: 'flex',
          flexDirection: isOpen ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          px: isOpen ? 2 : 1,
          py: 1,
          textAlign: 'center', 
          borderBottom: 1, 
          borderColor: 'divider',
          background: 'var(--color-primary)',
          color: 'white',
          position: 'relative'
        }}>
          {isOpen ? (
            <>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  letterSpacing: '0.05em',
                  mb: 0.5,
                  lineHeight: 1.2
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  lineHeight: 1
                }}
              >
                {subtitle}
              </Typography>
              <Tooltip title="Thu gọn" placement="right">
                <IconButton
                  onClick={() => setIsOpen(!isOpen)}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  size="small"
                >
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Mở rộng" placement="right">
              <IconButton
                onClick={() => setIsOpen(!isOpen)}
                sx={{
                  color: 'white',
                  width: '100%',
                  height: '100%',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                size="large"
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </motion.div>

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        <AnimatePresence>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <ListItem disablePadding>
                  <Tooltip title={!isOpen ? item.label : ''} placement="right">
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      component={motion.div}
                      whileHover={isOpen ? { x: 4 } : { scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 2,
                        backgroundColor: isActive 
                          ? 'var(--color-primary-100)' 
                          : 'transparent',
                        color: isActive 
                          ? 'var(--color-primary-dark)' 
                          : 'var(--text-primary)',
                        fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s ease',
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        px: isOpen ? 2 : 1,
                        '&:hover': {
                          backgroundColor: isActive 
                            ? 'var(--color-primary-100)' 
                            : 'var(--bg-secondary)',
                          transform: isOpen ? 'translateX(4px)' : 'scale(1.05)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ 
                        color: isActive 
                          ? 'var(--color-primary-dark)' 
                          : 'var(--text-secondary)',
                        minWidth: isOpen ? 40 : 'auto',
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        mr: isOpen ? 0 : 0
                      }}>
                        <Icon />
                      </ListItemIcon>
                      {isOpen && (
                        <ListItemText 
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: '0.95rem',
                            fontWeight: isActive ? 600 : 500
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </List>

      <Divider />

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Box sx={{ p: isOpen ? 2 : 1 }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isOpen ? (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ 
                  mb: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }
                }}
              >
                Đăng xuất
              </Button>
            ) : (
              <Tooltip title="Đăng xuất" placement="right">
                <IconButton
                  onClick={handleLogout}
                  color="error"
                  sx={{
                    width: '100%',
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            )}
          </motion.div>
          {isOpen && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'var(--text-tertiary)',
                display: 'block', 
                textAlign: 'center',
                fontSize: '0.7rem',
                fontWeight: 500
              }}
            >
              v1.0.0
            </Typography>
          )}
        </Box>
      </motion.div>
    </Drawer>
  );
};

export default GenericDrawer;