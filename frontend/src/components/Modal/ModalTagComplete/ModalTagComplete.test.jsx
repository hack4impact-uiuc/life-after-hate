import React, { act } from "react";
import { vi, afterEach } from "vitest";
import { mount, click, change } from "../../../../test/render";
import ModalTagComplete from "./index";
let view;
afterEach(() => view?.unmount());
it("shows selected tags and removes a chip through onChange", () => {
  const onChange = vi.fn();
  view = mount(<ModalTagComplete tags={["Food"]} onChange={onChange} />, {
    tags: { all: ["Food", "Housing"], selected: [] },
  });
  expect(view.container.textContent).toContain("Food");
  click(view.container.querySelector('[data-testid="CancelIcon"]'));
  expect(onChange).toHaveBeenCalledWith(
    expect.anything(),
    [],
    "removeOption",
    expect.anything(),
  );
});
it("allows entering a new free-form tag", () => {
  const onChange = vi.fn();
  view = mount(<ModalTagComplete tags={[]} onChange={onChange} />, {
    tags: { all: [], selected: [] },
  });
  const input = view.container.querySelector("input");
  change(input, "New support");
  act(() =>
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        bubbles: true,
      }),
    ),
  );
  expect(onChange).toHaveBeenCalledWith(
    expect.anything(),
    ["New support"],
    "createOption",
    expect.anything(),
  );
});
it("disables tag editing in view-only mode", () => {
  view = mount(
    <ModalTagComplete tags={["Food"]} onChange={vi.fn()} disabled />,
    { tags: { all: ["Food"], selected: [] } },
  );
  expect(view.container.querySelector("input").disabled).toBe(true);
});
