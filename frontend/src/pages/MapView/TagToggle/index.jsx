import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { tagSelector } from "../../../redux/selectors/tags";
import { addFilterTag, removeFilterTag } from "../../../utils/api";

const TagToggle = ({ tag }) => {
  const selected = useSelector(tagSelector).includes(tag);
  return (
    <button
      type="button"
      className="filter-tag tag-toggle"
      aria-pressed={selected}
      onClick={() => (selected ? removeFilterTag(tag) : addFilterTag(tag))}
    >
      {tag}
    </button>
  );
};
TagToggle.propTypes = { tag: PropTypes.string.isRequired };
export default TagToggle;
