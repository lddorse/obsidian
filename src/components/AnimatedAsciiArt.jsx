import { useState, useEffect } from 'react';
import { animations } from '../data/animations';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

// Tracks the OS reduced-motion setting, updating live when the user toggles it
const usePrefersReducedMotion = () => {
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

const AnimatedAsciiArt = ({ animationType }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animation = animations[animationType];
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % animation.frames.length);
    }, animation.speed);

    return () => clearInterval(interval);
  }, [animation, prefersReducedMotion]);

  const frame = prefersReducedMotion ? animation.stillFrame : currentFrame;

  return (
    <div className="ascii-animation">
      <div className="animation-wrapper">
        <pre className="ascii-art">{animation.frames[frame]}</pre>
      </div>
    </div>
  );
};

export default AnimatedAsciiArt;
