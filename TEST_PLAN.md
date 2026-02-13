# Plan de Test

## Objectif
Documenter la stratégie de tests pour le module de validation (`validator.js`) et l'intégration UI (`Formulaire` React).

## Résumé
- Tests Unitaires: couvrent la logique pure de `validator.js` (formats, erreurs, cas limites).
- Tests d'Intégration: couvrent l'UI React `Formulaire` (validation côté client en temps réel, DOM, Toaster, `localStorage`).

## Table des cas testés

| Composant / Cible | Type de test | Cas couverts | Pourquoi |
|---|---|---|---|
| `validator.js` | Unitaire | - `isValidName`: noms valides, caractères invalides, XSS détecté, empty string
| | | - `isValidEmail`: formats valides/invalide
| | | - `isValidPostalCode`: 5 chiffres valides / formats invalides
| | | - `isAdult`: date valide, date invalide, date future, calcul des âges (29/02) | Tests rapides, déterministes, couvrent branches d'erreur et codes d'exception |
| `Formulaire` (React) | Intégration (RTL + Jest) | - Validation onChange/onBlur; messages d'erreur affichés en rouge
| | | - Bouton `Soumettre` désactivé tant que des erreurs persistent
| | | - Scénario "utilisateur chaotique": saisies invalides puis corrections successives
| | | - Après soumission valide: Toaster visible, `localStorage` contient l'enregistrement, champs réinitialisés | Couvre interactions réelles, DOM, intégration avec `validator.js` et APIs browser (localStorage) |

## Critères d'acceptation
- Les tests unitaires doivent couvrir tous les cas d'erreur documentés dans `validator.js`.
- Les tests d'intégration doivent valider que l'UI réagit correctement (messages, style rouge, disabled/enabled, stockage).

## Exécution
- Lancer les tests (Jest + React Testing Library):

```bash
npm test
```

## Remarques
- Les tests d'intégration utilisent l'environnement `jsdom` fourni par Jest pour vérifier `localStorage` et le DOM.
- Si vous ajoutez un framework CSS, veillez à ce que les tests cherchant la couleur rouge vérifient la propriété `style` inline ou une classe spécifique testée.
