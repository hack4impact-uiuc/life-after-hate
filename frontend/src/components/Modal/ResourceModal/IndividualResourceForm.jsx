import React from "react";
/* eslint-disable jsx-a11y/no-onchange */
import { ResourceFormInput } from "./index";

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

const IndividualResourceForm = (props) =>
  IndividualResourceFields.map((field) => (
    <ResourceFormInput key={field.shortName} {...{ ...field, ...props }} />
  ));
export default IndividualResourceForm;
