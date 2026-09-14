import React, { act } from "react";
import { afterEach, vi } from "vitest";
import { mount, click } from "../../../test/render";
import Modal from "./index";
let view;
afterEach(() => view?.unmount());
it.each([undefined, "Custom title"])(
  "shows modal title %s and closes through its close button",
  (headerTitle) => {
    view = mount(
      <Modal headerTitle={headerTitle} subtitle="Description">
        <p>Details</p>
      </Modal>,
      { modal: { isOpen: true, modalType: "RESOURCE", editable: true } },
    );
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog.textContent).toContain(headerTitle || "Add Resource");
    expect(dialog.textContent).toContain("Description");
    click(dialog.querySelector('[aria-label="Close dialog"]'));
    expect(view.store.getState().modal.isOpen).toBe(false);
  },
);
it("does not render a closed dialog", () => {
  view = mount(
    <Modal>
      <p>Private</p>
    </Modal>,
  );
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
