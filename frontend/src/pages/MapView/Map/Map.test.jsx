import React, { act } from "react";
import { vi, beforeEach, afterEach } from "vitest";
import { mount } from "../../../../test/render";
const capture = vi.hoisted(() => ({ deck: null }));
vi.mock("@deck.gl/react", () => ({
  default: (props) => {
    capture.deck = props;
    return <div>{props.children}</div>;
  },
}));
vi.mock("@deck.gl/layers", () => ({
  ScatterplotLayer: class {
    constructor(props) {
      this.props = props;
    }
  },
}));
vi.mock("react-map-gl", () => ({
  default: () => <div>Map canvas</div>,
  FlyToInterpolator: class {},
  _MapContext: { Provider: ({ children }) => children },
}));
import Map from "./index";
let view;
const resources = [
  { _id: "a", type: "GROUP", location: { type: "Point", coordinates: [1, 2] } },
  {
    _id: "b",
    type: "INDIVIDUAL",
    location: { type: "Point", coordinates: [3, 4] },
  },
];
const render = (overrides = {}, ownResources = resources) => {
  view = mount(<Map resources={ownResources} />, overrides);
  return view;
};
afterEach(() => view?.unmount());
it("resets stale search state on mount", () => {
  render({
    resources,
    map: {
      center: [1, 2],
      selectedId: "a",
      search: { query: "old", location: "old" },
    },
  });
  expect(view.store.getState().resources).toEqual([]);
  expect(view.store.getState().map.center).toBeUndefined();
  expect(view.store.getState().map.search).toEqual({ query: "", location: "" });
});
it.each([[[0, 0]], [[-87.6, 41.8]]])(
  "focuses valid center %j and adds a center marker",
  (center) => {
    render();
    act(() =>
      view.store.dispatch({ type: "UPDATE_MAP_CENTER", payload: center }),
    );
    expect(capture.deck.viewState).toMatchObject({
      longitude: center[0],
      latitude: center[1],
      zoom: 5,
      transitionDuration: 650,
    });
    expect(capture.deck.layers[0].props.data.at(-1)).toEqual({
      location: { type: "Center", coordinates: center },
    });
  },
);
it.each([null, [null, null], [1], [NaN, 0]])(
  "ignores invalid center %j",
  (center) => {
    render();
    act(() =>
      view.store.dispatch({ type: "UPDATE_MAP_CENTER", payload: center }),
    );
    expect(capture.deck.layers[0].props.data).toEqual(resources);
    expect(capture.deck.viewState.zoom).toBe(3.5);
  },
);
it("selects a resource marker and clears selection on empty/center clicks", () => {
  render();
  act(() => capture.deck.onClick({ object: resources[1], index: 1 }));
  expect(view.store.getState().map.selectedId).toBe("b");
  act(() => capture.deck.onClick({ object: { location: { type: "Center" } } }));
  expect(view.store.getState().map.selectedId).toBeUndefined();
  act(() => capture.deck.onClick({}));
  expect(view.store.getState().map.selectedId).toBeUndefined();
});
it("styles selected, center, and resource-type markers", () => {
  render();
  act(() => view.store.dispatch({ type: "SELECT_MAP_RESOURCE", payload: "a" }));
  const layer = capture.deck.layers[0].props;
  expect(layer.getRadius(resources[0])).toBe(13);
  expect(layer.getRadius(resources[1])).toBe(7);
  expect(layer.getPosition(resources[0])).toEqual([1, 2]);
  expect(layer.getFillColor(resources[0])).toEqual([247, 146, 48]);
  expect(layer.getFillColor(resources[1])).toEqual([17, 132, 135]);
  expect(layer.getFillColor({ type: "TANGIBLE", location: {} })).toEqual([
    73, 132, 87,
  ]);
  expect(layer.getFillColor({ type: "UNKNOWN", location: {} })).toEqual([
    86, 113, 170,
  ]);
});
it("updates the view and cursor during hover/drag", () => {
  render();
  expect(capture.deck.getCursor({ isDragging: false })).toBe("grab");
  expect(capture.deck.getCursor({ isDragging: true })).toBe("grabbing");
  act(() => capture.deck.onHover({ picked: true }));
  expect(capture.deck.getCursor({ isDragging: false })).toBe("pointer");
  act(() => capture.deck.onHover({ picked: false }));
  const viewState = { latitude: 1, longitude: 2, zoom: 6 };
  act(() => capture.deck.onViewStateChange({ viewState }));
  expect(capture.deck.viewState).toEqual(viewState);
});
