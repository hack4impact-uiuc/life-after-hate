import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { vi, beforeEach, afterEach } from "vitest";
import { mount, click, button, flush } from "../../../test/render";
vi.mock("../../utils/api", () => ({ logout: vi.fn().mockResolvedValue() }));
import { logout } from "../../utils/api";
import Navbar from "./index";
let view, observer;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback) {
        observer = { callback, disconnect: vi.fn(), observe: vi.fn() };
        this.observe = observer.observe;
        this.disconnect = observer.disconnect;
      }
    },
  );
});
afterEach(() => {
  view?.unmount();
  vi.unstubAllGlobals();
});
function render(path = "/", auth = {}) {
  view = mount(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>,
    {
      auth: {
        role: "ADMIN",
        propicUrl: "",
        firstName: "Ada",
        lastName: "Admin",
        ...auth,
      },
      resources: [{ _id: "a" }],
    },
  );
  return view.container;
}
it.each(["/", "/directory", "/users"])(
  "marks the active navigation link for %s",
  (path) => {
    const c = render(path);
    expect(c.querySelector('[aria-current="page"]').getAttribute("href")).toBe(
      path,
    );
  },
);
it("toggles mobile navigation and clears page state on navigation", () => {
  const c = render();
  const toggle = c.querySelector('[aria-label="Toggle navigation"]');
  click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  click(c.querySelector('a[href="/directory"]'));
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(view.store.getState().resources).toEqual([]);
});
it("opens a new resource dialog and closes mobile navigation", () => {
  const c = render();
  click(c.querySelector('[aria-label="Toggle navigation"]'));
  click(button(c, "New resource"));
  expect(view.store.getState().modal).toMatchObject({
    isOpen: true,
    modalType: "RESOURCE",
  });
  expect(
    c
      .querySelector('[aria-label="Toggle navigation"]')
      .getAttribute("aria-expanded"),
  ).toBe("false");
});
it("hides admin navigation and creation controls from volunteers", () => {
  const c = render("/", { role: "VOLUNTEER" });
  expect(c.querySelector('a[href="/users"]')).toBeNull();
  expect(button(c, "New resource")).toBeUndefined();
});
it("falls back to initials when an avatar fails and resets when URL changes", () => {
  const c = render("/", { propicUrl: "https://example.com/a" });
  act(() => c.querySelector("#user-icon").dispatchEvent(new Event("error")));
  expect(c.querySelector("#user-icon").textContent).toBe("A");
  act(() =>
    view.store.dispatch({
      type: "AUTH_UPDATE",
      payload: { role: "ADMIN", propicUrl: "https://example.com/b" },
    }),
  );
  expect(c.querySelector("#user-icon").tagName).toBe("IMG");
});
it("shows fallback account name and initial", () => {
  const c = render("/", { firstName: "", lastName: "" });
  expect(c.querySelector("#user-icon").textContent).toBe("U");
  expect(c.textContent).toContain("Your account");
});
it("invokes logout through the account menu", async () => {
  const c = render();
  click(c.querySelector("#signout-button"));
  await flush();
  expect(logout).toHaveBeenCalledOnce();
});
it("tracks navbar height and disconnects the resize observer on unmount", () => {
  render();
  act(() => observer.callback([{ contentRect: { height: 80 } }]));
  expect(document.documentElement.style.getPropertyValue("--nav-height")).toBe(
    "80px",
  );
  view.unmount();
  view = null;
  expect(observer.disconnect).toHaveBeenCalledOnce();
});
