import { useState, useEffect } from 'react';
import { animations } from '../data/animations';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

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
