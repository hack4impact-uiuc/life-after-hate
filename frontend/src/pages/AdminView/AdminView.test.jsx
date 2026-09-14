import React, { act } from "react";
import { vi, beforeEach, afterEach } from "vitest";
import {
  mount,
  click,
  change,
  flush,
  button,
  deferred,
} from "../../../test/render";
vi.mock("../../utils/api", () => ({
  refreshAllUsers: vi.fn(),
  editAndRefreshUser: vi.fn(),
}));
import { refreshAllUsers, editAndRefreshUser } from "../../utils/api";
import AdminView from "./index";
const accounts = [
  {
    id: "p",
    firstName: "Pat",
    lastName: "Pending",
    email: "p@example.com",
    role: "PENDING",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "a",
    firstName: "Ada",
    lastName: "Admin",
    email: "a@example.com",
    role: "ADMIN",
    title: "Coordinator",
    lastActive: "2026-01-01",
  },
  {
    id: "v",
    firstName: "Vic",
    lastName: "Volunteer",
    email: "v@example.com",
    role: "VOLUNTEER",
  },
  {
    id: "r",
    firstName: "Ron",
    lastName: "Rejected",
    email: "r@example.com",
    role: "REJECTED",
    lastActive: "invalid",
  },
];
let view;
function render(users = accounts, role = "ADMIN") {
  view = mount(<AdminView />, { users: { userList: users }, auth: { role } });
  return view.container;
}
beforeEach(() => {
  vi.resetAllMocks();
  refreshAllUsers.mockResolvedValue();
  editAndRefreshUser.mockResolvedValue();
});
afterEach(() => view?.unmount());
it("loads accounts, separates pending review, and flags overdue requests", async () => {
  const c = render();
  expect(c.textContent).toContain("Loading accounts");
  await flush();
  expect(document.title).toBe("Account Management - Life After Hate");
  expect(c.textContent).toContain("4 accounts · 1 awaiting review");
  expect(c.querySelector(".review-queue").textContent).toContain("Pat Pending");
  expect(c.querySelector(".review-queue").textContent).toContain("Over 7 days");
  expect(c.querySelectorAll(".users .card-wrapper")).toHaveLength(3);
});
it.each([
  ["Active", 2],
  ["Deactivated", 1],
  ["All", 3],
])("filters %s accounts", async (filter, count) => {
  const c = render();
  await flush();
  click(button(c, filter));
  expect(c.querySelectorAll(".users .card-wrapper")).toHaveLength(count);
  expect(button(c, filter).getAttribute("aria-pressed")).toBe("true");
});
it("searches names and email case-insensitively and shows no matches", async () => {
  const c = render();
  await flush();
  change(c.querySelector("input"), " A@EXAMPLE.COM ");
  expect(c.querySelectorAll(".users .card-wrapper")).toHaveLength(1);
  change(c.querySelector("input"), "missing");
  expect(c.textContent).toContain("No teammates match your search");
});
it.each([undefined, null, "invalid", new Date().toISOString()])(
  "handles missing, malformed, and fresh request dates %#",
  async (createdAt) => {
    const c = render([{ ...accounts[0], createdAt }]);
    await flush();
    expect(c.querySelector(".overdue")).toBeNull();
    expect(c.textContent).toContain(
      createdAt && createdAt !== "invalid"
        ? "Requested"
        : "Request date unavailable",
    );
  },
);
it.each([[], null])("handles an empty account collection %#", async (users) => {
  const c = render(users);
  await flush();
  expect(c.textContent).toContain("No accounts in this view");
});
it("reports loading failure", async () => {
  refreshAllUsers.mockRejectedValueOnce(Error("Offline"));
  const c = render([]);
  await flush();
  expect(c.querySelector('[role="alert"]').textContent).toContain(
    "Unable to load accounts",
  );
});
it.each([
  ["Approve", "VOLUNTEER"],
  ["Decline", "REJECTED"],
])("%s applies the intended role", async (label, role) => {
  const c = render();
  await flush();
  click(button(c, label));
  await flush();
  expect(editAndRefreshUser).toHaveBeenCalledWith({ role, title: "" }, "p");
});
it("allows choosing Admin and disables review controls while pending", async () => {
  const pending = deferred();
  editAndRefreshUser.mockReturnValueOnce(pending.promise);
  const c = render();
  await flush();
  change(c.querySelector("select"), "ADMIN");
  click(button(c, "Approve"));
  expect(c.querySelector("select").disabled).toBe(true);
  expect(button(c, "Decline").disabled).toBe(true);
  expect(editAndRefreshUser).toHaveBeenCalledWith(
    { role: "ADMIN", title: "" },
    "p",
  );
  await act(async () => pending.resolve());
  expect(c.querySelector(".review-row").textContent).toContain("Approved");
});
it.each([
  ["ECONNABORTED", "timed out"],
  ["ETIMEDOUT", "timed out"],
  ["other", "Could not update Pat"],
])(
  "reports review failure %s and re-enables controls",
  async (code, message) => {
    editAndRefreshUser.mockRejectedValueOnce({ code });
    const c = render();
    await flush();
    click(button(c, "Approve"));
    await flush();
    expect(c.querySelector('[role="alert"]').textContent).toContain(message);
    expect(button(c, "Approve").disabled).toBe(false);
    click(button(c, "Approve"));
    await flush();
    expect(c.querySelector('[role="alert"]')).toBeNull();
  },
);
it("opens the unified account editor on row click", async () => {
 const c = render(); await flush(); click(c.querySelector(".users .card-wrapper"));
 expect(view.store.getState().modal).toMatchObject({ userId: "a", editable: true });
 expect(c.querySelector(".users .edit-button")).toBeNull();
});
it.each(["Enter", " "])("opens profiles with keyboard %j", async (key) => {
  const c = render();
  await flush();
  act(() =>
    c
      .querySelector(".users .card-wrapper")
      .dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })),
  );
  expect(view.store.getState().modal).toMatchObject({
    userId: "a",
    editable: true,
  });
});
it("does not expose profile editing to volunteers", async () => {
  const c = render(accounts, "VOLUNTEER");
  await flush();
  expect(c.querySelector(".users .edit-button")).toBeNull();
});
