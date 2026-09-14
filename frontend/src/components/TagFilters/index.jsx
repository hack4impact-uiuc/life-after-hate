import React from "react";
import { useSelector } from "react-redux";
import { tagSelector, globalTagListSelector } from "../../redux/selectors/tags";
import { removeFilterTag } from "../../utils/api";
import TagPicker from "./TagPicker";
import "./styles.scss";

const TagFilters = () => {
  const tags = useSelector(tagSelector);
  const globalTags = useSelector(globalTagListSelector) || [];
  return (
    <div className="tag-filters" role="group" aria-label="Tag filters">
      <span className="tag-filters-label">Filters</span>
      {tags.map((tag) => (
        <button
          type="button"
          className="filter-tag"
          key={tag}
          onClick={() => removeFilterTag(tag)}
          aria-label={`Remove ${tag} filter`}
        >
          {tag} <span aria-hidden="true">×</span>
        </button>
      ))}
      <TagPicker tags={globalTags} selectedTags={tags} />
    </div>
  );
};
export default TagFilters;
