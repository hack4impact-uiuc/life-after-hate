/// <reference types="Cypress" />

context("Navbar", () => {
  beforeEach(() => {
    cy.visit(Cypress.env("BASE_URI"));
  });

  it("Page title is correct", () => {
    // https://on.cypress.io/title
    cy.title().should("eq", "Life After Hate Resource Maps");
  });

  it("Has a navbar with 2 elements", () => {
    cy.get(".nav-links")
      .first()
      .children()
      .first()
      .should("have.text", "Map");
    cy.get(".nav-links")
      .first()
      .children()
      .should("have.length.gt", 0);
  });
});
