/// <reference types="Cypress" />

context("Navbar", () => {
  beforeEach(() => {
    cy.setRole("ADMIN");
    cy.visit(Cypress.env("BASE_URI"));
  });

  it("Page title is correct", () => {
    // https://on.cypress.io/title
    cy.title().should("eq", "Life After Hate Resource Map");
  });

  it("Has a navbar with 2 links", () => {
    cy.get("[data-cy=nav-links]").children().eq(0).should("have.text", "Map");
    cy.get("[data-cy=nav-links]")
      .children()
      .eq(1)
      .should("have.text", "Directory");
  });

  it("Dropdown functionality with logout works as expected", () => {
    cy.get(".caret").click();
    cy.get(".dropdown-header")
      .should("be.visible")
      .and("contain.text", "John Doe");

    cy.get(".signout-button").click();
    cy.url().should("eq", `${Cypress.env("BASE_URI")}/login`); // tests won't fail in case the port changes
  });
});
