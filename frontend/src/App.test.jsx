import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import App from "./App";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div);
  act(() => root.render(<App />));
  act(() => root.unmount());
});
