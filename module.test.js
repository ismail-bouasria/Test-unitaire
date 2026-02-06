import { calculateAge } from './module.js';

describe('calculateAge', () => {
  let validPerson;

  // Avant chaque test, on recrée un jeu de données propre
  beforeEach(() => {
    validPerson = {
      name: 'John Doe',
      birth: new Date('1990-05-15')
    };
  });

  // Test 1 : Cas nominal - calcul de l'âge fonctionne correctement
  describe('Cas nominal', () => {
    test('devrait calculer correctement l\'âge pour une date de naissance valide', () => {
      const age = calculateAge(validPerson);
      expect(typeof age).toBe('number');
      expect(age).toBeGreaterThanOrEqual(0);
    });

    test('devrait retourner 0 pour une personne née cette année', () => {
      const newborn = { birth: new Date() };
      const age = calculateAge(newborn);
      expect(age).toBe(0);
    });
  });

  // Test 2 : Aucun argument envoyé
  describe('Gestion des erreurs - argument manquant', () => {
    test('devrait lancer une erreur si aucun argument n\'est fourni', () => {
      expect(() => calculateAge()).toThrow('Un argument est requis');
    });

    test('devrait lancer une erreur si l\'argument est undefined', () => {
      expect(() => calculateAge(undefined)).toThrow('Un argument est requis');
    });

    test('devrait lancer une erreur si l\'argument est null', () => {
      expect(() => calculateAge(null)).toThrow('Un argument est requis');
    });
  });

  // Test 3 : L'argument n'est pas un objet
  describe('Gestion des erreurs - type d\'argument invalide', () => {
    test('devrait lancer une erreur si l\'argument est une chaîne', () => {
      expect(() => calculateAge('John')).toThrow('L\'argument doit être un objet');
    });

    test('devrait lancer une erreur si l\'argument est un nombre', () => {
      expect(() => calculateAge(42)).toThrow('L\'argument doit être un objet');
    });

    test('devrait lancer une erreur si l\'argument est un tableau', () => {
      expect(() => calculateAge([1, 2, 3])).toThrow('L\'argument doit être un objet');
    });

    test('devrait lancer une erreur si l\'argument est une fonction', () => {
      expect(() => calculateAge(() => {})).toThrow('L\'argument doit être un objet');
    });
  });

  // Test 4 : L'objet n'a pas de champ birth
  describe('Gestion des erreurs - champ birth manquant', () => {
    test('devrait lancer une erreur si l\'objet n\'a pas de champ birth', () => {
      const personWithoutBirth = { name: 'John' };
      expect(() => calculateAge(personWithoutBirth)).toThrow('L\'objet doit avoir un champ "birth"');
    });

    test('devrait lancer une erreur si l\'objet est vide', () => {
      expect(() => calculateAge({})).toThrow('L\'objet doit avoir un champ "birth"');
    });
  });

  // Test 5 : Le champ birth n'est pas une instance de Date
  describe('Gestion des erreurs - birth n\'est pas une Date', () => {
    test('devrait lancer une erreur si birth est une chaîne', () => {
      const personWithStringBirth = { birth: '1990-05-15' };
      expect(() => calculateAge(personWithStringBirth)).toThrow('Le champ "birth" doit être une instance de Date');
    });

    test('devrait lancer une erreur si birth est un nombre (timestamp)', () => {
      const personWithTimestamp = { birth: 643420800000 };
      expect(() => calculateAge(personWithTimestamp)).toThrow('Le champ "birth" doit être une instance de Date');
    });

    test('devrait lancer une erreur si birth est un objet quelconque', () => {
      const personWithObjectBirth = { birth: { year: 1990, month: 5 } };
      expect(() => calculateAge(personWithObjectBirth)).toThrow('Le champ "birth" doit être une instance de Date');
    });

    test('devrait lancer une erreur si birth est une Date invalide', () => {
      const personWithInvalidDate = { birth: new Date('invalid-date') };
      expect(() => calculateAge(personWithInvalidDate)).toThrow('Le champ "birth" doit être une Date valide');
    });
  });

  // Test 6 : Cas limites
  describe('Cas limites', () => {
    test('devrait lancer une erreur si la date de naissance est dans le futur', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const personFromFuture = { birth: futureDate };
      expect(() => calculateAge(personFromFuture)).toThrow('La date de naissance ne peut pas être dans le futur');
    });
  });
});
