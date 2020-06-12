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
      .should("have.length", 3)
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
    cy.get("#search-button").click();

    // Should display results
    cy.get("[data-cy=card-address]").should("have.length.gt", 50);

    cy.get(".edit-button").should("not.exist");
  });

  it("Should show only edit buttons on map view", () => {
    cy.visit(`${Cypress.env("BASE_URI")}`);
    cy.get(".submitSearch").click();
    cy.get(".card-title").first().click();

    // Wait until the view button is visible
    cy.get("[data-cy=card-resource-view-btn]").first().should("be.visible");

    cy.get("[data-cy=card-resource-edit-btn]").should("not.exist");

    cy.get("[data-cy=card-resource-view-btn]")
      .first()
      .should("contain.text", "View")
      .click();

    cy.get(".modal-input-field")
      .first()
      .should("be.visible")
      .and("be.disabled");
  });
});
