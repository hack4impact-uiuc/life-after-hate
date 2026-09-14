import React from "react";
import PropTypes from "prop-types";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import TextField from "@mui/material/TextField";

const overrides = {
  MuiInputBase: {
    root: {
      "&&&": {
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 0,
        borderRadius: "4px",
        backgroundColor: "#f6f6f6",
      },
    },
  },
  MuiFilledInput: {
    underline: {
      "&&&:before": {
        borderBottom: "none",
      },

      "&&&:after": {
        borderBottom: "2px solid #f79230",
      },
    },
  },
  MuiChip: {
    label: {
      "&&&": {
        color: "#f79230",
        fontWeight: 700,
        fontSize: "12px",
        textTransform: "uppercase",
      },
    },
    deleteIcon: {
      "&": {
        color: "#f79230",
      },
      "&:hover": {
        color: "#f9ac61",
      },
    },
    outlined: {
      "&&&": {
        border: "1px solid #f79230",
        backgroundColor: "transparent",
      },
    },
  },
};
const theme = createTheme({
  components: Object.fromEntries(
    Object.entries(overrides).map(([key, styles]) => [
      key,
      { styleOverrides: styles },
    ]),
  ),
});

const TagAutocomplete = ({ onChange, tags, tagOptions, ...props }) => (
  <MuiThemeProvider theme={theme}>
    <Autocomplete
      multiple
      id="tags-filled"
      data-cy="tag-autocomplete"
      onChange={onChange}
      options={tagOptions}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              data-cy="tag-chip"
              key={key ?? option}
              variant="outlined"
              label={option}
              {...tagProps}
            />
          );
        })
      }
      {...props}
      value={tags}
      renderInput={(params) => (
        <TextField {...params} variant="filled" placeholder="Tags" />
      )}
    />
  </MuiThemeProvider>
);

TagAutocomplete.propTypes = {
  onChange: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  tagOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TagAutocomplete;
