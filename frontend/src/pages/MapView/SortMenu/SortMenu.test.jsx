import React, { act } from "react";
import { vi, afterEach } from "vitest";
import { mount, click } from "../../../../test/render";
vi.mock("@mui/material/Menu", () => ({
  default: ({ open, onClose, onKeyDown, children }) =>
    open ? (
      <div role="menu" onKeyDown={onKeyDown}>
        <button aria-label="Dismiss" onClick={onClose}>
          Dismiss
        </button>
        {children}
      </div>
    ) : null,
}));
vi.mock("@mui/material/MenuItem", () => ({
  default: ({ children, selected, ...props }) => (
    <button {...props}>{children}</button>
  ),
}));
import SortMenu from "./index";
let view;
afterEach(() => view?.unmount());
it.each(["nearest", "name"])(
  "marks %s selected and applies a new selection",
  (value) => {
    const onChange = vi.fn();
    view = mount(<SortMenu value={value} onChange={onChange} />);
    click(view.container.querySelector("button"));
    expect(
      view.container.querySelectorAll('[aria-checked="true"]'),
    ).toHaveLength(1);
    const other = view.container.querySelector('[aria-checked="false"]');
    click(other);
    expect(onChange).toHaveBeenCalledWith(
      value === "nearest" ? "name" : "nearest",
    );
    expect(view.container.querySelector('[role="menu"]')).toBeNull();
  },
);
it("closes via menu dismissal and confines Escape to the menu", () => {
  view = mount(<SortMenu value="nearest" onChange={vi.fn()} />);
  click(view.container.querySelector("button"));
  const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
  act(() => view.container.querySelector('[role="menu"]').dispatchEvent(event));
  click(view.container.querySelector('[aria-label="Dismiss"]'));
  expect(view.container.querySelector('[role="menu"]')).toBeNull();
});
