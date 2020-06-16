import React from "react";
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
  resources,
}) => {
  const onChange = (_, value, reason) => {
    if (reason !== "clear" && globalTagList.indexOf(value) !== -1) {
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
        getOptionSelected={() => false}
        freeSolo
        onInputChange={onInputChange}
        forcePopupIcon={query !== ""}
        options={resources.length > 0 ? globalTagList ?? [] : []}
        renderInput={(params) => <TextField {...params} margin="normal" />}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapSearchAutocomplete);
