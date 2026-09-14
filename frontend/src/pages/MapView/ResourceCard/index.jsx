import React from "react";
import { useDispatch } from "react-redux";
import { selectMapResource } from "../../../redux/actions/map";
import { addFilterTag } from "../../../utils/api";
import {
  resourceName,
  resourceDescription,
} from "../../../redux/selectors/resource";

const labels = {
  GROUP: "Group",
  INDIVIDUAL: "Individual",
  TANGIBLE: "Resource",
};
const ResourceCard = ({ resource, isSelected, myRef, style }) => {
  const dispatch = useDispatch();
  return (
    <div className="resource-card" ref={myRef} style={style}>
      <article className={isSelected ? "expanded" : "collapsed"}>
        <button
          className="resource-select"
          aria-pressed={isSelected}
          onClick={() => dispatch(selectMapResource(resource._id))}
        >
          <div className="card-top">
            <span className={`type-dot ${resource.type}`} />
            <span className="card-title">{resourceName(resource)}</span>
            {resource.distanceFromSearchLoc != null && (
              <span className="card-distance">
                {`${resource.distanceFromSearchLoc.toFixed(1)} mi`}
              </span>
            )}
          </div>
          <p className="card-desc">{resourceDescription(resource)}</p>
          <div className="card-meta">
            <span>{labels[resource.type]}</span>
            {resource.availability && <> · {resource.availability}</>}
          </div>
        </button>
        <div className="card-tags">
          {(resource.tags || []).slice(0, 3).map((tag) => (
            <button
              className="filter-tag"
              key={tag}
              onClick={() => addFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
          {resource.tags?.length > 3 && (
            <button
              className="more-tags"
              onClick={() => dispatch(selectMapResource(resource._id))}
              aria-label={`View all ${resource.tags.length} tags`}
            >
              +{resource.tags.length - 3}
            </button>
          )}
        </div>
      </article>
    </div>
  );
};
export default ResourceCard;
