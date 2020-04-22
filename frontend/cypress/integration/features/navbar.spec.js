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

  it("Has a navbar with 3 links", () => {
    cy.get("[data-cy=nav-links]").children().eq(0).should("have.text", "Map");
    cy.get("[data-cy=nav-links]")
      .children()
      .should("have.length", 3)
      .should("contain.text", "Directory")
      .and("contain.text", "Map")
      .and("contain.text", "Account Management");
  });

  it("Dropdown functionality with logout works as expected", () => {
    cy.get(".caret").click();
    cy.get(".dropdown-header")
      .should("be.visible")
      .and("contain.text", "John Doe");

    cy.get(".signout-button").click();
    cy.url().should("eq", `${Cypress.env("BASE_URI")}/login`); // tests won't fail in case the port changes
  });

  it("Page navigation works as expected", () => {
    cy.get("[data-cy=nav-links]")
      .children()
      .eq(1)
      .should("have.text", "Directory")
      .click();

    cy.url().should("eq", `${Cypress.env("BASE_URI")}/directory`);

    cy.get("[data-cy=nav-links]")
      .children()
      .eq(2)
      .should("have.text", "Account Management")
      .click();

    cy.url().should("eq", `${Cypress.env("BASE_URI")}/users`);

    cy.get("[data-cy=nav-links]")
      .children()
      .eq(0)
      .should("have.text", "Map")
      .click();

    cy.url().should("eq", `${Cypress.env("BASE_URI")}/`);
  });

  it("Clicking on the logo takes back to the map view", () => {
    cy.visit(`${Cypress.env("BASE_URI")}/directory`);
    cy.get("#logo").click();

    cy.url().should("eq", `${Cypress.env("BASE_URI")}/`);
  });
});
