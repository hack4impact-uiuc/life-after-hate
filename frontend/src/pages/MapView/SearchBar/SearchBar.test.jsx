import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { vi, expect, test, beforeEach, afterEach } from "vitest";
import SearchBar from "./index";
import map from "../../../redux/reducers/map";
import {
  updateSearchQuery,
  updateSearchLocation,
} from "../../../redux/actions/map";
import { filterAndRefreshResource } from "../../../utils/api";
vi.mock("../../../utils/api", () => ({ filterAndRefreshResource: vi.fn() }));
let root, container, store, status;
beforeEach(() => {
  vi.useFakeTimers();
  filterAndRefreshResource.mockReset().mockResolvedValue({});
  store = createStore((state, action) => ({ map: map(state?.map, action) }));
  status = vi.fn();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root.render(
      <Provider store={store}>
        <SearchBar onStatusChange={status} />
      </Provider>,
    ),
  );
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});
const type = (query) => act(() => store.dispatch(updateSearchQuery(query)));
const tick = async (ms) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
const submit = () =>
  act(() =>
    container
      .querySelector("form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
test("debounces keywords and clears results without applying a draft location", async () => {
  act(() => store.dispatch(updateSearchLocation("Chicago")));
  type("a");
  await tick(200);
  type("alpha");
  await tick(299);
  expect(filterAndRefreshResource).not.toHaveBeenCalled();
  await tick(1);
  expect(filterAndRefreshResource).toHaveBeenLastCalledWith(
    "alpha",
    "",
    undefined,
    500,
    expect.any(Object),
  );
  type("");
  await tick(300);
  expect(filterAndRefreshResource).toHaveBeenLastCalledWith(
    "",
    "",
    undefined,
    500,
    expect.any(Object),
  );
});
test("Enter applies location immediately and cancels the pending debounce", async () => {
  act(() => store.dispatch(updateSearchLocation("Chicago")));
  type("alpha");
  submit();
  await tick(400);
  expect(filterAndRefreshResource).toHaveBeenCalledTimes(1);
  expect(filterAndRefreshResource).toHaveBeenLastCalledWith(
    "alpha",
    "Chicago",
    undefined,
    500,
    expect.any(Object),
  );
  type("beta");
  await tick(300);
  expect(filterAndRefreshResource).toHaveBeenLastCalledWith(
    "beta",
    "Chicago",
    undefined,
    500,
    expect.any(Object),
  );
});
test("invalidates in-flight results as soon as typing resumes and on unmount", async () => {
  type("alpha");
  await tick(300);
  const first = filterAndRefreshResource.mock.calls[0][4];
  expect(first.shouldApply()).toBe(true);
  type("beta");
  expect(first.shouldApply()).toBe(false);
  await tick(300);
  const second = filterAndRefreshResource.mock.calls[1][4];
  act(() => root.unmount());
  expect(second.shouldApply()).toBe(false);
  root = createRoot(container);
});
test("shows an error and permits retry", async () => {
  filterAndRefreshResource.mockRejectedValueOnce(new Error("offline"));
  type("alpha");
  await tick(300);
  expect(status).toHaveBeenLastCalledWith("error");
  submit();
  await tick(0);
  expect(status).toHaveBeenLastCalledWith("idle");
});
