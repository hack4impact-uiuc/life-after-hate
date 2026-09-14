import React, { useState } from "react";
import PropTypes from "prop-types";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const options = { nearest: "Nearest", name: "Name" };
const SortMenu = ({ value, onChange }) => {
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <button
        className="map-sort-button"
        aria-label={`Sort map resources: ${options[value]}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        {options[value]}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="m3 4.5 3 3 3-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: { className: "map-sort-menu" },
          list: { "aria-label": "Sort map resources" },
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") event.stopPropagation();
        }}
      >
        {Object.entries(options).map(([key, label]) => (
          <MenuItem
            key={key}
            role="menuitemradio"
            aria-checked={value === key}
            selected={value === key}
            onClick={() => {
              onChange(key);
              setAnchor(null);
            }}
          >
            {label}
            <span aria-hidden="true">{value === key ? "✓" : ""}</span>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
SortMenu.propTypes = {
  value: PropTypes.oneOf(["nearest", "name"]).isRequired,
  onChange: PropTypes.func.isRequired,
};
export default SortMenu;
