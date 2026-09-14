import { vi, beforeEach } from "vitest";
vi.mock("../redux/store", () => ({ default: { dispatch: vi.fn() } }));
vi.mock("react-toastify", () => ({ toast: { info: vi.fn() } }));
import store from "../redux/store";
import {
  toQueryString,
  getURLForEndpoint,
  apiRequest,
  updateGlobalAuthState,
  purgeGlobalAuthState,
} from "./apiHelpers";
import { AUTH_UPDATE, AUTH_PURGE } from "../redux/actions/auth";
beforeEach(() => vi.clearAllMocks());
it("encodes query values and keys without allowing injected parameters", () => {
  expect(toQueryString({ "a&b": "Chicago & food=free", tag: "café" })).toBe(
    "a%26b=Chicago%20%26%20food%3Dfree&tag=caf%C3%A9",
  );
});
it("omits unset values while preserving zero radius and false", () => {
  expect(
    toQueryString({
      radius: 0,
      enabled: false,
      empty: "",
      missing: undefined,
      nil: null,
    }),
  ).toBe("radius=0&enabled=false");
  expect(toQueryString({})).toBe("");
});
it.each(["users", "/users"])("joins endpoint %s", (endpoint) =>
  expect(getURLForEndpoint(endpoint)).toBe("/api/users"),
);
it("resolves requests through the middleware callback with defaults", async () => {
  const promise = apiRequest({ endpoint: "users" });
  const action = store.dispatch.mock.calls[0][0];
  expect(action.payload).toMatchObject({
    url: "/api/users",
    method: "GET",
    data: null,
    withLoader: true,
    expectUnauthorizedResponse: false,
  });
  action.payload.onSuccess({ result: [] });
  await expect(promise).resolves.toEqual({ result: [] });
});
it("forwards request options and rejects middleware failures", async () => {
  const notification = { failureMessage: "Failed" };
  const promise = apiRequest({
    method: "POST",
    data: { name: "Test" },
    withLoader: false,
    notification,
    expectUnauthorizedResponse: true,
  });
  const payload = store.dispatch.mock.calls[0][0].payload;
  expect(payload).toMatchObject({
    url: "/api",
    method: "POST",
    data: { name: "Test" },
    withLoader: false,
    notification,
    expectUnauthorizedResponse: true,
  });
  payload.onFailure(new Error("Failed"));
  await expect(promise).rejects.toThrow("Failed");
});
it("updates and purges authentication through Redux", () => {
  const user = { role: "ADMIN" };
  updateGlobalAuthState(user);
  purgeGlobalAuthState();
  expect(store.dispatch).toHaveBeenNthCalledWith(1, {
    type: AUTH_UPDATE,
    payload: user,
  });
  expect(store.dispatch).toHaveBeenNthCalledWith(2, { type: AUTH_PURGE });
});
