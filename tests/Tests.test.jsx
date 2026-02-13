import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
      expect(await screen.findByText(/INVALID_FORMAT/i)).toBeInTheDocument();
      const emailError = screen.getByText(/INVALID_FORMAT/i);
      expect(emailError).toHaveStyle('color: rgb(255, 0, 0)');

      // Saisie CP invalide (3 chiffres)
      fireEvent.change(postal, { target: { value: '123' } });
      fireEvent.blur(postal);
      expect(await screen.findByText(/INVALID_FORMAT/i)).toBeInTheDocument();
      const postalError = screen.getByText(/INVALID_FORMAT/i);
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
      expect(await screen.findByText(/INVALID_FORMAT/i)).toBeInTheDocument();

      fireEvent.change(postal, { target: { value: '12' } });
      fireEvent.blur(postal);
      expect(await screen.findByText(/INVALID_FORMAT/i)).toBeInTheDocument();

      expect(submit).toBeDisabled();

      // Corrections
      fireEvent.change(nom, { target: { value: 'Dupont' } });
      fireEvent.blur(nom);

      fireEvent.change(prenom, { target: { value: 'Jean' } });
      fireEvent.blur(prenom);

      fireEvent.change(email, { target: { value: 'jean@example.com' } });
      fireEvent.blur(email);
      await waitFor(() => expect(screen.queryByText(/INVALID_FORMAT/i)).toBeNull());

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

  describe('3. Cas Limites (Edge Cases)', () => {

    test('Trim des espaces : espaces nettoyés avant enregistrement', async () => {
      render(<Formulaire />);

      const nom = screen.getByLabelText(/^Nom$/i);
      const prenom = screen.getByLabelText(/^Prénom$/i);
      const email = screen.getByLabelText(/^Email$/i);
      const dob = screen.getByLabelText(/^Date de naissance$/i);
      const postal = screen.getByLabelText(/^Code Postal$/i);
      const city = screen.getByLabelText(/^Ville$/i);
      const submit = screen.getByRole('button', { name: /Soumettre/i });

      // Saisir avec espaces
      fireEvent.change(nom, { target: { value: '  Dupont  ' } });
      fireEvent.change(prenom, { target: { value: '  Jean  ' } });
      fireEvent.change(email, { target: { value: 'jean.dupont@example.com' } });

      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 25);
      fireEvent.change(dob, { target: { value: birthDate.toISOString().slice(0, 10) } });

      fireEvent.change(postal, { target: { value: '75001' } });
      fireEvent.change(city, { target: { value: '  Paris  ' } });

      await waitFor(() => expect(submit).toBeEnabled());
      fireEvent.click(submit);

      // Vérifier localStorage : espaces trimés
      const saved = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      expect(saved[0].nom).toBe('Dupont'); // trimé
      expect(saved[0].prenom).toBe('Jean'); // trimé
      expect(saved[0].city).toBe('Paris'); // trimé via sanitizeInput
    });

    test('Date de naissance dans le futur : erreur affichée', async () => {
      render(<Formulaire />);

      const dob = screen.getByLabelText(/^Date de naissance$/i);
      const submit = screen.getByRole('button', { name: /Soumettre/i });

      // Date dans le futur
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);
      fireEvent.change(dob, { target: { value: futureDate.toISOString().slice(0, 10) } });
      fireEvent.blur(dob);

      expect(await screen.findByText(/DATE_IN_FUTURE/i)).toBeInTheDocument();
      const dobError = screen.getByText(/DATE_IN_FUTURE/i);
      expect(dobError).toHaveStyle('color: rgb(255, 0, 0)');

      // Bouton disabled
      expect(submit).toBeDisabled();
    });

    test('Soumission avec erreurs : pas de sauvegarde, pas de reset', async () => {
      render(<Formulaire />);

      const nom = screen.getByLabelText(/^Nom$/i);
      const email = screen.getByLabelText(/^Email$/i);
      const submit = screen.getByRole('button', { name: /Soumettre/i });

      // Saisir des données invalides
      fireEvent.change(nom, { target: { value: '<script>alert(1)</script>' } });
      fireEvent.change(email, { target: { value: 'invalid-email' } });

      // Bouton disabled
      expect(submit).toBeDisabled();

      // Tenter de soumettre (même si disabled, pour couvrir le code)
      fireEvent.click(submit);

      // Pas de toaster
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // localStorage vide
      const saved = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      expect(saved.length).toBe(0);

      // Champs non vidés
      expect(nom.value).toBe('<script>alert(1)</script>');
      expect(email.value).toBe('invalid-email');
    });

  });

});
