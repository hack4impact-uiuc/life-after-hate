/// <reference types="Cypress" />

context("Volunteer User", () => {
  beforeEach(() => {
    // Set the current role to VOLUNTEER
    cy.setRole("VOLUNTEER");
    cy.visit(Cypress.env("BASE_URI"));
  });

  it("Shows a navbar without user management", () => {
    cy.get("[data-cy=nav-links]")
      .children()
      .should("have.length", 2)
      .should("contain.text", "Directory")
      .and("contain.text", "Map")
      .and("not.contain.text", "Account Management");
  });

  it("Redirects to home after trying to visit users page", () => {
    cy.visit(`${Cypress.env("BASE_URI")}/users`);

    cy.url().should("not.be", `${Cypress.env("BASE_URI")}/users`);
  });

  it("Should have no edit button on directory page", () => {
    cy.visit(`${Cypress.env("BASE_URI")}/directory`);

    // Should display results
    cy.get("[data-cy=card-address]").should("have.length.gt", 50);

    cy.get(".edit-button").should("not.exist");
  });
});
