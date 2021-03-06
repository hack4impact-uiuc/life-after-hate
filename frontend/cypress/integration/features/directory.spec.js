/// <reference types="Cypress" />

context("Directory View", () => {
  beforeEach(() => {
    // Set the current role to ADMIN
    cy.setRole("ADMIN");
    cy.visit(`${Cypress.env("BASE_URI")}/directory`);
  });

  it("Displays proper sections", () => {
    cy.get("#search-button").click();
    cy.get(".manager-header").should("contain.text", "Resource Directory");
    cy.get(".resource-labels")
      .should("contain.text", "Resource Name")
      .and("contain.text", "Location")
      .and("contain.text", "Volunteer Role")
      .and("contain.text", "Description")
      .and("contain.text", "Availability");
  });

  it("Adding an incomplete resource fails", () => {
    cy.get("#add-button").should("have.text", "Add Resource").click();

    cy.get("[data-cy=modal-resourceType]").select("GROUP");
    cy.get("[data-cy=modal-companyName]").type("Test Resource");

    cy.get("#submit-form-button").click();
    cy.get("[data-cy=modal-contactName]").should("have.class", "invalid");

    cy.get("[data-cy=modal-contactPhone]").type("123-456-7890");

    cy.get("#submit-form-button").click();
    cy.get('[data-cy="modal-contactName"]').should("have.class", "invalid");
    cy.get('[data-cy="modal-contactPhone"]').should(
      "not.have.class",
      "invalid"
    );

    // Don't close out of the modal on error
    cy.get(".modal-title").should("be.visible");
  });

  it("Should clear resources when moving from directory view to map view & back", () => {
    cy.get("#search-button").click();
    cy.get("[data-cy=card-companyName]").should("have.length.gt", 10);
    cy.get("[data-cy=nav-links]").children().eq(0).click();
    cy.get(".card-content").should("not.be.visible");
    cy.get("[data-cy=nav-links]").children().eq(1).click();
    cy.get("[data-cy=card-companyName]").should("have.length", 0);
  });

  it("Should show different fields depending on type of resource added", () => {
    cy.get("#add-button").click();
    cy.get(".modal-title").should("have.text", "Add Resource");
    cy.get("[data-cy=modal-resourceType]").should("have.value", "INDIVIDUAL");

    cy.get("[data-cy=modal-skills]").should("exist");
    cy.get("[data-cy=modal-resourceType]").select("GROUP");
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

    cy.get("[data-cy=card-address]", { timeout: 10000 }).should(
      "have.length",
      1
    );

    cy.get(".edit-button").click();

    // Check tag persistence
    cy.get("[data-cy=tag-chip]").first().should("have.text", "Sample Tag");
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
    cy.get("[data-cy=modal-contactName]").clear().type("Edited Resource!!");
    cy.get("[data-cy=modal-contactEmail]").clear();
    cy.get("[data-cy=modal-address]")
      .clear()
      .type("630 S 5th St, Champaign, IL");
    cy.get("#submit-form-button").click();

    cy.get("[data-cy=card-companyName]", { timeout: 10000 })
      .should("have.length", 1)
      .should("have.text", "Edited Resource!!");

    // Check if the geocode functionality works as we expect it - should fill in the ZIP code
    cy.get("[data-cy=card-address]").should("contain.text", "61820");
    cy.get(".edit-button").first().click();
    cy.get("[data-cy=modal-contactName]").clear().type("Alan Fang");
    cy.get("[data-cy=modal-contactEmail]").should("have.text", "");
    cy.get("#submit-form-button").click();
  });

  it("Search by location works", () => {
    cy.get("#search-location").type("Saint Louis, MO");
    cy.get("#search-button").click();

    cy.get("[data-cy=card-address]")
      .first()
      .should("contain.text", "Saint Louis");
  });

  it("Should live filter by tags", () => {
    cy.get("#search-button").click();
    cy.get("[data-cy=card-address]").should("have.length.gt", 1);
    cy.get("#tags-filled").type("Air{enter}");
    cy.get("[data-cy=card-address]").should("have.length", 6);
    cy.get("#tags-filled").type("Meet{enter}");
    cy.get("[data-cy=card-address]").should("have.length", 1);
    cy.get("[data-cy=card-companyName]").should(
      "have.text",
      "Golden North Motel"
    );
    cy.get("#tags-filled").type("{backspace}{backspace}");
    cy.get("[data-cy=card-address]").should("have.length.gt", 1);
  });

  it("Should sort by label and have card distances", () => {
    cy.get("#search-location").type("Chicago");
    cy.get("#search-button").click();
    cy.get("[data-cy=card-companyName]").should("have.length.gt", 1);
    cy.get(".resource-label").first().click();
    cy.get("[data-cy=card-companyName]")
      .first()
      .should("have.text", "Alan Fang");
    cy.get(".resource-label").first().click();
    cy.get("[data-cy=card-companyName]")
      .first()
      .should("not.contain.text", "Alan Fang");

    // Search by location
    cy.get(".resource-label").eq(1).click();
    cy.get("[data-cy=card-distance]").first().should("contain.text", "86");
    cy.get(".resource-label").eq(1).click();
    cy.get("[data-cy=card-distance]").first().should("contain.text", "488");
  });

  it("Should show a CSV download option", () => {
    cy.get("#csv-download-btn").should("not.be.visible");
    cy.get("#search-button").click();
    cy.get("#csv-download-btn").should("be.visible");
  });

  it("should work for tangible resources", () => {
    cy.get("#add-button").click();
    cy.get(".modal-title").should("have.text", "Add Resource");
    cy.get("[data-cy=modal-resourceType]").select("TANGIBLE");
    cy.get("[data-cy=modal-resourceName]").type("Test Resource Name");
    cy.get("[data-cy=modal-contactName]").type("Testing");
    cy.get("[data-cy=modal-contactPhone]").type("1-234-567-8900");
    cy.get("[data-cy=modal-contactEmail]").type("josh@gmail.com");
    cy.get("[data-cy=modal-quantity]").type("5");
    cy.get("[data-cy=modal-description").type(
      "This is a test description! This should show up in its entirety."
    );
    cy.get(".add-edit-resource-form > > [data-cy=tag-autocomplete]")
      .type("Sample Tag{enter}")
      .type("c{enter}");
    cy.get("[data-cy=modal-address").type("1234 W. Main St. Urbana, IL 61801");
    cy.get("[data-cy=modal-notes").type(
      "This is a notes field! You can enter notes here."
    );
    cy.get("#submit-form-button").click();
    cy.get(".Toastify__toast-body").should("contain.text", "Success");

    cy.get("[data-cy=card-companyName]").should(
      "have.text",
      "Test Resource Name"
    );
  });
});
