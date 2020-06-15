import React from "react";
import { connect } from "react-redux";
import TagAutocomplete from "../../../components/TagAutocomplete";
import {
  tagSelector,
  globalTagListSelector,
} from "../../../redux/selectors/tags";
import { replaceTags } from "../../../redux/actions/tags";

export const DirectoryTagSearch = ({ tags, replaceTags, globalTagList }) => {
  const handleSelectionChange = (_, value) => {
    replaceTags(value);
  };
  return (
    <TagAutocomplete
      autoHighlight
      freeSolo
      tags={tags}
      tagOptions={globalTagList}
      onChange={handleSelectionChange}
    ></TagAutocomplete>
  );
};

const mapStateToProps = (state) => ({
  tags: tagSelector(state),
  globalTagList: globalTagListSelector(state),
});

const mapDispatchToProps = { replaceTags };

export default connect(mapStateToProps, mapDispatchToProps)(DirectoryTagSearch);
