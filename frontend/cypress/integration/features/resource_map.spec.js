/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="Cypress" />

// Though waits are almost always discouraged, we have no choice but to wait
// For the click event listener to attach to the map view pins
const WAIT_DURATION = 3000;

context("Resource Map", () => {
  beforeEach(() => {
    cy.on("window:before:load", (win) => {
      cy.spy(win.console, "log");
      cy.spy(win.console, "error");
    });
    // Set the current role to ADMIN
    cy.setRole("ADMIN");
    cy.visit(Cypress.env("BASE_URI"));
    // Wait for resources to load
    cy.get(".submitSearch").click();
    cy.get(".card-content").should("be.visible");
  });

  it("Clear search works as intended", () => {
    cy.get("#locationInput").type("hello location");
    cy.get("#searchInput").type("hello search");

    cy.get("#locationInput").should("have.value", "hello location");

    cy.get("[data-cy=clear-location]").click();

    cy.get("#locationInput").should("have.value", "");
    cy.get("#searchInput").should("have.value", "hello search");

    cy.get("[data-cy=clear-search]").click();
    cy.get("#searchInput").should("have.value", "");
  });

  it("Search by both name and location works as intended", () => {
    cy.get("#locationInput").type("Chicago");
    cy.get("#searchInput").type("Fairway");

    cy.get(".submitSearch").click();

    cy.get(".card-title")
      .should("have.length", 1)
      .and("have.text", "Fairway Inn");

    cy.get(".card-distance")
      .should("have.text", "86 miles away")
      .and("be.visible");

    // Try again with an empty search, but this time making sure that more than one resource is displayed
    cy.get("[data-cy=clear-location]").click();
    cy.get("[data-cy=clear-search]").click();
    cy.get(".submitSearch").click();

    cy.get(".card-title").should("have.length.gt", 1);

    cy.get(".card-distance").should("not.exist");
  });

  it("Search by only name works as intended", () => {
    cy.get("#searchInput").type("Fairway Inn");
    cy.get(".submitSearch").click();

    cy.get(".card-title").should("have.length", 1);
    cy.get(".card-distance").should("not.exist");
  });

  it("Search by only location works as intended", () => {
    cy.get("#locationInput").type("Chicago");
    cy.get(".submitSearch").click();
    cy.get(".card-title").first().should("have.text", "Fairway Inn");
    cy.get(".card-distance")
      .should("have.length.gt", 1)
      .and("be.visible")
      .first()
      .should("have.text", "86 miles away");

    // Check to make sure the popup has a visible distance as well
    cy.get(".card-distance").first().click();
    cy.get(".popup-distance")
      .should("be.visible")
      .and("have.text", "86 miles away");
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
    cy.get("[data-cy=modal-company-name]").should(
      "contain.value",
      "Best Western Old Mill Inn"
    );
    // Test that it's editable
    cy.get("[data-cy=modal-company-name]").type("Hello world!");
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

  it("Advanced modal: Editing a resource validation works as intended", () => {
    cy.get(".card-title").first().click();

    cy.get("[data-cy=card-resource-edit-btn]").first().click();

    // Clear name field
    cy.get("[data-cy=modal-contact-name]").clear();
    // Clear email field
    cy.get("[data-cy=modal-contact-name]").clear();
    cy.get("#submit-form-button").click();

    // Make sure they all have invalid class
    cy.get("[data-cy=modal-contact-name]")
      .first()
      .should("have.class", "invalid")
      .and("be.visible");
    cy.get("[data-cy=modal-contact-name]").should("have.class", "invalid");

    // Make sure that hitting delete will show confirm

    cy.get("#delete-form-button")
      .should("have.text", "Delete")
      .click()
      .should("have.text", "Confirm")
      .trigger("blur")
      .should("have.text", "Delete");
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

    cy.get("[data-cy=modal-contact-name]").type("Hello world!");
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

  it("Opens with expand button properly", () => {
    cy.get(".maximize-icon").first().click();
    cy.get(".modal-title").should("be.visible");
    // Should be view only modal
    cy.get(".modal-input-field").first().should("be.disabled");
  });

  it("Closes modal upon clicking away", () => {
    cy.get("#view-default-view").wait(WAIT_DURATION).click(536, 288);
    cy.get("[data-cy=popup-title]").should("be.visible");
    // Click somewhere random...
    cy.get("#view-default-view").click(900, 500);
    cy.get("[data-cy=popup-title]").should("not.be.visible");
  });
});
