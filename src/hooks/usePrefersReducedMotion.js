import { useState, useEffect } from 'react';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

// Tracks the OS reduced-motion setting, updating live when the user toggles it
export const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(
    () => window.matchMedia(reducedMotionQuery).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(reducedMotionQuery);
    const handleChange = (e) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
};
