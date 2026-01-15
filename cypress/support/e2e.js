// import './commands';
// import 'cypress-axe';

// Add custom commands
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.contains('Log In').click();
  cy.get('#login-email').type(email);
  cy.get('#login-password').type(password);
  cy.get('#login-form').submit();
});

Cypress.Commands.add('logout', () => {
  cy.get('button').contains('Logout').click();
});
