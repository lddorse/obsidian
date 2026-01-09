import { useEffect } from 'react';

const Modal = ({ item, onClose }) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>║ {item.name} ║</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
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
