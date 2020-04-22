// Though waits are almost always discouraged, we have no choice but to wait
// For the click event listener to attach to the map view pins
/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="Cypress" />

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
    cy.get(".card-title")
      .should("have.length.gt", 1)
      .first()
      .should("have.text", "Fairway Inn");
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

  it("Should show modal correctly on expanding popup", () => {
    cy.get("#view-default-view").wait(WAIT_DURATION).click(536, 288);
    cy.get(".popup-max").click();
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
  });

  it("Closes modal upon clicking away", () => {
    cy.get("#view-default-view").wait(WAIT_DURATION).click(536, 288);
    cy.get("[data-cy=popup-title]").should("be.visible");
    // Click somewhere random...
    cy.get("#view-default-view").click(900, 500);
    cy.get("[data-cy=popup-title]").should("not.be.visible");
  });
});
