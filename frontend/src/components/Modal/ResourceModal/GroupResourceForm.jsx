/* eslint-disable jsx-a11y/no-onchange */
import React from "react";
import ModalInput from "../ModalInput";

const GroupResourceFields = [
  { labelText: "Contact Name", shortName: "contactName", required: true },
  { labelText: "Company Name", shortName: "companyName", required: true },
  { labelText: "Contact Phone", shortName: "contactPhone" },
  { labelText: "Contact Email", shortName: "contactEmail" },
  {
    labelText: "Description",
    shortName: "description",
    tag: "textarea",
    rows: 10,
  },
  { labelText: "Address", shortName: "address", required: true },
  { labelText: "Notes", shortName: "notes" },
];

const GroupResourceForm = ({ resource, register, errors, editable }) => {
  const createInput = ({ required, shortName, tag, ...props }) => (
    <ModalInput
      componentRef={register({ required: required ?? false })}
      resource={resource}
      errors={errors}
      disabled={!editable}
      key={shortName}
      tag={tag ?? "input"}
      {...{ required, shortName, ...props }}
    ></ModalInput>
  );

  return GroupResourceFields.map(createInput);
};

export default GroupResourceForm;
