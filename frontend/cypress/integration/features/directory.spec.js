/// <reference types="Cypress" />

context("Directory View", () => {
  beforeEach(() => {
    // Set the current role to ADMIN
    cy.setRole("ADMIN");
    cy.visit(`${Cypress.env("BASE_URI")}/directory`);
  });

  it("Displays proper sections", () => {
    cy.get(".manager-header").should("contain.text", "Resource Directory");
    cy.get(".resource-labels")
      .should("contain.text", "Resource Name")
      .and("contain.text", "Location")
      .and("contain.text", "Point of Contact")
      .and("contain.text", "Description");
  });

  it("Adding an incomplete resource fails", () => {
    cy.get("#add-button").should("have.text", "Add Resource").click();

    cy.get("[data-cy=modal-resource-type]").select("GROUP");
    cy.get("[data-cy=modal-company-name]").type("Test Resource");

    cy.get("#submit-form-button").click();
    cy.get("[data-cy=modal-contact-name]").should("have.class", "invalid");

    cy.get("[data-cy=modal-contact-phone]").type("123-456-7890");

    cy.get("#submit-form-button").click();
    cy.get('[data-cy="modal-contact-name"]').should("have.class", "invalid");
    cy.get('[data-cy="modal-contact-phone"]').should(
      "not.have.class",
      "invalid"
    );

    // Don't close out of the modal on error
    cy.get(".modal-title").should("be.visible");
  });

  it("Should clear resources when moving from directory view to map view & back", () => {
    cy.get("#search-button").click();
    cy.get("[data-cy=card-companyName]").should("have.length.gt", 50);
    cy.get("[data-cy=nav-links]").children().eq(0).click();
    cy.get(".card-content").should("not.be.visible");
    cy.get("[data-cy=nav-links]").children().eq(1).click();
    cy.get("[data-cy=card-companyName]").should("have.length", 0);
  });

  it("Should show different fields depending on type of resource added", () => {
    cy.get("#add-button").click();
    cy.get(".modal-title").should("have.text", "Add Resource");
    cy.get("[data-cy=modal-resource-type]").should("have.value", "INDIVIDUAL");

    cy.get("[data-cy=modal-skills]").should("exist");
    cy.get("[data-cy=modal-resource-type]").select("GROUP");
    cy.get("[data-cy=modal-skills]").should("not.exist");
    cy.get("[data-cy=modal-description]").should("exist");
  });

  it("Allows us to add a resource then delete it", () => {
    cy.createDirectoryViewResource("This is Test Resource");
    cy.get("#search-general").type("This is Test Resource");
    cy.get("#search-button").click();

    cy.get("[data-cy=card-companyName]").should(
      "have.text",
      "This is Test Resource"
    );

    cy.get("[data-cy=card-address]").should("have.length", 1);

    cy.get(".edit-button").click();

    cy.get("#delete-form-button")
      .should("have.text", "Delete")
      .click()
      .should("have.text", "Confirm")
      .click();

    cy.get("[data-cy=card-address]").should("not.exist");
  });

  it("Shows a correct modal upon clicking a resource", () => {
    cy.get("#search-general").type("Extended Stay America");
    cy.get("#search-button").click();

    cy.get("[data-cy=card-companyName]").should("have.length", 1).click();

    cy.get(".modal-title").should("contain.text", "Extended Stay America");
    cy.get('[name="companyName"]').should(
      "contain.value",
      "Extended Stay America"
    );
    cy.get('[name="companyName"]').should("be.disabled");
    cy.get("#submit-form-button").should("not.exist");
  });

  it("Invalid search returns nothing", () => {
    cy.get("#search-general").type("asdflijdlfkdajlksdf");
    cy.get("#search-button").click();
    cy.get("[data-cy=card-companyName]").should("have.length", 0);
  });

  it("Allows and persists edits", () => {
    cy.get("#search-general").type("Alan Fang");
    cy.get("#search-button").click();
    cy.get(".edit-button").first().click();
    cy.get(".modal-title").should("have.text", "Edit Resource");
    cy.get("[data-cy=modal-contact-name]").clear().type("Edited Resource!!");
    cy.get("[data-cy=modal-address]")
      .clear()
      .type("630 S 5th St, Champaign, IL");
    cy.get("#submit-form-button").click();

    cy.get("[data-cy=card-companyName]")
      .should("have.length", 1)
      .should("have.text", "Edited Resource!!");

    // Check if the geocode functionality works as we expect it - should fill in the ZIP code
    cy.get("[data-cy=card-address]").should("contain.text", "61820");
    cy.get(".edit-button").first().click();
    cy.get("[data-cy=modal-contact-name]").clear().type("Alan Fang");
    cy.get("#submit-form-button").click();
  });

  it("Search by location works", () => {
    cy.get("#search-location").type("Saint Louis, MO");
    cy.get("#search-button").click();

    cy.get("[data-cy=card-address]")
      .first()
      .should("contain.text", "Saint Louis");
  });
});
