/// <reference types="Cypress" />

context("Resource Map", () => {
  beforeEach(() => {
    // Set the current role to ADMIN
    cy.setRole("ADMIN");
    cy.visit(Cypress.env("BASE_URI"));
    // Wait for resources to load
    cy.get(".submitSearch").click();
    cy.get(".card-content").should("be.visible");
  });

  it("Popup functionality works as expected", () => {
    cy.get("#deckgl-overlay").click(536, 288);
    cy.get("[data-cy=popup-title]")
      .should("contain.text", "Best Western Old Mill Inn")
      .and("be.visible");
    cy.get(".mapboxgl-popup-close-button").click();
    cy.get("[data-cy=popup-title]").should("not.be.visible");
  });

  it("Different popups when clicking between resources", () => {
    // https://on.cypress.io/title
    cy.get("#deckgl-overlay").click(536, 288);
    cy.get("[data-cy=popup-title]").should(
      "contain.text",
      "Best Western Old Mill Inn"
    );
    cy.get("#deckgl-overlay").click(625, 347);
    cy.get("[data-cy=popup-title]").should(
      "not.contain.text",
      "Best Western Old Mill Inn"
    );
  });

  it("Should show modal correctly on expanding popup", () => {
    cy.get("#deckgl-overlay").click(536, 288);
    cy.get(".popup-max").click();
    cy.get(".modal-title")
      .should("be.visible")
      .and("have.text", "Edit Resource");
    // Check that the words match up with what was clicked
    cy.get(".modal-input-field")
      .first()
      .should("contain.value", "Best Western Old Mill Inn");
    // Test that it's editable
    cy.get(".modal-input-field")
      .first()
      .type("Hello world!");
    cy.get(".close-button").click();
    // Ensure the popup is still open
    cy.get("[data-cy=popup-title]")
      .should("contain.text", "Best Western Old Mill Inn")
      .and("be.visible");
  });

  it("Closes modal upon clicking away", () => {
    cy.get("#deckgl-overlay").click(536, 288);
    cy.get("[data-cy=popup-title]").should("be.visible");
    // Click somewhere random...
    cy.get("#deckgl-overlay").click(900, 500);
    cy.get("[data-cy=popup-title]").should("not.be.visible");
  });
});
