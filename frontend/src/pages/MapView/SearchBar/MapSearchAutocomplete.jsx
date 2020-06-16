import React from "react";
import { connect } from "react-redux";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import { globalTagListSelector } from "../../../redux/selectors/tags";
import { updateSearchQuery } from "../../../redux/actions/map";
import { addTag } from "../../../redux/actions/tags";
import { searchQuerySelector } from "../../../redux/selectors/map";

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
    MuiAutocomplete: {
      noOptions: {
        "&&&": {
          display: "none",
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
}) => {
  const onChange = (_, value, reason) => {
    if (reason !== "clear") {
      addTag(value);
      updateSearchQuery("");
    }
  };
  const onInputChange = (_, value, reason) => {
    if (reason !== "reset") {
      updateSearchQuery(value);
    }
  };
  return (
    <MuiThemeProvider theme={theme}>
      <Autocomplete
        onChange={onChange}
        disableClearable
        open={query !== ""}
        onInputChange={onInputChange}
        noOptionsText={null}
        forcePopupIcon={query !== ""}
        options={globalTagList ?? []}
        renderInput={(params) => <TextField {...params} margin="normal" />}
        inputValue={query}
      />
    </MuiThemeProvider>
  );
};

const mapStateToProps = (state) => ({
    globalTagList: globalTagListSelector(state),
    query: searchQuerySelector(state),
  });

const mapDispatchToProps = {
  updateSearchQuery,
  addTag,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapSearchAutocomplete);
