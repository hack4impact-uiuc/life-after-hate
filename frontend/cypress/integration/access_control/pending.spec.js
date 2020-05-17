context("Pending", () => {
  beforeEach(() => {
    // Set the current role to PENDING
    cy.setRole("PENDING");
    cy.visit(Cypress.env("BASE_URI"));
  });

  it("Shows the LAH logo", () => {
    cy.get("[data-cy=logo]").should("be.visible");
  });

  it("Displays a pending message", () => {
    cy.get("[data-cy=pending]").should("be.visible");
  });

  it("Should not have a navbar", () => {
    cy.get("[data-cy=nav-links]").should("not.exist");
  });

  it("Should not display any map", () => {
    cy.get("#deckgl-overlay").should("not.exist");
  });

  it("Visiting the URLs as a pending user shows pending", () => {
    cy.visit(`${Cypress.env("BASE_URI")}/users`);

    cy.get("[data-cy=pending]").should("be.visible");

    cy.visit(`${Cypress.env("BASE_URI")}/directory`);
    cy.get("[data-cy=pending]").should("be.visible");
  });
});
