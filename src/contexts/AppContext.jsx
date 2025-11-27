import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../config/axios.config';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Global loading state
  const [globalLoading, setGlobalLoading] = useState(false);
  
  // Global error state
  const [globalError, setGlobalError] = useState(null);
  
  // Global notification state (deprecated - using react-toastify now)
  const [notifications, setNotifications] = useState([]);
  
  // Theme state
  const [theme, setTheme] = useState('light');
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Show global loading
  const showGlobalLoading = () => setGlobalLoading(true);
  const hideGlobalLoading = () => setGlobalLoading(false);

  // Show global error
  const showGlobalError = (error) => {
    setGlobalError(error);
    // Auto hide after 5 seconds
    setTimeout(() => setGlobalError(null), 5000);
  };
  const hideGlobalError = () => setGlobalError(null);

  // Notification management using react-toastify
  const addNotification = (notification) => {
    const { message, severity = 'info', duration = 4000 } = notification;
    
    switch (severity) {
      case 'success':
        toast.success(message, { autoClose: duration });
        break;
      case 'error':
        toast.error(message, { autoClose: duration });
        break;
      case 'warning':
        toast.warning(message, { autoClose: duration });
        break;
      case 'info':
      default:
        toast.info(message, { autoClose: duration });
        break;
    }
    
    return Date.now(); // Return a fake ID for compatibility
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Theme management
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Sidebar management
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Warm-up backend on app load to reduce cold start delay
  useEffect(() => {
    const warmUpBackend = async () => {
      try {
        // Try to warm up backend by calling a simple endpoint
        // This helps reduce Azure cold start delay on first login
        // Options: Swagger endpoint (public) or health check if available
        const warmUpPromises = [
          // Try swagger endpoint (usually public and lightweight)
          axiosInstance.get('/swagger/v1/swagger.json', {
            timeout: 5000,
            validateStatus: (status) => status < 500 // Accept 200-499
          }).catch(() => null),
          // Try OPTIONS request to /Auth/login to warm up connection
          axiosInstance.options('/Auth/login', {
            timeout: 3000
          }).catch(() => null)
        ];
        
        // Fire and forget - don't wait for all to complete
        Promise.allSettled(warmUpPromises).catch(() => {
          // Silently fail - warm-up should not affect user experience
        });
      } catch (error) {
        // Silently fail - warm-up is best effort only
        console.debug('Warm-up call failed (this is normal):', error);
      }
    };
    
    // Delay warm-up slightly to not block initial render
    // Warm up after 1 second to let app initialize first
    const timeoutId = setTimeout(warmUpBackend, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const value = {
    // Loading
    globalLoading,
    showGlobalLoading,
    hideGlobalLoading,
    
    // Error
    globalError,
    showGlobalError,
    hideGlobalError,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    
    // Theme
    theme,
    toggleTheme,
    
    // Sidebar
    sidebarOpen,
    toggleSidebar
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
