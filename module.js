/**
 * @module module
 * @description Module contenant les fonctions utilitaires pour calculer l'âge
 */

/**
 * Calcule l'âge d'une personne à partir de sa date de naissance.
 * 
 * @param {Object} p - L'objet représentant une personne
 * @param {Date} p.birth - La date de naissance de la personne (instance de Date)
 * @returns {number} L'âge de la personne en années
 * @throws {Error} Si aucun argument n'est fourni
 * @throws {Error} Si l'argument n'est pas un objet
 * @throws {Error} Si l'objet n'a pas de champ "birth"
 * @throws {Error} Si le champ "birth" n'est pas une instance de Date
 * @throws {Error} Si la Date est invalide
 * @throws {Error} Si la date de naissance est dans le futur
 * 
 * @example
 * // Utilisation basique
 * const person = { birth: new Date('1990-05-15') };
 * const age = calculateAge(person);
 * console.log(age); // Affiche l'âge calculé
 */
export function calculateAge(p) {
  // Vérification 1 : Argument requis
  if (p === undefined || p === null) {
    throw new Error('Un argument est requis');
  }

  // Vérification 2 : L'argument doit être un objet (pas un tableau, une fonction, etc.)
  if (typeof p !== 'object' || Array.isArray(p)) {
    throw new Error('L\'argument doit être un objet');
  }

  // Vérification 3 : L'objet doit avoir un champ "birth"
  if (!('birth' in p)) {
    throw new Error('L\'objet doit avoir un champ "birth"');
  }

  // Vérification 4 : Le champ "birth" doit être une instance de Date
  if (!(p.birth instanceof Date)) {
    throw new Error('Le champ "birth" doit être une instance de Date');
  }

  // Vérification 5 : La Date doit être valide
  if (isNaN(p.birth.getTime())) {
    throw new Error('Le champ "birth" doit être une Date valide');
  }

  // Vérification 6 : La date de naissance ne peut pas être dans le futur
  if (p.birth > new Date()) {
    throw new Error('La date de naissance ne peut pas être dans le futur');
  }

  // Calcul de l'âge (ta logique originale)
  let dateDiff = new Date(Date.now() - p.birth.getTime());
  let age = Math.abs(dateDiff.getUTCFullYear() - 1970);
  return age;
}
