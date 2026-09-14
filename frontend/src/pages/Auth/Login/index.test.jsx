import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { SignInScreen } from "./index";

let container, root;
const preventNavigation = (event) => event.preventDefault();
beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  // Cancel jsdom navigation after React has handled the click.
  window.addEventListener("click", preventNavigation);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.removeEventListener("click", preventNavigation);
  vi.useRealTimers();
});
function render(onSignIn) {
  act(() =>
    root.render(
      <SignInScreen signInUrl="/api/auth/login" onSignIn={onSignIn} />,
    ),
  );
  return container.querySelector("a");
}
function click(link, options = {}) {
  act(() =>
    link.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, ...options }),
    ),
  );
}
it("shows connecting feedback and restores it after browser Back", () => {
  const link = render();
  click(link);
  expect(link.getAttribute("aria-busy")).toBe("true");
  expect(link.textContent).toContain("Connecting…");
  act(() => window.dispatchEvent(new Event("pageshow")));
  expect(link.getAttribute("aria-busy")).toBe("false");
  expect(link.textContent).toContain("Continue with Google");
});
it("restores feedback when navigation does not complete", () => {
  const link = render();
  click(link);
  act(() => vi.advanceTimersByTime(12000));
  expect(link.getAttribute("aria-busy")).toBe("false");
});
it("does not show connecting for modified or canceled navigation", () => {
  const link = render();
  for (const modifier of ["metaKey", "ctrlKey", "shiftKey", "altKey"]) {
    click(link, { [modifier]: true });
    expect(link.getAttribute("aria-busy")).toBe("false");
  }
  render((event) => event.preventDefault());
  click(link);
  expect(link.getAttribute("aria-busy")).toBe("false");
});
