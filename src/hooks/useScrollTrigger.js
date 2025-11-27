import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const useScrollTrigger = (enabled = true) => {
  const location = useLocation();
  const triggersRef = useRef([]);

  useEffect(() => {
    if (!enabled) return;

    // Clean up existing triggers
    triggersRef.current.forEach(trigger => trigger.kill());
    triggersRef.current = [];

    // Wait for DOM to be ready
    const setupScrollTriggers = () => {
      // Find all sections
      const sections = document.querySelectorAll('section, [data-scroll-section]');
      
      sections.forEach((section, index) => {
        // Create animation for each section
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            markers: false, // Set to true for debugging
          }
        });

        // Animate section content
        const content = section.querySelectorAll('h1, h2, h3, h4, h5, h6, p, img, [data-scroll-item]');
        
        if (content.length > 0) {
          tl.from(content, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
          });
        } else {
          // Fallback: animate the whole section
          tl.from(section, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: 'power2.out',
          });
        }

        triggersRef.current.push(tl.scrollTrigger);
      });

      // Refresh ScrollTrigger
      ScrollTrigger.refresh();
    };

    // Setup after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(setupScrollTriggers, 100);

    // Refresh on resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
    };
  }, [enabled, location.pathname]);

  return triggersRef.current;
};

export default useScrollTrigger;

