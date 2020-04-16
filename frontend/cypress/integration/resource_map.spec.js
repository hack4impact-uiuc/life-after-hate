/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="Cypress" />

// Though waits are almost always discouraged, we have no choice but to wait
// For the click event listener to attach to the map view pins
const WAIT_DURATION = 800;

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
    cy.get("#view-default-view").wait(WAIT_DURATION).click(536, 288);
    cy.get("[data-cy=popup-title]")
      .should("contain.text", "Best Western Old Mill Inn")
      .and("be.visible");
    cy.get(".mapboxgl-popup-close-button").click();
    cy.get("[data-cy=popup-title]").should("not.be.visible");
  });

  it("Different popups when clicking between resources", () => {
    // https://on.cypress.io/title
    cy.get("#view-default-view").wait(WAIT_DURATION).click(536, 288);
    cy.get("[data-cy=popup-title]").should(
      "contain.text",
      "Best Western Old Mill Inn"
    );
    cy.get("#view-default-view").wait(WAIT_DURATION).click(625, 347);
    cy.get("[data-cy=popup-title]").should(
      "not.contain.text",
      "Best Western Old Mill Inn"
    );
  });

  it("Should show view/edit modals correctly on expanding popup", () => {
    cy.get("#view-default-view").wait(WAIT_DURATION).click(536, 288);
    // Click the edit resource button
    cy.get(".expanded > .card-action > [data-cy=card-resource-edit-btn]")
      .should("be.visible")
      .click();
    cy.get(".modal-title")
      .should("be.visible")
      .and("have.text", "Edit Resource");
    // Check that the words match up with what was clicked
    cy.get(".modal-input-field")
      .first()
      .should("contain.value", "Best Western Old Mill Inn");
    // Test that it's editable
    cy.get(".modal-input-field").first().type("Hello world!");
    cy.get(".close-button").click();
    // Ensure the popup is still open
    cy.get("[data-cy=popup-title]")
      .should("contain.text", "Best Western Old Mill Inn")
      .and("be.visible");

    // Test the equivalent view only button
    cy.get(
      ".expanded > .card-action > [data-cy=card-resource-view-btn]"
    ).click();
    cy.get(".modal-title")
      .should("be.visible")
      .and("not.have.text", "Edit Resource");
    cy.get(".close-button").click();
  });

  it("Popup button functionality should work", () => {
    cy.get("#view-default-view").wait(WAIT_DURATION).click(536, 288);
    // Click the edit resource button
    cy.get(".popup > .card-action > [data-cy=card-resource-edit-btn]")
      .should("be.visible")
      .click();
    cy.get(".modal-title")
      .should("be.visible")
      .and("have.text", "Edit Resource");

    cy.get(".modal-input-field").first().type("Hello world!");
    cy.get(".close-button").click();
    // Ensure the popup is still open
    cy.get("[data-cy=popup-title]")
      .should("contain.text", "Best Western Old Mill Inn")
      .and("be.visible");

    // Test the equivalent view only button
    cy.get(".popup > .card-action > [data-cy=card-resource-view-btn]").click();
    cy.get(".modal-title")
      .should("be.visible")
      .and("not.have.text", "Edit Resource");
    cy.get(".close-button").click();
  });

  it("Properly de-focuses resources on close", () => {
    cy.get("#view-default-view").wait(WAIT_DURATION).click(536, 288);

    // Make sure the popup is open
    cy.get("[data-cy=popup-title]").should("be.visible");
    // Make sure the close button is visible
    cy.get(".expanded .top-card-close > .top-close-icon")
      .should("be.visible")
      .click();
    // Popup should no longer be visible
    cy.get("[data-cy=popup-title]").should("not.be.visible");

    // Try again, but this time using the popup close
    cy.get("#view-default-view").click(536, 288);

    cy.get("[data-cy=popup-title]").should("be.visible");
    cy.get(".mapboxgl-popup-close-button").should("be.visible").click();
    cy.get("[data-cy=popup-title]").should("not.be.visible");
  });

  it("Closes modal upon clicking away", () => {
    cy.get("#view-default-view").wait(WAIT_DURATION).click(536, 288);
    cy.get("[data-cy=popup-title]").should("be.visible");
    // Click somewhere random...
    cy.get("#view-default-view").click(900, 500);
    cy.get("[data-cy=popup-title]").should("not.be.visible");
  });
});
