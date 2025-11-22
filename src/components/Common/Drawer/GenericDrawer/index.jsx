import React from 'react';
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
  Button
} from '@mui/material';
import {
  ExitToApp as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 250;

const GenericDrawer = ({ 
  title = "BRIGHWAY",
  subtitle = "Portal",
  menuItems = [],
  onLogout = () => {}
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    // Scroll to top when navigating
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
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
          p: 2, 
          textAlign: 'center', 
          borderBottom: 1, 
          borderColor: 'divider',
          background: 'var(--color-primary)',
          color: 'white'
        }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: '0.05em',
              mb: 0.5
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
              textTransform: 'uppercase'
            }}
          >
            {subtitle}
          </Typography>
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
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    component={motion.div}
                    whileHover={{ x: 4 }}
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
                      '&:hover': {
                        backgroundColor: isActive 
                          ? 'var(--color-primary-100)' 
                          : 'var(--bg-secondary)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: isActive 
                        ? 'var(--color-primary-dark)' 
                        : 'var(--text-secondary)',
                      minWidth: 40
                    }}>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: isActive ? 600 : 500
                      }}
                    />
                  </ListItemButton>
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
        <Box sx={{ p: 2 }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
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
          </motion.div>
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
        </Box>
      </motion.div>
    </Drawer>
  );
};

export default GenericDrawer;