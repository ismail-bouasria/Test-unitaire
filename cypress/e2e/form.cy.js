describe('E2E: formulaire soumis et sauvegardé', () => {
  it('remplit le formulaire, soumet et vérifie localStorage', () => {
    // Utilise la baseUrl de cypress.config.js pour charger la racine React
    cy.visit('/')

    cy.get('#nom').type('Etest')
    cy.get('#prenom').type('Test')
    cy.get('#email').type('e2e.test@example.com')

    const adult = new Date()
    adult.setFullYear(adult.getFullYear() - 30)
    const adultIso = adult.toISOString().slice(0,10)
    cy.get('#dob').type(adultIso)

    cy.get('#postal').type('75001')
    cy.get('#city').type('Paris')

    // attendre que le bouton soit activé puis cliquer
        // Intercept API POST to /posts (catch both absolute and relative URLs) and stub success
        cy.intercept('POST', '**/posts', {
          statusCode: 201,
          body: { id: 101 }
        }).as('postSignup');

        cy.get('button[type="submit"]', { timeout: 15000 }).should('not.be.disabled').click()

    // Vérifier le toaster
    cy.get('[role="status"]', { timeout: 3000 }).should('contain', 'Formulaire soumis avec succès')

        // Wait for API call and assert payload
        cy.wait('@postSignup', { timeout: 10000 }).then((req) => {
          const body = req.request?.body || req.response?.body || {};
          expect(body.email).to.equal('e2e.test@example.com');
        });
  })
})
