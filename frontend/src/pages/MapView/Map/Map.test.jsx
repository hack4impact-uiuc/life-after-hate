import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test, vi } from "vitest";
const captured = vi.hoisted(() => ({ props: null }));
vi.mock("react-redux", () => ({ connect: () => (Component) => Component }));
vi.mock("@deck.gl/react", () => ({
  default: (props) => {
    captured.props = props;
    return null;
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
  default: () => null,
  FlyToInterpolator: class {},
  _MapContext: { Provider: () => null },
}));
import Map from "./index";
let root;
afterEach(() => {
  if (root) act(() => root.unmount());
  vi.unstubAllGlobals();
});
test("uses shorter camera and marker transitions and responds live to reduced motion", () => {
  let listener;
  const preference = {
    matches: false,
    addEventListener: vi.fn((_, callback) => {
      listener = callback;
    }),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal("matchMedia", () => preference);
  root = createRoot(document.createElement("div"));
  const props = {
    resources: [],
    clearResources: vi.fn(),
    clearMapCenter: vi.fn(),
    clearMapResource: vi.fn(),
    selectMapResource: vi.fn(),
  };
  act(() => root.render(<Map {...props} />));
  act(() => root.render(<Map {...props} center={[-87, 42]} />));
  expect(captured.props.viewState.transitionDuration).toBe(650);
  expect(captured.props.layers[0].props.transitions.getRadius).toBe(160);
  act(() => {
    preference.matches = true;
    listener();
  });
  expect(captured.props.viewState.transitionDuration).toBe(0);
  expect(captured.props.layers[0].props.transitions.getFillColor).toBe(0);
  act(() => root.render(<Map {...props} center={[-88, 43]} />));
  expect(captured.props.viewState.transitionDuration).toBe(0);
  act(() => root.unmount());
  root = null;
  expect(preference.removeEventListener).toHaveBeenCalledWith(
    "change",
    listener,
  );
});
