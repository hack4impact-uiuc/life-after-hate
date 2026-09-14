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

import {
  refreshGlobalAuth,
  logout,
  addAndRefreshResource,
  editAndRefreshResource,
  deleteAndRefreshResource,
  refreshAllUsers,
  editAndRefreshUser,
  getTags,
  addFilterTag,
  removeFilterTag,
} from "./api";
import { updateGlobalAuthState, purgeGlobalAuthState } from "./apiHelpers";
import {
  ADD_RESOURCE,
  UPDATE_RESOURCE,
  DELETE_RESOURCE,
} from "../redux/actions/resources";
import { UPDATE_USERS } from "../redux/actions/users";
import { REFRESH_TAG_LIST, ADD_TAG, REMOVE_TAG } from "../redux/actions/tags";
it("loads current user and purges authentication when refresh fails", async () => {
  apiRequest.mockResolvedValueOnce({ result: { role: "PENDING" } });
  await refreshGlobalAuth();
  expect(updateGlobalAuthState).toHaveBeenCalledWith({ role: "PENDING" });
  apiRequest.mockRejectedValueOnce(new Error("Unauthorized"));
  await refreshGlobalAuth();
  expect(purgeGlobalAuthState).toHaveBeenCalledOnce();
});
it.each([true, false])(
  "logout always purges local authentication (request succeeds: %s)",
  async (succeeds) => {
    if (succeeds) apiRequest.mockResolvedValueOnce({});
    else apiRequest.mockRejectedValueOnce(new Error("Offline"));
    const result = logout();
    if (succeeds) await result;
    else await expect(result).rejects.toThrow("Offline");
    expect(purgeGlobalAuthState).toHaveBeenCalledOnce();
    expect(apiRequest).toHaveBeenCalledWith({
      endpoint: "auth/logout",
      method: "POST",
    });
  },
);
it("fetches the server-normalized resource after creation", async () => {
  const doc = { _id: "new", address: "Normalized" };
  apiRequest
    .mockResolvedValueOnce({ id: "new" })
    .mockResolvedValueOnce({ result: doc });
  await addAndRefreshResource({ address: "raw" });
  expect(apiRequest).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      endpoint: "resources",
      method: "POST",
      data: { address: "raw" },
    }),
  );
  expect(apiRequest).toHaveBeenNthCalledWith(2, {
    endpoint: "resources/new",
    method: "GET",
  });
  expect(store.dispatch).toHaveBeenCalledWith({
    type: ADD_RESOURCE,
    payload: doc,
  });
});
it("fetches updated resource data after edit", async () => {
  const doc = { _id: "a", notes: "New" };
  apiRequest.mockResolvedValueOnce({}).mockResolvedValueOnce({ result: doc });
  await editAndRefreshResource({ notes: "New" }, "a");
  expect(apiRequest).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      endpoint: "/resources/a",
      method: "PUT",
      data: { notes: "New" },
    }),
  );
  expect(store.dispatch).toHaveBeenCalledWith({
    type: UPDATE_RESOURCE,
    payload: doc,
  });
});
it("removes a resource only after the server confirms deletion", async () => {
  let finish;
  apiRequest.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = deleteAndRefreshResource("a");
  expect(store.dispatch).not.toHaveBeenCalled();
  finish({});
  await pending;
  expect(store.dispatch).toHaveBeenCalledWith({
    type: DELETE_RESOURCE,
    payload: { _id: "a" },
  });
});
it.each([
  addAndRefreshResource,
  editAndRefreshResource,
  deleteAndRefreshResource,
  editAndRefreshUser,
])("failed mutation does not publish local changes %#", async (operation) => {
  apiRequest.mockRejectedValueOnce(new Error("Denied"));
  await expect(operation({}, "a")).rejects.toThrow("Denied");
  expect(store.dispatch).not.toHaveBeenCalled();
  expect(apiRequest).toHaveBeenCalledOnce();
});
it("refreshes the user list after a successful role update", async () => {
  const list = [{ id: "u", role: "VOLUNTEER" }];
  apiRequest.mockResolvedValueOnce({}).mockResolvedValueOnce({ result: list });
  await editAndRefreshUser({ role: "VOLUNTEER" }, "u");
  expect(apiRequest).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ endpoint: "/users/u", method: "PATCH" }),
  );
  expect(store.dispatch).toHaveBeenCalledWith({
    type: UPDATE_USERS,
    payload: list,
  });
});
it("refreshes users and tags and toggles local tag filters", async () => {
  apiRequest
    .mockResolvedValueOnce({ result: [] })
    .mockResolvedValueOnce({ result: ["Food"] });
  await refreshAllUsers();
  await getTags();
  addFilterTag("Food");
  removeFilterTag("Food");
  expect(store.dispatch.mock.calls.map(([action]) => action)).toEqual([
    { type: UPDATE_USERS, payload: [] },
    { type: REFRESH_TAG_LIST, payload: ["Food"] },
    { type: ADD_TAG, payload: "Food" },
    { type: REMOVE_TAG, payload: "Food" },
  ]);
});
it.each([undefined, [null, null], [NaN, 0], [0]])(
  "clears a previous map center when search returns invalid coordinates %j",
  async (center) => {
    apiRequest.mockResolvedValueOnce({ result: { resources: [], center } });
    await filterAndRefreshResource("", "");
    expect(store.dispatch).toHaveBeenCalledWith({
      type: UPDATE_MAP_CENTER,
      payload: null,
    });
  },
);
it("accepts a zero-valued map center", async () => {
  apiRequest.mockResolvedValueOnce({
    result: { resources: [], center: [0, 0] },
  });
  await filterAndRefreshResource("", "Origin", undefined, 0, {
    withLoader: false,
  });
  expect(store.dispatch).toHaveBeenCalledWith({
    type: UPDATE_MAP_CENTER,
    payload: [0, 0],
  });
  expect(apiRequest).toHaveBeenCalledWith(
    expect.objectContaining({ withLoader: false }),
  );
});
