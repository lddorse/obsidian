import Frame from './Frame';

const AboutSection = ({ hours, description }) => {
  return (
    <section id="about" className="snap-section" tabIndex={-1} aria-labelledby="about-heading">
      <Frame className="info-frame">
        <div className="about-section">
          <h2 id="about-heading">║ ABOUT ║</h2>
          <p>{description}</p>
        </div>

        <div className="info-horizontal-divider" aria-hidden="true">
          ═══════════════════════════════════════════════════════════════════
        </div>

        <div className="hours-section">
          <h2>║ {hours.title} ║</h2>
          <div className="hours-list">
            {hours.schedule.map((item) => (
              <div key={item.day} className="hours-item">
                {item.shortDay ? (
                  <span>
                    <span className="day-long">{item.day}</span>
                    <span className="day-short" aria-hidden="true">{item.shortDay}</span>
                  </span>
                ) : (
                  <span>{item.day}</span>
                )}
                <span className="hours-dots" aria-hidden="true" />
                <span className="hours-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </Frame>
    </section>
  );
};

export default AboutSection;
