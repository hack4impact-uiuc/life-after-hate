import React, { act } from "react";
import { vi, beforeEach, afterEach } from "vitest";
import {
  mount,
  change,
  submit,
  flush,
  deferred,
} from "../../../../test/render";
vi.mock("../../../utils/api", () => ({ filterAndRefreshResource: vi.fn() }));
vi.mock("../../../components/TagFilters", () => ({
  default: () => <div>Filters</div>,
}));
import { filterAndRefreshResource } from "../../../utils/api";
import SearchBar from "./index";
let view, status;
beforeEach(() => {
  vi.useFakeTimers();
  filterAndRefreshResource.mockReset().mockResolvedValue({});
  status = vi.fn();
});
afterEach(() => {
  view?.unmount();
  vi.useRealTimers();
});
const render = (isLoading = false) => {
  view = mount(<SearchBar onSearchStatusChange={status} />, { isLoading });
  return view.container;
};
const tick = (ms) => act(async () => vi.advanceTimersByTimeAsync(ms));
it("loads all resources on mount and reports completion", async () => {
  render();
  expect(status).toHaveBeenCalledWith("searching");
  await flush();
  expect(filterAndRefreshResource).toHaveBeenCalledWith(
    "",
    "",
    undefined,
    undefined,
    expect.any(Object),
  );
  expect(status).toHaveBeenLastCalledWith("complete");
});
it("debounces rapid keyword and location changes into one request", async () => {
  const c = render();
  await flush();
  filterAndRefreshResource.mockClear();
  change(c.querySelector("#search-general"), "Fo");
  await tick(200);
  change(c.querySelector("#search-general"), "Food");
  change(c.querySelector("#search-location"), "Chicago");
  await tick(349);
  expect(filterAndRefreshResource).not.toHaveBeenCalled();
  await tick(1);
  expect(filterAndRefreshResource).toHaveBeenCalledOnce();
  expect(filterAndRefreshResource).toHaveBeenCalledWith(
    "Food",
    "Chicago",
    undefined,
    undefined,
    expect.any(Object),
  );
});
it("submits immediately and cancels the pending debounce", async () => {
  const c = render();
  await flush();
  filterAndRefreshResource.mockClear();
  change(c.querySelector("#search-general"), "Food");
  await submit(c.querySelector("form"));
  await tick(400);
  expect(filterAndRefreshResource).toHaveBeenCalledOnce();
});
it("invalidates old responses as soon as input changes", async () => {
  const old = deferred();
  filterAndRefreshResource.mockReturnValueOnce(old.promise);
  const c = render();
  const options = filterAndRefreshResource.mock.calls[0][4];
  expect(options.shouldApply()).toBe(true);
  change(c.querySelector("#search-general"), "New");
  expect(options.shouldApply()).toBe(false);
  await act(async () => old.resolve({}));
  expect(status).toHaveBeenLastCalledWith("searching");
  await tick(350);
  expect(status).toHaveBeenLastCalledWith("complete");
});
it("reports current failures and ignores stale failures", async () => {
  filterAndRefreshResource.mockRejectedValueOnce(Error("Offline"));
  const c = render();
  await flush();
  expect(status).toHaveBeenLastCalledWith("error");
  const old = deferred();
  filterAndRefreshResource.mockReturnValueOnce(old.promise);
  await submit(c.querySelector("form"));
  change(c.querySelector("#search-general"), "New");
  await act(async () => old.reject(Error("Old")));
  expect(status).toHaveBeenLastCalledWith("searching");
});
it("cancels pending timers and invalidates responses on unmount", async () => {
  const c = render();
  await flush();
  const options = filterAndRefreshResource.mock.calls[0][4];
  change(c.querySelector("#search-general"), "New");
  view.unmount();
  view = null;
  const count = status.mock.calls.length;
  await tick(400);
  expect(options.shouldApply()).toBe(false);
  expect(filterAndRefreshResource).toHaveBeenCalledOnce();
  expect(status).toHaveBeenCalledTimes(count);
});
it("disables manual search while loading", () =>
  expect(render(true).querySelector("button").disabled).toBe(true));
