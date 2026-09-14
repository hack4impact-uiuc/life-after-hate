import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { vi, beforeEach, afterEach } from "vitest";
vi.mock("../../utils/api", () => ({
  logout: vi.fn(),
  refreshGlobalAuth: vi.fn(),
}));
vi.mock("../../utils/apiHelpers", () => ({ purgeGlobalAuthState: vi.fn() }));
import { logout, refreshGlobalAuth } from "../../utils/api";
import { purgeGlobalAuthState } from "../../utils/apiHelpers";
import SessionGuard, { IDLE_TIMEOUT_MS } from "./index";
let root, store;
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  logout.mockResolvedValue(undefined);
  root = createRoot(document.createElement("div"));
  store = createStore((state = { auth: { authenticated: true } }, action) =>
    action.type === "logout" ? { auth: { authenticated: false } } : state,
  );
});
afterEach(() => {
  act(() => root.unmount());
  vi.useRealTimers();
  vi.restoreAllMocks();
});
function render() {
  act(() =>
    root.render(
      <Provider store={store}>
        <SessionGuard />
      </Provider>,
    ),
  );
}
it("locks at the idle boundary and logs out once even if the network fails", async () => {
  logout.mockRejectedValueOnce(Error("Offline"));
  render();
  await act(async () => vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 1000));
  expect(logout).not.toHaveBeenCalled();
  await act(async () => vi.advanceTimersByTime(1000));
  expect(purgeGlobalAuthState).toHaveBeenCalledOnce();
  expect(logout).toHaveBeenCalledOnce();
  await act(async () => vi.advanceTimersByTime(IDLE_TIMEOUT_MS));
  expect(logout).toHaveBeenCalledOnce();
});
it.each(["pointerdown", "keydown"])("resets idle time on %s", (event) => {
  render();
  act(() => vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 1000));
  act(() => window.dispatchEvent(new Event(event)));
  act(() => vi.advanceTimersByTime(1000));
  expect(logout).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 1000));
  expect(logout).toHaveBeenCalledOnce();
});
it("does not revive an expired session when activity arrives after suspended timers", () => {
  render();
  vi.setSystemTime(Date.now() + IDLE_TIMEOUT_MS);
  act(() => window.dispatchEvent(new Event("pointerdown")));
  expect(purgeGlobalAuthState).toHaveBeenCalledOnce();
});
it("refreshes active authentication periodically and on becoming visible", () => {
  render();
  act(() => vi.advanceTimersByTime(5 * 60 * 1000));
  expect(refreshGlobalAuth).toHaveBeenCalledOnce();
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(refreshGlobalAuth).toHaveBeenCalledOnce();
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(refreshGlobalAuth).toHaveBeenCalledTimes(2);
});
it("locks instead of refreshing an expired tab on visibility change", () => {
  render();
  vi.setSystemTime(Date.now() + IDLE_TIMEOUT_MS);
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(logout).toHaveBeenCalledOnce();
  expect(refreshGlobalAuth).not.toHaveBeenCalled();
});
it("removes timers and listeners when authentication is purged", () => {
  render();
  act(() => store.dispatch({ type: "logout" }));
  expect(vi.getTimerCount()).toBe(0);
  vi.setSystemTime(Date.now() + IDLE_TIMEOUT_MS);
  act(() => {
    window.dispatchEvent(new Event("keydown"));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(logout).not.toHaveBeenCalled();
  expect(refreshGlobalAuth).not.toHaveBeenCalled();
});
it("does not schedule timers for anonymous users", () => {
  store.dispatch({ type: "logout" });
  render();
  expect(vi.getTimerCount()).toBe(0);
});
