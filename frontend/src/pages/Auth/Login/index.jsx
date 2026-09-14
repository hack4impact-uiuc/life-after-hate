import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import AuthFrame from "../AuthFrame";
import { getURLForEndpoint } from "../../../utils/apiHelpers.js";
import "./styles.scss";

export const SignInScreen = ({ signInUrl, onSignIn }) => {
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    if (!connecting) return;
    const reset = () => setConnecting(false);
    // Restore the action after browser Back or a navigation that never completes.
    window.addEventListener("pageshow", reset);
    const timeout = window.setTimeout(reset, 12000);
    return () => {
      window.removeEventListener("pageshow", reset);
      window.clearTimeout(timeout);
    };
  }, [connecting]);
  const handleSignIn = (event) => {
    onSignIn?.(event);
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    setConnecting(true);
  };
  return (
    <AuthFrame titleId="sign-in-title">
      <h1 id="sign-in-title">Sign in</h1>
      <p className="sign-in-instructions">
        Use the Google account tied to your LAH access.
      </p>
      <a
        className="sign-in-google"
        href={signInUrl}
        onClick={handleSignIn}
        aria-busy={connecting}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="currentColor"
          className={
            connecting ? "sign-in-provider is-connecting" : "sign-in-provider"
          }
        >
          <path d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.23c1.89-1.74 2.99-4.3 2.99-7.36ZM12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22ZM6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59ZM12 5.96c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z" />
        </svg>
        <span aria-live="polite">
          {connecting ? "Connecting…" : "Continue with Google"}
        </span>
        <span className="sign-in-arrow" aria-hidden="true">
          →
        </span>
      </a>
    </AuthFrame>
  );
};
SignInScreen.propTypes = {
  signInUrl: PropTypes.string.isRequired,
  onSignIn: PropTypes.func,
};
const Login = ({ authed, location }) => {
  useEffect(() => {
    document.title = "Sign in - Life After Hate";
  }, []);
  const target = location?.state?.from?.pathname;
  const returnTo = /^\/(resources|shortlists)\/[a-f0-9]{24}$/i.test(
    target || "",
  )
    ? target
    : "/";
  if (authed) return <Redirect to={returnTo} />;
  return (
    <SignInScreen
      signInUrl={getURLForEndpoint("auth/login")}
      onSignIn={() => {
        try {
          if (returnTo !== "/")
            sessionStorage.setItem("lah.returnTo", returnTo);
          else sessionStorage.removeItem("lah.returnTo");
        } catch {
          /* Sign-in still works without storage. */
        }
      }}
    />
  );
};
Login.propTypes = {
  authed: PropTypes.bool.isRequired,
  location: PropTypes.object,
};
export default connect((state) => ({ authed: state.auth.authenticated }))(
  Login,
);
