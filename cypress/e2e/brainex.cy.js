describe('BraineX E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  describe('Homepage', () => {
    it('should load successfully', () => {
      cy.contains('Your Gateway to Scholarships').should('be.visible');
    });

    it('should have accessible navigation', () => {
      cy.get('nav').should('be.visible');
      cy.get('nav a[href="/fields"]').should('exist');
      cy.get('nav a[href="/scholarships"]').should('exist');
      cy.get('nav a[href="/mentors"]').should('exist');
    });

    it('should toggle theme', () => {
      cy.get('.theme-toggle').click();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      cy.get('.theme-toggle').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });
  });

  describe('Authentication', () => {
    it('should show login modal', () => {
      cy.contains('Log In').click();
      cy.get('#login-modal').should('be.visible');
    });

    it('should register new user', () => {
      cy.contains('Sign Up').click();

      cy.get('#signup-email').type(`test${Date.now()}@example.com`);
      cy.get('#signup-password').type('Test@123');
      cy.get('#signup-confirm-password').type('Test@123');
      cy.get('#signup-first-name').type('Test');
      cy.get('#signup-last-name').type('User');
      cy.get('#signup-field').select('Computer Science');

      cy.get('#signup-form').submit();

      cy.contains('Welcome').should('be.visible');
    });

    it('should login existing user', () => {
      cy.contains('Log In').click();

      cy.get('#login-email').type('john.doe@example.com');
      cy.get('#login-password').type('Student@123');

      cy.get('#login-form').submit();

      cy.contains('Welcome, John').should('be.visible');
    });
  });

  describe('Scholarships Page', () => {
    it('should display scholarships', () => {
      cy.visit('http://localhost:3000/scholarships');
      cy.get('.scholarship-card').should('have.length.gt', 0);
    });

    it('should filter scholarships by category', () => {
      cy.visit('http://localhost:3000/scholarships');
      cy.get('#category-filter').select('graduate');
      cy.get('.scholarship-card').should('exist');
    });
  });

  describe('Fields Page', () => {
    it('should display academic fields', () => {
      cy.visit('http://localhost:3000/fields');
      cy.get('.field-card').should('have.length.gt', 0);
    });

    it('should navigate to scholarships from field', () => {
      cy.visit('http://localhost:3000/fields');
      cy.get('.field-card').first().find('button').click();
      cy.url().should('include', '/scholarships');
    });
  });

  describe('Mentors Page', () => {
    it('should display mentors', () => {
      cy.visit('http://localhost:3000/mentors');
      cy.get('.mentor-card').should('have.length.gt', 0);
    });

    it('should show mentor ratings', () => {
      cy.visit('http://localhost:3000/mentors');
      cy.get('.mentor-card').first().should('contain', '⭐');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', () => {
      cy.injectAxe();
      cy.checkA11y();
    });

    it('should support keyboard navigation', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'href');
    });

    it('should have ARIA labels', () => {
      cy.get('.theme-toggle').should('have.attr', 'aria-label');
    });
  });

  describe('Performance', () => {
    it('should load within 3 seconds', () => {
      const start = Date.now();
      cy.visit('http://localhost:3000');
      cy.window().then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(3000);
      });
    });
  });
});
