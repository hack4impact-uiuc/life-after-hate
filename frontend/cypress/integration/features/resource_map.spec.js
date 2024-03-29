/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="Cypress" />

// Though waits are almost always discouraged, we have no choice but to wait
// For the click event listener to attach to the map view pins

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
    cy.get("[data-cy=searchInput] > > input").type("hello search");

    cy.get("#locationInput").should("have.value", "hello location");

    cy.get("[data-cy=clear-location]").click();

    cy.get("#locationInput").should("have.value", "");
    cy.get("[data-cy=searchInput] > > input").should(
      "have.value",
      "hello search"
    );
  });

  it("Search by both name and location works as intended", () => {
    cy.get("#locationInput").type("Chicago");
    cy.get("[data-cy=searchInput] > > input").type("Fairway");

    cy.get(".submitSearch").click();

    cy.get(".card-title")
      .should("have.length", 1)
      .and("have.text", "Fairway Inn");

    cy.get(".card-distance")
      .should("have.text", "86.05 miles away")
      .and("be.visible");

    // Try again with an empty search, but this time making sure that more than one resource is displayed
    cy.get("[data-cy=clear-location]").click();
    cy.get("[data-cy=searchInput] > > input").clear();
    cy.get(".submitSearch").click();

    cy.get(".card-title").should("have.length.gt", 1);

    cy.get(".card-distance").should("not.exist");
  });

  it("Search by only name works as intended", () => {
    cy.get("[data-cy=searchInput] > > input").type("Fairway Inn");
    cy.get(".submitSearch").click();

    cy.get(".card-title", { timeout: 10000 }).should("have.length", 1);
    cy.get(".card-distance").should("not.exist");
  });

  it("Search by only location works as intended", () => {
    cy.get("#locationInput").type("Chicago");
    cy.get(".submitSearch").click();
    cy.get(".card-title:first").should("have.text", "Fairway Inn");
    cy.get(".card-distance")
      .should("have.length.gt", 1)
      .and("be.visible")
      .first()
      .should("have.text", "86.05 miles away");

    // Check to make sure the popup has a visible distance as well
    cy.get(".card-distance").first().click();
    cy.get(".popup-distance")
      .should("be.visible")
      .and("have.text", "86.04 miles away");
  });

  it("View/edit modals behave differently", () => {
    cy.get("[data-cy=searchInput] > > input").type("Fairway Inn");
    cy.get(".submitSearch").click();

    cy.get(".card-title:first").should("have.text", "Fairway Inn").click();
    // Click the edit resource button
    cy.get(".expanded > .card-action > [data-cy=card-resource-edit-btn]")
      .should("be.visible")
      .click();
    cy.get(".modal-title")
      .should("be.visible")
      .and("have.text", "Edit Resource");
    // Test that it's editable
    cy.get("[data-cy=modal-companyName]").type("Hello world!");
    cy.get("[data-cy=modal-notes]").scrollIntoView();
    cy.get("#submit-form-button").should("be.visible");
    cy.get(".close-button").click();
    // Ensure the popup is still open
    cy.get("[data-cy=popup-title]")
      .should("contain.text", "Fairway Inn")
      .and("be.visible");

    // Test the equivalent view only button
    cy.get(
      ".expanded > .card-action > [data-cy=card-resource-view-btn]"
    ).click();
    cy.get(".modal-title")
      .should("be.visible")
      .and("not.have.text", "Edit Resource");
    cy.get("[data-cy=modal-notes]").scrollIntoView();
    cy.get("#submit-form-button").should("not.be.visible");
    cy.get(".close-button").click();
  });

  it("Advanced modal: Editing a resource validation works as intended", () => {
    cy.get(".card-title").first().click();

    cy.get("[data-cy=card-resource-edit-btn]").first().click();

    // Clear name field
    cy.get("[data-cy=modal-contactName]").clear();
    // Clear email field
    cy.get("[data-cy=modal-contactName]").clear();
    cy.get("#submit-form-button").click();

    // Make sure they all have invalid class
    cy.get("[data-cy=modal-contactName]")
      .first()
      .should("have.class", "invalid")
      .and("be.visible");
    cy.get("[data-cy=modal-contactName]").should("have.class", "invalid");

    // Make sure that hitting delete will show confirm
    cy.get("#delete-form-button")
      .should("have.text", "Delete")
      .click()
      .should("have.text", "Confirm")
      .trigger("blur")
      .should("have.text", "Delete");
  });

  it("View/edit modal functionality should work when triggered by the popup", () => {
    cy.get("[data-cy=searchInput] > > input").type("Fairway Inn");
    cy.get(".submitSearch").click();

    cy.get(".card-title:first").should("have.text", "Fairway Inn").click();

    // Click the edit resource button
    cy.get(".popup > .card-action > [data-cy=card-resource-edit-btn]")
      .should("be.visible")
      .click();
    cy.get(".modal-title")
      .should("be.visible")
      .and("have.text", "Edit Resource");

    cy.get("[data-cy=modal-contactName]").type("Hello world!");
    cy.get(".close-button").click();
    // Ensure the popup is still open
    cy.get("[data-cy=popup-title]")
      .should("contain.text", "Fairway Inn")
      .and("be.visible");

    // Test the equivalent view only button
    cy.get(".popup > .card-action > [data-cy=card-resource-view-btn]").click();
    cy.get(".modal-title")
      .should("be.visible")
      .and("not.have.text", "Edit Resource");

    cy.get(".close-button").click();
  });

  it("Properly de-focuses resources on close", () => {
    cy.get("[data-cy=searchInput] > > input").type("Fairway Inn");
    cy.get(".submitSearch").click();

    cy.get(".card-title:first").should("have.text", "Fairway Inn").click();

    // Make sure the popup is open
    cy.get("[data-cy=popup-title]").should("be.visible");
    // Make sure the close button is visible
    cy.get(".expanded .top-card-close > .top-close-icon")
      .should("be.visible")
      .click();
    // Popup should no longer be visible
    cy.get("[data-cy=popup-title]").should("not.be.visible");

    // Try again, but this time using the popup close
    cy.get(".card-title:first").should("have.text", "Fairway Inn").click();
    cy.get("[data-cy=popup-title]").should("be.visible");
    cy.get(".mapboxgl-popup-close-button").should("be.visible").click();
    cy.get("[data-cy=popup-title]").should("not.be.visible");
    // Make sure now that we closed using the popup that the sidebar no longer a the resource expanded
    cy.get(".expanded .top-card-close > .top-close-icon").should(
      "not.be.visible"
    );
  });

  it("Opens with expand button properly", () => {
    cy.get(".maximize-icon").first().click();
    cy.get(".modal-title").should("be.visible");
    // Should be view only modal
    cy.get(".modal-input-field").first().should("be.disabled");
  });

  it("Clicking on the logo clears state properly", () => {
    cy.get(".submitSearch").click();
    cy.get(".card-title").should("have.length.gt", 1);

    cy.get("#locationInput").type("Hello World");
    cy.get("[data-cy=searchInput] > > input").type("Hello World");
    cy.get("#logo").click();

    cy.get(".card-title").should("have.length", 0);
    cy.get("#locationInput").should("have.text", "");
    cy.get("[data-cy=searchInput] > > input").should("have.text", "");
  });

  it("Tag filtering test", () => {
    cy.get("[data-cy=searchInput] > > input").type("Fairway Inn");
    cy.get(".submitSearch").click();
    cy.get(".card-title:first").should("have.text", "Fairway Inn");

    cy.get(".card-tag-search").should("have.length", 0);
    cy.get(".card-tag").each(($el) => {
      cy.wrap($el).click({ force: true });
    });

    // Do it again to make sure we're not adding duplicates
    cy.get(".card-tag").each(($el) => {
      cy.wrap($el).click({ force: true });
    });

    // Tags in search should be length 3
    cy.get(".card-tag-search").should("have.length", 3);
    // Only one card there
    cy.get(".card-title").should("have.length", 1);

    // // Should persist across search, however this time eliminating tags should bring back resources
    cy.get("[data-cy=searchInput] > > input").clear();
    cy.get(".submitSearch").click();
    cy.get(".card-tag-search").should("have.length", 3);
    cy.get(".card-title").should("have.text", "Fairway Inn");
    cy.get(".close-tag").each(($el) => {
      cy.wrap($el).click();
    });
    cy.get(".card-tag-search").should("have.length", 0);
    cy.get(".card-title").should("have.length.gt", 1);
  });
});
