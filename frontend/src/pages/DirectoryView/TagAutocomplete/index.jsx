import React from "react";
import { connect } from "react-redux";
import Chip from "@material-ui/core/Chip";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  createMuiTheme,
  ThemeProvider as MuiThemeProvider,
} from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { tagSelector } from "../../../redux/selectors/tags";
import { replaceTags } from "../../../redux/actions/tags";

const theme = createMuiTheme({
  overrides: {
    MuiInputBase: {
      root: {
        "&&&": {
          padding: "1px",
        },
      },
    },
  },
});

export const TagAutocomplete = ({ replaceTags, tags }) => {
  const handleSelectionChange = (_, value) => {
    replaceTags(value);
  };

  return (
    <MuiThemeProvider theme={theme}>
      <Autocomplete
        multiple
        id="tags-filled"
        onChange={handleSelectionChange}
        options={["A", "B"]}
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
});

const mapDispatchToProps = { replaceTags };

export default connect(mapStateToProps, mapDispatchToProps)(TagAutocomplete);
