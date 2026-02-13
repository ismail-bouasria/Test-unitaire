/**
 * Copie de validator.js dans src/lib pour organisation du projet
 */

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
  if (age >= 18) {
    return { valid: true, age };
  } else {
    return { valid: false, age, error: 'AGE_UNDER_18' };
  }
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
  if (postalCode === undefined || postalCode === null) {
    throw new Error('INVALID_ARGUMENT');
  }

  if (typeof postalCode !== 'string') {
    throw new Error('INVALID_TYPE');
  }

  const postalCodeRegex = /^[0-9]{5}$/;
  if (postalCodeRegex.test(postalCode)) {
    return { valid: true, postalCode };
  } else {
    return { valid: false, error: 'INVALID_FORMAT' };
  }
}

export function isValidName(name) {
  if (name === undefined || name === null) {
    throw new Error('INVALID_ARGUMENT');
  }

  if (typeof name !== 'string') {
    throw new Error('INVALID_TYPE');
  }

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

  for (const pattern of xssPatterns) {
    if (pattern.test(name)) {
      return { valid: false, error: 'XSS_DETECTED' };
    }
  }

  const validNameRegex = /^[a-zA-ZàâäéèêëïîôùûüçœæÀÂÄÉÈÊËÏÎÔÙÛÜÇŒÆäöüßÄÖÜ\s\-']+$/;
  if (validNameRegex.test(name)) {
    return { valid: true, name };
  } else {
    return { valid: false, error: 'INVALID_CHARACTERS' };
  }
}

export function sanitizeInput(input) {
  if (input === undefined || input === null) {
    throw new Error('INVALID_ARGUMENT');
  }

  if (typeof input !== 'string') {
    throw new Error('INVALID_TYPE');
  }

  if (input === '') {
    return { sanitized: '', wasModified: false };
  }

  let sanitized = input;
  const original = input;
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=/gi, '');
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  if (original.trim() === '' && sanitized === '') {
    sanitized = '';
  }
  const wasModified = sanitized !== original;
  return { sanitized, wasModified };
}

export function isValidEmail(email) {
  if (email === undefined || email === null) {
    throw new Error('INVALID_ARGUMENT');
  }

  if (typeof email !== 'string') {
    throw new Error('INVALID_TYPE');
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(email)) {
    return { valid: true, email };
  } else {
    return { valid: false, error: 'INVALID_FORMAT' };
  }
}
