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
