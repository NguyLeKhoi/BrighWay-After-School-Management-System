import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component to scroll to top when route changes
 * Used in layouts to ensure page starts at top when navigating
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top smoothly when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

