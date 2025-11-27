import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ScrollTriggerWrapper = ({ children, enabled = true }) => {
  const location = useLocation();
  const containerRef = useRef(null);
  const triggersRef = useRef([]);

  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
      return;
    }

    // Clean up existing triggers
    triggersRef.current.forEach(trigger => trigger.kill());
    triggersRef.current = [];

    const setupScrollTriggers = () => {
      const container = containerRef.current || document;
      
      // Find all sections
      let sections = container.querySelectorAll('section, [data-scroll-section]');
      
      if (sections.length === 0) {
        // If no sections found, try to find main content areas
        const mainContent = container.querySelector('main, [class*="homepage"], [class*="package"], [class*="facilities"]');
        if (mainContent) {
          sections = [mainContent];
        }
      }
      
      sections.forEach((section, index) => {
        // Get all animatable elements in section
        const headings = section.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const paragraphs = section.querySelectorAll('p');
        const images = section.querySelectorAll('img');
        const cards = section.querySelectorAll('[class*="card"], [class*="Card"]');
        
        // Combine all elements to animate
        const allElements = [...headings, ...paragraphs, ...images, ...cards];
        
        if (allElements.length > 0) {
          // Find the first content element to use as trigger point (skip empty spacing)
          // Priority: first heading > first paragraph > first image > first card
          const firstHeading = headings[0];
          const firstParagraph = paragraphs[0];
          const firstImage = images[0];
          const firstCard = cards[0];
          
          // Use the first available content element as trigger
          const triggerElement = firstHeading || firstParagraph || firstImage || firstCard || allElements[0];
          
          // Check if trigger element is already in viewport
          const rect = triggerElement.getBoundingClientRect();
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isInViewport) {
            // If already visible, just set opacity to 1 immediately
            gsap.set(allElements, { opacity: 1, y: 0 });
          } else {
            // Set initial state only if not in viewport
            gsap.set(allElements, { opacity: 0, y: 30 });
          }
          
          // Create ScrollTrigger animation - trigger based on actual content, not section
          const trigger = ScrollTrigger.create({
            trigger: triggerElement,
            start: 'top 85%',  // Trigger khi nội dung gần vào viewport (sớm hơn)
            end: 'bottom 15%',
            toggleActions: 'play none none reverse',
            markers: false,
            onEnter: () => {
              gsap.to(allElements, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
              });
            },
            onLeaveBack: () => {
              gsap.to(allElements, {
                opacity: 0,
                y: 30,
                duration: 0.3,
                ease: 'power2.in',
              });
            },
          });
          
          triggersRef.current.push(trigger);
        } else {
          // If no elements found, try to find content container
          const contentContainer = section.querySelector('[class*="container"], [class*="content"], [class*="wrapper"], [class*="textContent"]');
          const triggerElement = contentContainer || section;
          
          // Check if trigger element is already in viewport
          const rect = triggerElement.getBoundingClientRect();
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isInViewport) {
            gsap.set(section, { opacity: 1, y: 0 });
          } else {
            gsap.set(section, { opacity: 0, y: 20 });
          }
          
          const trigger = ScrollTrigger.create({
            trigger: triggerElement,
            start: 'top 85%',  // Trigger khi nội dung gần vào viewport
            end: 'bottom 15%',
            toggleActions: 'play none none reverse',
            markers: false,
            onEnter: () => {
              gsap.to(section, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
              });
            },
          });
          
          triggersRef.current.push(trigger);
        }
      });

      // Refresh ScrollTrigger
      ScrollTrigger.refresh();
      
      // Ensure scroll position is at top after setup
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Setup after DOM is ready
    const timeoutId = setTimeout(setupScrollTriggers, 200);

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

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

export default ScrollTriggerWrapper;

