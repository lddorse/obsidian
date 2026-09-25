import Frame from './Frame';
import Footer from './Footer';

const LocationSection = ({ location }) => {
  return (
    <section id="location" className="snap-section" tabIndex={-1} aria-labelledby="location-heading">
      <Frame className="info-frame">
        <div className="location-section">
          <h2 id="location-heading">║ LOCATION ║</h2>

          <div className="location-address">
            <div className="terminal-line">&gt; {location.address}</div>
            <div className="terminal-line">&gt; {location.city}</div>
          </div>

          <div className="location-directions">
            <h3>&gt; {location.directions.title}_</h3>
            <div className="alley-notice">⚠ {location.directions.note} ⚠</div>
            <ol className="directions-list">
              {location.directions.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </Frame>

      <Footer />
    </section>
  );
};

export default LocationSection;
