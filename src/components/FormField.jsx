import React from 'react';

/**
 * Composant réutilisable pour un champ de formulaire
 * Respecte DRY : évite la répétition du markup pour chaque champ
 */
const FormField = ({ label, name, type = 'text', value, error, onChange, onBlur }) => (
  <div>
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
    {error && <div style={{ color: 'red' }}>{error}</div>}
  </div>
);

export default FormField;