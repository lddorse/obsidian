import { useState, useEffect, useRef } from 'react';
import { getBusinessStatus, formatOpensAt } from '../utils/businessStatus';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const SIGN = 'OBSIDIAN';
const EXIT_MS = 400;
const FONT_TIMEOUT_MS = 1000;

// Recomputes open/closed at the start of every minute
const useBusinessStatus = () => {
  const [status, setStatus] = useState(() => getBusinessStatus());

  useEffect(() => {
    let timer;
    const tick = () => {
      setStatus(getBusinessStatus());
      timer = setTimeout(tick, 60000 - (Date.now() % 60000));
    };
    timer = setTimeout(tick, 60000 - (Date.now() % 60000));
    return () => clearTimeout(timer);
  }, []);

  return status;
};

// Wait for Monoton so letters don't light up in the fallback font, but not forever
const useFontReady = (font) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loaded = document.fonts ? document.fonts.load(font) : Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, FONT_TIMEOUT_MS));
    Promise.race([loaded, timeout])
      .catch(() => {})
      .then(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [font]);

  return ready;
};

const EntryGate = ({ onClose }) => {
  const status = useBusinessStatus();
  const prefersReducedMotion = usePrefersReducedMotion();
  const fontReady = useFontReady('1em Monoton');
  const [leaving, setLeaving] = useState(false);
  const gateRef = useRef(null);

  const enter = () => {
    if (leaving) return;
    if (prefersReducedMotion) {
      onClose();
    } else {
      setLeaving(true);
    }
  };

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(onClose, EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving, onClose]);

  useEffect(() => {
    const handleKey = (e) => {
      if (['Enter', ' ', 'Escape'].includes(e.key)) {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // Lock page scroll while the gate is up. Focus goes to the dialog, not the
  // button, so the button stays faint until someone tabs to it.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    gateRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const signClass = [
    'gate-sign',
    status.isOpen ? 'is-lit' : 'is-unlit',
    (fontReady || prefersReducedMotion) && 'is-ready'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={gateRef}
      tabIndex={-1}
      className={`entry-gate${leaving ? ' is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Obsidian"
      onClick={enter}
    >
      <h1 className={signClass} aria-label="Obsidian">
        {[...SIGN].map((letter, i) => (
          <span key={i} className="gate-letter" style={{ '--i': i }} aria-hidden="true">
            {letter}
          </span>
        ))}
      </h1>

      <p className={`gate-status ${status.isOpen ? 'is-open' : 'is-closed'}`}>
        {status.isOpen ? 'OPEN' : `CLOSED // OPENS ${formatOpensAt(status.opensAt)}`}{' '}
        <span className="blink" aria-hidden="true">_</span>
      </p>

      <button type="button" className="gate-enter" onClick={enter}>
        tap to enter
      </button>
    </div>
  );
};

export default EntryGate;
