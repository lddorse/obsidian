// Box with ╔ ╗ ╚ ╝ corners; the border itself comes from the className's CSS
const Frame = ({ className, children }) => (
  <div className={className}>
    <span className="frame-corners tl" aria-hidden="true">╔</span>
    <span className="frame-corners tr" aria-hidden="true">╗</span>
    <span className="frame-corners bl" aria-hidden="true">╚</span>
    <span className="frame-corners br" aria-hidden="true">╝</span>
    {children}
  </div>
);

export default Frame;
