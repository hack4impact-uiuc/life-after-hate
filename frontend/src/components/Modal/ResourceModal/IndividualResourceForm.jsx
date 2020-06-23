/* eslint-disable jsx-a11y/no-onchange */
import { createInput } from "./index";

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
  IndividualResourceFields.map((field) => createInput({ ...field, ...props }));
export default IndividualResourceForm;
