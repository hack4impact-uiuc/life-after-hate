import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { ModalManager } from "./index";
let props;
vi.mock("../ResourceModal", () => ({
  default: (next) => {
    props = next;
    return <input defaultValue={next.resource.name} />;
  },
}));
vi.mock("../UserModal", () => ({ default: () => null }));
it("retains closing data until exit and resets on quick reopen, ignoring stale exit callbacks", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  const render = (isOpen, resource) =>
    act(() =>
      root.render(
        <ModalManager isOpen={isOpen} resource={resource} editable />,
      ),
    );
  render(true, { name: "Original" });
  const oldInput = container.querySelector("input");
  oldInput.value = "Unsaved";
  render(false, null);
  expect(container.querySelector("input")).toBe(oldInput);
  expect(props.resource.name).toBe("Original");
  const oldOnClosed = props.onClosed;
  render(true, { name: "Next" });
  expect(container.querySelector("input").value).toBe("Next");
  act(() => oldOnClosed());
  expect(container.querySelector("input").value).toBe("Next");
  render(false, null);
  act(() => props.onClosed());
  expect(container.querySelector("input")).toBeNull();
  act(() => root.unmount());
});

it("clears private data immediately when authentication is lost during an exit", () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  act(() =>
    root.render(
      <ModalManager
        isOpen
        authenticated
        resource={{ name: "Private record" }}
      />,
    ),
  );
  act(() =>
    root.render(<ModalManager isOpen={false} authenticated resource={null} />),
  );
  expect(container.querySelector("input").value).toBe("Private record");
  act(() =>
    root.render(
      <ModalManager isOpen={false} authenticated={false} resource={null} />,
    ),
  );
  expect(container.querySelector("input")).toBeNull();
  act(() =>
    root.render(<ModalManager isOpen={false} authenticated resource={null} />),
  );
  expect(container.querySelector("input")).toBeNull();
  act(() => root.unmount());
});
