const LocationInfo = ({ info }) => {
  return (
    <div className="info-section">
      <div className="info-frame">
        <span className="frame-corners tl">╔</span>
        <span className="frame-corners tr">╗</span>
        <span className="frame-corners bl">╚</span>
        <span className="frame-corners br">╝</span>
        
        <h2>║ {info.title} ║</h2>
        
        <div className="location-content">
          <div className="location-address">
            <div className="terminal-line">&gt; {info.address}</div>
            <div className="terminal-line">&gt; {info.city}</div>
          </div>
          
          <div className="location-about">
            <p>{info.description}</p>
          </div>
          
          <div className="location-directions">
            <h3>&gt; {info.directions.title}_</h3>
            <div className="alley-notice">
              ⚠ {info.directions.note} ⚠
            </div>
            <ol className="directions-list">
              {info.directions.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;
