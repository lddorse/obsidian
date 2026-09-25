import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import AboutSection from './components/AboutSection';
import LocationSection from './components/LocationSection';
import Modal from './components/Modal';
import EntryGate from './components/EntryGate';
import { menuData } from './data/menuData';
import { hours, locationInfo } from './data/businessInfo';
import { useBusinessStatus } from './hooks/useBusinessStatus';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useSectionKeys } from './hooks/useSectionKeys';
import './App.css';

const JUMP_LINKS = [
  ...menuData.map(({ id, title }) => ({ id, label: title })),
  { id: 'about', label: 'ABOUT & HOURS' },
  { id: 'location', label: 'LOCATION' }
];

function App() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [gateOpen, setGateOpen] = useState(true);
  const closeGate = useCallback(() => setGateOpen(false), []);
  const heroSignRef = useRef(null);
  const status = useBusinessStatus();
  const prefersReducedMotion = usePrefersReducedMotion();

  useSectionKeys({ enabled: !gateOpen && !selectedItem, reducedMotion: prefersReducedMotion });

  // Deep links (/#location): the browser looks for the target before React has
  // rendered it, so scroll there ourselves, behind the gate
  useLayoutEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
  }, []);

  return (
    <>
      {gateOpen && <EntryGate status={status} onClose={closeGate} targetRef={heroSignRef} />}

      <div className="viewport-frame" aria-hidden="true" />

      <main inert={gateOpen}>
        <Hero
          status={status}
          signRef={heroSignRef}
          signHidden={gateOpen}
          alleyNote={locationInfo.directions.note}
          links={JUMP_LINKS}
        />

        {menuData.map((section) => (
          <MenuSection
            key={section.id}
            id={section.id}
            title={section.title}
            animation={section.animation}
            items={section.items}
            onItemClick={setSelectedItem}
          />
        ))}

        <AboutSection hours={hours} description={locationInfo.description} />
        <LocationSection location={locationInfo} />
      </main>

      <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}

export default App;
