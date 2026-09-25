import { useEffect } from 'react';

// Locks page scrolling (and snapping) on <html>, the page's scroll container.
// Counted, so overlapping locks (gate, modal) release only when all are gone.
let locks = 0;

export const useScrollLock = (active) => {
  useEffect(() => {
    if (!active) return;
    locks += 1;
    document.documentElement.classList.add('scroll-locked');
    return () => {
      locks -= 1;
      if (locks === 0) document.documentElement.classList.remove('scroll-locked');
    };
  }, [active]);
};
