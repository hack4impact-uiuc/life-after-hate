import React from "react";
import { ResourceFormInput } from "./index";

const GroupResourceFields = [
  { labelText: "Contact Name", shortName: "contactName", required: true },
  { labelText: "Company Name", shortName: "companyName", required: true },
  { labelText: "Contact Phone", shortName: "contactPhone" },
  { labelText: "Contact Email", shortName: "contactEmail" },
  { labelText: "Website", shortName: "websiteURL" },
  {
    labelText: "Description",
    shortName: "description",
    tag: "textarea",
    rows: 7,
  },
  { labelText: "Address", shortName: "address", required: true },
  { labelText: "Notes", shortName: "notes", tag: "textarea", rows: 7 },
];

const GroupResourceForm = (props) =>
  GroupResourceFields.map((field) => (
    <ResourceFormInput key={field.shortName} {...{ ...field, ...props }} />
  ));

export default GroupResourceForm;
