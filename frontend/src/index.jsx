/* eslint-disable react/jsx-filename-extension */
import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./styles/index.scss";
import App from "./App";

import "bootstrap/dist/css/bootstrap.css";

createRoot(document.getElementById("root")).render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
if ("serviceWorker" in navigator)
  navigator.serviceWorker
    .getRegistrations()
    .then((items) => items.forEach((item) => item.unregister()));
if ("caches" in window)
  caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
