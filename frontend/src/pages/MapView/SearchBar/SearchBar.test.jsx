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

import { change, click } from "../../../../test/render";
test("clears search text and restores input focus", async () => {
  change(container.querySelector("#map-keyword-input"), "Food");
  click(container.querySelector('[aria-label="Clear search"]'));
  expect(store.getState().map.search.query).toBe("");
  expect(document.activeElement.id).toBe("map-keyword-input");
  await tick(300);
  expect(filterAndRefreshResource.mock.calls.at(-1)[0]).toBe("");
});
test("clears an applied location immediately and restores focus", async () => {
  change(container.querySelector("#locationInput"), " Chicago ");
  submit();
  await tick(1);
  expect(filterAndRefreshResource.mock.calls.at(-1)[1]).toBe("Chicago");
  click(container.querySelector('[aria-label="Clear location"]'));
  await tick(1);
  expect(filterAndRefreshResource.mock.calls.at(-1)[1]).toBe("");
  expect(document.activeElement.id).toBe("locationInput");
});
test.each(["", "0", "15", "1010"])(
  "does not search while radius is invalid: %s",
  async (value) => {
    change(
      container.querySelector('[aria-label="Search radius in miles"]'),
      value,
    );
    await tick(350);
    expect(filterAndRefreshResource).not.toHaveBeenCalled();
    expect(status).toHaveBeenLastCalledWith("idle");
  },
);
test("debounces a valid radius change and preserves the applied location", async () => {
  change(
    container.querySelector('[aria-label="Search radius in miles"]'),
    "100",
  );
  await tick(300);
  expect(filterAndRefreshResource.mock.calls.at(-1)[3]).toBe(100);
});
test("does not submit or debounce during IME composition", async () => {
  act(() =>
    container
      .querySelector("form")
      .dispatchEvent(
        new CompositionEvent("compositionstart", { bubbles: true }),
      ),
  );
  type("検索");
  submit();
  await tick(400);
  expect(filterAndRefreshResource).not.toHaveBeenCalled();
  act(() =>
    container
      .querySelector("form")
      .dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })),
  );
  await tick(300);
  expect(filterAndRefreshResource.mock.calls.at(-1)[0]).toBe("検索");
});
