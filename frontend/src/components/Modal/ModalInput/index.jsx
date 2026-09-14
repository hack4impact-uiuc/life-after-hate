import React from "react";
import PropTypes from "prop-types";

const ModalInput = ({
  registration,
  shortName,
  resource,
  errors,
  required,
  disabled,
  labelText,
  tag,
  ...passedInProps
}) => {
  const props = {
    ...registration,
    type: "text",
    name: shortName,
    "data-cy": `modal-${shortName}`,
    defaultValue: resource[shortName],
    className: `modal-input-field ${
      required && errors?.[shortName] ? "invalid" : ""
    }`,
    disabled,
    ...passedInProps,
  };

  const Tag = tag;
  return (
    <label className="modal-lab">
      <p>{labelText}</p>
      <Tag {...props}></Tag>
    </label>
  );
};

ModalInput.propTypes = {
  registration: PropTypes.object.isRequired,
  shortName: PropTypes.string.isRequired,
  resource: PropTypes.object.isRequired,
  errors: PropTypes.object,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  labelText: PropTypes.node,
  tag: PropTypes.string,
};

export default ModalInput;
