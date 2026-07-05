/// <reference types="cypress-file-upload" />
// Cypress E2E test skeleton for Delamere-farm
// Run with: npx cypress open or npx cypress run

describe('Delamere-farm End-to-End Tests', () => {
  const adminEmail = Cypress.env('adminEmail') || 'admin@example.com';
  const adminPass = Cypress.env('adminPass') || 'AdminPassword123!';

  beforeEach(() => {
    // Reset state before each test
    cy.clearCookies();
    cy.visit('/');
  });

  it('Public Home Page Loads and Carousel Works', () => {
    cy.get('[data-testid="hero-carousel"]').should('be.visible');
    cy.get('[data-testid="carousel-next"]').click();
    cy.wait(500);
    cy.get('[data-testid="carousel-prev"]').click();
  });

  it('User Registration Flow', () => {
    cy.visit('/register');
    const random = Math.random().toString(36).substring(2, 10);
    const email = `${random}@example.com`;
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type('TestPass123!');
    cy.get('input[name="confirmPassword"]').type('TestPass123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
  });

  it('Admin Login and Product CRUD', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('input[name="password"]').type(adminPass);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin');

    // Navigate to products page
    cy.visit('/admin/products');
    cy.contains('New Product').click();
    cy.get('input[name="title"]').type('Cypress Test Product');
    cy.get('input[name="price"]').type('99.99');
    // Assume file input for image
    cy.get('input[type="file"]').attachFile('cypress/fixtures/sample.jpg');
    cy.get('button').contains('Create').click();
    cy.contains('Cypress Test Product').should('exist');

    // Edit the product
    cy.contains('Cypress Test Product').parent().within(() => {
      cy.get('button').contains('Edit').click();
    });
    cy.get('input[name="price"]').clear().type('79.99');
    cy.get('button').contains('Update').click();
    cy.contains('79.99').should('exist');

    // Delete the product
    cy.contains('Cypress Test Product').parent().within(() => {
      cy.get('button').contains('Delete').click();
    });
    cy.on('window:confirm', () => true);
    cy.contains('Cypress Test Product').should('not.exist');
  });

  it('Analytics Page Loads and CSV Export', () => {
    // Assume admin already logged in from previous test (session cookie persists)
    cy.visit('/admin/analytics');
    cy.get('[data-testid="sales-chart"]').should('be.visible');
    cy.get('button').contains('Export CSV').click();
    // Verify download – Cypress can't access file system directly; just ensure request was sent
    cy.intercept('GET', '/api/admin/analytics/orders?format=csv').as('csvDownload');
    cy.wait('@csvDownload').its('response.statusCode').should('eq', 200);
  });

  it('Bookings Flow', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(adminEmail);
    cy.get('input[name="password"]').type(adminPass);
    cy.get('button[type="submit"]').click();
    cy.visit('/bookings');
    cy.get('input[name="date"]').type('2024-12-31');
    cy.get('input[name="time"]').type('18:00');
    cy.get('button').contains('Create Booking').click();
    cy.contains('2024-12-31').should('exist');
    // Cancel booking
    cy.contains('2024-12-31').parent().within(() => {
      cy.get('button').contains('Cancel').click();
    });
    cy.on('window:confirm', () => true);
    cy.contains('2024-12-31').should('not.exist');
  });
});
