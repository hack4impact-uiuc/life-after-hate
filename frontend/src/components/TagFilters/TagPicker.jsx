import React, { useState } from "react";
import PropTypes from "prop-types";
import Popover from "@mui/material/Popover";
import { addFilterTag } from "../../utils/api";

const TagPicker = ({ tags, selectedTags }) => {
  const [anchor, setAnchor] = useState(null);
  const [query, setQuery] = useState("");
  const available = tags.filter((tag) => !selectedTags.includes(tag));
  const matches = available.filter((tag) =>
    tag.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const close = () => {
    setAnchor(null);
    setQuery("");
  };
  return (
    <>
      <button
        type="button"
        className="add-tag-button"
        aria-label="Add tag filter"
        aria-haspopup="dialog"
        aria-expanded={Boolean(anchor)}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        <span aria-hidden="true">+</span> Tag
      </button>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            className: "map-tag-picker",
            role: "dialog",
            "aria-label": "Choose a tag",
          },
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            close();
          }
        }}
      >
        <input
          autoFocus
          aria-label="Find a tag"
          placeholder="Find a tag…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="tag-picker-options">
          {matches.map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => {
                addFilterTag(tag);
                close();
              }}
            >
              {tag}
              <span aria-hidden="true">+</span>
            </button>
          ))}
          {!matches.length && (
            <p role="status">
              {available.length
                ? "No matching tags."
                : tags.length
                  ? "All tags are already added."
                  : "No tags available yet."}
            </p>
          )}
        </div>
      </Popover>
    </>
  );
};
TagPicker.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedTags: PropTypes.arrayOf(PropTypes.string).isRequired,
};
export default TagPicker;
