import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createStore } from "redux";
import reducer from "../src/redux/reducers";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
export function mount(element, overrides = {}) {
  const initial = reducer(undefined, { type: "INIT" });
  const store = createStore(reducer, { ...initial, ...overrides });
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const render = (view = element) =>
    act(() => root.render(<Provider store={store}>{view}</Provider>));
  render();
  return {
    container,
    store,
    render,
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}
export const click = (element) => {
  if (!element) throw Error("Missing click target");
  return act(() =>
    typeof element.click === "function"
      ? element.click()
      : element.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        ),
  );
};
export const change = (element, value) =>
  act(() => {
    const prototype =
      element instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : element instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(
      element,
      value,
    );
    element.dispatchEvent(
      new Event(element instanceof HTMLSelectElement ? "change" : "input", {
        bubbles: true,
      }),
    );
  });
export const submit = async (form) =>
  act(async () => {
    form.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });
export const flush = () => act(async () => {});
export const button = (container, text) =>
  [...container.querySelectorAll("button")].find(
    (b) => b.textContent.trim() === text,
  );
export const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
