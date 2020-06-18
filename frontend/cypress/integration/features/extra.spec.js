/// <reference types="Cypress" />

context("Extra Tests", () => {
  beforeEach(() => {
    // Set the current role to ADMIN
    cy.setRole("ADMIN");
    cy.visit(`${Cypress.env("BASE_URI")}/login`);
  });

  it("Properly redirects on login when authed", () => {
    cy.get("[data-cy=nav-links]").children().eq(0).should("have.text", "Map");
  });

  it("Properly boots user on unauthorized request", () => {
    cy.server();
    cy.route({
      method: "GET",
      url: "**/api/resources/filter**",
      status: 401,
      response: [],
    });

    cy.get(".submitSearch").click();

    cy.get(".Toastify__toast-body").should(
      "contain.text",
      "You have been signed out"
    );

    cy.url().should("eq", `${Cypress.env("BASE_URI")}/login`);
  });
});
