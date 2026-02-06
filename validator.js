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
