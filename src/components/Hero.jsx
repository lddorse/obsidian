import NeonSign from './NeonSign';
import { formatOpensAt } from '../utils/businessStatus';

// signRef is where the entry gate's sign lands; it stays hidden until then
const Hero = ({ status, signRef, signHidden, alleyNote, links }) => {
  return (
    <section id="hero" className="snap-section hero" tabIndex={-1} aria-label="Welcome">
      <NeonSign
        ref={signRef}
        lit={status.isOpen}
        className="hero-sign"
        style={signHidden ? { visibility: 'hidden' } : undefined}
      />

      <p className="tagline">
        &gt; SPECIALTY COFFEE ROASTING + CRAFT COCKTAILS + DRAFT BEER_
        <span className="blink" aria-hidden="true">█</span>
      </p>

      <p className={`hero-status ${status.isOpen ? 'is-open' : 'is-closed'}`}>
        &gt; {status.isOpen ? `OPEN UNTIL ${status.closesAt}` : `OPENS ${formatOpensAt(status.opensAt)}`}
      </p>

      <a href="#location" className="alley-notice hero-alley">
        ⚠ {alleyNote} ⚠
      </a>

      <nav aria-label="Sections">
        <ul className="jump-links">
          {links.map(({ id, label }) => (
            <li key={id}>
              <a href={`#${id}`}>&gt; {label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
};

export default Hero;
