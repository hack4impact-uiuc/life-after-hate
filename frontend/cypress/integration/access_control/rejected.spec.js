/// <reference types="Cypress" />

context("Rejected User", () => {
  beforeEach(() => {
    // Set the current role to REJECTED
    cy.setRole("REJECTED");
    cy.visit(Cypress.env("BASE_URI"));
  });

  it("By default goes to the login page", () => {
    cy.url().should("eq", `${Cypress.env("BASE_URI")}/login`);
  });

  it("Does not show the navbar", () => {
    cy.get("[data-cy=nav-links]").should("not.exist");
  });

  it("Redirects to login after trying to visit all pages", () => {
    cy.visit(`${Cypress.env("BASE_URI")}/users`);

    cy.url().should("eq", `${Cypress.env("BASE_URI")}/login`);

    cy.visit(`${Cypress.env("BASE_URI")}/directory`);

    cy.url().should("eq", `${Cypress.env("BASE_URI")}/login`);
  });
});
