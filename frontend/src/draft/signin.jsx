import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { SignInScreen } from "../pages/Auth/Login";
import { PendingScreen } from "../pages/Auth/Pending";
function Preview() {
  const [pending, setPending] = useState(
    new URLSearchParams(location.search).has("pending"),
  );
  return pending ? (
    <PendingScreen
      email="alex@example.com"
      requestedAt="2026-09-14T00:00:00Z"
      onSignOut={() => setPending(false)}
    />
  ) : (
    <SignInScreen
      signInUrl="/api/auth/login"
      onSignIn={(event) => {
        event.preventDefault();
        setPending(true);
      }}
    />
  );
}
createRoot(document.getElementById("root")).render(<Preview />);
