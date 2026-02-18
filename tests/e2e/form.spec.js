const { test, expect } = require('@playwright/test');

test('E2E: formulaire soumis et sauvegardé', async ({ page }) => {
  // Open the built index page from the public folder (served at project root)
  await page.goto('/public/index.html');

  // Remplir le formulaire
  await page.fill('#nom', 'E2E');
  await page.fill('#prenom', 'Test');
  await page.fill('#email', 'e2e.test@example.com');

  const adult = new Date();
  adult.setFullYear(adult.getFullYear() - 30);
  const adultIso = adult.toISOString().slice(0,10);
  await page.fill('#dob', adultIso);

  await page.fill('#postal', '75001');
  await page.fill('#city', 'Paris');

  // Soumettre
  await Promise.all([
    page.waitForResponse(resp => resp.status() === 200 || resp.status() === 0).catch(() => {}),
    page.click('button[type="submit"]')
  ]);

  // Vérifier le toaster
  const toaster = await page.waitForSelector('[role="status"]', { timeout: 3000 });
  expect(await toaster.textContent()).toContain('Formulaire soumis avec succès');

  // Vérifier localStorage
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('form_submissions') || '[]'));
  expect(saved.length).toBeGreaterThan(0);
  expect(saved[0].email).toBe('e2e.test@example.com');
});
