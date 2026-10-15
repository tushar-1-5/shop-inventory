import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            &#x2715;
          </button>
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}
