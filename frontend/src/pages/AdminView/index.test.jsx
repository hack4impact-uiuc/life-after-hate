import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { vi, expect, test, beforeEach, afterEach } from "vitest";
import { UserManager } from "./index";
import { refreshAllUsers, editAndRefreshUser } from "../../utils/api";
import { roleEnum } from "../../utils/enums";
vi.mock("../../utils/api", () => ({
  refreshAllUsers: vi.fn(),
  editAndRefreshUser: vi.fn(),
}));
vi.mock("./UserCard", () => ({ default: () => <div>Account</div> }));
let root, container;
const user = {
  id: "pending-1",
  firstName: "Avery",
  lastName: "Lee",
  email: "avery@example.org",
  role: roleEnum.PENDING,
};
beforeEach(() => {
  vi.useFakeTimers();
  refreshAllUsers.mockReset().mockResolvedValue();
  editAndRefreshUser.mockReset();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});
const render = async (users) =>
  act(async () => root.render(<UserManager users={users} />));
const click = (selector) =>
  act(() => container.querySelector(selector).click());
test("guards repeated review, retains the updated row until acknowledgement and collapse finish", async () => {
  let resolve;
  editAndRefreshUser.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await render([user]);
  container.querySelector(".approve-button").focus();
  act(() => {
    container.querySelector(".approve-button").click();
    container.querySelector(".approve-button").click();
  });
  expect(editAndRefreshUser).toHaveBeenCalledTimes(1);
  expect(container.querySelector(".approve-button").textContent).toBe(
    "Approving…",
  );
  await render([{ ...user, role: roleEnum.VOLUNTEER }]);
  expect(container.querySelector(".review-row")).not.toBeNull();
  await act(async () => resolve());
  expect(container.querySelector(".approve-button").textContent).toBe(
    "Approved",
  );
  expect(container.querySelector('[role="status"]').textContent).toContain(
    "approved",
  );
  await act(async () => vi.advanceTimersByTimeAsync(900));
  expect(container.querySelector(".review-row-shell--leaving")).not.toBeNull();
  await act(async () => vi.advanceTimersByTimeAsync(300));
  expect(container.querySelector(".review-row")).toBeNull();
});
test("failed review stays available with clear error feedback and can retry", async () => {
  editAndRefreshUser
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce();
  await render([user]);
  await act(async () => container.querySelector(".decline-button").click());
  expect(container.querySelector('[role="alert"]').textContent).toContain(
    "Could not update",
  );
  expect(container.querySelector(".decline-button").disabled).toBe(false);
  await act(async () => container.querySelector(".decline-button").click());
  expect(editAndRefreshUser).toHaveBeenCalledTimes(2);
  expect(container.querySelector(".decline-button").textContent).toBe(
    "Declined",
  );
});
test("unmount clears scheduled removal work", async () => {
  editAndRefreshUser.mockResolvedValue();
  await render([user]);
  await act(async () => container.querySelector(".approve-button").click());
  act(() => root.render(null));
  expect(vi.getTimerCount()).toBe(0);
});

test.each([true, false])(
  "ignores review completion after unmount (%s)",
  async (success) => {
    let resolve, reject;
    editAndRefreshUser.mockReturnValue(
      new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      }),
    );
    await render([user]);
    click(".approve-button");
    act(() => root.render(null));
    await act(async () => (success ? resolve() : reject(new Error("offline"))));
    expect(vi.getTimerCount()).toBe(0);
  },
);
