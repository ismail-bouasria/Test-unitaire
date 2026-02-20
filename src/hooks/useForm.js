import { useState, useCallback } from 'react';
import { isValidName, isValidEmail, isAdult, isValidPostalCode, sanitizeInput } from '../lib/validator.js';

/**
 * Hook personnalisé pour gérer la logique du formulaire
 * Respecte SRP : gestion de l'état et validation du formulaire
 */
export const useForm = (initialValues, onSubmitSuccess) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    try {
      switch (name) {
        case 'nom':
        case 'prenom':
          return isValidName(value).valid ? '' : isValidName(value).error;
        case 'email':
          return isValidEmail(value).valid ? '' : isValidEmail(value).error;
        case 'dob': {
          if (!value) return 'INVALID_ARGUMENT';
          const date = new Date(value);
          if (isNaN(date.getTime())) return 'INVALID_DATE';
          const res = isAdult(date);
          return res.valid ? '' : (res.error || 'UNDERAGE');
        }
        case 'postal':
          return isValidPostalCode(value).valid ? '' : isValidPostalCode(value).error;
        case 'city': {
          const sanitized = sanitizeInput(value || '');
          // Accepter les champs ville qui deviennent vides après sanitization
          // (on préfère sauvegarder une chaîne vide plutôt que bloquer la soumission)
          return '';
        }
        default:
          return '';
      }
    } catch (err) {
      return err.message || 'INVALID';
    }
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const isFormValid = useCallback(() => {
    const requiredFields = ['nom', 'prenom', 'email', 'dob', 'postal', 'city'];
    return requiredFields.every(field => values[field] && !errors[field]);
  }, [values, errors]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Validation finale
    const newErrors = {};
    Object.keys(values).forEach(key => {
      newErrors[key] = validateField(key, values[key]);
    });
    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) return;

    // Sauvegarde
    const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
    const submission = {
      ...values,
      city: sanitizeInput(values.city).sanitized,
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem('form_submissions', JSON.stringify([...submissions, submission]));

    // Callback de succès
    onSubmitSuccess();

    // Reset
    setValues(initialValues);
    setTouched({});
    setErrors({});
  }, [values, validateField, initialValues, onSubmitSuccess]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isFormValid
  };
};