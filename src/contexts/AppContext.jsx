import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

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
