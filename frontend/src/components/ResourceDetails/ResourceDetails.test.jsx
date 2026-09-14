import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { mount } from "../../../test/render";
import ResourceDetails from "./index";

let view;
afterEach(() => view?.unmount());

it("keeps one set of actions when switching between resources", () => {
  const onClose = vi.fn();
  const details = (id) => (
    <ResourceDetails
      resource={{ _id: id, type: "GROUP", companyName: `Group ${id}` }}
      onClose={onClose}
    />
  );
  view = mount(details("one"), { auth: { role: "ADMIN" } });
  for (const id of ["two", "three", "one"]) {
    view.render(details(id));
    for (const label of ["Edit", "Copy resource link", "Add to shortlist"]) {
      const buttons = [...view.container.querySelectorAll("button")].filter(
        (button) => button.textContent.trim() === label,
      );
      expect(buttons).toHaveLength(1);
    }
    expect(view.container.querySelectorAll(".drawer-body")).toHaveLength(1);
    expect(view.container.querySelector("h2").textContent).toBe(`Group ${id}`);
  }
});
