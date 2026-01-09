import { useState, useEffect } from 'react';
import { animations } from '../data/animations';

const AnimatedAsciiArt = ({ animationType }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animation = animations[animationType];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % animation.frames.length);
    }, animation.speed);

    return () => clearInterval(interval);
  }, [animation]);

  return (
    <div className="ascii-animation">
      <div className="animation-wrapper">
        <pre className="ascii-art">{animation.frames[currentFrame]}</pre>
      </div>
    </div>
  );
};

export default AnimatedAsciiArt;
