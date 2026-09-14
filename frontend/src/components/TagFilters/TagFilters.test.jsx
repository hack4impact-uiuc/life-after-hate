import React, { act } from "react";
import { vi, beforeEach, afterEach } from "vitest";
import { mount, click, change } from "../../../test/render";
vi.mock("@mui/material/Popover", () => ({
  default: ({ open, onClose, onKeyDown, children }) =>
    open ? (
      <div role="dialog" onKeyDown={onKeyDown}>
        <button aria-label="Dismiss" onClick={onClose}>
          Dismiss
        </button>
        {children}
      </div>
    ) : null,
}));
vi.mock("../../utils/api", () => ({
  addFilterTag: vi.fn(),
  removeFilterTag: vi.fn(),
}));
import { addFilterTag, removeFilterTag } from "../../utils/api";
import TagFilters from "./index";
import TagToggle from "../../pages/MapView/TagToggle";
let view;
const render = (all = ["Food", "Housing", "Health"], selected = ["Food"]) => {
  view = mount(<TagFilters />, { tags: { all, selected } });
  return view.container;
};
beforeEach(() => vi.clearAllMocks());
afterEach(() => view?.unmount());
it("removes selected filters and never offers them as new options", () => {
  const c = render();
  click(c.querySelector('[aria-label="Remove Food filter"]'));
  expect(removeFilterTag).toHaveBeenCalledWith("Food");
  click(c.querySelector('[aria-label="Add tag filter"]'));
  expect(c.querySelector(".tag-picker-options").textContent).not.toContain(
    "Food",
  );
  expect(
    c
      .querySelector('[aria-label="Add tag filter"]')
      .getAttribute("aria-expanded"),
  ).toBe("true");
});
it("filters options case-insensitively and selects a tag", () => {
  const c = render();
  click(c.querySelector('[aria-label="Add tag filter"]'));
  change(c.querySelector("input"), " HOU ");
  const option = c.querySelector(".tag-picker-options button");
  expect(option.textContent).toContain("Housing");
  click(option);
  expect(addFilterTag).toHaveBeenCalledWith("Housing");
  expect(c.querySelector('[role="dialog"]')).toBeNull();
});
it.each([
  [[], [], "No tags available yet."],
  [["Food"], ["Food"], "All tags are already added."],
])("reports unavailable options %#", (all, selected, message) => {
  const c = render(all, selected);
  click(c.querySelector('[aria-label="Add tag filter"]'));
  expect(c.querySelector('[role="status"]').textContent).toBe(message);
});
it("reports no matching tags", () => {
  const c = render();
  click(c.querySelector('[aria-label="Add tag filter"]'));
  change(c.querySelector("input"), "zzzz");
  expect(c.querySelector('[role="status"]').textContent).toBe(
    "No matching tags.",
  );
});
it.each(["Escape", "Dismiss"])(
  "closes the picker with %s and clears its query",
  (how) => {
    const c = render();
    const open = c.querySelector('[aria-label="Add tag filter"]');
    click(open);
    change(c.querySelector("input"), "House");
    if (how === "Escape")
      act(() =>
        c
          .querySelector("input")
          .dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
          ),
      );
    else click(c.querySelector('[aria-label="Dismiss"]'));
    expect(c.querySelector('[role="dialog"]')).toBeNull();
    click(open);
    expect(c.querySelector("input").value).toBe("");
  },
);
it.each([true, false])("toggles a tag with selected=%s", (selected) => {
  view = mount(<TagToggle tag="Food" />, {
    tags: { selected: selected ? ["Food"] : [] },
  });
  click(view.container.querySelector("button"));
  expect(selected ? removeFilterTag : addFilterTag).toHaveBeenCalledWith(
    "Food",
  );
});
it("handles an unloaded global tag list", () => {
  const c = render(undefined, []);
  expect(c.textContent).toContain("Filters");
});
