import React from "react";
import { vi, afterEach } from "vitest";
import { mount } from "../../../../test/render";
vi.mock("../ResourceModal", () => ({ default: () => <p>Resource editor</p> }));
vi.mock("../UserModal", () => ({ default: () => <p>User editor</p> }));
import ModalManager from "./index";
let view;
afterEach(() => view?.unmount());
it.each([
  [true, "RESOURCE", "Resource editor"],
  [true, "USER", "User editor"],
  [false, "RESOURCE", ""],
  [true, undefined, ""],
])("shows the correct editor %#", (isOpen, modalType, text) => {
  view = mount(<ModalManager />, { modal: { isOpen, modalType } });
  expect(view.container.textContent).toBe(text);
});
