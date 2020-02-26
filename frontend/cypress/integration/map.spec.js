/// <reference types="Cypress" />

context("Window", () => {
  beforeEach(() => {
    cy.wait(45000);
    cy.visit("http://frontend:3000/");
  });

  it("cy.window() - get the global window object", () => {
    // https://on.cypress.io/window

    cy.window().should("have.property", "top");
  });

  it("cy.document() - get the document object", () => {
    // https://on.cypress.io/document
    cy.document()
      .should("have.property", "charset")
      .and("eq", "UTF-8");
  });

  it("cy.title() - get the title", () => {
    // https://on.cypress.io/title
    cy.title().should("eq", "Life After Hate Resource Map");
  });
});
