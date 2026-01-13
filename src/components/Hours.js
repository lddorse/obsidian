const Hours = ({ hours }) => {
  return (
    <div className="info-section">
      <div className="info-frame">
        <span className="frame-corners tl">╔</span>
        <span className="frame-corners tr">╗</span>
        <span className="frame-corners bl">╚</span>
        <span className="frame-corners br">╝</span>
        
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
    </div>
  );
};

export default Hours;
