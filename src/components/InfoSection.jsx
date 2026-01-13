const InfoSection = ({ hours, location }) => {
  return (
    <div className="info-section-wide">
      <div className="info-frame-wide">
        <span className="frame-corners tl">╔</span>
        <span className="frame-corners tr">╗</span>
        <span className="frame-corners bl">╚</span>
        <span className="frame-corners br">╝</span>
        
        {/* About Section - Full Width */}
        <div className="about-section">
          <h2>║ ABOUT ║</h2>
          <p>{location.description}</p>
        </div>
        
        {/* Divider */}
        <div className="info-horizontal-divider">
          ═══════════════════════════════════════════════════════════════════
        </div>
        
        {/* Hours Section - Centered */}
        <div className="hours-section">
          <h2>║ {hours.title} ║</h2>
          <div className="hours-list">
            {hours.schedule.map((item, index) => (
              <div key={index} className="hours-item">
                <span className="hours-day">{item.day}</span>
                <span className="hours-dots">................</span>
                <span className="hours-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Divider */}
        <div className="info-horizontal-divider">
          ═══════════════════════════════════════════════════════════════════
        </div>
        
        {/* Location Section */}
        <div className="location-section">
          <h2>║ LOCATION ║</h2>
          
          <div className="location-address">
            <div className="terminal-line">&gt; {location.address}</div>
            <div className="terminal-line">&gt; {location.city}</div>
          </div>
          
          <div className="location-directions">
            <h3>&gt; {location.directions.title}_</h3>
            <div className="alley-notice">
              ⚠ {location.directions.note} ⚠
            </div>
            <ol className="directions-list">
              {location.directions.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
