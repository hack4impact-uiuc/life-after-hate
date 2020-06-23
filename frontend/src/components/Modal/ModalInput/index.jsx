import React from "react";

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

export default ModalInput;
