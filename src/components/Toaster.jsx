import React, { useEffect } from 'react';

/**
 * Composant Toaster pour afficher les notifications
 * Respecte SRP : affichage des notifications uniquement
 */
const Toaster = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        right: 20,
        top: 20,
        background: '#333',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: 4,
        zIndex: 1000
      }}
    >
      {message}
    </div>
  );
};

export default Toaster;