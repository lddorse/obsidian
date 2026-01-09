import AnimatedAsciiArt from './AnimatedAsciiArt';

const MenuSection = ({ title, animation, items, onItemClick }) => {
  return (
    <div className="menu-column">
      <AnimatedAsciiArt animationType={animation} />
      
      <div className="menu-frame">
        <span className="frame-corners tl">╔</span>
        <span className="frame-corners tr">╗</span>
        <span className="frame-corners bl">╚</span>
        <span className="frame-corners br">╝</span>
        
        <h2>║ {title} ║</h2>
        
        {items.map((item, index) => (
          <div 
            key={index} 
            className="menu-item"
            onClick={() => onItemClick(item)}
          >
            <span className="item-name">{item.name}</span>
            <span className="price">{item.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuSection;
