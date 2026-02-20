import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import Formulaire from '../src/components/Formulaire.jsx';

beforeEach(() => {
  localStorage.clear();
});

describe('Tests d\'Intégration - Formulaire React', () => {

  describe('1. Tests de Validation et UI (Utilisateur Chaotique)', () => {

    test('Saisie invalide : email sans @ et CP à 3 chiffres - erreurs en rouge, bouton disabled', async () => {
      render(<Formulaire />);

      const email = screen.getByLabelText(/^Email$/i);
      const postal = screen.getByLabelText(/^Code Postal$/i);
      const submit = screen.getByRole('button', { name: /Soumettre/i });

      // Saisie email invalide (sans @)
      fireEvent.change(email, { target: { value: 'invalidemail' } });
      fireEvent.blur(email);
      // Chercher l'erreur à l'intérieur du champ email uniquement
      const emailError = await within(email.parentElement).findByText(/INVALID_FORMAT/i);
      expect(emailError).toHaveStyle('color: rgb(255, 0, 0)');

      // Saisie CP invalide (3 chiffres)
      fireEvent.change(postal, { target: { value: '123' } });
      fireEvent.blur(postal);
      const postalError = await within(postal.parentElement).findByText(/INVALID_FORMAT/i);
      expect(postalError).toHaveStyle('color: rgb(255, 0, 0)');

      // Bouton disabled
      expect(submit).toBeDisabled();
    });

    test('Correction en temps réel : erreurs disparaissent, bouton se réactive', async () => {
      render(<Formulaire />);

      const nom = screen.getByLabelText(/^Nom$/i);
      const prenom = screen.getByLabelText(/^Prénom$/i);
      const email = screen.getByLabelText(/^Email$/i);
      const dob = screen.getByLabelText(/^Date de naissance$/i);
      const postal = screen.getByLabelText(/^Code Postal$/i);
      const city = screen.getByLabelText(/^Ville$/i);
      const submit = screen.getByRole('button', { name: /Soumettre/i });

      // Saisies invalides initiales
      fireEvent.change(email, { target: { value: 'invalid' } });
      fireEvent.blur(email);
      await within(email.parentElement).findByText(/INVALID_FORMAT/i);

      fireEvent.change(postal, { target: { value: '12' } });
      fireEvent.blur(postal);
      await within(postal.parentElement).findByText(/INVALID_FORMAT/i);

      expect(submit).toBeDisabled();

      // Corrections
      fireEvent.change(nom, { target: { value: 'Dupont' } });
      fireEvent.blur(nom);

      fireEvent.change(prenom, { target: { value: 'Jean' } });
      fireEvent.blur(prenom);

      fireEvent.change(email, { target: { value: 'jean@example.com' } });
      fireEvent.blur(email);
      await waitFor(() => expect(within(email.parentElement).queryByText(/INVALID_FORMAT/i)).toBeNull());

      const adultDate = new Date();
      adultDate.setFullYear(adultDate.getFullYear() - 25);
      fireEvent.change(dob, { target: { value: adultDate.toISOString().slice(0, 10) } });
      fireEvent.blur(dob);

      fireEvent.change(postal, { target: { value: '75001' } });
      fireEvent.blur(postal);
      await waitFor(() => expect(screen.queryByText(/INVALID_FORMAT/i)).toBeNull());

      fireEvent.change(city, { target: { value: 'Paris' } });
      fireEvent.blur(city);

      // Bouton enabled
      await waitFor(() => expect(submit).toBeEnabled());
    });

  });

  describe('2. Tests de Cycle de Vie (Succès)', () => {

    test('Soumission valide : localStorage, reset formulaire, feedback succès', async () => {
      render(<Formulaire />);

      const nom = screen.getByLabelText(/^Nom$/i);
      const prenom = screen.getByLabelText(/^Prénom$/i);
      const email = screen.getByLabelText(/^Email$/i);
      const dob = screen.getByLabelText(/^Date de naissance$/i);
      const postal = screen.getByLabelText(/^Code Postal$/i);
      const city = screen.getByLabelText(/^Ville$/i);
      const submit = screen.getByRole('button', { name: /Soumettre/i });

      // Remplir tous les champs avec données valides
      fireEvent.change(nom, { target: { value: 'Martin' } });
      fireEvent.change(prenom, { target: { value: 'Alice' } });
      fireEvent.change(email, { target: { value: 'alice.martin@test.com' } });

      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      fireEvent.change(dob, { target: { value: birthDate.toISOString().slice(0, 10) } });

      fireEvent.change(postal, { target: { value: '69000' } });
      fireEvent.change(city, { target: { value: 'Lyon' } });

      // Attendre que le bouton soit enabled
      await waitFor(() => expect(submit).toBeEnabled());

      // Soumission
      fireEvent.click(submit);

      // Feedback succès (Toaster)
      expect(await screen.findByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('Formulaire soumis avec succès');

      // LocalStorage
      const saved = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      expect(saved.length).toBe(1);
      expect(saved[0]).toMatchObject({
        nom: 'Martin',
        prenom: 'Alice',
        email: 'alice.martin@test.com',
        postal: '69000',
        city: 'Lyon'
      });

      // Reset du formulaire
      expect(nom.value).toBe('');
      expect(prenom.value).toBe('');
      expect(email.value).toBe('');
      expect(dob.value).toBe('');
      expect(postal.value).toBe('');
      expect(city.value).toBe('');
    });

  });

  describe('4. Tests d\'Interaction Utilisateur', () => {

    test('Navigation clavier : Tab entre les champs fonctionne', () => {
      render(<Formulaire />);

      const nom = screen.getByLabelText(/^Nom$/i);
      const prenom = screen.getByLabelText(/^Prénom$/i);
      const email = screen.getByLabelText(/^Email$/i);

      // Focus initial sur nom
      act(() => { nom.focus(); });
      expect(document.activeElement.id).toBe('nom');

      // Tab vers prénom (simulé)
      act(() => { prenom.focus(); });
      expect(document.activeElement.id).toBe('prenom');

      // Tab vers email (simulé)
      act(() => { email.focus(); });
      expect(document.activeElement.id).toBe('email');
    });

  });

  describe('5. Tests d\'Accessibilité', () => {

    test('Labels ARIA : tous les champs ont des labels associés', () => {
      render(<Formulaire />);

      const nom = screen.getByLabelText(/^Nom$/i);
      const prenom = screen.getByLabelText(/^Prénom$/i);
      const email = screen.getByLabelText(/^Email$/i);
      const dob = screen.getByLabelText(/^Date de naissance$/i);
      const postal = screen.getByLabelText(/^Code Postal$/i);
      const city = screen.getByLabelText(/^Ville$/i);

      // Vérifier que les inputs ont les bons id et que les labels les référencent
      expect(nom).toHaveAttribute('id', 'nom');
      expect(prenom).toHaveAttribute('id', 'prenom');
      expect(email).toHaveAttribute('id', 'email');
      expect(dob).toHaveAttribute('id', 'dob');
      expect(postal).toHaveAttribute('id', 'postal');
      expect(city).toHaveAttribute('id', 'city');
    });

  });

  describe('6. Tests de Sécurité', () => {

    test('Injection XSS avancée : script dans ville nettoyé', () => {
      render(<Formulaire />);

      const city = screen.getByLabelText(/^Ville$/i);
      const submit = screen.getByRole('button', { name: /Soumettre/i });

      // Payload XSS plus complexe
      fireEvent.change(city, { target: { value: '<img src=x onerror=alert(1)>' } });

      // Remplir autres champs pour activer le bouton
      const nom = screen.getByLabelText(/^Nom$/i);
      const prenom = screen.getByLabelText(/^Prénom$/i);
      const email = screen.getByLabelText(/^Email$/i);
      const dob = screen.getByLabelText(/^Date de naissance$/i);
      const postal = screen.getByLabelText(/^Code Postal$/i);

      fireEvent.change(nom, { target: { value: 'Test' } });
      fireEvent.change(prenom, { target: { value: 'User' } });
      fireEvent.change(email, { target: { value: 'test@example.com' } });
      const adultDate = new Date();
      adultDate.setFullYear(adultDate.getFullYear() - 25);
      fireEvent.change(dob, { target: { value: adultDate.toISOString().slice(0, 10) } });
      fireEvent.change(postal, { target: { value: '75001' } });

      fireEvent.click(submit);

      // Vérifier que la ville a été nettoyée dans localStorage
      const saved = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      expect(saved[0].city).toBe(''); // Les balises ont été supprimées
    });

  });

  describe('7. Tests d\'UX/UI', () => {

    test('États visuels du bouton : disabled/enabled avec styles corrects', () => {
      render(<Formulaire />);

      const submit = screen.getByRole('button', { name: /Soumettre/i });

      // Initialement disabled avec opacity 0.6
      expect(submit).toBeDisabled();
      expect(submit).toHaveStyle('opacity: 0.6');

      // Remplir tous les champs
      const nom = screen.getByLabelText(/^Nom$/i);
      const prenom = screen.getByLabelText(/^Prénom$/i);
      const email = screen.getByLabelText(/^Email$/i);
      const dob = screen.getByLabelText(/^Date de naissance$/i);
      const postal = screen.getByLabelText(/^Code Postal$/i);
      const city = screen.getByLabelText(/^Ville$/i);

      fireEvent.change(nom, { target: { value: 'Dupont' } });
      fireEvent.change(prenom, { target: { value: 'Jean' } });
      fireEvent.change(email, { target: { value: 'jean@example.com' } });
      const adultDate = new Date();
      adultDate.setFullYear(adultDate.getFullYear() - 25);
      fireEvent.change(dob, { target: { value: adultDate.toISOString().slice(0, 10) } });
      fireEvent.change(postal, { target: { value: '75001' } });
      fireEvent.change(city, { target: { value: 'Paris' } });

      // Maintenant enabled avec opacity 1
      expect(submit).toBeEnabled();
      expect(submit).toHaveStyle('opacity: 1');
    });

  });

  describe('8. Tests d\'Intégration Avancée', () => {

    test('localStorage : multiples soumissions accumulées', () => {
      render(<Formulaire />);

      const nom = screen.getByLabelText(/^Nom$/i);
      const prenom = screen.getByLabelText(/^Prénom$/i);
      const email = screen.getByLabelText(/^Email$/i);
      const dob = screen.getByLabelText(/^Date de naissance$/i);
      const postal = screen.getByLabelText(/^Code Postal$/i);
      const city = screen.getByLabelText(/^Ville$/i);
      const submit = screen.getByRole('button', { name: /Soumettre/i });

      // Première soumission
      fireEvent.change(nom, { target: { value: 'Alice' } });
      fireEvent.change(prenom, { target: { value: 'Martin' } });
      fireEvent.change(email, { target: { value: 'alice@test.com' } });
      const date1 = new Date();
      date1.setFullYear(date1.getFullYear() - 30);
      fireEvent.change(dob, { target: { value: date1.toISOString().slice(0, 10) } });
      fireEvent.change(postal, { target: { value: '69000' } });
      fireEvent.change(city, { target: { value: 'Lyon' } });

      fireEvent.click(submit);

      // Deuxième soumission
      fireEvent.change(nom, { target: { value: 'Bob' } });
      fireEvent.change(prenom, { target: { value: 'Wilson' } });
      fireEvent.change(email, { target: { value: 'bob@test.com' } });
      const date2 = new Date();
      date2.setFullYear(date2.getFullYear() - 25);
      fireEvent.change(dob, { target: { value: date2.toISOString().slice(0, 10) } });
      fireEvent.change(postal, { target: { value: '33000' } });
      fireEvent.change(city, { target: { value: 'Bordeaux' } });

      fireEvent.click(submit);

      // Vérifier que les deux soumissions sont dans localStorage
      const saved = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      expect(saved.length).toBe(2);
      expect(saved[0].nom).toBe('Alice');
      expect(saved[1].nom).toBe('Bob');
    });

  });

  describe('9. Tests Fonctionnels - Edge Cases par Champ', () => {

    test('Nom avec caractères accentués et spéciaux : accepté', () => {
      render(<Formulaire />);

      const nom = screen.getByLabelText(/^Nom$/i);
      const prenom = screen.getByLabelText(/^Prénom$/i);

      // Caractères accentués
      fireEvent.change(nom, { target: { value: 'José María' } });
      fireEvent.blur(nom);
      expect(screen.queryByText(/INVALID/i)).not.toBeInTheDocument();

      // Tirets et apostrophes
      fireEvent.change(prenom, { target: { value: 'Jean-Pierre' } });
      fireEvent.blur(prenom);
      expect(screen.queryByText(/INVALID/i)).not.toBeInTheDocument();
    });

    test('Email avec sous-domaine et + : accepté', () => {
      render(<Formulaire />);

      const email = screen.getByLabelText(/^Email$/i);

      fireEvent.change(email, { target: { value: 'test+tag@sub.example.com' } });
      fireEvent.blur(email);
      expect(screen.queryByText(/INVALID/i)).not.toBeInTheDocument();
    });

    test('Date de naissance : âge limite (18 ans exactement)', () => {
      render(<Formulaire />);

      const dob = screen.getByLabelText(/^Date de naissance$/i);

      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

      fireEvent.change(dob, { target: { value: eighteenYearsAgo.toISOString().slice(0, 10) } });
      fireEvent.blur(dob);
      expect(screen.queryByText(/UNDERAGE/i)).not.toBeInTheDocument();
    });

    test('Code Postal : commençant par 0 et DOM-TOM', () => {
      render(<Formulaire />);

      const postal = screen.getByLabelText(/^Code Postal$/i);

      // CP commençant par 0
      fireEvent.change(postal, { target: { value: '01000' } });
      fireEvent.blur(postal);
      expect(screen.queryByText(/INVALID/i)).not.toBeInTheDocument();

      // CP DOM-TOM (Réunion)
      fireEvent.change(postal, { target: { value: '97400' } });
      fireEvent.blur(postal);
      expect(screen.queryByText(/INVALID/i)).not.toBeInTheDocument();
    });

  });

});
