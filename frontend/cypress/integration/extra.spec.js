/// <reference types="Cypress" />

context("Directory View", () => {
  beforeEach(() => {
    // Set the current role to ADMIN
    cy.setRole("ADMIN");
    cy.visit(`${Cypress.env("BASE_URI")}/login`);
  });

  it("Properly redirects on login when authed", () => {
    cy.get("[data-cy=nav-links]").children().eq(0).should("have.text", "Map");
  });
});
