import { useEffect, useRef } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';

const Modal = ({ item, onClose }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // No snapping or page scroll behind the modal
  useScrollLock(Boolean(item));

  // Focus the close button on open, and hand focus back to the menu item on close
  const closeRef = useRef(null);
  useEffect(() => {
    if (!item) return;
    const opener = document.activeElement;
    closeRef.current?.focus();
    return () => opener?.focus?.({ preventScroll: true });
  }, [item]);

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">║ {item.name} ║</h2>
          <button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-price">{item.price}</div>
          
          <div className="modal-section">
            <h3>&gt; DESCRIPTION_</h3>
            <p>{item.description}</p>
          </div>
          
          <div className="modal-section">
            <h3>&gt; NOTES_</h3>
            <p>{item.notes}</p>
          </div>
        </div>
        
        <div className="modal-footer">
          &gt; PRESS ESC OR CLICK OUTSIDE TO CLOSE_
        </div>
      </div>
    </div>
  );
};

export default Modal;
