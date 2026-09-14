import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ActionButtons from "../../pages/MapView/ActionButtons";
import TagToggle from "../../pages/MapView/TagToggle";
import LastModifiedInfo from "../Modal/LastModifiedInfo";
import {
  resourceName,
  resourceDescription,
} from "../../redux/selectors/resource";
import { distanceToString, websiteHref } from "../../utils/formatters";
import "./styles.scss";

export const typeLabels = {
  GROUP: "Group",
  INDIVIDUAL: "Individual",
  TANGIBLE: "Resource",
};

const ResourceDetails = ({ resource, onClose }) => {
  const [closingResource, setClosingResource] = useState(null);
  const drawerResource = resource || closingResource;
  const websiteURL = websiteHref(drawerResource?.websiteURL);
  useEffect(() => {
    if (resource) {
      setClosingResource(resource);
      return;
    }
    const timer = window.setTimeout(() => setClosingResource(null), 300);
    return () => window.clearTimeout(timer);
  }, [resource]);
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape" && resource) onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [resource, onClose]);
  return (
    <div className="resource-detail-view">
      {drawerResource && (
        <div
          className={`drawer-shell ${resource ? "is-open" : "is-closing"}`}
          inert={!resource ? "" : undefined}
          aria-hidden={!resource || undefined}
        >
          <aside className="resource-drawer" aria-label="Resource details">
            <header>
              <div>
                <h2>
                  <span className={`type-dot ${drawerResource.type}`} />
                  {resourceName(drawerResource)}
                </h2>
                <p>
                  {typeLabels[drawerResource.type]}
                  {drawerResource.distanceFromSearchLoc != null &&
                    ` · ${distanceToString(drawerResource.distanceFromSearchLoc)}`}
                </p>
              </div>
              <button aria-label="Close resource details" onClick={onClose}>
                ×
              </button>
            </header>
            <ActionButtons resource={drawerResource} />
            <div className="drawer-body">
              {resourceDescription(drawerResource) && (
                <div className="drawer-description">
                  {drawerResource.type === "INDIVIDUAL" && (
                    <div className="eyebrow">Skills & qualifications</div>
                  )}
                  <p>{resourceDescription(drawerResource)}</p>
                </div>
              )}
              <dl>
                {[
                  ["Contact", drawerResource.contactName],
                  ["Email", drawerResource.contactEmail],
                  ["Phone", drawerResource.contactPhone],
                  ["Address", drawerResource.address],
                  ["Availability", drawerResource.availability],
                  ["Volunteer roles", drawerResource.volunteerRoles],
                  ["Quantity", drawerResource.quantity],
                  ["Website", drawerResource.websiteURL],
                ]
                  .filter(([, value]) => value != null && value !== "")
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        {label === "Email" ? (
                          <a href={`mailto:${value}`}>{value}</a>
                        ) : label === "Phone" ? (
                          <a href={`tel:${value}`}>{value}</a>
                        ) : label === "Website" && websiteURL ? (
                          <a
                            href={websiteURL}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  ))}
              </dl>
              {drawerResource.volunteerReason && (
                <div className="drawer-section">
                  <div className="eyebrow">Why volunteer?</div>
                  <p>{drawerResource.volunteerReason}</p>
                </div>
              )}
              {drawerResource.howDiscovered && (
                <div className="drawer-section">
                  <div className="eyebrow">How discovered</div>
                  <p>{drawerResource.howDiscovered}</p>
                </div>
              )}
              <div className="eyebrow">Tags</div>
              <div className="drawer-tags">
                {drawerResource.tags?.map((tag) => (
                  <TagToggle key={tag} tag={tag} />
                ))}
              </div>
              {drawerResource.notes && (
                <div className="drawer-notes">
                  <div className="eyebrow">Notes</div>
                  <p>{drawerResource.notes}</p>
                </div>
              )}
              {(drawerResource.dateLastModified ||
                drawerResource.dateCreated) && (
                <div className="drawer-history">
                  <LastModifiedInfo resource={drawerResource} />
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
ResourceDetails.propTypes = {
  resource: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
export default ResourceDetails;
