import React, { useState, useEffect } from 'react';
import { isValidName, isValidEmail, isAdult, isValidPostalCode, sanitizeInput } from '../lib/validator.js';

export default function Formulaire() {
  const initial = {
    nom: '',
    prenom: '',
    email: '',
    dob: '',
    postal: '',
    city: ''
  };

  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  const validateField = (name, value) => {
    try {
      switch (name) {
        case 'nom': {
          const res = isValidName(value);
          return res.valid ? '' : res.error;
        }
        case 'prenom': {
          const res = isValidName(value);
          return res.valid ? '' : res.error;
        }
        case 'email': {
          const res = isValidEmail(value);
          return res.valid ? '' : res.error;
        }
        case 'dob': {
          if (!value) return 'INVALID_ARGUMENT';
          const date = new Date(value);
          if (isNaN(date.getTime())) return 'INVALID_DATE';
          const res = isAdult(date);
          return res.valid ? '' : (res.error || 'UNDERAGE');
        }
        case 'postal': {
          const res = isValidPostalCode(value);
          return res.valid ? '' : res.error;
        }
        case 'city': {
          const sanitized = sanitizeInput(value || '');
          if (sanitized.sanitized.trim() === '') return 'EMPTY_CITY';
          return '';
        }
        default:
          return '';
      }
    } catch (err) {
      return err.message || 'INVALID';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(v => ({ ...v, [name]: value }));
    const err = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    const err = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const isFormValid = () => {
    const required = ['nom','prenom','email','dob','postal','city'];
    for (const f of required) {
      if (!values[f] || errors[f]) return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // final validation
    const newErrors = {};
    Object.keys(values).forEach(k => {
      newErrors[k] = validateField(k, values[k]);
    });
    setErrors(newErrors);
    const hasError = Object.values(newErrors).some(v => v);
    if (hasError) return;

    // save in localStorage
    const key = 'form_submissions';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const toSave = {
      ...values,
      city: sanitizeInput(values.city).sanitized,
      submittedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify([...existing, toSave]));

    setToast('Formulaire soumis avec succès');
    setValues(initial);
    setTouched({});
    setErrors({});
  };

  return (
    <div>
      <h2>Formulaire</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="nom">Nom</label>
          <input id="nom" name="nom" value={values.nom} onChange={handleChange} onBlur={handleBlur} />
          {errors.nom && <div style={{ color: 'red' }}>{errors.nom}</div>}
        </div>

        <div>
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" name="prenom" value={values.prenom} onChange={handleChange} onBlur={handleBlur} />
          {errors.prenom && <div style={{ color: 'red' }}>{errors.prenom}</div>}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} />
          {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
        </div>

        <div>
          <label htmlFor="dob">Date de naissance</label>
          <input id="dob" name="dob" type="date" value={values.dob} onChange={handleChange} onBlur={handleBlur} />
          {errors.dob && <div style={{ color: 'red' }}>{errors.dob}</div>}
        </div>

        <div>
          <label htmlFor="postal">Code Postal</label>
          <input id="postal" name="postal" value={values.postal} onChange={handleChange} onBlur={handleBlur} />
          {errors.postal && <div style={{ color: 'red' }}>{errors.postal}</div>}
        </div>

        <div>
          <label htmlFor="city">Ville</label>
          <input id="city" name="city" value={values.city} onChange={handleChange} onBlur={handleBlur} />
          {errors.city && <div style={{ color: 'red' }}>{errors.city}</div>}
        </div>

        <button type="submit" disabled={!isFormValid()} style={{ opacity: isFormValid() ? 1 : 0.6 }}>Soumettre</button>
      </form>

      {toast && (
        <div role="status" style={{ position: 'fixed', right: 20, top: 20, background: '#333', color: '#fff', padding: '8px 12px', borderRadius: 4 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
