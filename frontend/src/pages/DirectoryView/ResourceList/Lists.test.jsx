import React, { act } from "react";
import { vi, beforeEach, afterEach } from "vitest";
import { mount, click, button } from "../../../../test/render";
const calls = vi.hoisted(() => ({
  clearAll: vi.fn(),
  clear: vi.fn(),
  recomputeRowHeights: vi.fn(),
  forceUpdateGrid: vi.fn(),
  scrollToPosition: vi.fn(),
}));
vi.mock("react-virtualized", async () => {
  const React = await import("react");
  return {
    CellMeasurerCache: class {
      clearAll = calls.clearAll;
      clear = calls.clear;
      rowHeight = () => 90;
    },
    AutoSizer: ({ children }) => children({ height: 500, width: 900 }),
    CellMeasurer: ({ children }) =>
      children({ registerChild: () => {}, measure: () => {} }),
    List: React.forwardRef(({ rowCount, rowRenderer }, ref) => {
      React.useImperativeHandle(ref, () => calls);
      return (
        <div>
          {Array.from({ length: rowCount }, (_, index) =>
            rowRenderer({
              index,
              key: String(index),
              style: { top: index * 90 },
            }),
          )}
        </div>
      );
    }),
  };
});
vi.mock("../../../utils/api", () => ({
  addFilterTag: vi.fn(),
  removeFilterTag: vi.fn(),
}));
import DirectoryList from "./index";
import CardView from "../../MapView/CardView";
const resources = [
  {
    _id: "a",
    type: "GROUP",
    companyName: "Org",
    address: "Chicago",
    tags: ["A", "B", "C", "D", "E"],
    distanceFromSearchLoc: 0,
  },
  {
    _id: "b",
    type: "TANGIBLE",
    resourceName: "Supplies",
    location: { coordinates: [0, 0] },
  },
];
let view;
beforeEach(() => vi.clearAllMocks());
afterEach(() => view?.unmount());
it.each(["directory", "map"])(
  "renders %s rows and clears layout cache on resize/unmount",
  (kind) => {
    view = mount(
      kind === "directory" ? (
        <DirectoryList resources={resources} />
      ) : (
        <CardView resources={resources} />
      ),
      { auth: { role: "ADMIN" } },
    );
    expect(view.container.textContent).toContain("Org");
    expect(view.container.textContent).toContain("+2");
    act(() => window.dispatchEvent(new Event("resize")));
    expect(calls.recomputeRowHeights).toHaveBeenCalled();
    expect(calls.clearAll).toHaveBeenCalled();
    view.unmount();
    view = null;
    vi.clearAllMocks();
    act(() => window.dispatchEvent(new Event("resize")));
    expect(calls.clearAll).not.toHaveBeenCalled();
  },
);
it.each(["directory", "map"])(
  "renders no %s rows for empty resources",
  (kind) => {
    view = mount(
      kind === "directory" ? (
        <DirectoryList resources={[]} />
      ) : (
        <CardView resources={[]} />
      ),
    );
    expect(view.container.textContent).toBe("");
  },
);
it("recomputes directory layout for density and resource changes", () => {
  view = mount(<DirectoryList resources={resources} density="comfortable" />);
  expect(
    view.container
      .querySelector(".resource-list")
      .style.getPropertyValue("--directory-rows-height"),
  ).toBe("180px");
  view.render(<DirectoryList resources={resources} density="compact" />);
  expect(calls.scrollToPosition).toHaveBeenCalledWith(0);
  expect(calls.forceUpdateGrid).toHaveBeenCalled();
  expect(
    view.container
      .querySelector(".resource-list")
      .style.getPropertyValue("--directory-rows-height"),
  ).toBe("140px");
  view.render(<DirectoryList resources={[resources[0]]} density="compact" />);
  expect(view.container.querySelectorAll(".card-wrapper")).toHaveLength(1);
});
it.each(["click", "Enter", " "])(
  "opens view-only directory records using %s",
  (how) => {
    view = mount(<DirectoryList resources={resources} />, {
      auth: { role: "ADMIN" },
    });
    const row = view.container.querySelector(".card-wrapper");
    if (how === "click") click(row);
    else
      act(() =>
        row.dispatchEvent(
          new KeyboardEvent("keydown", { key: how, bubbles: true }),
        ),
      );
    expect(view.store.getState().modal).toMatchObject({
      resourceId: "a",
      editable: false,
    });
  },
);
it("opens editable directory records without also firing the row action", () => {
  view = mount(<DirectoryList resources={resources} />, {
    auth: { role: "ADMIN" },
  });
  click(button(view.container, "Edit"));
  expect(view.store.getState().modal).toMatchObject({
    resourceId: "a",
    editable: true,
  });
});
it("hides directory edit actions from volunteers and renders zero distance", () => {
  view = mount(<DirectoryList resources={resources} />, {
    auth: { role: "VOLUNTEER" },
  });
  expect(button(view.container, "Edit")).toBeUndefined();
  expect(view.container.textContent).toContain("0.00 miles away");
});
it("selects map cards and recalculates the selected row height", () => {
  view = mount(<CardView resources={resources} />);
  click(view.container.querySelector(".resource-select"));
  expect(view.store.getState().map.selectedId).toBe("a");
  expect(view.container.querySelector("article").className).toBe("expanded");
  expect(calls.recomputeRowHeights).toHaveBeenCalledWith(0);
  click(view.container.querySelector(".more-tags"));
  expect(view.store.getState().map.selectedId).toBe("a");
  view.render(<CardView resources={[...resources].reverse()} />);
  expect(calls.forceUpdateGrid).toHaveBeenCalled();
});
it("uses mappable Redux resources when no explicit list is supplied", () => {
  view = mount(<CardView />, { resources });
  expect(view.container.textContent).toContain("Supplies");
  expect(view.container.textContent).not.toContain("Org");
});
