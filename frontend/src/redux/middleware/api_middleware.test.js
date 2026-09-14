import axios from "axios";
import middleware from "./api_middleware";
vi.mock("axios", () => ({ default: { get: vi.fn(), request: vi.fn() } }));
vi.mock("react-toastify", () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
afterEach(() => vi.clearAllMocks());
it("does not deliver private responses after logout", async () => {
  let resolve;
  axios.request.mockReturnValue(
    new Promise((r) => {
      resolve = r;
    }),
  );
  const dispatch = vi.fn();
  const success = vi.fn();
  const failure = vi.fn();
  const run = middleware({ dispatch })(() => {});
  run({
    type: "API_REQUEST",
    payload: {
      url: "/api/resources",
      method: "GET",
      onSuccess: success,
      onFailure: failure,
    },
  });
  await flush();
  run({ type: "AUTH_PURGE" });
  resolve({ data: { notes: "private" } });
  await flush();
  expect(success).not.toHaveBeenCalled();
  expect(failure).toHaveBeenCalled();
  expect(JSON.stringify(dispatch.mock.calls)).not.toContain("private");
});
it("attaches CSRF tokens to writes and shares concurrent token acquisition", async () => {
  axios.get.mockResolvedValue({ data: { token: "test-token" } });
  axios.request.mockResolvedValue({ data: {} });
  const run = middleware({ dispatch: vi.fn() })(() => {});
  const payload = {
    url: "/api/resources",
    method: "POST",
    data: {},
    onSuccess: vi.fn(),
    onFailure: vi.fn(),
  };
  run({ type: "API_REQUEST", payload });
  run({ type: "API_REQUEST", payload });
  await flush();
  expect(axios.get).toHaveBeenCalledTimes(1);
  expect(axios.request.mock.calls[0][0].headers["X-CSRF-Token"]).toBe(
    "test-token",
  );
});

it.each(["csrf", "mutation"])(
  "releases the loader after a %s timeout and allows another attempt",
  async (stage) => {
    const error = Object.assign(new Error("timeout"), { code: "ECONNABORTED" });
    axios.get.mockResolvedValue({ data: { token: "test-token" } });
    axios.request.mockResolvedValue({ data: {} });
    if (stage === "csrf") axios.get.mockRejectedValueOnce(error);
    else axios.request.mockRejectedValueOnce(error);
    const dispatch = vi.fn();
    const failure = vi.fn();
    const success = vi.fn();
    const run = middleware({ dispatch })(() => {});
    const action = {
      type: "API_REQUEST",
      payload: {
        url: "/api/users/" + "c".repeat(24),
        method: "PATCH",
        data: { role: "REJECTED" },
        withLoader: true,
        onFailure: failure,
        onSuccess: success,
      },
    };
    run(action);
    await flush();
    expect(failure).toHaveBeenCalledWith(error);
    expect(success).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({ type: "LOADER_END" });
    expect(axios.get.mock.calls.at(-1)[1].timeout).toBe(10000);
    run(action);
    await flush();
    expect(success).toHaveBeenCalledTimes(1);
    expect(axios.request.mock.calls.at(-1)[0].timeout).toBe(35000);
    if (stage === "csrf") expect(axios.get).toHaveBeenCalledTimes(2);
  },
);

import { toast } from "react-toastify";
it("forwards non-API actions without requesting data", () => {
  const next = vi.fn();
  const action = { type: "OTHER" };
  middleware({ dispatch: vi.fn() })(next)(action);
  expect(next).toHaveBeenCalledWith(action);
  expect(axios.request).not.toHaveBeenCalled();
});
it("emits configured success messages and forwards custom headers", async () => {
  axios.request.mockResolvedValueOnce({ data: { ok: true } });
  const success = vi.fn();
  const dispatch = vi.fn();
  middleware({ dispatch })(() => {})({
    type: "API_REQUEST",
    payload: {
      url: "/api/resources",
      method: "GET",
      data: { keyword: "Food" },
      headers: { "X-Test": "test" },
      onSuccess: success,
      onFailure: vi.fn(),
      notification: { successMessage: "Saved" },
    },
  });
  await flush();
  expect(toast.success).toHaveBeenCalledWith("Saved");
  expect(success).toHaveBeenCalledWith({ ok: true });
  expect(axios.request).toHaveBeenCalledWith(
    expect.objectContaining({
      params: { keyword: "Food" },
      headers: expect.objectContaining({ "X-Test": "test" }),
    }),
  );
});
it.each([true, false])(
  "handles unauthorized responses with expected=%s",
  async (expectUnauthorizedResponse) => {
    axios.request.mockRejectedValueOnce({ response: { status: 401 } });
    const dispatch = vi.fn();
    middleware({ dispatch })(() => {})({
      type: "API_REQUEST",
      payload: {
        url: "/api/users/current",
        method: "GET",
        onSuccess: vi.fn(),
        onFailure: vi.fn(),
        expectUnauthorizedResponse,
      },
    });
    await flush();
    expect(
      dispatch.mock.calls.some(([a]) => a.type === "API_ACCESS_DENIED"),
    ).toBe(!expectUnauthorizedResponse);
    expect(toast.info).toHaveBeenCalledTimes(
      expectUnauthorizedResponse ? 0 : 1,
    );
  },
);
it("invalidates cached CSRF after forbidden responses and reports failures", async () => {
  axios.get.mockResolvedValue({ data: { token: "csrf" } });
  axios.request
    .mockRejectedValueOnce({ response: { status: 403 } })
    .mockResolvedValueOnce({ data: {} });
  const run = middleware({ dispatch: vi.fn() })(() => {});
  const action = {
    type: "API_REQUEST",
    payload: {
      url: "/api/resources",
      method: "POST",
      onSuccess: vi.fn(),
      onFailure: vi.fn(),
      notification: { failureMessage: "Denied" },
    },
  };
  run(action);
  await flush();
  expect(toast.error).toHaveBeenCalledWith("Denied");
  run(action);
  await flush();
  expect(axios.get).toHaveBeenCalledTimes(2);
});
