import React, { useState } from 'react';
import { useForm } from '../hooks/useForm.js';
import FormField from './FormField.jsx';
import Toaster from './Toaster.jsx';

/**
 * Composant principal du formulaire
 * Respecte SRP : rendu UI uniquement, logique déléguée au hook
 */
export default function Formulaire() {
  const initialValues = {
    nom: '',
    prenom: '',
    email: '',
    dob: '',
    postal: '',
    city: ''
  };

  const [toastMessage, setToastMessage] = useState(null);

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isFormValid
  } = useForm(initialValues, () => setToastMessage('Formulaire soumis avec succès'));

  const fields = [
    { name: 'nom', label: 'Nom' },
    { name: 'prenom', label: 'Prénom' },
    { name: 'email', label: 'Email' },
    { name: 'dob', label: 'Date de naissance', type: 'date' },
    { name: 'postal', label: 'Code Postal' },
    { name: 'city', label: 'Ville' }
  ];

  return (
    <div>
      <h2>Formulaire</h2>
      <form onSubmit={handleSubmit} noValidate>
        {fields.map(field => (
          <FormField
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type || 'text'}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        ))}
        <button
          type="submit"
          disabled={!isFormValid()}
          style={{ opacity: isFormValid() ? 1 : 0.6 }}
        >
          Soumettre
        </button>
      </form>
      <Toaster message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
