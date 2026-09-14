import React, { act } from "react";
import { vi, beforeEach, afterEach } from "vitest";
import { mount, click, button, flush } from "../../../test/render";
vi.mock("../../utils/api", () => ({
  getTags: vi.fn().mockResolvedValue(),
  addFilterTag: vi.fn(),
  removeFilterTag: vi.fn(),
}));
vi.mock("./Map", () => ({
  default: ({ resources }) => (
    <div data-testid="map" data-ids={resources.map((r) => r._id).join(",")} />
  ),
}));
vi.mock("./CardView", () => ({
  default: ({ resources }) => (
    <div data-testid="cards" data-ids={resources.map((r) => r._id).join(",")} />
  ),
}));
vi.mock("./SearchBar", () => ({
  default: ({ onStatusChange }) => (
    <div>
      {["idle", "pending", "updating", "error"].map((s) => (
        <button key={s} onClick={() => onStatusChange(s)}>
          {s}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("./SortMenu", () => ({
  default: ({ onChange }) => (
    <button onClick={() => onChange("name")}>Sort name</button>
  ),
}));
import MapView from "./index";
import { getTags } from "../../utils/api";
const resources = [
  {
    _id: "g",
    type: "GROUP",
    companyName: "Zeta",
    description: "Group support",
    location: { coordinates: [0, 0] },
    tags: [],
    distanceFromSearchLoc: 0,
  },
  {
    _id: "i",
    type: "INDIVIDUAL",
    contactName: "Ada",
    skills: "Skills",
    location: { coordinates: [1, 1] },
    tags: ["Food"],
    contactEmail: "a@example.com",
    contactPhone: "123",
    address: "Chicago",
    websiteURL: "example.com",
    availability: "Anytime",
    volunteerRoles: "Guide",
    volunteerReason: "Help",
    howDiscovered: "Friend",
    notes: "Private notes",
    dateCreated: "2026-01-01",
  },
  {
    _id: "t",
    type: "TANGIBLE",
    resourceName: "Books",
    location: { coordinates: [2, 2] },
    quantity: "10",
  },
];
let view;
const render = (overrides = {}) => {
  view = mount(<MapView />, {
    resources,
    auth: { role: "ADMIN" },
    ...overrides,
  });
  return view.container;
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});
afterEach(() => {
  view?.unmount();
  vi.useRealTimers();
});
it("loads tags and shows the mapped resource count and search address", async () => {
  const c = render({ search: { address: "Chicago" } });
  await flush();
  expect(getTags).toHaveBeenCalledOnce();
  expect(document.title).toBe("Map View - Life After Hate");
  expect(c.textContent).toContain("3 resources");
  expect(c.textContent).toContain("near Chicago");
});
it.each([
  ["All", "g,i,t"],
  ["Groups", "g"],
  ["Individuals", "i"],
  ["Resources", "t"],
])("filters both map and list by %s", (label, ids) => {
  const c = render();
  click(button(c, label));
  expect(c.querySelector('[data-testid="map"]').dataset.ids).toBe(ids);
  expect(c.querySelector('[data-testid="cards"]').dataset.ids).toBe(ids);
});
it("sorts resources by name without mutating Redux data", () => {
  const c = render();
  click(button(c, "Sort name"));
  expect(c.querySelector('[data-testid="cards"]').dataset.ids).toBe("i,t,g");
  expect(view.store.getState().resources).toEqual(resources);
});
it.each(["pending", "updating", "idle", "error"])(
  "presents search status %s",
  (status) => {
    const c = render();
    click(button(c, status));
    expect(c.querySelector(".results-rail").getAttribute("aria-busy")).toBe(
      String(["pending", "updating"].includes(status)),
    );
    expect(Boolean(c.querySelector('[role="alert"]'))).toBe(status === "error");
    expect(Boolean(c.querySelector(".search-progress"))).toBe(
      status === "updating",
    );
  },
);
it("shows an empty prompt for resources without valid locations", () => {
  const c = render({ resources: [{ _id: "bad", type: "GROUP" }] });
  expect(c.textContent).toContain("Find a place to start");
});
it("renders resource details, safe contact links, tags, and history", () => {
  const c = render({
    map: { selectedId: "i", search: { query: "", location: "" } },
  });
  expect(c.querySelector(".resource-drawer").textContent).toContain(
    "Skills & qualifications",
  );
  expect(c.querySelector(".resource-drawer").textContent).toContain(
    "Private notes",
  );
  expect(c.querySelector('a[href="mailto:a@example.com"]')).not.toBeNull();
  expect(c.querySelector('a[href="tel:123"]')).not.toBeNull();
  expect(c.querySelector('a[href="https://example.com/"]').rel).toBe(
    "noopener noreferrer",
  );
});
it("displays zero distance and does not make unsafe website links clickable", () => {
  const c = render({
    resources: [{ ...resources[0], websiteURL: "javascript:alert(1)" }],
    map: { selectedId: "g", search: {} },
  });
  expect(c.textContent).toContain("0.00 miles away");
  expect(c.querySelector('a[href^="javascript:"]')).toBeNull();
  expect(c.textContent).toContain("javascript:alert(1)");
});
it.each(["button", "Escape"])(
  "closes and removes drawer after its transition using %s",
  async (how) => {
    const c = render({ map: { selectedId: "i", search: {} } });
    if (how === "button")
      click(c.querySelector('[aria-label="Close resource details"]'));
    else
      act(() =>
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
      );
    expect(view.store.getState().map.selectedId).toBeUndefined();
    expect(c.querySelector(".drawer-shell").getAttribute("aria-hidden")).toBe(
      "true",
    );
    await act(async () => vi.advanceTimersByTimeAsync(300));
    expect(c.querySelector(".drawer-shell")).toBeNull();
  },
);
it("hides selected details when a type filter excludes the resource", async () => {
  const c = render({ map: { selectedId: "g", search: {} } });
  click(button(c, "Individuals"));
  await act(async () => vi.advanceTimersByTimeAsync(300));
  expect(c.querySelector(".resource-drawer")).toBeNull();
});
it("handles a stale selected ID", () => {
  const c = render({ map: { selectedId: "gone", search: {} } });
  expect(c.querySelector(".resource-drawer")).toBeNull();
});
it("opens the resource editor through drawer actions", () => {
  const c = render({ map: { selectedId: "g", search: {} } });
  const buttons = c.querySelector(".resource-drawer");
  click(button(buttons, "Edit"));
  expect(view.store.getState().modal).toMatchObject({ resourceId: "g" });
});
