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
    cy.get("#add-button")
      .should("have.text", "Add Resource")
      .click();

    cy.get('[name="companyName"]').type("Test Resource");

    cy.get("#submit-form-button").click();
    cy.get(".Toastify__toast-body").should("contain.text", "Fail");

    // Don't close out of the modal on error
    cy.get(".modal-title").should("be.visible");
  });

  it("Should display resources automatically on load", () => {
    cy.get("[data-cy=card-companyName]").should("have.length.gt", 0);
  });

  it("Allows us to add a resource and search for it", () => {
    cy.get("#add-button").click();
    cy.get(".modal-title").should("have.text", "Add Resource");
    cy.get('[name="companyName"]').type("Test Resource");
    cy.get('[name="contactName"]').type("Alan Fang");
    cy.get('[name="contactPhone"]').type("1-234-567-8900");
    cy.get('[name="contactEmail"]').type("alanfang@gmail.com");
    cy.get('textarea[name="description"]').type(
      "This is a test description! This should show up in its entirety."
    );
    cy.get('[name="tags"]').type("a,b,c");
    cy.get('[name="address"]').type("1234 W. Main St. Urbana, IL 61801");
    cy.get('[name="notes"]').type(
      "This is a notes field! You can enter notes here."
    );
    cy.get("#submit-form-button").click();
    cy.get(".Toastify__toast-body").should("contain.text", "Success");

    cy.get("#search-general").type("Test Resource");
    cy.get("#search-button").click();

    cy.get("[data-cy=card-companyName]")
      .should("have.length.lt", 50)
      .first()
      .should("have.text", "Test Resource");
  });

  it("Shows a correct modal upon clicking a resource", () => {
    cy.get("[data-cy=card-companyName]")
      .first()
      .click();

    cy.get(".modal-title").should("contain.text", "Pear Tree Inn");
    cy.get('[name="companyName"]').should("contain.value", "Pear Tree Inn");
    cy.get('[name="companyName"]').should("be.disabled");
    cy.get("#submit-form-button").should("not.exist");
  });

  it("Invalid search returns nothing", () => {
    cy.get("#search-general").type("asdflijdlfkdajlksdf");
    cy.get("#search-button").click();
    cy.get("[data-cy=card-companyName]").should("have.length", 0);
  });

  it("Allows and persists edits", () => {
    cy.get(".edit-button")
      .first()
      .click();
    cy.get(".modal-title").should("have.text", "Edit Resource");
    cy.get('[name="companyName"]')
      .clear()
      .type("Edited Resource!!");
    cy.get("#submit-form-button").click();

    // Search for edited resource
    cy.get("#search-general").type("Edited Resource!!");
    cy.get("#search-button").click();

    cy.get("[data-cy=card-companyName]")
      .should("have.length.lt", 50)
      .first()
      .should("have.text", "Edited Resource!!");
  });

  it("Search by location works", () => {
    cy.get("#search-location").type("Saint Louis, MO");
    cy.get("#search-button").click();

    cy.get("[data-cy=card-address]")
      .should("have.length.lt", 50)
      .first()
      .should("contain.text", "Saint Louis");
  });

  it("Can query for and delete a resource", () => {
    cy.get("#search-general").type("Best Western Dayton");
    cy.get("#search-button").click();
    cy.get("[data-cy=card-address]").should("have.length.lt", 50);

    cy.get(".edit-button").click();

    cy.get("#delete-form-button")
      .should("have.text", "Delete")
      .click()
      .should("have.text", "Confirm")
      .click();

    cy.get("#search-button").click();

    cy.get("[data-cy=card-address]").should("not.exist");
  });
});
