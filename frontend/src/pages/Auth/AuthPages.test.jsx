import React from "react";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import { vi, afterEach } from "vitest";
import { mount, click, button, flush } from "../../../test/render";
vi.mock("../../utils/api", () => ({ logout: vi.fn().mockResolvedValue() }));
import { logout } from "../../utils/api";
import Login from "./Login";
import Pending, { PendingScreen } from "./Pending";
let view;
afterEach(() => {
  view?.unmount();
  vi.clearAllMocks();
});
it.each([true, false])("login handles authenticated=%s", (authenticated) => {
  view = mount(
    <MemoryRouter initialEntries={["/login"]}>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/">Home</Route>
      </Switch>
    </MemoryRouter>,
    { auth: { authenticated } },
  );
  expect(document.title).toBe("Sign in - Life After Hate");
  if (authenticated) expect(view.container.textContent).toBe("Home");
  else
    expect(view.container.querySelector("a").getAttribute("href")).toBe(
      "/api/auth/login",
    );
});
it("renders pending identity and signs out", async () => {
  view = mount(<Pending />, { auth: { email: "a@example.com" } });
  expect(document.title).toBe("Pending approval - Life After Hate");
  expect(view.container.textContent).toContain("a@example.com");
  click(button(view.container, "Sign out"));
  await flush();
  expect(logout).toHaveBeenCalledOnce();
});
it.each([undefined, "invalid", "2026-01-01T00:00:00Z"])(
  "formats pending request date %s",
  (requestedAt) => {
    view = mount(
      <PendingScreen requestedAt={requestedAt} onSignOut={vi.fn()} />,
    );
    expect(view.container.textContent).toContain(
      requestedAt?.startsWith("2026")
        ? "Requested 1 Jan 2026"
        : "Access request",
    );
    expect(view.container.querySelector(".pending-email")).toBeNull();
  },
);
