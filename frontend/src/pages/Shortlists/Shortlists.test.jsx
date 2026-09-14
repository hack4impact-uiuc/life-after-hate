import React from "react";
import { afterEach, it, expect, vi } from "vitest";
import { Router, Route } from "react-router-dom";
import { createMemoryHistory } from "history";
import {
  mount,
  click,
  change,
  submit,
  flush,
  button,
  deferred,
} from "../../../test/render";
import Shortlists, { ResourcePage } from "./index";
import ResourceSharing, { CopyLink } from "../../components/ResourceSharing";
import { apiRequest } from "../../utils/apiHelpers";
vi.mock("../../utils/apiHelpers", () => ({ apiRequest: vi.fn() }));
vi.mock("../../components/ResourceDetails", () => ({
  default: ({ resource }) => <div>{resource.companyName}</div>,
}));
let view;
afterEach(() => {
  view?.unmount();
  vi.restoreAllMocks();
  vi.resetAllMocks();
  delete navigator.clipboard;
});
const resource = {
  _id: "r1",
  type: "GROUP",
  companyName: "Food Bank",
  address: "Main Street",
};
const list = {
  id: "l1",
  name: "Support",
  owner_id: "me",
  resources: [resource, { ...resource, _id: "r2", companyName: "Other" }],
};
function setup(
  element,
  path = "/shortlists",
  route = "/shortlists/:id?",
  role = "VOLUNTEER",
) {
  const history = createMemoryHistory({ initialEntries: [path] });
  view = mount(
    <Router history={history}>
      <Route path={route}>{element}</Route>
    </Router>,
    { auth: { id: "me", role, authenticated: true } },
  );
  return history;
}
const result = (value) => ({ result: value });
it("loads empty lists and creates a trimmed name", async () => {
  const pending = deferred();
  apiRequest
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce(result({ id: "l1" }))
    .mockResolvedValue(result(list));
  const history = setup(<Shortlists />);
  expect(view.container.textContent).toContain("Loading shortlists");
  pending.resolve(result([]));
  await flush();
  expect(view.container.textContent).toContain("No shortlists yet");
  expect(button(view.container, "Create shortlist").disabled).toBe(true);
  change(view.container.querySelector("input"), " New list ");
  await submit(view.container.querySelector("form"));
  expect(apiRequest).toHaveBeenCalledWith(
    expect.objectContaining({ method: "POST", data: { name: "New list" } }),
  );
  expect(history.location.pathname).toBe("/shortlists/l1");
});
it("renders counts and ownership for populated lists", async () => {
  apiRequest.mockResolvedValue(
    result([
      { ...list, count: 1 },
      { ...list, id: "l2", owner_id: "other", count: 2 },
    ]),
  );
  setup(<Shortlists />);
  await flush();
  expect(view.container.textContent).toContain("1 resource · Created by you");
  expect(view.container.textContent).toContain("2 resources · LAH shared list");
});
it("retries loading and reports save failures", async () => {
  apiRequest
    .mockRejectedValueOnce(Error())
    .mockResolvedValueOnce(result([]))
    .mockRejectedValue(Error());
  setup(<Shortlists />);
  await flush();
  expect(view.container.querySelector("[role=alert]")).not.toBeNull();
  click(button(view.container, "Reload"));
  await flush();
  change(view.container.querySelector("input"), "Name");
  await submit(view.container.querySelector("form"));
  expect(view.container.textContent).toContain("Could not save your change");
});
it("renames, previews, prints, removes and deletes an owned list", async () => {
  apiRequest.mockResolvedValueOnce(result(list)).mockResolvedValue(result({}));
  const print = vi.spyOn(window, "print").mockImplementation(() => {});
  const history = setup(<Shortlists />, "/shortlists/l1");
  await flush();
  change(view.container.querySelector("input"), " Renamed ");
  await submit(view.container.querySelector("form"));
  expect(view.container.querySelector("h1").textContent).toBe("Renamed");
  click(button(view.container, "Preview handout"));
  click(button(view.container, "Print handout"));
  expect(print).toHaveBeenCalledOnce();
  click(button(view.container, "Close handout preview"));
  click(view.container.querySelector('[aria-label="Remove Food Bank"]'));
  await flush();
  expect(
    view.container.querySelector('[aria-label="Remove Food Bank"]'),
  ).toBeNull();
  expect(
    view.container.querySelector('[aria-label="Remove Other"]'),
  ).not.toBeNull();
  click(button(view.container, "Delete shortlist"));
  click(button(view.container, "Cancel"));
  expect(button(view.container, "Confirm delete")).toBeUndefined();
  click(button(view.container, "Delete shortlist"));
  apiRequest.mockResolvedValueOnce(result({})).mockResolvedValue(result([]));
  click(button(view.container, "Confirm delete"));
  await flush();
  expect(history.location.pathname).toBe("/shortlists");
});
it.each(["ADMIN", "VOLUNTEER"])(
  "respects %s edit access on someone else’s empty list",
  async (role) => {
    apiRequest.mockResolvedValue(
      result({ ...list, owner_id: "other", resources: [] }),
    );
    setup(<Shortlists />, "/shortlists/l1", "/shortlists/:id?", role);
    await flush();
    expect(view.container.textContent).toContain("This shortlist is empty");
    expect(button(view.container, "Preview handout").disabled).toBe(true);
    expect(!!button(view.container, "Delete shortlist")).toBe(role === "ADMIN");
  },
);
it.each([true, false])(
  "ignores a late shortlist response after unmount (%s)",
  async (success) => {
    const pending = deferred();
    apiRequest.mockReturnValue(pending.promise);
    setup(<Shortlists />);
    view.unmount();
    view = null;
    if (success) pending.resolve(result([]));
    else pending.reject(Error());
    await flush();
  },
);
it("loads a direct resource link into the store", async () => {
  const pending = deferred();
  apiRequest.mockReturnValue(pending.promise);
  setup(<ResourcePage />, "/resources/r1", "/resources/:id");
  expect(view.container.textContent).toContain("Loading resource");
  pending.resolve(result(resource));
  await flush();
  expect(view.container.textContent).toContain("Food Bank");
  expect(view.store.getState().resources).toEqual([resource]);
});
it.each(["error", "missing", "late-success", "late-error"])(
  "handles resource %s",
  async (mode) => {
    const pending = deferred();
    apiRequest.mockReturnValue(pending.promise);
    setup(<ResourcePage />, "/resources/r1", "/resources/:id");
    if (mode.startsWith("late")) {
      view.unmount();
      view = null;
    }
    if (mode.endsWith("error")) pending.reject(Error());
    else pending.resolve(result({ ...resource, _id: "other" }));
    await flush();
    if (view)
      expect(view.container.textContent).toContain("could not be loaded");
  },
);
it.each([true, false])(
  "copies resource links with clipboard success=%s",
  async (success) => {
    const writeText = vi.fn();
    success
      ? writeText.mockResolvedValue()
      : writeText.mockRejectedValue(Error());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    setup(<CopyLink path="/resources/r1" />);
    click(button(view.container, "Copy link"));
    await flush();
    expect(writeText).toHaveBeenCalledWith(
      new URL("/resources/r1", window.location.origin).href,
    );
    if (success) expect(view.container.textContent).toContain("Link copied");
    else {
      const input = view.container.querySelector("input");
      input.focus();
      expect(input.selectionEnd).toBe(input.value.length);
    }
  },
);
it.each(["ADMIN", "VOLUNTEER"])(
  "saves to existing lists for %s",
  async (role) => {
    apiRequest
      .mockResolvedValueOnce(
        result([{ ...list }, { ...list, id: "other", owner_id: "other" }]),
      )
      .mockResolvedValue(result({}));
    setup(
      <ResourceSharing resource={resource} />,
      "/shortlists",
      "/shortlists",
      role,
    );
    click(button(view.container, "Add to shortlist"));
    await flush();
    expect(view.container.querySelectorAll("option").length).toBe(
      role === "ADMIN" ? 3 : 2,
    );
    change(view.container.querySelector("select"), "l1");
    await submit(view.container.querySelector("form"));
    expect(apiRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        endpoint: "shortlists/l1/resources/r1",
        method: "PUT",
      }),
    );
    expect(view.container.textContent).toContain("Resource saved");
    click(button(view.container, "Add to shortlist"));
    expect(view.container.querySelector("form")).toBeNull();
  },
);
it("creates a list before saving and retains it for retry if insertion fails", async () => {
  apiRequest
    .mockResolvedValueOnce(result([]))
    .mockResolvedValueOnce(result(list))
    .mockRejectedValueOnce(Error())
    .mockResolvedValue(result({}));
  setup(<ResourceSharing resource={resource} />);
  click(button(view.container, "Add to shortlist"));
  await flush();
  change(view.container.querySelector("input"), " New ");
  await submit(view.container.querySelector("form"));
  expect(view.container.textContent).toContain("Could not save");
  expect(view.container.querySelector("select").value).toBe("l1");
  await submit(view.container.querySelector("form"));
  expect(view.container.textContent).toContain("Resource saved");
  expect(
    apiRequest.mock.calls.filter(([arg]) => arg.method === "POST"),
  ).toHaveLength(1);
});
it("reports a shortlist load failure", async () => {
  apiRequest.mockRejectedValue(Error());
  setup(<ResourceSharing resource={resource} />);
  click(button(view.container, "Add to shortlist"));
  await flush();
  expect(view.container.textContent).toContain("Could not load shortlists");
});
