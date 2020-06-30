import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import { globalTagListSelector } from "../../../redux/selectors/tags";
import { updateSearchQuery } from "../../../redux/actions/map";
import { addTag } from "../../../redux/actions/tags";
import { searchQuerySelector } from "../../../redux/selectors/map";
import { resourceSelector } from "../../../redux/selectors/resource";

import {
  createMuiTheme,
  ThemeProvider as MuiThemeProvider,
} from "@material-ui/core/styles";

const theme = createMuiTheme({
  overrides: {
    MuiInputBase: {
      root: {
        "&&&": {
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          borderRadius: "4px",
          backgroundColor: "#fff",
        },
      },
    },
    MuiFormControl: {
      root: {
        "&&&": {
          marginTop: 0,
          marginBottom: 0,
          borderRadius: "4px",
          backgroundColor: "#fff",
        },
      },
    },
    MuiInput: {
      underline: {
        "&&&:before": {
          borderBottom: "1px solid rgba(0,0,0,0.2)",
        },

        "&&&:after": {
          borderBottom: "1px solid #f79230",
        },
      },
    },
    MuiAutocomplete: {
      root: {
        "&&&": {
          marginRight: "5px",
          marginLeft: "4px",
        },
      },
      noOptions: {
        "&&&": {
          display: "none",
        },
      },
      input: {
        "&&&": {
          width: "252px",
          fontSize: "14px",
          textIndent: "2px",
          color: "#2a2a2a",
        },
        "&&&::placeholder": {
          color: "#000",
        },
      },
    },
  },
});

const MapSearchAutocomplete = ({
  globalTagList,
  query,
  updateSearchQuery,
  addTag,
  resources,
}) => {
  const onInputChange = (_, value, reason) => {
    if (reason === "reset") {
      // Guard against adding the empty string, since that sends a reset event
      if (value) {
        addTag(value);
        updateSearchQuery("");
      }
    } else {
      updateSearchQuery(value);
    }
  };

  return (
    <MuiThemeProvider theme={theme}>
      <Autocomplete
        getOptionSelected={() => false}
        freeSolo
        onInputChange={onInputChange}
        forcePopupIcon={query !== ""}
        // Only present suggestions when there are resources!
        options={resources.length > 0 ? globalTagList ?? [] : []}
        renderInput={(params) => (
          <TextField
            {...params}
            data-cy="searchInput"
            margin="normal"
            placeholder="Search"
          />
        )}
        inputValue={query}
      />
    </MuiThemeProvider>
  );
};

const mapStateToProps = (state) => ({
  globalTagList: globalTagListSelector(state),
  resources: resourceSelector(state),
  query: searchQuerySelector(state),
});

const mapDispatchToProps = {
  updateSearchQuery,
  addTag,
};

MapSearchAutocomplete.propTypes = {
  globalTagList: PropTypes.arrayOf(PropTypes.string),
  query: PropTypes.string,
  updateSearchQuery: PropTypes.func,
  addTag: PropTypes.func,
  resources: PropTypes.arrayOf(PropTypes.object),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapSearchAutocomplete);
