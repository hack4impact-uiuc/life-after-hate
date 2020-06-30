import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import TagAutocomplete from "../../../components/TagAutocomplete";
import { globalTagListSelector } from "../../../redux/selectors/tags";

export const ModalTagComplete = ({
  tags,
  onChange,
  globalTagList,
  defaultValue,
  disabled,
}) => (
  <TagAutocomplete
    freeSolo
    tags={tags}
    tagOptions={globalTagList}
    onChange={onChange}
    defaultValue={defaultValue}
    disabled={disabled}
  ></TagAutocomplete>
);

const mapStateToProps = (state) => ({
  globalTagList: globalTagListSelector(state),
});

ModalTagComplete.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func,
  globalTagList: PropTypes.arrayOf(PropTypes.string).isRequired,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
};

export default connect(mapStateToProps, null)(ModalTagComplete);
