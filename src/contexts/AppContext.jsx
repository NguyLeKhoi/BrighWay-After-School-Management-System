import React, { createContext, useContext, useState } from 'react';

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
  
  // Global notification state
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

  // Notification management
  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { id, ...notification };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
    
    return id;
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
