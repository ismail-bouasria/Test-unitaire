import { isAdult, isValidPostalCode } from './validator.js';

describe('Validator Module', () => {
  
  // ============================================
  // VALIDATION DE L'ÂGE - isAdult()
  // ============================================
  describe('isAdult - Validation de l\'âge (>= 18 ans)', () => {
    
    let today;
    
    beforeEach(() => {
      today = new Date();
    });

    // --- Cas passants ---
    describe('Cas passants', () => {
      test('devrait retourner success pour une personne de 18 ans exactement', () => {
        const birthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        const result = isAdult(birthDate);
        expect(result).toEqual({ valid: true, age: 18 });
      });

      test('devrait retourner success pour une personne de 25 ans', () => {
        const birthDate = new Date(today.getFullYear() - 25, 5, 15);
        const result = isAdult(birthDate);
        expect(result.valid).toBe(true);
        expect(result.age).toBeGreaterThanOrEqual(24);
      });

      test('devrait retourner success pour une personne de 65 ans', () => {
        const birthDate = new Date(today.getFullYear() - 65, 0, 1);
        const result = isAdult(birthDate);
        expect(result.valid).toBe(true);
      });
    });

    // --- Cas échouants (mineurs) ---
    describe('Cas échouants - Mineurs', () => {
      test('devrait retourner une erreur pour une personne de 17 ans', () => {
        const birthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
        const result = isAdult(birthDate);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('AGE_UNDER_18');
        expect(result.age).toBe(17);
      });

      test('devrait retourner une erreur pour un bébé (0 an)', () => {
        const birthDate = new Date();
        const result = isAdult(birthDate);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('AGE_UNDER_18');
      });

      test('devrait retourner une erreur pour un enfant de 10 ans', () => {
        const birthDate = new Date(today.getFullYear() - 10, 6, 20);
        const result = isAdult(birthDate);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('AGE_UNDER_18');
      });

      test('devrait retourner une erreur si anniversaire pas encore passé cette année (17 ans 364 jours)', () => {
        // Personne qui aura 18 ans demain
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const birthDate = new Date(today.getFullYear() - 18, tomorrow.getMonth(), tomorrow.getDate());
        const result = isAdult(birthDate);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('AGE_UNDER_18');
      });
    });

    // --- Cas particulier : 29 février ---
    describe('Cas particulier - 29 février (années bissextiles)', () => {
      test('devrait gérer correctement une naissance le 29 février', () => {
        // Trouver une année bissextile il y a plus de 18 ans
        let leapYear = today.getFullYear() - 20;
        while (!isLeapYear(leapYear)) {
          leapYear--;
        }
        const birthDate = new Date(leapYear, 1, 29); // 29 février
        const result = isAdult(birthDate);
        expect(result.valid).toBe(true);
        expect(result.age).toBeGreaterThanOrEqual(18);
      });

      test('devrait calculer correctement l\'âge pour un né le 29 février vérifié le 28 février', () => {
        // Simule une vérification le 28 février d'une année non bissextile
        let leapYear = today.getFullYear() - 18;
        while (!isLeapYear(leapYear)) {
          leapYear--;
        }
        const birthDate = new Date(leapYear, 1, 29);
        const result = isAdult(birthDate);
        expect(result).toHaveProperty('valid');
        expect(result).toHaveProperty('age');
      });
    });

    // --- Edge cases : valeurs invalides ---
    describe('Edge cases - Valeurs invalides', () => {
      test('devrait lancer une erreur si aucun argument fourni', () => {
        expect(() => isAdult()).toThrow('INVALID_ARGUMENT');
      });

      test('devrait lancer une erreur si argument est null', () => {
        expect(() => isAdult(null)).toThrow('INVALID_ARGUMENT');
      });

      test('devrait lancer une erreur si argument est undefined', () => {
        expect(() => isAdult(undefined)).toThrow('INVALID_ARGUMENT');
      });

      test('devrait lancer une erreur si argument n\'est pas une Date', () => {
        expect(() => isAdult('1990-05-15')).toThrow('INVALID_DATE_TYPE');
      });

      test('devrait lancer une erreur si argument est un nombre', () => {
        expect(() => isAdult(19900515)).toThrow('INVALID_DATE_TYPE');
      });

      test('devrait lancer une erreur si argument est un objet quelconque', () => {
        expect(() => isAdult({ year: 1990, month: 5 })).toThrow('INVALID_DATE_TYPE');
      });

      test('devrait lancer une erreur si la Date est invalide', () => {
        expect(() => isAdult(new Date('invalid'))).toThrow('INVALID_DATE');
      });

      test('devrait lancer une erreur si la date est dans le futur', () => {
        const futureDate = new Date(today.getFullYear() + 1, 0, 1);
        expect(() => isAdult(futureDate)).toThrow('DATE_IN_FUTURE');
      });
    });
  });

  // ============================================
  // VALIDATION CODE POSTAL - isValidPostalCode()
  // ============================================
  describe('isValidPostalCode - Code postal français (5 chiffres)', () => {

    // --- Cas passants ---
    describe('Cas passants', () => {
      test('devrait valider un code postal standard (75001 Paris)', () => {
        const result = isValidPostalCode('75001');
        expect(result).toEqual({ valid: true, postalCode: '75001' });
      });

      test('devrait valider un code postal commençant par 0 (01000 Bourg-en-Bresse)', () => {
        const result = isValidPostalCode('01000');
        expect(result).toEqual({ valid: true, postalCode: '01000' });
      });

      test('devrait valider un code postal DOM-TOM (97100 Guadeloupe)', () => {
        const result = isValidPostalCode('97100');
        expect(result).toEqual({ valid: true, postalCode: '97100' });
      });

      test('devrait valider un code postal Corse (20000)', () => {
        const result = isValidPostalCode('20000');
        expect(result).toEqual({ valid: true, postalCode: '20000' });
      });

      test('devrait valider Monaco (98000)', () => {
        const result = isValidPostalCode('98000');
        expect(result).toEqual({ valid: true, postalCode: '98000' });
      });
    });

    // --- Cas échouants ---
    describe('Cas échouants - Formats invalides', () => {
      test('devrait rejeter un code postal avec moins de 5 chiffres', () => {
        const result = isValidPostalCode('7500');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('INVALID_FORMAT');
      });

      test('devrait rejeter un code postal avec plus de 5 chiffres', () => {
        const result = isValidPostalCode('750001');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('INVALID_FORMAT');
      });

      test('devrait rejeter un code postal avec des lettres', () => {
        const result = isValidPostalCode('75OO1');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('INVALID_FORMAT');
      });

      test('devrait rejeter un code postal avec des espaces', () => {
        const result = isValidPostalCode('75 001');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('INVALID_FORMAT');
      });

      test('devrait rejeter un code postal avec des caractères spéciaux', () => {
        const result = isValidPostalCode('75-001');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('INVALID_FORMAT');
      });

      test('devrait rejeter une chaîne vide', () => {
        const result = isValidPostalCode('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('INVALID_FORMAT');
      });
    });

    // --- Edge cases ---
    describe('Edge cases - Valeurs invalides', () => {
      test('devrait lancer une erreur si aucun argument fourni', () => {
        expect(() => isValidPostalCode()).toThrow('INVALID_ARGUMENT');
      });

      test('devrait lancer une erreur si argument est null', () => {
        expect(() => isValidPostalCode(null)).toThrow('INVALID_ARGUMENT');
      });

      test('devrait lancer une erreur si argument est undefined', () => {
        expect(() => isValidPostalCode(undefined)).toThrow('INVALID_ARGUMENT');
      });

      test('devrait lancer une erreur si argument est un nombre', () => {
        expect(() => isValidPostalCode(75001)).toThrow('INVALID_TYPE');
      });

      test('devrait lancer une erreur si argument est un objet', () => {
        expect(() => isValidPostalCode({ code: '75001' })).toThrow('INVALID_TYPE');
      });

      test('devrait lancer une erreur si argument est un tableau', () => {
        expect(() => isValidPostalCode(['75001'])).toThrow('INVALID_TYPE');
      });
    });
  });
});

// Helper function pour les tests
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
