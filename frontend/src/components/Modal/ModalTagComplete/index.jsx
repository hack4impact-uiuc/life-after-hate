import React from "react";
import { connect } from "react-redux";
import TagAutocomplete from "../../../components/TagAutocomplete";
import { globalTagListSelector } from "../../../redux/selectors/tags";

export const ModalTagComplete = ({
  tags,
  onChange,
  globalTagList,
  defaultValue,
}) => (
    <TagAutocomplete
      autoHighlight
      freeSolo
      tags={tags}
      tagOptions={globalTagList}
      onChange={onChange}
      defaultValue={defaultValue}
    ></TagAutocomplete>
  );

const mapStateToProps = (state) => ({
  globalTagList: globalTagListSelector(state),
});

export default connect(mapStateToProps, null)(ModalTagComplete);
