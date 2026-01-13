const InfoSection = ({ hours, location }) => {
  return (
    <div className="info-section-wide">
      <div className="info-frame-wide">
        <span className="frame-corners tl">╔</span>
        <span className="frame-corners tr">╗</span>
        <span className="frame-corners bl">╚</span>
        <span className="frame-corners br">╝</span>
        
        <div className="info-columns">
          {/* Hours Column */}
          <div className="info-column">
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
          <div className="info-divider">║</div>
          
          {/* Location Column */}
          <div className="info-column">
            <h2>║ {location.title} ║</h2>
            <div className="location-content">
              <div className="location-address">
                <div className="terminal-line">&gt; {location.address}</div>
                <div className="terminal-line">&gt; {location.city}</div>
              </div>
              
              <div className="location-about">
                <p>{location.description}</p>
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
      </div>
    </div>
  );
};

export default InfoSection;
