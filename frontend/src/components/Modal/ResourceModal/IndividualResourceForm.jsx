/* eslint-disable jsx-a11y/no-onchange */
import React from "react";
import ModalInput from "../ModalInput";

const IndividualResourceFields = [
  { labelText: "Contact Name", shortName: "contactName", required: true },
  { labelText: "Contact Phone", shortName: "contactPhone" },
  { labelText: "Contact Email", shortName: "contactEmail" },
  {
    labelText: "Skills & Qualifications",
    shortName: "skills",
    tag: "textarea",
  },
  { labelText: "Volunteer Roles", shortName: "volunteerRoles" },
  { labelText: "Availability", shortName: "availability" },
  {
    labelText: "Why Volunteer?",
    shortName: "volunteerReason",
    tag: "textarea",
  },
  { labelText: "Address", shortName: "address", required: true },
  { labelText: "Notes", shortName: "notes" },
];

const IndividualResourceForm = ({ resource, register, errors, editable }) => {
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

  return IndividualResourceFields.map(createInput);
};

export default IndividualResourceForm;
