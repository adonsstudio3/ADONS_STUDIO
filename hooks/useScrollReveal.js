import { useEffect, useRef } from 'react';

/**
 * Custom hook for scroll reveal animations using Intersection Observer
 * Adds fade-in and slide-up effect when element enters viewport
 */
export const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    duration = 0.8,
    delay = 0,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Add reveal class to trigger animation
        element.classList.add('reveal');
        // Unobserve after animation
        observer.unobserve(element);
      }
    }, { threshold, rootMargin });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, rootMargin, duration, delay]);

  return ref;
};
