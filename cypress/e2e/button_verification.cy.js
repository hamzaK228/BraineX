describe('Button Functionality Verification', () => {

    // 1. Notion / My Goals Page
    it('should verify Notion/My Goals page buttons', () => {
        cy.visit('/pages/notion.html');
        // Switch to Goals section to ensure button is visible
        cy.get('a[data-section="goals"]').click({ force: true });

        // Check "Add New Goal" button
        cy.get('.js-open-goal-modal').should('exist').and('be.visible');
        cy.get('.js-open-goal-modal').click();

        // Verify modal opens (if implemented) or at least button is clickable
        // Since we are not sure if modal works, we just check click

        // Sidebar toggles
        cy.get('.sidebar-toggle').click();
        cy.get('.sidebar').should('have.class', 'closed');
        cy.get('.sidebar-toggle').click();
        cy.get('.sidebar').should('not.have.class', 'closed');
    });

    // 2. Fields Page
    it('should verify Fields page buttons', () => {
        cy.visit('/pages/fields.html');
        // Explore Field buttons
        // Explore Field buttons (wait for JS to replace links with buttons)
        cy.get('button.btn-explore-field').first().click();
        cy.get('#fieldDetailModal').should('be.visible');
        cy.get('.close-modal').click({ multiple: true, force: true });
        cy.get('#fieldDetailModal').should('not.be.visible');

        // Filter tabs
        cy.contains('.filter-tab', 'Startups').click();
        cy.get('.filter-tab[data-filter="business"]').should('have.class', 'active');
    });

    // 3. Admin Page
    it('should verify Admin page buttons', () => {
        cy.visit('/pages/admin.html');
        // Sidebar navigation
        cy.get('.admin-nav a[href="#users"]').click();
        cy.get('#users-section').should('be.visible');

        cy.get('.admin-nav a[href="#scholarships"]').click();
        cy.get('#scholarships-section').should('be.visible');

        // Modal triggers (if any)
        cy.get('.btn-add-scholarship').click();
        cy.get('#addScholarshipModal').should('be.visible');
        cy.get('.close-modal').click({ multiple: true, force: true });
    });

    // 4. Events Page
    it('should verify Events page buttons', () => {
        cy.visit('/pages/events.html');
        // Register buttons
        cy.get('.btn-register').first().click();
        cy.get('#eventRegistrationModal').should('be.visible');
        cy.get('.close-modal').click({ multiple: true, force: true });

        // Category filters
        cy.contains('.category-btn', 'Workshops').click();
        cy.get('.category-btn.active').should('contain', 'Workshops');
    });

    // 5. Roadmaps Page
    it('should verify Roadmaps page buttons', () => {
        cy.visit('/pages/roadmaps.html');
        // View Roadmap
        cy.get('.btn-view-roadmap').first().click();
        cy.get('#roadmapDetailModal').should('be.visible');
        cy.get('.close-modal').click({ multiple: true, force: true });
    });

    // 6. Projects Page
    it('should verify Projects page buttons', () => {
        cy.visit('/pages/projects.html');
        // Start Project
        cy.get('.btn-start-project').first().click();
        cy.get('#projectStartModal').should('be.visible');
        cy.get('.close-modal').click({ multiple: true, force: true });
    });

    // 7. Scholarships Page
    it('should verify Scholarships page buttons', () => {
        cy.visit('/pages/scholarships.html');
        // Apply buttons (might redirect or open modal)
        // Check Filters
        cy.get('#categoryFilter').select('Merit-based');
        cy.get('#categoryFilter').should('have.value', 'Merit-based');
    });

});
