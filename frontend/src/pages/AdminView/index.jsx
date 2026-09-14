import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { refreshAllUsers, editAndRefreshUser } from "../../utils/api";
import { userSelector } from "../../redux/selectors/users";
import { roleEnum } from "../../utils/enums";
import UserCard from "./UserCard";
import "./styles.scss";

const requestDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const UserManager = ({ users = [] }) => {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [roles, setRoles] = useState({});
  const [busy, setBusy] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    document.title = "Account Management - Life After Hate";
    refreshAllUsers()
      .catch(() =>
        setError("Unable to load accounts. Please refresh to try again."),
      )
      .finally(() => setLoading(false));
  }, []);
  const accounts = users || [];
  const pending = accounts.filter((user) => user.role === roleEnum.PENDING);
  const visible = accounts.filter(
    (user) =>
      user.role !== roleEnum.PENDING &&
      (filter === "All" ||
        (filter === "Deactivated"
          ? user.role === roleEnum.REJECTED
          : [roleEnum.ADMIN, roleEnum.VOLUNTEER].includes(user.role))) &&
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const review = async (user, role) => {
    setBusy((previous) => ({ ...previous, [user.id]: true }));
    setError("");
    try {
      await editAndRefreshUser({ role, title: user.title || "" }, user.id);
    } catch (error) {
      setError(
        ["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)
          ? "The request timed out. Refresh to check the account status before trying again."
          : `Could not update ${user.firstName}'s account. Please try again.`,
      );
    } finally {
      setBusy((previous) => ({ ...previous, [user.id]: false }));
    }
  };
  return (
    <main className="user-directory">
      <header className="people-heading">
        <h1 id="page-title">People</h1>
        <p>
          {loading
            ? "Loading accounts…"
            : `${accounts.length} accounts · ${pending.length} awaiting review`}
        </p>
      </header>
      {error && (
        <p className="people-error" role="alert">
          {error}
        </p>
      )}
      {pending.length > 0 && (
        <section className="review-queue" aria-labelledby="review-heading">
          <header>
            <h2 id="review-heading">
              <span className="review-dot" />
              Awaiting review
            </h2>
            <p>Requests older than 7 days are flagged</p>
          </header>
          {pending.map((user) => {
            const date = requestDate(user.createdAt);
            const overdue = date && Date.now() - date.getTime() > 7 * 86400000;
            return (
              <div className="review-row" key={user.id}>
                <div className="review-identity">
                  <span className="person-avatar">
                    {(user.firstName || user.email || "?")[0].toUpperCase()}
                  </span>
                  <div>
                    <strong>
                      {user.firstName} {user.lastName}
                    </strong>
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="request-date">
                  {date
                    ? `Requested ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                    : "Request date unavailable"}
                  {overdue && <span className="overdue">Over 7 days</span>}
                </div>
                <div className="review-actions">
                  <select
                    aria-label={`Role for ${user.firstName} ${user.lastName}`}
                    value={roles[user.id] || roleEnum.VOLUNTEER}
                    disabled={busy[user.id]}
                    onChange={(event) =>
                      setRoles({ ...roles, [user.id]: event.target.value })
                    }
                  >
                    <option value={roleEnum.VOLUNTEER}>Volunteer</option>
                    <option value={roleEnum.ADMIN}>Admin</option>
                  </select>
                  <button
                    className="approve-button"
                    disabled={busy[user.id]}
                    onClick={() =>
                      review(user, roles[user.id] || roleEnum.VOLUNTEER)
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="decline-button"
                    disabled={busy[user.id]}
                    onClick={() => review(user, roleEnum.REJECTED)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}
      <div className="people-toolbar">
        <div
          className="people-filters"
          role="group"
          aria-label="Account status"
          data-cy="user-filter"
        >
          {["All", "Active", "Deactivated"].map((label) => (
            <button
              key={label}
              aria-pressed={filter === label}
              onClick={() => setFilter(label)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="people-search">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="7" />
            <path d="m15 15 6 6" />
          </svg>
          <input
            type="search"
            aria-label="Find a teammate"
            placeholder="Find a teammate"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <section className="users" aria-label="Accounts">
        <div className="user-labels">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Title</span>
          <span>Last active</span>
          <span />
        </div>
        {visible.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        {!loading && !visible.length && (
          <p className="people-empty">
            {query
              ? "No teammates match your search."
              : "No accounts in this view."}
          </p>
        )}
      </section>
    </main>
  );
};
UserManager.propTypes = { users: PropTypes.arrayOf(PropTypes.object) };
export default connect((state) => ({ users: userSelector(state) }))(
  UserManager,
);
