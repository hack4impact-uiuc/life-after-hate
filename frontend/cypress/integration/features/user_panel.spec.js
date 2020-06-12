// Though waits are almost always discouraged, we have no choice but to wait
// For the click event listener to attach to the map view pins
/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="Cypress" />

context("User Panel", () => {
  beforeEach(() => {
    cy.setRole("ADMIN");
    cy.visit(`${Cypress.env("BASE_URI")}/users`);
  });

  it("Has the correct directory elements", () => {
    cy.get(".manager-header").should("contain.text", "User Directory");
    cy.get(".user-labels").should("contain.text", "Account Type");
  });

  it("Should have clickable users", () => {
    cy.get(".card-wrapper > :nth-child(1)")
      .should("have.length", 30)
      .first()
      .should("have.text", "Amanda Osborn")
      .click();

    cy.get(".modal-title").should("have.text", "Amanda Osborn");

    cy.get("[data-cy=modal-name]")
      .should("have.value", "Amanda Osborn")
      .and("be.disabled");
    cy.get("[data-cy=modal-submit]").should("not.be.visible");

    // Close modal
    cy.get(".close-button").click();
    cy.get(".modal-title").should("not.be.visible");
  });

  it("Allows editing", () => {
    cy.get(".edit-button").should("have.length", 30).first().click();

    cy.get(".modal-title").should("have.text", "Edit User");

    // Name should be un-editable
    cy.get("[data-cy=modal-name]")
      .should("have.value", "Amanda Osborn")
      .and("be.disabled");

    cy.get("[data-cy=modal-role]").select("VOLUNTEER");

    cy.get("[data-cy=modal-submit]").click();

    cy.get(".Toastify__toast").should(
      "contain.text",
      "Successfully edited user"
    );

    cy.get(".modal-title").should("not.exist");
    cy.get(".card-wrapper > :nth-child(3)")
      .first()
      .should("have.text", "VOLUNTEER");
  });

  it("Properly filters by role", () => {
    cy.get("[data-cy=user-filter]").click();
    cy.get('[value="PENDING"]').click();

    cy.get(".card-wrapper > :nth-child(3)").each(($el) => {
      cy.wrap($el).should("have.text", "PENDING");
    });

    cy.get("[data-cy=user-filter]").click();
    cy.get('[value="REJECTED"]').click();

    cy.get(".card-wrapper > :nth-child(3)").each(($el) => {
      cy.wrap($el).should("have.text", "REJECTED");
    });

    cy.get("[data-cy=user-filter]").click();
    cy.get('[value="ACTIVE"]').click();

    cy.get(".card-wrapper > :nth-child(3)").each(($el) => {
      cy.wrap($el).contains(/ADMIN|VOLUNTEER/g);
    });
  });
});
