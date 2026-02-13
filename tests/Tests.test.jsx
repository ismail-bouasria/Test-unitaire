import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Formulaire from '../src/components/Formulaire.jsx';

beforeEach(() => {
  localStorage.clear();
});

test('Scénario utilisateur chaotique: erreurs puis corrections, soumission, localStorage', async () => {
  render(<Formulaire />);

  const nom = screen.getByLabelText(/^Nom$/i);
  const prenom = screen.getByLabelText(/^Prénom$/i);
  const email = screen.getByLabelText(/^Email$/i);
  const dob = screen.getByLabelText(/^Date de naissance$/i);
  const postal = screen.getByLabelText(/^Code Postal$/i);
  const city = screen.getByLabelText(/^Ville$/i);
  const submit = screen.getByRole('button', { name: /Soumettre/i });

  // Initialement, le bouton est disabled
  expect(submit).toBeDisabled();

  // Saisies invalides
  fireEvent.change(nom, { target: { value: '<script>alert(1)</script>' } });
  fireEvent.blur(nom);
  expect(await screen.findByText(/XSS_DETECTED|XSS/i)).toBeInTheDocument();
  const nomError = screen.getByText(/XSS_DETECTED|XSS/i);
  expect(nomError).toHaveStyle('color: rgb(255, 0, 0)');

  fireEvent.change(email, { target: { value: 'invalid-email' } });
  fireEvent.blur(email);
  expect(await screen.findByText(/INVALID_FORMAT/i)).toBeInTheDocument();
  const emailError = screen.getByText(/INVALID_FORMAT/i);
  expect(emailError).toHaveStyle('color: rgb(255, 0, 0)');

  // Le bouton reste disabled
  expect(submit).toBeDisabled();

  // Correction progressive
  fireEvent.change(nom, { target: { value: 'Dupont' } });
  fireEvent.blur(nom);
  await waitFor(() => expect(screen.queryByText(/XSS_DETECTED|XSS/i)).toBeNull());

  fireEvent.change(prenom, { target: { value: 'Jean' } });
  fireEvent.blur(prenom);

  fireEvent.change(email, { target: { value: 'jean.dupont@example.com' } });
  fireEvent.blur(email);

  // Date de naissance invalide (Futur)
  const future = new Date();
  future.setFullYear(future.getFullYear() + 2);
  const futureIso = future.toISOString().slice(0,10);
  fireEvent.change(dob, { target: { value: futureIso } });
  fireEvent.blur(dob);
  expect(await screen.findByText(/DATE_IN_FUTURE|UNDERAGE/i)).toBeInTheDocument();

  // Correction DOB -> majeur
  const adult = new Date(); adult.setFullYear(adult.getFullYear() - 30);
  const adultIso = adult.toISOString().slice(0,10);
  fireEvent.change(dob, { target: { value: adultIso } });
  fireEvent.blur(dob);
  await waitFor(() => expect(screen.queryByText(/DATE_IN_FUTURE|UNDERAGE/i)).toBeNull());

  // Postal invalid then valid
  fireEvent.change(postal, { target: { value: '123' } });
  fireEvent.blur(postal);
  expect(await screen.findByText(/INVALID_FORMAT/i)).toBeInTheDocument();

  fireEvent.change(postal, { target: { value: '75001' } });
  fireEvent.blur(postal);
  await waitFor(() => expect(screen.queryByText(/INVALID_FORMAT/i)).toBeNull());

  // City empty then valid
  fireEvent.change(city, { target: { value: '' } });
  fireEvent.blur(city);
  expect(await screen.findByText(/EMPTY_CITY/i)).toBeInTheDocument();

  fireEvent.change(city, { target: { value: 'Paris' } });
  fireEvent.blur(city);
  await waitFor(() => expect(screen.queryByText(/EMPTY_CITY/i)).toBeNull());

  // Tous les champs valides -> bouton enabled
  await waitFor(() => expect(submit).toBeEnabled());

  // Soumission
  fireEvent.click(submit);

  // Toaster visible
  expect(await screen.findByRole('status')).toBeInTheDocument();

  // localStorage rempli
  const saved = JSON.parse(localStorage.getItem('form_submissions') || '[]');
  expect(saved.length).toBeGreaterThan(0);
  expect(saved[0]).toMatchObject({ nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com', postal: '75001', city: 'Paris' });

  // Champs vidés
  expect(nom.value).toBe('');
  expect(prenom.value).toBe('');
  expect(email.value).toBe('');
});
