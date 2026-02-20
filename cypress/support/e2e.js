// Fichier support Cypress minimal
// Importez commandes custom si besoin
// Ex: import './commands'

// Désactiver native uncaught exceptions failing test si nécessaire
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false prevents Cypress from failing the test
  return false
})
