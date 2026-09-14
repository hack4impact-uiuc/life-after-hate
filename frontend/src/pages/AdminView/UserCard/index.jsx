import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { roleEnum } from "../../../utils/enums";
import { openUserModalWithPayload } from "../../../redux/actions/modal";

const UserCard = ({ user, openUserModalWithPayload }) => {
  const openAccount = () => {
    openUserModalWithPayload({ userId: user.id, editable: true });
  };

  return (
    <div
      className="card-click card-wrapper"
      role="button"
      tabIndex="0"
      onClick={openAccount}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          ["Enter", " "].includes(event.key)
        ) {
          event.preventDefault();
          openAccount();
        }
      }}
    >
      <div className="col user-name">
        <span className="person-avatar">
          {(user.firstName || user.email || "?")[0].toUpperCase()}
        </span>
        <p>{`${user.firstName} ${user.lastName}`}</p>
      </div>
      <div className="col user-email">
        <p className="text-truncate">{user.email}</p>
      </div>
      <div className="col user-role">
        <span className={`role-badge role-${user.role.toLowerCase()}`}>
          {user.role === roleEnum.REJECTED ? "DEACTIVATED" : user.role}
        </span>
      </div>
      <div className="col user-title">
        <p>{user.title || "—"}</p>
      </div>
      <div className="col user-last-active">
        {user.lastActive && !Number.isNaN(new Date(user.lastActive).getTime())
          ? new Date(user.lastActive).toLocaleDateString()
          : "—"}
      </div>
      <span className="account-chevron" aria-hidden="true">
        ›
      </span>
    </div>
  );
};

const mapDispatchToProps = {
  openUserModalWithPayload,
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.oneOf(Object.values(roleEnum)).isRequired,
    title: PropTypes.string,
  }),
  openUserModalWithPayload: PropTypes.func.isRequired,
};

export default connect(null, mapDispatchToProps)(UserCard);
