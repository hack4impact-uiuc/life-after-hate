import { vi, test, expect, beforeEach } from "vitest";
vi.mock("./apiHelpers", () => ({
  apiRequest: vi.fn(),
  toQueryString: () => "",
  updateGlobalAuthState: vi.fn(),
  purgeGlobalAuthState: vi.fn(),
}));
vi.mock("../redux/store", () => ({
  default: {
    dispatch: vi.fn(),
    getState: () => ({ map: { center: [-87, 42] } }),
  },
}));
import { apiRequest } from "./apiHelpers";
import store from "../redux/store";
import { filterAndRefreshResource } from "./api";
import { UPDATE_MAP_CENTER } from "../redux/actions/map";
beforeEach(() => {
  vi.clearAllMocks();
});
test("only the newest search can publish results", async () => {
  let resolveOld;
  apiRequest.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
  );
  const old = filterAndRefreshResource("old", "");
  apiRequest.mockResolvedValueOnce({
    result: { resources: [], center: [-87, 42] },
  });
  await filterAndRefreshResource("new", "");
  const count = store.dispatch.mock.calls.length;
  resolveOld({ result: { resources: [{ _id: "stale" }], center: [0, 0] } });
  await old;
  expect(store.dispatch).toHaveBeenCalledTimes(count);
  expect(
    store.dispatch.mock.calls.some(
      ([action]) => action.type === UPDATE_MAP_CENTER,
    ),
  ).toBe(false);
});
test("an invalidated search cannot publish and a new location updates the center", async () => {
  apiRequest.mockResolvedValue({ result: { resources: [], center: [1, 2] } });
  await filterAndRefreshResource("old", "", undefined, 500, {
    shouldApply: () => false,
  });
  expect(store.dispatch).not.toHaveBeenCalled();
  await filterAndRefreshResource("new", "Paris");
  expect(store.dispatch).toHaveBeenCalledWith({
    type: UPDATE_MAP_CENTER,
    payload: [1, 2],
  });
});
