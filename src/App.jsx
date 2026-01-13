import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MenuSection from './components/MenuSection';
import Modal from './components/Modal';
import InfoSection from './components/InfoSection';
import { menuData } from './data/menuData';
import { hours, locationInfo } from './data/businessInfo';
import './App.css';

function App() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="container">
      <Header />
      
      <div className="menu-section">
        {menuData.map((section) => (
          <MenuSection
            key={section.id}
            title={section.title}
            animation={section.animation}
            items={section.items}
            onItemClick={setSelectedItem}
          />
        ))}
      </div>
      
      <InfoSection hours={hours} location={locationInfo} />
      
      <Footer />
      
      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

export default App;
