import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Component to scroll to top when route changes
 * Used in layouts to ensure page starts at top when navigating
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force scroll to top - multiple methods to ensure it works
    const scrollToTop = () => {
      // Method 1: window.scrollTo
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto' // Use 'auto' instead of 'smooth' for immediate scroll
      });
      
      // Method 2: Direct property assignment
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }
      
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }
      
      // Method 3: window.pageYOffset
      if (window.pageYOffset !== 0) {
        window.scrollTo(0, 0);
      }
    };

    // Scroll immediately
    scrollToTop();

    // Scroll after DOM updates (after ScrollTriggerWrapper setup)
    const timeout1 = setTimeout(() => {
      scrollToTop();
      // Refresh ScrollTrigger after scrolling
      if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    }, 50);

    // Scroll again after ScrollTriggerWrapper delay (200ms)
    const timeout2 = setTimeout(() => {
      scrollToTop();
      if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    }, 250);

    // Final scroll after everything is ready
    const timeout3 = setTimeout(() => {
      scrollToTop();
    }, 500);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;

