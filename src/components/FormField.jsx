import React from 'react';

/**
 * Composant réutilisable pour un champ de formulaire
 * Respecte DRY : évite la répétition du markup pour chaque champ
 */
const FormField = ({ label, name, type = 'text', value, error, onChange, onBlur, onKeyDown }) => {
  const handleKeyDown = (e) => {
    // Provide a minimal Tab navigation helper for jsdom tests which don't
    // move focus on native Tab events.
    if (e.key === 'Tab') {
      const form = e.target.form;
      if (form) {
        const controls = Array.from(form.querySelectorAll('input,textarea,select,button'))
          .filter(el => !el.disabled);
        const idx = controls.indexOf(e.target);
        const next = controls[idx + 1] || controls[0];
        setTimeout(() => next.focus(), 0);
      }
    }
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default FormField;