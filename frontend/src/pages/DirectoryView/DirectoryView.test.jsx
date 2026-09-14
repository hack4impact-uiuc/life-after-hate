import React from "react";
import { vi, beforeEach, afterEach } from "vitest";
import { mount, click, change, button, flush } from "../../../test/render";
vi.mock("../../utils/api", () => ({ getTags: vi.fn().mockResolvedValue() }));
vi.mock("./SearchBar", () => ({
  default: ({ onSearchStatusChange }) => (
    <div>
      {["complete", "searching", "error"].map((status) => (
        <button key={status} onClick={() => onSearchStatusChange(status)}>
          {status}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("./ResourceList", () => ({
  default: ({ resources, density, onSelectResource }) => (
    <div data-testid="rows" data-density={density}>
      {resources.map((r) => (
        <button key={r._id} onClick={() => onSelectResource(r._id)}>
          {r.companyName}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("../../components/ResourceDetails", () => ({
  default: ({ resource, onClose }) =>
    resource ? (
      <div data-testid="details">
        {resource.companyName}
        <button onClick={onClose}>Close details</button>
      </div>
    ) : null,
}));
import Directory from "./index";
import { getTags } from "../../utils/api";
let view;
const resources = [
  {
    _id: "a",
    type: "GROUP",
    companyName: "Alpha",
    tags: ["Food"],
    dateCreated: new Date().toISOString(),
  },
  {
    _id: "b",
    type: "GROUP",
    companyName: "Beta",
    tags: [],
    dateCreated: "2020-01-01",
  },
];
const render = (overrides = {}) => {
  view = mount(<Directory />, {
    resources,
    auth: { role: "ADMIN" },
    ...overrides,
  });
  return view.container;
};
beforeEach(() => vi.clearAllMocks());
afterEach(() => view?.unmount());
it("loads tags and shows result counts after loading", async () => {
  const c = render();
  await flush();
  expect(document.title).toBe("Directory View - Life After Hate");
  expect(getTags).toHaveBeenCalledOnce();
  expect(c.textContent).toContain("Searching…");
  click(button(c, "complete"));

  expect(c.textContent).toContain("2 results");
  expect(c.textContent).toContain("in default order");
});
it("shows selected-tag result counts", () => {
  const c = render({ tags: { selected: ["Food"], all: ["Food"] } });
  click(button(c, "complete"));

  expect(c.querySelector("#result-count").textContent).toBe("1 result");
});
it.each([
  ["searching", "Searching resources"],
  ["error", "Could not load resources"],
  ["complete", "No resources found"],
])("shows empty state for %s", (status, message) => {
  const c = render({ resources: [] });
  click(button(c, status));
  expect(c.querySelector(".directory-empty").textContent).toContain(message);
  expect(c.querySelector(".directory-table").getAttribute("aria-busy")).toBe(
    String(status === "searching"),
  );
});
it.each([
  ["RESOURCE NAME", "asc", "sorted by name"],
  ["LOCATION", "desc", "sorted by location (descending)"],
])("describes current sort %s %s", (field, order, text) => {
  const c = render({ sort: { field, order } });
  click(button(c, "complete"));
  expect(c.textContent).toContain(text);
});
it("toggles row density", () => {
  const c = render();
  click(button(c, "Compact"));
  expect(c.querySelector("main").className).toContain("directory--compact");
  expect(c.querySelector('[data-testid="rows"]').dataset.density).toBe(
    "compact",
  );
  click(button(c, "Comfortable"));
  expect(button(c, "Comfortable").getAttribute("aria-pressed")).toBe("true");
});
it("hides CSV export from volunteers", () => {
  const c = render({ auth: { role: "VOLUNTEER" } });
  expect(c.querySelector("#csv-download-btn")).toBeNull();
});
it("cycles desktop and mobile sort controls", () => {
  const c = render();
  const name = c.querySelector('[aria-label="Sort by resource"]');
  click(name);
  expect(view.store.getState().sort).toEqual({
    field: "RESOURCE NAME",
    order: "asc",
  });
  click(name);
  expect(view.store.getState().sort.order).toBe("desc");
  click(name);
  expect(view.store.getState().sort.field).toBeNull();
});
it("supports mobile sort selection and direction changes", () => {
  const c = render();
  const select = c.querySelector('[aria-label="Sort resources"]');
  change(select, "LOCATION");
  expect(view.store.getState().sort).toEqual({
    field: "LOCATION",
    order: "asc",
  });
  click(c.querySelector('[aria-label="Change sort order"]'));
  expect(view.store.getState().sort.order).toBe("desc");
});

it("opens and closes the selected resource drawer", () => {
  const c = render();
  click(button(c, "Alpha"));
  expect(c.querySelector('[data-testid="details"]').textContent).toContain(
    "Alpha",
  );
  click(button(c, "Close details"));
  expect(c.querySelector('[data-testid="details"]')).toBeNull();
});
