import { useState, useRef } from 'react';

/**
 * Custom hook for loading with minimum duration
 * Ensures loading state is shown for at least minimumDuration ms
 * @param {number} minimumDuration - Minimum duration in milliseconds (default: 1500ms)
 */
export const useLoading = (minimumDuration = 1500) => {
  const [isLoading, setIsLoading] = useState(false);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  const showLoading = () => {
    startTimeRef.current = Date.now();
    setIsLoading(true);
  };

  const hideLoading = () => {
    if (!startTimeRef.current) {
      setIsLoading(false);
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = minimumDuration - elapsed;

    if (remaining > 0) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Wait for remaining time before hiding
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        startTimeRef.current = null;
        timeoutRef.current = null;
      }, remaining);
    } else {
      // Enough time has passed, hide immediately
      setIsLoading(false);
      startTimeRef.current = null;
    }
  };

  return {
    isLoading,
    showLoading,
    hideLoading
  };
};
