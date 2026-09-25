import AnimatedAsciiArt from './AnimatedAsciiArt';
import Frame from './Frame';

const MenuSection = ({ id, title, animation, items, onItemClick }) => {
  return (
    <section id={id} className="snap-section" tabIndex={-1} aria-labelledby={`${id}-heading`}>
      <div className="menu-column">
        <AnimatedAsciiArt animationType={animation} />

        <Frame className="menu-frame">
          <h2 id={`${id}-heading`}>║ {title} ║</h2>

          {items.map((item) => (
            <button
              key={item.name}
              type="button"
              className="menu-item"
              onClick={() => onItemClick(item)}
            >
              <span className="item-name">{item.name}</span>
              <span className="price">{item.price}</span>
            </button>
          ))}
        </Frame>
      </div>
    </section>
  );
};

export default MenuSection;
