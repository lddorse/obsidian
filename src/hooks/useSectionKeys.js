import { useEffect } from 'react';

const KEYS = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
const EDGE = 2; // px of slack when comparing scroll positions

// Arrow keys and Page Up/Down move between .snap-section elements. A section
// taller than the viewport is scrolled through first, so nothing is skipped.
export const useSectionKeys = ({ enabled, reducedMotion }) => {
  useEffect(() => {
    if (!enabled) return;

    // Where an in-flight smooth scroll is headed, so repeated presses stack
    // (cleared on scrollend, with a timeout for browsers without it)
    let pendingTarget = null;
    let pendingTimer;
    const clearPending = () => {
      pendingTarget = null;
      clearTimeout(pendingTimer);
    };

    const handleKey = (e) => {
      const dir = KEYS[e.key];
      if (!dir || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;

      const viewport = window.innerHeight;
      const from = pendingTarget ?? window.scrollY;
      const sections = [...document.querySelectorAll('.snap-section')].map((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        return { top, bottom: top + el.offsetHeight };
      });
      if (!sections.length) return;

      const index = Math.max(0, sections.findLastIndex((s) => s.top <= from + EDGE));
      const current = sections[index];
      const step = e.key.startsWith('Page') ? viewport * 0.9 : viewport * 0.4;
      let target;

      if (dir > 0) {
        if (current.bottom > from + viewport + EDGE) {
          target = Math.min(from + step, current.bottom - viewport);
        } else if (sections[index + 1]) {
          target = sections[index + 1].top;
        }
      } else if (current.top < from - EDGE) {
        target = Math.max(from - step, current.top);
      } else if (sections[index - 1]) {
        const prev = sections[index - 1];
        // Enter a tall previous section at its bottom, not its top
        target = prev.bottom - prev.top > viewport ? prev.bottom - viewport : prev.top;
      }

      if (target === undefined) return;
      e.preventDefault();
      window.scrollTo({ top: target, behavior: reducedMotion ? 'instant' : 'smooth' });

      if (!reducedMotion) {
        pendingTarget = target;
        clearTimeout(pendingTimer);
        pendingTimer = setTimeout(clearPending, 1000);
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('scrollend', clearPending);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('scrollend', clearPending);
      clearPending();
    };
  }, [enabled, reducedMotion]);
};
