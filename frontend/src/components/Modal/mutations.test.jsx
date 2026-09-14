import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ConnectedUserModal, { UserModal } from "./UserModal";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { ResourceModal } from "./ResourceModal";
import { editAndRefreshUser, deleteAndRefreshResource } from "../../utils/api";
import { resourceEnum, roleEnum } from "../../utils/enums";
vi.mock("../../utils/api", () => ({
  editAndRefreshUser: vi.fn(),
  editAndRefreshResource: vi.fn(),
  addAndRefreshResource: vi.fn(),
  deleteAndRefreshResource: vi.fn(),
}));
vi.mock("./index", () => ({
  default: ({ children }) => <div>{children}</div>,
}));
vi.mock("./ModalTagComplete", () => ({ default: () => null }));
let container, root;
beforeEach(() => {
  vi.clearAllMocks();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
const click = async (button) =>
  act(async () =>
    button.dispatchEvent(new MouseEvent("click", { bubbles: true })),
  );
it("keeps user edits on failure and prevents duplicate pending submissions", async () => {
  let reject;
  editAndRefreshUser.mockReturnValue(
    new Promise((_, fail) => {
      reject = fail;
    }),
  );
  const closeModal = vi.fn();
  await act(async () =>
    root.render(
      <UserModal
        isOpen
        editable
        user={{
          id: "u",
          firstName: "Jane",
          lastName: "Doe",
          email: "j@example.org",
          role: Object.values(roleEnum)[0],
        }}
        closeModal={closeModal}
      />,
    ),
  );
  const form = container.querySelector("form");
  await act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
  expect(editAndRefreshUser).toHaveBeenCalledTimes(1);
  expect(container.querySelector('[type="submit"]').textContent).toContain(
    "Saving…",
  );
  await act(async () => reject(new Error("offline")));
  expect(closeModal).not.toHaveBeenCalled();
  expect(container.querySelector('[role="alert"]').textContent).toContain(
    "Your entries are still here",
  );
  expect(container.querySelector('[type="submit"]').disabled).toBe(false);
});
it("waits for confirmed resource deletion before closing", async () => {
  let resolve;
  deleteAndRefreshResource.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const closeModal = vi.fn();
  await act(async () =>
    root.render(
      <ResourceModal
        isOpen
        editable
        isAddingResource={false}
        resource={{ _id: "r", type: resourceEnum.INDIVIDUAL, tags: [] }}
        closeModal={closeModal}
      />,
    ),
  );
  const button = container.querySelector("#delete-form-button");
  await click(button);
  expect(deleteAndRefreshResource).not.toHaveBeenCalled();
  await click(button);
  expect(button.textContent).toBe("Deleting…");
  expect(closeModal).not.toHaveBeenCalled();
  await act(async () => resolve());
  expect(closeModal).toHaveBeenCalledTimes(1);
});

it("connected editors preserve the opening snapshot after Redux clears the modal", async () => {
  const store = createStore(() => ({
    modal: { isOpen: false, editable: true },
    users: { userList: [] },
  }));
  await act(async () =>
    root.render(
      <Provider store={store}>
        <ConnectedUserModal
          isOpen={false}
          editable={false}
          user={{
            id: "u",
            firstName: "Snapshot",
            lastName: "User",
            email: "s@example.org",
          }}
        />
      </Provider>,
    ),
  );
  expect(container.textContent).toContain("Snapshot User");
  expect(container.querySelector('[type="submit"]')).toBeNull();
});
