import { useState, useCallback } from 'react';

/**
 * Custom hook for content-level loading states in admin pages
 * Renders loading overlay only in the content area, not affecting fixed sidebar
 * 
 * @param {number} minDuration - Minimum loading duration in milliseconds (default: 200ms for faster UX)
 * @returns {Object} Loading state and control functions
 */
const useContentLoading = (minDuration = 200) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Đang tải...');

  const showLoading = useCallback((text = 'Đang tải...') => {
    setLoadingText(text);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    // Ensure minimum loading duration for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, minDuration);
  }, [minDuration]);

  const setText = useCallback((text) => {
    setLoadingText(text);
  }, []);

  return {
    isLoading,
    loadingText,
    showLoading,
    hideLoading,
    setText
  };
};

export default useContentLoading;
