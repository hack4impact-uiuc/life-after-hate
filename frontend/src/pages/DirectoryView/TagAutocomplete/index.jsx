import React from "react";
import { connect } from "react-redux";
import Chip from "@material-ui/core/Chip";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  createMuiTheme,
  ThemeProvider as MuiThemeProvider,
} from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import {
  tagSelector,
  globalTagListSelector,
} from "../../../redux/selectors/tags";
import { replaceTags } from "../../../redux/actions/tags";

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
    MuiChip: {
      label: {
        "&&&": {
          // color: "#f79230",
          color: "rgba(0, 0, 0, 0.7)",
          // fontWeight: 600,
          textTransform: "uppercase",
        },
      },
    },
  },
});

export const TagAutocomplete = ({ replaceTags, tags, globalTagList }) => {
  const handleSelectionChange = (_, value) => {
    replaceTags(value);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <Autocomplete
        multiple
        id="tags-filled"
        onChange={handleSelectionChange}
        options={globalTagList}
        freeSolo
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option}
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
        value={tags}
        renderInput={(params) => (
          <TextField {...params} variant="filled" placeholder="Tags" />
        )}
      />
    </MuiThemeProvider>
  );
};

const mapStateToProps = (state) => ({
  tags: tagSelector(state),
  globalTagList: globalTagListSelector(state),
});

const mapDispatchToProps = { replaceTags };

export default connect(mapStateToProps, mapDispatchToProps)(TagAutocomplete);
