import React, { act } from "react";
import { vi, beforeEach, afterEach } from "vitest";
import {
  mount,
  click,
  change,
  submit,
  flush,
  button,
  deferred,
} from "../../../../test/render";
vi.mock("../../Modal", () => ({
  default: ({ children, headerTitle }) => (
    <section>
      <h1>{headerTitle}</h1>
      {children}
    </section>
  ),
}));
vi.mock("../ModalTagComplete", () => ({
  default: ({ tags, onChange, disabled }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(null, ["Food"])}
    >
      Tags: {tags.join(", ")}
    </button>
  ),
}));
vi.mock("../../../utils/api", () => ({
  editAndRefreshResource: vi.fn(),
  addAndRefreshResource: vi.fn(),
  deleteAndRefreshResource: vi.fn(),
}));
import {
  editAndRefreshResource,
  addAndRefreshResource,
  deleteAndRefreshResource,
} from "../../../utils/api";
import ResourceModal from "./index";
let view;
const resource = {
  _id: "r",
  type: "INDIVIDUAL",
  contactName: "Ada",
  address: "Chicago",
  notes: "Existing note",
  tags: [],
  location: { coordinates: [0, 0] },
  dateCreated: "2026-01-01",
  customLegacyField: "private",
  skills: "Support",
};
function render(doc = resource, editable = true) {
  view = mount(<ResourceModal isOpen />, {
    resources: doc ? [doc] : [],
    modal: {
      isOpen: true,
      editable,
      modalType: "RESOURCE",
      ...(doc ? { resourceId: doc._id } : {}),
    },
  });
  return view.container;
}
beforeEach(() => {
  vi.resetAllMocks();
  for (const fn of [
    editAndRefreshResource,
    addAndRefreshResource,
    deleteAndRefreshResource,
  ])
    fn.mockResolvedValue({});
});
afterEach(() => view?.unmount());
it.each(["INDIVIDUAL", "GROUP", "TANGIBLE"])(
  "renders existing %s fields and locks the resource type",
  (type) => {
    const container = render({
      ...resource,
      type,
      companyName: "Org",
      resourceName: "Supplies",
    });
    expect(container.querySelector("fieldset").disabled).toBe(true);
    expect(
      container.querySelector(
        `[name="${type === "GROUP" ? "companyName" : type === "TANGIBLE" ? "resourceName" : "contactName"}"]`,
      ),
    ).not.toBeNull();
  },
);
it("edits only writable fields and closes after successful persistence", async () => {
  const c = render();
  change(c.querySelector('[name="contactName"]'), "Grace");
  await submit(c.querySelector("form"));
  expect(editAndRefreshResource).toHaveBeenCalledWith(
    expect.objectContaining({ contactName: "Grace" }),
    "r",
  );
  const data = editAndRefreshResource.mock.calls[0][0];
  for (const key of ["_id", "location", "dateCreated", "customLegacyField"])
    expect(data).not.toHaveProperty(key);
  expect(view.store.getState().modal.isOpen).toBe(false);
});
it("requires mandatory fields before calling the API", async () => {
  const c = render(null);
  await submit(c.querySelector("form"));
  expect(addAndRefreshResource).not.toHaveBeenCalled();
  expect(c.querySelectorAll('[role="alert"]').length).toBeGreaterThan(0);
  expect(
    c.querySelector('[name="contactName"]').getAttribute("aria-invalid"),
  ).toBe("true");
});
it.each(["INDIVIDUAL", "GROUP", "TANGIBLE"])(
  "creates a new %s resource with tags",
  async (type) => {
    const c = render(null);
    click(c.querySelector(`input[value="${type}"]`));
    change(c.querySelector('[name="contactName"]'), "Ada");
    change(c.querySelector('[name="address"]'), "Chicago");
    if (type === "GROUP")
      change(c.querySelector('[name="companyName"]'), "Org");
    if (type === "TANGIBLE")
      change(c.querySelector('[name="resourceName"]'), "Supplies");
    click(button(c, "Tags:"));
    await submit(c.querySelector("form"));
    expect(addAndRefreshResource).toHaveBeenCalledWith(
      expect.objectContaining({
        type,
        tags: ["Food"],
        contactName: "Ada",
        address: "Chicago",
      }),
    );
  },
);
it("edits notes inline without obsolete section tabs", () => {
 const c = render(); change(c.querySelector('[name="notes"]'), "Draft");
 expect(c.querySelector('[name="notes"]').value).toBe("Draft");
 expect(c.querySelector('[role="tablist"]')).toBeNull();
});
it("keeps new-resource notes editable without history tabs", () => {
 const c = render(null); expect(c.querySelector('[name="notes"]').value).toBe("");
 expect(c.querySelector('[role="tablist"]')).toBeNull();
});
it("cancels without saving", () => {
  const c = render();
  click(button(c, "Cancel"));
  expect(view.store.getState().modal.isOpen).toBe(false);
  expect(editAndRefreshResource).not.toHaveBeenCalled();
});
it("renders read-only details without mutation buttons", () => {
  const c = render(resource, false);
  expect(c.querySelector('[name="contactName"]').disabled).toBe(true);
  expect(button(c, "Save resource")).toBeUndefined();
  expect(button(c, "Delete")).toBeUndefined();
  click(button(c, "Close"));
  expect(view.store.getState().modal.isOpen).toBe(false);
});
it("requires two clicks to delete and resets confirmation on blur", async () => {
  const c = render();
  const remove = button(c, "Delete");
  click(remove);
  expect(remove.textContent).toBe("Confirm delete");
  expect(deleteAndRefreshResource).not.toHaveBeenCalled();
  act(() =>
    remove.dispatchEvent(new FocusEvent("focusout", { bubbles: true })),
  );
  expect(remove.textContent).toBe("Delete");
  click(remove);
  click(remove);
  await flush();
  expect(deleteAndRefreshResource).toHaveBeenCalledWith("r");
});
it("keeps the dialog open while deletion is pending", async () => {
  const pending = deferred();
  deleteAndRefreshResource.mockReturnValueOnce(pending.promise);
  const c = render();
  click(button(c, "Delete"));
  click(button(c, "Confirm delete"));
  expect(view.store.getState().modal.isOpen).toBe(true);
  await act(async () => pending.resolve());
  expect(view.store.getState().modal.isOpen).toBe(false);
});
it("prevents repeated saves while the first save is pending", async () => {
  const pending = deferred();
  editAndRefreshResource.mockReturnValue(pending.promise);
  const c = render();
  await submit(c.querySelector("form"));
  expect(c.querySelector("#submit-form-button").disabled).toBe(true);
  await act(async () => pending.resolve());
  expect(view.store.getState().modal.isOpen).toBe(false);
});
it.each(["save", "delete"])(
  "keeps draft data and permits retry after failed %s",
  async (operation) => {
    const fn =
      operation === "save" ? editAndRefreshResource : deleteAndRefreshResource;
    fn.mockRejectedValueOnce(Error("Offline"));
    const c = render();
    if (operation === "save") await submit(c.querySelector("form"));
    else {
      click(button(c, "Delete"));
      click(button(c, "Confirm delete"));
      await flush();
    }
    expect(view.store.getState().modal.isOpen).toBe(true);
    expect(c.querySelector('[role="alert"]').textContent).toContain(
      "Please try again",
    );
    expect(c.querySelector('[name="contactName"]').value).toBe("Ada");
    if (operation === "save") await submit(c.querySelector("form"));
    else {
      click(button(c, "Confirm delete"));
      await flush();
    }
    expect(fn).toHaveBeenCalledTimes(2);
    expect(view.store.getState().modal.isOpen).toBe(false);
  },
);
it("rejects programmatic submissions from the read-only form", async () => {
  const c = render(resource, false);
  await submit(c.querySelector("form"));
  expect(editAndRefreshResource).not.toHaveBeenCalled();
});
it("closes safely when the selected resource disappears before the request completes", () => {
  render();
  act(() =>
    view.store.dispatch({ type: "DELETE_RESOURCE", payload: { _id: "r" } }),
  );
  expect(view.store.getState().modal.isOpen).toBe(false);
});
