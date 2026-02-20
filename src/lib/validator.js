/**
 * Module de validation - Fonctions utilitaires pour valider les données utilisateur
 * Respecte SRP : chaque fonction a une seule responsabilité de validation
 */

/**
 * Helper pour valider les arguments communs (non-null, type string)
 * Respecte DRY : évite la répétition des checks de base
 */
const validateArgument = (value, expectedType = 'string') => {
  if (value === undefined || value === null) {
    throw new Error('INVALID_ARGUMENT');
  }
  if (typeof value !== expectedType) {
    throw new Error('INVALID_TYPE');
  }
};

export function isAdult(birthDate) {
  if (birthDate === undefined || birthDate === null) {
    throw new Error('INVALID_ARGUMENT');
  }

  if (!(birthDate instanceof Date)) {
    throw new Error('INVALID_DATE_TYPE');
  }

  if (isNaN(birthDate.getTime())) {
    throw new Error('INVALID_DATE');
  }

  const today = new Date();
  if (birthDate > today) {
    throw new Error('DATE_IN_FUTURE');
  }

  const age = calculateAge(birthDate, today);
  return age >= 18
    ? { valid: true, age }
    : { valid: false, age, error: 'AGE_UNDER_18' };
}

function calculateAge(birthDate, currentDate) {
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();
  const dayDiff = currentDate.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age;
}

export function isValidPostalCode(postalCode) {
  validateArgument(postalCode);

  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode)
    ? { valid: true, postalCode }
    : { valid: false, error: 'INVALID_FORMAT' };
}

export function isValidName(name) {
  validateArgument(name);

  if (name.trim() === '') {
    return { valid: false, error: 'EMPTY_NAME' };
  }

  const xssPatterns = [
    /<[^>]*>/,
    /javascript:/i,
    /on\w+=/i,
    /<script/i,
    /<img/i,
    /<iframe/i,
    /<link/i,
    /<style/i,
  ];

  if (xssPatterns.some(pattern => pattern.test(name))) {
    return { valid: false, error: 'XSS_DETECTED' };
  }

  // Accept all Unicode letters + common punctuation (spaces, hyphens, apostrophes)
  const validNameRegex = /^[\p{L}\s\-']+$/u;
  return validNameRegex.test(name)
    ? { valid: true, name }
    : { valid: false, error: 'INVALID_CHARACTERS' };
}

export function sanitizeInput(input) {
  validateArgument(input);

  if (input === '') {
    return { sanitized: '', wasModified: false };
  }

  let sanitized = input;
  const original = input;

  // Supprimer scripts et styles
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Supprimer toutes les balises HTML
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Supprimer les protocoles dangereux
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');

  // Supprimer les attributs d'événements
  sanitized = sanitized.replace(/\bon\w+\s*=/gi, '');

  // Normaliser les espaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Gérer les cas où l'input était seulement des espaces
  if (original.trim() === '' && sanitized === '') {
    sanitized = '';
  }

  return {
    sanitized,
    wasModified: sanitized !== original
  };
}

export function isValidEmail(email) {
  validateArgument(email);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email)
    ? { valid: true, email }
    : { valid: false, error: 'INVALID_FORMAT' };
}
