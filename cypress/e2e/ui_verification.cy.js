describe('UI Verification Tests', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('http://localhost:3000');
  });

  it('Theme toggle persists across page reload', () => {
    // Initial state check (likely light or dark depending on OS/Defaults, but specific toggle should switch it)
    cy.get('html')
      .invoke('attr', 'data-theme')
      .then((initialTheme) => {
        // Click toggle
        cy.get('.theme-toggle').click();

        // Verify attribute changed
        cy.get('html').should('not.have.attr', 'data-theme', initialTheme);

        // Get new theme
        cy.get('html')
          .invoke('attr', 'data-theme')
          .then((newTheme) => {
            // Reload page
            cy.reload();

            // Verify persistence
            cy.get('html').should('have.attr', 'data-theme', newTheme);
          });
      });
  });

  it('Login button changes to Logout after successful auth', () => {
    // Open Login Modal
    cy.window().then((win) => win.openModal('loginModal'));

    // Fill credentials (assuming test account or mock)
    // Using a mock response for auth/login to ensure success
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
          accessToken: 'fake-token',
        },
      },
    }).as('loginRequest');

    cy.get('#loginEmail').type('test@example.com');
    cy.get('#loginPassword').type('password123');
    cy.get('#loginModal .btn-submit').click();

    // Wait for API call
    cy.wait('@loginRequest');

    // Verify UI update (Logout button presence)
    cy.get('.btn-logout').should('be.visible').and('contain', 'Logout');
    cy.get('.user-greeting').should('contain', 'Hi, Test');
  });

  it('Form submit button prevents double-click', () => {
    cy.window().then((win) => win.openModal('loginModal'));

    // Intercept to delay response so we can check disabled state
    cy.intercept('POST', '/api/auth/login', (req) => {
      req.on('response', (res) => {
        res.setDelay(1000); // 1 second delay
      });
      req.reply({
        statusCode: 200,
        body: { success: true, data: {} },
      });
    }).as('delayedLogin');

    cy.get('#loginEmail').type('test@example.com');
    cy.get('#loginPassword').type('password123');

    const btn = cy.get('#loginModal .btn-submit');

    // First click
    btn.click();

    // Check immediate disabled state and loading class
    btn.should('have.attr', 'disabled');
    btn.should('have.class', 'bse-loading');

    // Attempt second click (programmatic or via UI if possible, but disabled check covers intention)
    btn.should('be.disabled');
  });
});
