const { test, expect } = require('@playwright/test');

test('E2E: formulaire soumis et sauvegardé', async ({ page }) => {
  // Open the built index page from the public folder (served at project root)
  await page.goto('/public/index.html');

  // Remplir le formulaire
  await page.fill('#nom', 'Etest');
  await page.fill('#prenom', 'Test');
  await page.fill('#email', 'e2e.test@example.com');

  const adult = new Date();
  adult.setFullYear(adult.getFullYear() - 30);
  const adultIso = adult.toISOString().slice(0,10);
  await page.fill('#dob', adultIso);

  await page.fill('#postal', '75001');
  await page.fill('#city', 'Paris');

  // Soumettre : attendre que le bouton soit activé puis cliquer
  // Debug: log form state before waiting
  const stateBefore = await page.evaluate(() => {
    const get = id => document.querySelector(id) ? document.querySelector(id).value : null;
    const errors = Array.from(document.querySelectorAll('div')).filter(d => d.style && d.style.color === 'red').map(d => d.textContent);
    return {
      nom: get('#nom'), prenom: get('#prenom'), email: get('#email'), dob: get('#dob'), postal: get('#postal'), city: get('#city'),
      submitDisabled: document.querySelector('button[type="submit"]')?.disabled,
      errors
    };
  });
  console.log('FORM STATE BEFORE SUBMIT:', JSON.stringify(stateBefore));
  await page.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 15000 });
  await page.click('button[type="submit"]');

  // Vérifier le toaster
  const toaster = await page.waitForSelector('[role="status"]', { timeout: 3000 });
  expect(await toaster.textContent()).toContain('Formulaire soumis avec succès');

  // Vérifier localStorage
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('form_submissions') || '[]'));
  expect(saved.length).toBeGreaterThan(0);
  expect(saved[0].email).toBe('e2e.test@example.com');
});
