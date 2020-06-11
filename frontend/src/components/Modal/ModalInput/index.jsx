import React from "react";

const ModalInput = ({
  componentRef,
  shortName,
  resource,
  errors,
  required,
  disabled,
  isTextArea,
  labelText,
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

  return (
    <label className="modal-lab">
      <p>{labelText}</p>
      {isTextArea ? <textarea rows={6} {...props} /> : <input {...props} />}
    </label>
  );
};

export default ModalInput;
