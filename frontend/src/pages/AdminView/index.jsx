import React, { useEffect, useRef, useState } from "react";
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

export const UserManager = ({ users = [] }) => {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [roles, setRoles] = useState({});
  const [reviews, setReviews] = useState({});
  const inFlight = useRef(new Set());
  const timers = useRef([]);
  const headingRef = useRef(null);
  const mounted = useRef(true);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      timers.current.forEach(clearTimeout);
    };
  }, []);
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
  const queued = [...pending];
  Object.values(reviews).forEach(({ user }) => {
    if (!queued.some((item) => item.id === user.id)) queued.push(user);
  });
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
    if (inFlight.current.has(user.id)) return;
    inFlight.current.add(user.id);
    const action = role === roleEnum.REJECTED ? "Declining…" : "Approving…";
    setReviews((previous) => ({
      ...previous,
      [user.id]: { user, action, status: "working" },
    }));
    setError("");
    try {
      await editAndRefreshUser({ role, title: user.title || "" }, user.id);
      if (!mounted.current) return;
      const action = role === roleEnum.REJECTED ? "Declined" : "Approved";
      setNotice(
        `${user.firstName || user.email}'s request ${action.toLowerCase()}.`,
      );
      setReviews((previous) => ({
        ...previous,
        [user.id]: { user, action, status: "success" },
      }));
      timers.current.push(
        setTimeout(() => {
          if (
            document.activeElement?.closest("[data-review-id]")?.dataset
              .reviewId === String(user.id)
          ) {
            headingRef.current?.focus();
          }
          setReviews((previous) => ({
            ...previous,
            [user.id]: { user, action, status: "leaving" },
          }));
          timers.current.push(
            setTimeout(() => {
              setReviews((previous) => {
                const next = { ...previous };
                delete next[user.id];
                return next;
              });
              inFlight.current.delete(user.id);
            }, 300),
          );
        }, 900),
      );
    } catch (error) {
      if (!mounted.current) return;
      inFlight.current.delete(user.id);
      setReviews((previous) => {
        const next = { ...previous };
        delete next[user.id];
        return next;
      });
      setError(
        ["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)
          ? "The request timed out. Refresh to check the account status before trying again."
          : `Could not update ${user.firstName}'s account. Please refresh to check its status before trying again.`,
      );
    }
  };
  return (
    <main className="user-directory">
      <header className="people-heading">
        <h1 id="page-title" ref={headingRef} tabIndex={-1}>
          People
        </h1>
        <p>
          {loading
            ? "Loading accounts…"
            : `${accounts.length} accounts · ${pending.length} awaiting review`}
        </p>
      </header>
      <p className="people-notice" role="status">
        {notice}
      </p>
      {error && (
        <p className="people-error" role="alert">
          {error}
        </p>
      )}
      {queued.length > 0 && (
        <section className="review-queue" aria-labelledby="review-heading">
          <header>
            <h2 id="review-heading">
              <span className="review-dot" />
              Awaiting review
            </h2>
            <p>Requests older than 7 days are flagged</p>
          </header>
          {queued.map((user) => {
            const reviewState = reviews[user.id];
            const date = requestDate(user.createdAt);
            const overdue = date && Date.now() - date.getTime() > 7 * 86400000;
            return (
              <div
                className={`review-row-shell ${reviewState?.status === "leaving" ? "review-row-shell--leaving" : ""}`}
                key={user.id}
                data-review-id={user.id}
              >
                <div className="review-row-clip">
                  <div
                    className="review-row"
                    aria-busy={reviewState?.status === "working"}
                  >
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
                        disabled={Boolean(reviewState)}
                        onChange={(event) =>
                          setRoles({ ...roles, [user.id]: event.target.value })
                        }
                      >
                        <option value={roleEnum.VOLUNTEER}>Volunteer</option>
                        <option value={roleEnum.ADMIN}>Admin</option>
                      </select>
                      <button
                        className="approve-button"
                        disabled={Boolean(reviewState)}
                        onClick={() =>
                          review(user, roles[user.id] || roleEnum.VOLUNTEER)
                        }
                      >
                        {reviewState && reviewState.action.startsWith("Approv")
                          ? reviewState.action
                          : "Approve"}
                      </button>
                      <button
                        className="decline-button"
                        disabled={Boolean(reviewState)}
                        onClick={() => review(user, roleEnum.REJECTED)}
                      >
                        {reviewState && reviewState.action.startsWith("Declin")
                          ? reviewState.action
                          : "Decline"}
                      </button>
                    </div>
                  </div>
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
