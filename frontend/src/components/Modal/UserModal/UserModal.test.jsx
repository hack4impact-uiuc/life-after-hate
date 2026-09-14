import React, { act } from "react";
import { vi, beforeEach, afterEach } from "vitest";
import {
  mount,
  click,
  change,
  submit,
  button,
  deferred,
} from "../../../../test/render";
vi.mock("../../Modal", () => ({
  default: ({ children }) => <section>{children}</section>,
}));
vi.mock("../../../utils/api", () => ({ editAndRefreshUser: vi.fn() }));
import { editAndRefreshUser } from "../../../utils/api";
import UserModal from "./index";
let view;
const user = {
  id: "u",
  firstName: "Ada",
  lastName: "Admin",
  email: "a@example.com",
  role: "PENDING",
  title: "Old",
};
function render(editable = true) {
  view = mount(<UserModal />, {
    users: { userList: [user] },
    modal: { userId: "u", isOpen: true, editable, modalType: "USER" },
  });
  return view.container;
}
beforeEach(() => {
  editAndRefreshUser.mockReset().mockResolvedValue();
});
afterEach(() => view?.unmount());
it("keeps identity fields read-only and edits only role/title", async () => {
  const c = render();
  expect(c.querySelector('[name="name"]').disabled).toBe(true);
  expect(c.querySelector('[name="email"]').disabled).toBe(true);
  change(c.querySelector("select"), "VOLUNTEER");
  change(c.querySelector('[name="title"]'), "New");
  await submit(c.querySelector("form"));
  expect(editAndRefreshUser).toHaveBeenCalledWith(
    { role: "VOLUNTEER", title: "New" },
    "u",
  );
  expect(view.store.getState().modal.isOpen).toBe(false);
});
it("cancels without editing", () => {
  const c = render();
  click(button(c, "Cancel"));
  expect(editAndRefreshUser).not.toHaveBeenCalled();
  expect(view.store.getState().modal.isOpen).toBe(false);
});
it("disables all fields in view-only mode", () => {
  const c = render(false);
  expect(c.querySelector("select").disabled).toBe(true);
  expect(c.querySelector('[name="title"]').disabled).toBe(true);
  expect(button(c, "Save changes")).toBeUndefined();
});
it("prevents duplicate submissions while saving", async () => {
  const pending = deferred();
  editAndRefreshUser.mockReturnValueOnce(pending.promise);
  const c = render();
  await submit(c.querySelector("form"));
  expect(button(c, "Save changes").disabled).toBe(true);
  await act(async () => pending.resolve());
  expect(view.store.getState().modal.isOpen).toBe(false);
});
it("keeps edits after a failed request and allows retry", async () => {
  editAndRefreshUser.mockRejectedValueOnce(Error("Offline"));
  const c = render();
  change(c.querySelector('[name="title"]'), "Draft");
  await submit(c.querySelector("form"));
  expect(c.querySelector('[role="alert"]').textContent).toContain(
    "Please try again",
  );
  expect(view.store.getState().modal.isOpen).toBe(true);
  expect(c.querySelector('[name="title"]').value).toBe("Draft");
  await submit(c.querySelector("form"));
  expect(view.store.getState().modal.isOpen).toBe(false);
});
it("does not submit a read-only user form", async () => {
  const c = render(false);
  await submit(c.querySelector("form"));
  expect(editAndRefreshUser).not.toHaveBeenCalled();
});
