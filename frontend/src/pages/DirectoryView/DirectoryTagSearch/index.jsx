import React from "react";
import PropTypes from "prop-types";
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

DirectoryTagSearch.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
  replaceTags: PropTypes.func,
  globalTagList: PropTypes.arrayOf(PropTypes.string),
};

export default connect(mapStateToProps, mapDispatchToProps)(DirectoryTagSearch);
