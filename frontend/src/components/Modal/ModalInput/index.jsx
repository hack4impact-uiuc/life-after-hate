import React from "react";
import PropTypes from "prop-types";

const ModalInput = ({
  componentRef,
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
    ref: componentRef,
    type: "text",
    name: shortName,
    "data-cy": `modal-${shortName}`,
    defaultValue: resource[shortName],
    className: `modal-input-field ${
      required && errors[shortName] ? "invalid" : ""
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
  componentRef: PropTypes.elementType,
  shortName: PropTypes.string,
  resource: PropTypes.object,
  errors: PropTypes.object,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  labelText: PropTypes.string,
  tag: PropTypes.string,
};

export default ModalInput;
