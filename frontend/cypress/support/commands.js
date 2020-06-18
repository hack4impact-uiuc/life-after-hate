// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Used to set the current role
Cypress.Commands.add("setRole", (role) => {
  cy.request({
    url: `${Cypress.env("API_URI")}/api/test/setRole/${role}`,
    method: "GET",
  });
});

Cypress.Commands.add("createDirectoryViewResource", (name) => {
  cy.get("#add-button").click();
  cy.get(".modal-title").should("have.text", "Add Resource");
  cy.get("[data-cy=modal-resourceType]").select("GROUP");
  cy.get("[data-cy=modal-companyName]").type(name);
  cy.get("[data-cy=modal-contactName]").type("Testing");
  cy.get("[data-cy=modal-contactPhone]").type("1-234-567-8900");
  cy.get("[data-cy=modal-contactEmail]").type("alanfang@gmail.com");
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
});
