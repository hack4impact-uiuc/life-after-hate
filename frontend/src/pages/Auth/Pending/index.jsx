import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import AuthFrame from "../AuthFrame";
import { logout } from "../../../utils/api";
export function PendingScreen({ email, onSignOut, requestedAt }) {
  const date = requestedAt ? new Date(requestedAt) : null;
  const validDate = date && Number.isFinite(date.getTime());
  return (
    <AuthFrame label="PENDING APPROVAL" titleId="pending-title">
      <div data-cy="pending" className="pending-content">
        <div className="pending-check" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="13" fill="currentColor" />
            <path
              d="m7.5 14 4.2 4.2 8.8-9"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 id="pending-title">Request received</h1>
        <p className="sign-in-instructions">
          An administrator will review your access.
          {email && (
            <>
              {" "}
              You’re signed in as{" "}
              <strong className="pending-email">{email}</strong>.
            </>
          )}{" "}
          Check back after your request has been approved.
        </p>
        <div className="pending-status" role="status">
          <span>
            {validDate
              ? `Requested ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })} · status`
              : "Access request · status"}
          </span>
          <strong>pending</strong>
        </div>
        <button className="pending-signout" onClick={onSignOut} type="button">
          Sign out
        </button>
      </div>
    </AuthFrame>
  );
}
PendingScreen.propTypes = {
  email: PropTypes.string,
  onSignOut: PropTypes.func.isRequired,
  requestedAt: PropTypes.string,
};
function Pending({ email }) {
  useEffect(() => {
    document.title = "Pending approval - Life After Hate";
  }, []);
  return <PendingScreen email={email} onSignOut={logout} />;
}
Pending.propTypes = { email: PropTypes.string };
export default connect((state) => ({ email: state.auth.email }))(Pending);
