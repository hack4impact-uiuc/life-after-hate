import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { tagSelector, globalTagListSelector } from "../../redux/selectors/tags";
import { removeFilterTag } from "../../utils/api";
import TagPicker from "./TagPicker";
import "./styles.scss";

const TagFilters = () => {
  const tags = useSelector(tagSelector);
  const [visibleTags, setVisibleTags] = useState(tags);
  useEffect(() => {
    setVisibleTags((previous) => [
      ...tags,
      ...previous.filter((tag) => !tags.includes(tag)),
    ]);
    const timer = window.setTimeout(() => setVisibleTags(tags), 150);
    return () => window.clearTimeout(timer);
  }, [tags]);
  const globalTags = useSelector(globalTagListSelector) || [];
  return (
    <div className="tag-filters" role="group" aria-label="Tag filters">
      <span className="tag-filters-label">Filters</span>
      {visibleTags.map((tag) => (
        <button
          type="button"
          className={`filter-tag ${tags.includes(tag) ? "is-present" : "is-leaving"}`}
          disabled={!tags.includes(tag)}
          aria-hidden={!tags.includes(tag) || undefined}
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
