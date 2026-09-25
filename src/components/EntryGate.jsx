import { useState, useEffect, useRef } from 'react';
import { formatOpensAt } from '../utils/businessStatus';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScrollLock } from '../hooks/useScrollLock';
import NeonSign from './NeonSign';

const FADE_MS = 400;
const FLIGHT_MS = 500;
const FONT_TIMEOUT_MS = 1000;

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

// On dismiss the sign flies into the hero's sign (targetRef) while the rest of
// the gate fades. If the hero sign isn't fully on screen, the gate just fades.
const EntryGate = ({ status, onClose, targetRef }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const fontReady = useFontReady('1em Monoton');
  const [exit, setExit] = useState(null); // null | 'fade' | 'fly'
  const gateRef = useRef(null);
  const signRef = useRef(null);

  useScrollLock(true);

  const enter = () => {
    if (exit) return;
    if (prefersReducedMotion) {
      onClose();
      return;
    }

    const from = signRef.current?.getBoundingClientRect();
    const to = targetRef?.current?.getBoundingClientRect();
    const onScreen = from && to && to.width > 0 && to.top >= 0 && to.bottom <= window.innerHeight;
    if (!onScreen) {
      setExit('fade');
      return;
    }

    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const scale = to.width / from.width;
    setExit('fly');
    signRef.current
      .animate(
        [{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }],
        { duration: FLIGHT_MS, easing: 'cubic-bezier(0.3, 0, 0.2, 1)', fill: 'forwards' }
      )
      .finished.then(onClose, onClose);
  };

  useEffect(() => {
    if (exit !== 'fade') return;
    const timer = setTimeout(onClose, FADE_MS);
    return () => clearTimeout(timer);
  }, [exit, onClose]);

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

  // Focus goes to the dialog, not the button, so the button stays faint until
  // someone tabs to it
  useEffect(() => {
    gateRef.current?.focus();
  }, []);

  const exitClass = { fade: ' is-leaving', fly: ' is-flying' }[exit] ?? '';

  return (
    <div
      ref={gateRef}
      tabIndex={-1}
      className={`entry-gate${exitClass}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Obsidian"
      onClick={enter}
    >
      <NeonSign
        ref={signRef}
        lit={status.isOpen}
        className={`gate-sign${fontReady || prefersReducedMotion || exit ? ' is-ready' : ''}`}
      />

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
