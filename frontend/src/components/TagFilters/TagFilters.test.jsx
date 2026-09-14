import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import TagFilters from "./index";
import { removeFilterTag } from "../../utils/api";
vi.mock("../../utils/api", () => ({ removeFilterTag: vi.fn() }));
vi.mock("./TagPicker", () => ({ default: () => <button>Add tag</button> }));
let root, container, store;
beforeEach(() => {
  vi.useFakeTimers();
  store = createStore(
    (state = { tags: { selected: ["Housing"], all: [] } }, action) =>
      action.type === "tags"
        ? { tags: { ...state.tags, selected: action.tags } }
        : state,
  );
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root.render(
      <Provider store={store}>
        <TagFilters />
      </Provider>,
    ),
  );
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});
test("removes a filter immediately, then retains an inert chip only for its exit", () => {
  act(() => container.querySelector(".filter-tag").click());
  expect(removeFilterTag).toHaveBeenCalledWith("Housing");
  act(() => store.dispatch({ type: "tags", tags: [] }));
  expect(container.querySelector(".filter-tag").disabled).toBe(true);
  expect(
    container.querySelector(".filter-tag").getAttribute("aria-hidden"),
  ).toBe("true");
  act(() => vi.advanceTimersByTime(150));
  expect(container.querySelector(".filter-tag")).toBeNull();
});
test("re-adding a chip during its exit cancels stale removal", () => {
  act(() => store.dispatch({ type: "tags", tags: [] }));
  act(() => vi.advanceTimersByTime(80));
  act(() => store.dispatch({ type: "tags", tags: ["Housing"] }));
  act(() => vi.advanceTimersByTime(150));
  expect(container.querySelectorAll(".filter-tag")).toHaveLength(1);
  expect(container.querySelector(".filter-tag").disabled).toBe(false);
});
