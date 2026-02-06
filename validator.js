/**
 * @module validator
 * @description Module de validation - Moteur de validation en JavaScript
 * @author Isma
 * @version 1.0.0
 */

/**
 * Vérifie si une personne est majeure (>= 18 ans) à partir de sa date de naissance.
 * 
 * @param {Date} birthDate - La date de naissance de la personne
 * @returns {Object} Objet contenant { valid: boolean, age: number, error?: string }
 * @throws {Error} INVALID_ARGUMENT - Si aucun argument ou argument null/undefined
 * @throws {Error} INVALID_DATE_TYPE - Si l'argument n'est pas une instance de Date
 * @throws {Error} INVALID_DATE - Si la Date est invalide (NaN)
 * @throws {Error} DATE_IN_FUTURE - Si la date de naissance est dans le futur
 * 
 * @example
 * // Personne majeure
 * const result = isAdult(new Date('1990-05-15'));
 * // { valid: true, age: 35 }
 * 
 * @example
 * // Personne mineure
 * const result = isAdult(new Date('2010-05-15'));
 * // { valid: false, age: 15, error: 'AGE_UNDER_18' }
 */
export function isAdult(birthDate) {
  // Validation des arguments
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

  // Calcul précis de l'âge
  const age = calculateAge(birthDate, today);

  // Vérification de la majorité
  if (age >= 18) {
    return { valid: true, age };
  } else {
    return { valid: false, age, error: 'AGE_UNDER_18' };
  }
}

/**
 * Calcule l'âge exact d'une personne en tenant compte du jour d'anniversaire.
 * Gère correctement le cas du 29 février.
 * 
 * @private
 * @param {Date} birthDate - Date de naissance
 * @param {Date} currentDate - Date actuelle
 * @returns {number} L'âge en années
 */
function calculateAge(birthDate, currentDate) {
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();
  const dayDiff = currentDate.getDate() - birthDate.getDate();

  // Si l'anniversaire n'est pas encore passé cette année, on retire 1 an
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

/**
 * Valide un code postal français (5 chiffres exactement).
 * 
 * @param {string} postalCode - Le code postal à valider
 * @returns {Object} Objet contenant { valid: boolean, postalCode?: string, error?: string }
 * @throws {Error} INVALID_ARGUMENT - Si aucun argument ou argument null/undefined
 * @throws {Error} INVALID_TYPE - Si l'argument n'est pas une chaîne de caractères
 * 
 * @example
 * // Code postal valide
 * const result = isValidPostalCode('75001');
 * // { valid: true, postalCode: '75001' }
 * 
 * @example
 * // Code postal invalide
 * const result = isValidPostalCode('7500');
 * // { valid: false, error: 'INVALID_FORMAT' }
 */
export function isValidPostalCode(postalCode) {
  // Validation des arguments
  if (postalCode === undefined || postalCode === null) {
    throw new Error('INVALID_ARGUMENT');
  }

  if (typeof postalCode !== 'string') {
    throw new Error('INVALID_TYPE');
  }

  // Regex pour code postal français : exactement 5 chiffres
  const postalCodeRegex = /^[0-9]{5}$/;

  if (postalCodeRegex.test(postalCode)) {
    return { valid: true, postalCode };
  } else {
    return { valid: false, error: 'INVALID_FORMAT' };
  }
}

/**
 * Valide un nom ou prénom (sans chiffres ni caractères spéciaux, sauf accents et tirets).
 * Protège contre les injections XSS.
 * 
 * @param {string} name - Le nom ou prénom à valider
 * @returns {Object} Objet contenant { valid: boolean, name?: string, error?: string }
 * @throws {Error} INVALID_ARGUMENT - Si aucun argument ou argument null/undefined
 * @throws {Error} INVALID_TYPE - Si l'argument n'est pas une chaîne de caractères
 * 
 * @example
 * // Nom valide
 * const result = isValidName('Jean-Pierre');
 * // { valid: true, name: 'Jean-Pierre' }
 * 
 * @example
 * // Nom avec XSS
 * const result = isValidName('<script>alert("xss")</script>');
 * // { valid: false, error: 'XSS_DETECTED' }
 */
export function isValidName(name) {
  // Validation des arguments
  if (name === undefined || name === null) {
    throw new Error('INVALID_ARGUMENT');
  }

  if (typeof name !== 'string') {
    throw new Error('INVALID_TYPE');
  }

  // Vérification nom vide ou espaces uniquement
  if (name.trim() === '') {
    return { valid: false, error: 'EMPTY_NAME' };
  }

  // Détection XSS - balises HTML et patterns dangereux
  const xssPatterns = [
    /<[^>]*>/,                    // Balises HTML
    /javascript:/i,               // javascript:
    /on\w+=/i,                    // onclick=, onerror=, etc.
    /<script/i,                   // <script
    /<img/i,                      // <img
    /<iframe/i,                   // <iframe
    /<link/i,                     // <link
    /<style/i,                    // <style
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(name)) {
      return { valid: false, error: 'XSS_DETECTED' };
    }
  }

  // Regex pour nom valide : lettres (avec accents), espaces, tirets, apostrophes
  // Autorise les caractères Unicode des alphabets latins avec accents
  const validNameRegex = /^[a-zA-ZàâäéèêëïîôùûüçœæÀÂÄÉÈÊËÏÎÔÙÛÜÇŒÆäöüßÄÖÜ\s\-']+$/;

  if (validNameRegex.test(name)) {
    return { valid: true, name };
  } else {
    return { valid: false, error: 'INVALID_CHARACTERS' };
  }
}
