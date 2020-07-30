import React from "react";
/* eslint-disable jsx-a11y/no-onchange */
import { ResourceFormInput } from "./index";

const IndividualResourceFields = [
  { labelText: "Contact Name", shortName: "contactName", required: true },
  { labelText: "Contact Phone", shortName: "contactPhone" },
  { labelText: "Contact Email", shortName: "contactEmail" },
  { labelText: "Website", shortName: "websiteURL" },
  {
    labelText: "Skills & Qualifications",
    shortName: "skills",
    tag: "textarea",
    rows: 7,
  },
  { labelText: "Volunteer Roles", shortName: "volunteerRoles" },
  { labelText: "Availability", shortName: "availability" },
  {
    labelText: "Why Volunteer?",
    shortName: "volunteerReason",
    tag: "textarea",
    rows: 4,
  },
  { labelText: "Address", shortName: "address", required: true },
  { labelText: "Notes", shortName: "notes", tag: "textarea", rows: 7 },
];

const IndividualResourceForm = (props) =>
  IndividualResourceFields.map((field) => (
    <ResourceFormInput key={field.shortName} {...{ ...field, ...props }} />
  ));
export default IndividualResourceForm;
