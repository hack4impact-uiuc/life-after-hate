import React from "react";
import { afterEach } from "vitest";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import { mount } from "../../../test/render";
vi.mock("../Navbar", () => ({ default: () => <nav>Navigation</nav> }));
vi.mock("../../pages/Auth/Pending", () => ({
  default: () => <p>Pending approval</p>,
}));
vi.mock("../Loader", () => ({ default: () => <p>Loading</p> }));
import PrivateRoute from "./index";
let view;
afterEach(() => view?.unmount());
function render(auth, roleRequired) {
  view = mount(
    <MemoryRouter initialEntries={["/private"]}>
      <Switch>
        <Route path="/login">Sign in</Route>
        <PrivateRoute
          path="/private"
          roleRequired={roleRequired}
          component={() => <p>Private data</p>}
        />
        <Route path="/">Home</Route>
      </Switch>
    </MemoryRouter>,
    { auth },
  );
  return view.container;
}
it("waits for authentication before rendering sensitive content", () => {
  const c = render({ authenticated: false, isFetchingAuth: true });
  expect(c.textContent).toBe("Loading");
});
it("redirects anonymous users to sign in", () => {
  const c = render({ authenticated: false, isFetchingAuth: false });
  expect(c.textContent).toBe("Sign in");
});
it.each(["ADMIN", "VOLUNTEER"])("allows approved %s users", (role) => {
  const c = render({ authenticated: true, role, isFetchingAuth: false });
  expect(c.textContent).toContain("Private data");
  expect(c.querySelector("nav")).toBeNull();
});
it("shows pending approval without private content", () => {
  const c = render({
    authenticated: true,
    role: "PENDING",
    isFetchingAuth: false,
  });
  expect(c.textContent).toBe("Pending approval");
});
it("redirects users without the required role", () => {
  const c = render(
    { authenticated: true, role: "VOLUNTEER", isFetchingAuth: false },
    "ADMIN",
  );
  expect(c.textContent).toBe("Home");
});
it("allows users with the required role", () => {
  const c = render(
    { authenticated: true, role: "ADMIN", isFetchingAuth: false },
    "ADMIN",
  );
  expect(c.textContent).toContain("Private data");
});
