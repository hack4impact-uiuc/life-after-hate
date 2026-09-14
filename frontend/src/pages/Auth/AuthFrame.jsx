import React from "react";
import PropTypes from "prop-types";
import Logo from "../../assets/images/lah-logo-2.png";
import "./Login/styles.scss";
export default function AuthFrame({
  label,
  mission,
  description,
  titleId,
  children,
}) {
  return (
    <main className="sign-in-page">
      <div className="sign-in-frame">
        <p className="sign-in-label">{label}</p>
        <div className="sign-in-panels">
          <section className="sign-in-brand" aria-label="Life After Hate">
            <img
              className="sign-in-logo"
              src={Logo}
              alt="Life After Hate"
              data-cy="logo"
            />
            {(mission || description) && (
              <div className="sign-in-mission">
                <span className="sign-in-accent" aria-hidden="true" />
                {mission && <h2>{mission}</h2>}
                {description && <p>{description}</p>}
              </div>
            )}
          </section>
          <section className="sign-in-form-panel" aria-labelledby={titleId}>
            <div className="sign-in-content">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
AuthFrame.propTypes = {
  label: PropTypes.string.isRequired,
  mission: PropTypes.string,
  description: PropTypes.string,
  titleId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
