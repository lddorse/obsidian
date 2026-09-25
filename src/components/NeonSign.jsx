const SIGN = 'OBSIDIAN';

// The Monoton neon sign, shared by the entry gate and the hero. Letters are
// separate spans so the gate can flicker them on one by one.
const NeonSign = ({ lit, className = '', ref, ...props }) => (
  <h1
    ref={ref}
    className={`neon-sign ${lit ? 'is-lit' : 'is-unlit'} ${className}`}
    aria-label="Obsidian"
    {...props}
  >
    {[...SIGN].map((letter, i) => (
      <span key={i} className="neon-letter" style={{ '--i': i }} aria-hidden="true">
        {letter}
      </span>
    ))}
  </h1>
);

export default NeonSign;
