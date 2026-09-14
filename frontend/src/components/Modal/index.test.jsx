import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { LAHModal } from "./index";
let modalProps;
vi.mock("reactstrap", () => ({
  Modal: (props) => {
    modalProps = props;
    return <div>{props.children}</div>;
  },
  ModalHeader: ({ children }) => <div>{children}</div>,
  ModalBody: ({ children }) => <div>{children}</div>,
  Button: ({ children }) => <button>{children}</button>,
}));
it("uses immediate transitions for reduced motion and updates with the system preference", () => {
  let update;
  const preference = {
    matches: true,
    addEventListener: (_, listener) => {
      update = listener;
    },
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal("matchMedia", () => preference);
  const root = createRoot(document.createElement("div"));
  act(() =>
    root.render(
      <LAHModal isOpen closeModal={() => {}}>
        <span>Content</span>
      </LAHModal>,
    ),
  );
  expect(modalProps.fade).toBe(false);
  expect(modalProps.modalTransition.timeout).toBe(0);
  expect(modalProps.backdropTransition.timeout).toBe(0);
  act(() => {
    preference.matches = false;
    update();
  });
  expect(modalProps.fade).toBe(true);
  expect(modalProps.modalTransition.timeout).toBe(280);
  act(() => root.unmount());
  expect(preference.removeEventListener).toHaveBeenCalledWith("change", update);
  vi.unstubAllGlobals();
});
